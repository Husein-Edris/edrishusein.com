import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { transformAbout } from './transformAbout';

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
});
