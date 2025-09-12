// app/about/page.tsx
import Image from 'next/image';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import { Metadata } from 'next';
import '@/src/styles/pages/About.scss';

export const dynamic = 'force-dynamic'; // Always fetch fresh data from WordPress

// Types based on actual ACF field structure
interface ExperienceItem {
  company_name: string;
  position: string;
  duration: string;
  description: string;
  technologies?: string;
}

interface SkillPost {
  ID: number;
  post_title: string;
  post_content?: string;
  post_excerpt?: string;
  // Add more fields as needed
}

interface HobbyPost {
  ID: number;
  post_title: string;
  post_content?: string;
  post_excerpt?: string;
  // Add more fields as needed
}

interface AboutPageFields {
  aboutHeroTitle?: string;
  aboutHeroSubtitle?: string;
  aboutHeroImage?: {
    node: {
      sourceUrl: string;
      altText: string;
      mediaDetails: {
        width: number;
        height: number;
      };
    };
  };
  experienceSection?: {
    sectionTitle: string;
    experienceItems: ExperienceItem[];
  };
  skillsSection?: {
    sectionTitle: string;
    selectedSkills: SkillPost[];
  };
  personalSection?: {
    sectionTitle: string;
    personalContent: string;
    personalImage?: {
      node: {
        sourceUrl: string;
        altText: string;
        mediaDetails: {
          width: number;
          height: number;
        };
      };
    };
    selectedHobbies: HobbyPost[];
  };
}

interface AboutPageData {
  page: {
    id: string;
    title: string;
    content: string;
    featuredImage?: {
      node: {
        sourceUrl: string;
        altText: string;
        mediaDetails: {
          width: number;
          height: number;
        };
      };
    };
    aboutPageFields?: AboutPageFields;
    seo?: {
      title: string;
      metaDesc: string;
      opengraphImage?: {
        sourceUrl: string;
      };
    };
  };
}

// Fallback data when WordPress is unavailable
const FALLBACK_ABOUT_DATA = {
  page: {
    id: "about",
    title: "About Edris Husein",
    content: "<p>Full-stack developer passionate about creating exceptional digital experiences with modern technologies.</p>",
    aboutPageFields: {
      aboutHeroTitle: "About Edris Husein",
      aboutHeroSubtitle: "Full-stack developer passionate about creating exceptional digital experiences",
      experienceSection: {
        sectionTitle: "Experience",
        experienceItems: [
          {
            company_name: "Freelance",
            position: "Full-Stack Developer",
            duration: "2020 - Present",
            description: "Developing modern web applications using React, Next.js, and WordPress",
            technologies: "React, Next.js, WordPress, TypeScript"
          }
        ]
      },
      skillsSection: {
        sectionTitle: "Skills & Technologies",
        selectedSkills: [
          { ID: 1, post_title: "React" },
          { ID: 2, post_title: "Next.js" },
          { ID: 3, post_title: "WordPress" },
          { ID: 4, post_title: "TypeScript" },
          { ID: 5, post_title: "SCSS" }
        ]
      },
      personalSection: {
        sectionTitle: "Personal",
        personalContent: "<p>When I'm not coding, I enjoy reading, exploring new technologies, and working on personal projects that challenge my creativity and technical skills.</p>",
        selectedHobbies: [
          { ID: 1, post_title: "Reading" },
          { ID: 2, post_title: "Technology Research" },
          { ID: 3, post_title: "Personal Projects" }
        ]
      }
    }
  }
};

async function getAboutPageData(): Promise<AboutPageData> {
  try {
    console.log('🔍 About page: Fetching directly from WordPress REST API');
    
    // Call WordPress REST API directly instead of our own API route during build
    const WORDPRESS_REST_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '') || 'https://cms.edrishusein.com';
    
    // Fetch about page, skills, and hobbies in parallel
    const [aboutResponse, skillsResponse, hobbiesResponse] = await Promise.all([
      fetch(`${WORDPRESS_REST_URL}/wp-json/wp/v2/pages?slug=about-me&acf_format=standard`, { cache: 'no-store' }),
      fetch(`${WORDPRESS_REST_URL}/wp-json/wp/v2/skill?per_page=50`, { cache: 'no-store' }),
      fetch(`${WORDPRESS_REST_URL}/wp-json/wp/v2/hobby?per_page=50`, { cache: 'no-store' })
    ]);
    
    if (!aboutResponse.ok) {
      throw new Error(`WordPress REST API failed: ${aboutResponse.status}`);
    }
    
    const aboutPages = await aboutResponse.json();
    
    if (!aboutPages || aboutPages.length === 0) {
      throw new Error('About page not found in WordPress');
    }
    
    // Get skills and hobbies data
    let skillsData: any[] = [];
    let hobbiesData: any[] = [];
    
    if (skillsResponse.ok) {
      skillsData = await skillsResponse.json();
      console.log(`✅ Found ${skillsData.length} skills from WordPress`);
    } else {
      console.warn('⚠️ Skills data not available from WordPress');
    }
    
    if (hobbiesResponse.ok) {
      hobbiesData = await hobbiesResponse.json();
      console.log(`✅ Found ${hobbiesData.length} hobbies from WordPress`);
    } else {
      console.warn('⚠️ Hobbies data not available from WordPress');
    }
    
    const aboutPage = aboutPages[0];
    console.log('✅ About page: WordPress data loaded');
    
    // Transform WordPress REST data to expected format
    const transformedData = {
      page: {
        id: aboutPage.id.toString(),
        title: aboutPage.title?.rendered || 'About',
        content: aboutPage.content?.rendered || '',
        featuredImage: aboutPage._embedded?.['wp:featuredmedia']?.[0] ? {
          node: {
            sourceUrl: aboutPage._embedded['wp:featuredmedia'][0].source_url,
            altText: aboutPage._embedded['wp:featuredmedia'][0].alt_text || 'About',
            mediaDetails: {
              width: aboutPage._embedded['wp:featuredmedia'][0].media_details?.width || 400,
              height: aboutPage._embedded['wp:featuredmedia'][0].media_details?.height || 400
            }
          }
        } : null,
        aboutPageFields: {
          // Use WordPress data if available, otherwise fallback
          ...FALLBACK_ABOUT_DATA.page.aboutPageFields,
          skillsSection: {
            sectionTitle: "Skills & Technologies",
            selectedSkills: skillsData.map(skill => ({
              ID: skill.id,
              post_title: skill.title?.rendered || skill.title,
              post_content: skill.content?.rendered || skill.content,
              post_excerpt: skill.excerpt?.rendered || skill.excerpt
            }))
          },
          personalSection: {
            sectionTitle: "Personal",
            personalContent: aboutPage.acf?.personal_content || FALLBACK_ABOUT_DATA.page.aboutPageFields?.personalSection?.personalContent || "",
            selectedHobbies: hobbiesData.map(hobby => ({
              ID: hobby.id,
              post_title: hobby.title?.rendered || hobby.title,
              post_content: hobby.content?.rendered || hobby.content,
              post_excerpt: hobby.excerpt?.rendered || hobby.excerpt
            }))
          }
        }
      }
    };
    
    return transformedData;
    
  } catch (error) {
    console.error('❌ About page: WordPress API error, using fallback:', error);
    return FALLBACK_ABOUT_DATA;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getAboutPageData();
  const page = data.page;

  return {
    title: page.seo?.title || page.title || 'About - Edris Husein',
    description: page.seo?.metaDesc || 'Learn more about Edris Husein, full-stack developer passionate about creating exceptional digital experiences.',
    openGraph: {
      title: page.seo?.title || page.title || 'About - Edris Husein',
      description: page.seo?.metaDesc || 'Learn more about Edris Husein, full-stack developer passionate about creating exceptional digital experiences.',
      images: page.seo?.opengraphImage?.sourceUrl ? [page.seo.opengraphImage.sourceUrl] : [],
    },
  };
}

export default async function AboutPage() {
  const data = await getAboutPageData();
  const page = data.page;
  const fields = page.aboutPageFields;

  return (
    <>
      <Header />
      <main className="about-page">
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
              {(fields?.aboutHeroImage || page.featuredImage) && (
                <div className="hero-image">
                  <Image
                    src={fields?.aboutHeroImage?.node.sourceUrl || page.featuredImage?.node.sourceUrl || '/images/Edris-Husein-Hero.png'}
                    alt={fields?.aboutHeroImage?.node.altText || page.featuredImage?.node.altText || 'Edris Husein'}
                    width={fields?.aboutHeroImage?.node.mediaDetails.width || page.featuredImage?.node.mediaDetails.width || 400}
                    height={fields?.aboutHeroImage?.node.mediaDetails.height || page.featuredImage?.node.mediaDetails.height || 400}
                    className="profile-image"
                    priority
                  />
                </div>
              )}
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
                    <p className="description">{item.description}</p>
                    {item.technologies && (
                      <div className="technologies">
                        <span className="tech-label">Technologies:</span>
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
                    <h3 className="skill-name">{skill.post_title}</h3>
                    {skill.post_excerpt && (
                      <p className="skill-description">{skill.post_excerpt}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Personal Section */}
        {fields?.personalSection && (
          <section className="about-personal">
            <div className="container">
              <div className="personal-content">
                <div className="personal-text">
                  <h2 className="section-title">{fields.personalSection.sectionTitle}</h2>
                  <div 
                    className="personal-description"
                    dangerouslySetInnerHTML={{ __html: fields.personalSection.personalContent }}
                  />
                  
                  {/* Hobbies */}
                  {fields.personalSection.selectedHobbies && fields.personalSection.selectedHobbies.length > 0 && (
                    <div className="hobbies-section">
                      <h3 className="hobbies-title">Interests & Hobbies</h3>
                      <div className="hobbies-list">
                        {fields.personalSection.selectedHobbies.map((hobby, index) => (
                          <div key={hobby.ID || index} className="hobby-item">
                            <span className="hobby-name">{hobby.post_title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {fields.personalSection.personalImage && (
                  <div className="personal-image">
                    <Image
                      src={fields.personalSection.personalImage.node.sourceUrl}
                      alt={fields.personalSection.personalImage.node.altText}
                      width={fields.personalSection.personalImage.node.mediaDetails.width}
                      height={fields.personalSection.personalImage.node.mediaDetails.height}
                      className="image"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}