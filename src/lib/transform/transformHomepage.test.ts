import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { transformHomepage } from './transformHomepage';

const homeFixture = JSON.parse(
  readFileSync(resolve(__dirname, '__fixtures__/home.json'), 'utf-8'),
)[0];

describe('transformHomepage', () => {
  const result = transformHomepage(homeFixture);

  it('uses the constant hero title (no CMS field exists — C6)', () => {
    expect(result.heroSection?.title).toBe('Edris Husein');
  });

  it('reads hero copy from CMS but leaves the hero image to the static default', () => {
    expect(result.heroSection?.heroCopy).toContain('web developer');
    // Hero image is intentionally not sourced from the CMS (dormant Preview.svg);
    // the Hero component supplies the static profile photo when this is undefined.
    expect(result.heroSection?.heroImage).toBeUndefined();
  });

  it('maps about / bookshelf / techstack / notebook / contact groups', () => {
    expect(result.aboutSection?.title).toBe('About me');
    expect(result.aboutSection?.aboutMeText).toContain('Edris Husein');
    expect(result.bookshelfSection?.title).toBe('BOOKSHELF');
    expect(result.bookshelfSection?.featuredImage?.node.sourceUrl).toContain('books-bg');
    expect(result.techstackSection?.featuredImage).toBeDefined();
    expect(result.notebookSection?.title).toBe('NOTEBOOK');
    expect(result.contactSection?.email).toBe('kontakt@edrishusein.com');
  });

  it('falls back to light defaults when acf_fields is absent', () => {
    const empty = transformHomepage({});
    expect(empty.heroSection?.title).toBe('Edris Husein');
    expect(empty.notebookSection?.title).toBe('NOTEBOOK');
    expect(empty.heroSection?.heroImage).toBeUndefined();
  });
});
