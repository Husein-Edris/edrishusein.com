// app/about/page.tsx
import Image from 'next/image';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generateEnhancedMetadata, generateProfilePageStructuredData, safeJsonLd } from '@/src/lib/seo-utils';
import { rewriteImageUrls } from '@/src/lib/image-utils';
import { cmsRest, isTransientCmsError } from '@/src/lib/rest-client';
import {
  transformAbout,
  extractExperienceTechIds,
  type AboutPageData,
  type RestAboutPage,
} from '@/src/lib/transform/transformAbout';
import { asArray } from '@/src/lib/transform/asArray';
import { decodeEntities } from '@/src/lib/transform/decodeEntities';
import { DataFetcher } from '@/src/lib/data-fetcher';
import { PORTRAIT_FALLBACK, resolvePortrait, type Portrait } from '@/src/lib/portrait';
import type { WordPressImage } from '@/src/types/wordpress';
import '@/src/styles/pages/About.scss';

// ISR: cached render refreshed at most once per 60s (keep in sync with CMS_REVALIDATE = 60).
export const revalidate = 60;

// Resolve experience technology IDs to names. The ACF relationship returns Tech
// CPT post IDs, which used to print as "Technologies: Tech, Tech, Tech".
async function resolveTechNames(ids: number[]): Promise<Map<number, string>> {
  if (ids.length === 0) return new Map();
  const techs = await cmsRest<Array<{ id: number; title?: { rendered?: string } }>>(
    `/tech?include=${ids.join(',')}&per_page=100&_fields=id,title`
  );
  return new Map(
    asArray<{ id: number; title?: { rendered?: string } }>(techs).map((tech) => [
      Number(tech.id),
      decodeEntities(tech.title?.rendered ?? ''),
    ])
  );
}

// No hardcoded fallback copy: a transient CMS failure throws out of cmsRest so
// ISR keeps serving the last good page, and a missing about page is a real 404.
async function getAboutPageData(): Promise<AboutPageData> {
  let pages: RestAboutPage[];
  try {
    pages = await cmsRest<RestAboutPage[]>('/pages?slug=about-me&acf_format=standard&_embed');
  } catch (error: unknown) {
    if (isTransientCmsError(error)) throw error;
    notFound();
  }
  if (!Array.isArray(pages) || pages.length === 0) {
    notFound();
  }

  const techNames = await resolveTechNames(extractExperienceTechIds(pages[0]));
  return rewriteImageUrls(transformAbout(pages[0], techNames));
}

// The About page's own image wins; when it is empty, the same portrait as the
// homepage hero (Home > Hero > Hero Image), then the static photo.
async function getAboutPortrait(
  aboutImage: WordPressImage | null | undefined,
  featuredImage: WordPressImage | null | undefined
): Promise<Portrait> {
  const own = resolvePortrait(aboutImage, featuredImage);
  if (own !== PORTRAIT_FALLBACK) return own;
  const { data: homepage } = await DataFetcher.getHomepageData();
  return resolvePortrait(homepage?.heroSection?.heroImage);
}

export async function generateMetadata(): Promise<Metadata> {
  // Fetched (deduped with the page render) so a missing page 404s here too.
  await getAboutPageData();

  return generateEnhancedMetadata(null, {
    title: 'About Edris Husein - Full-Stack Developer, Austria',
    description: 'About Edris Husein, a full-stack web developer from Dornbirn, Austria, building websites and web apps with Next.js, React, TypeScript and WordPress.',
    path: '/about',
    type: 'website',
  });
}

export default async function AboutPage() {
  const data = await getAboutPageData();
  const page = data.page;
  const fields = page.aboutPageFields;
  const portrait = await getAboutPortrait(fields?.aboutHeroImage, page.featuredImage);

  // ProfilePage schema: /about is the page about the site's Person entity.
  const structuredData = generateProfilePageStructuredData({
    title: page.title,
    description: 'About Edris Husein, full-stack web developer in Dornbirn, Austria.',
  });

        return (
        <>
          <Header />
          <main id="main-content" tabIndex={-1} className="about-page">
            {/* Hero Section */}
            <section className="about-hero">
              <div className="container">
                <div className="hero-content">
                  <div className="hero-text">
                    <h1 className="hero-title">
                      {fields?.aboutHeroTitle || page.title}
                    </h1>
                    {fields?.aboutHeroSubtitle && (
                      <p className="hero-subtitle">{fields.aboutHeroSubtitle}</p>
                    )}
                  </div>
                  <div className="hero-image">
                    <Image
                      src={portrait.src}
                      alt={portrait.alt}
                      width={portrait.width}
                      height={portrait.height}
                      className="profile-image"
                      sizes="256px"
                      priority
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Main Content */}
            {page.content && (
              <section className="about-content">
                <div className="container">
                  <div className="content-wrapper">
                    <div
                      className="about-text"
                      dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Experience Section */}
            {fields?.experienceSection && fields.experienceSection.experienceItems.length > 0 && (
              <section className="about-experience">
                <div className="container">
                  <h2 className="section-title">{fields.experienceSection.sectionTitle}</h2>
                  <div className="experience-list">
                    {fields.experienceSection.experienceItems.map((item, index) => (
                      <div key={index} className="experience-item">
                        <div className="experience-header">
                          <h3 className="position">{item.position}</h3>
                          <span className="duration">{item.duration}</span>
                        </div>
                        <h4 className="company">{item.company_name}</h4>
                        <div
                          className="description"
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        />
                        {item.technologies && (
                          <div className="technologies">
                            <span className="tech-label">{fields.experienceSection.technologiesLabel}</span>
                            <span className="tech-list">{item.technologies}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Skills Section */}
            {fields?.skillsSection && fields.skillsSection.selectedSkills.length > 0 && (
              <section className="about-skills">
                <div className="container">
                  <h2 className="section-title">{fields.skillsSection.sectionTitle}</h2>
                  <div className="skills-grid">
                    {fields.skillsSection.selectedSkills.map((skill, index) => (
                      <div key={skill.ID || index} className="skill-item">
                        <h3 className="skill-name">
                          {skill.post_title}
                        </h3>
                        {skill.post_excerpt && (
                          <p className="skill-description">
                            {skill.post_excerpt}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Interests & Hobbies Section */}
            {fields?.personalSection?.selectedHobbies && fields.personalSection.selectedHobbies.length > 0 && (
              <section className="about-hobbies">
                <div className="container">
                  <h2 className="section-title">{fields.personalSection.hobbiesTitle}</h2>
                  <div className="hobbies-list">
                    {fields.personalSection.selectedHobbies.map((hobby, index) => (
                      <div key={hobby.ID || index} className="hobby-item">
                        <span className="hobby-name">
                          {hobby.post_title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </main>
          <Footer />

          {/* Structured Data for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: safeJsonLd(structuredData),
            }}
          />
        </>
        );
}