import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { transformAbout, extractExperienceTechIds, ABOUT_TEXT_DEFAULTS } from './transformAbout';

const aboutPage = JSON.parse(
  readFileSync(resolve(__dirname, '__fixtures__/about.json'), 'utf-8'),
)[0];

describe('transformAbout', () => {
  const { page } = transformAbout(aboutPage);
  const fields = page.aboutPageFields;

  it('maps hero title/subtitle and content', () => {
    expect(page.title.length).toBeGreaterThan(0);
    expect(fields.aboutHeroTitle.length).toBeGreaterThan(0);
    expect(typeof page.content).toBe('string');
  });

  it('maps experience items with the component field names', () => {
    expect(fields.experienceSection.experienceItems.length).toBeGreaterThan(0);
    const item = fields.experienceSection.experienceItems[0];
    expect(item).toHaveProperty('company_name');
    expect(item).toHaveProperty('position');
    expect(item).toHaveProperty('duration');
    expect(item).toHaveProperty('description');
  });

  it('maps selected_skills (full relation objects) to {ID, post_title}', () => {
    const skills = fields.skillsSection.selectedSkills;
    expect(skills.length).toBeGreaterThan(0);
    expect(skills[0].ID).toBeGreaterThan(0);
    expect(typeof skills[0].post_title).toBe('string');
    expect(skills[0].post_title.length).toBeGreaterThan(0);
  });

  it('maps selected_hobbies', () => {
    expect(fields.personalSection.selectedHobbies.length).toBeGreaterThan(0);
    expect(fields.personalSection.selectedHobbies[0].post_title.length).toBeGreaterThan(0);
  });

  it('normalizes the hero image to the {node:{sourceUrl}} shape', () => {
    if (aboutPage.acf_fields?.about_hero_image?.url) {
      expect(fields.aboutHeroImage?.node.sourceUrl).toContain('http');
    }
  });

  it('falls back to light defaults when acf is absent', () => {
    const empty = transformAbout({});
    expect(empty.page.title).toBe('About');
    expect(empty.page.aboutPageFields.skillsSection.selectedSkills).toEqual([]);
    expect(empty.page.aboutPageFields.experienceSection.sectionTitle).toBe('Experience');
  });

  describe('experience technologies', () => {
    // Live shape: the ACF relationship field returns tech post IDs, not names.
    const withTechIds = {
      acf_fields: {
        experience_items: [
          { company_name: 'A', technologies: [296, 429, 999] },
          { company_name: 'B', technologies: 'PHP, CSS' },
          { company_name: 'C', technologies: false },
        ],
      },
    };

    it('collects the unique tech IDs referenced by experience items', () => {
      expect(extractExperienceTechIds(withTechIds as never)).toEqual([296, 429, 999]);
    });

    it('resolves tech IDs to names and skips IDs it cannot resolve', () => {
      const names = new Map([[296, 'PHP'], [429, 'Next.js']]);
      const items = transformAbout(withTechIds as never, names).page.aboutPageFields.experienceSection.experienceItems;
      expect(items[0].technologies).toBe('PHP, Next.js');
    });

    it('never prints placeholder names when nothing resolves (row is hidden)', () => {
      const items = transformAbout(withTechIds as never).page.aboutPageFields.experienceSection.experienceItems;
      expect(items[0].technologies).toBe('');
      expect(items[1].technologies).toBe('PHP, CSS');
      expect(items[2].technologies).toBe('');
    });
  });
});

describe('transformAbout section labels', () => {
  it('uses the code defaults while the fields are unsaved or blank', () => {
    const { page } = transformAbout({ acf_fields: { experience_technologies_label: '  ' } });
    expect(page.aboutPageFields.experienceSection.technologiesLabel).toBe('Technologies:');
    expect(page.aboutPageFields.personalSection.hobbiesTitle).toBe('Interests & Hobbies');
    expect(ABOUT_TEXT_DEFAULTS).toEqual({ technologiesLabel: 'Technologies:', hobbiesTitle: 'Interests & Hobbies' });
  });

  it('maps the filled About page fields', () => {
    const { page } = transformAbout({
      acf_fields: { experience_technologies_label: 'Stack:', hobbies_section_title: 'Outside work' },
    });
    expect(page.aboutPageFields.experienceSection.technologiesLabel).toBe('Stack:');
    expect(page.aboutPageFields.personalSection.hobbiesTitle).toBe('Outside work');
  });
});
