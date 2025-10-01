'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import '@/src/styles/pages/About.scss';

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
}

interface HobbyPost {
  ID: number;
  post_title: string;
  post_content?: string;
  post_excerpt?: string;
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

export default function AboutPage() {
  const [aboutData, setAboutData] = useState<AboutPageData>(FALLBACK_ABOUT_DATA);

  useEffect(() => {
    async function fetchAboutData() {
      try {
        console.log('🔍 Fetching about page via REST API');
        const WORDPRESS_REST_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '') || 'https://cms.edrishusein.com';
        
        // Fetch about page, skills, and hobbies in parallel
        const [aboutResponse, skillsResponse, hobbiesResponse] = await Promise.all([
          fetch(`${WORDPRESS_REST_URL}/wp-json/wp/v2/pages?slug=about-me&acf_format=standard&_embed`),
          fetch(`${WORDPRESS_REST_URL}/wp-json/wp/v2/skill?per_page=50`),
          fetch(`${WORDPRESS_REST_URL}/wp-json/wp/v2/hobby?per_page=50`)
        ]);
        
        if (aboutResponse.ok) {
          const aboutPages = await aboutResponse.json();
          
          if (aboutPages && aboutPages.length > 0) {
            const aboutPage = aboutPages[0];
            
            // Get skills and hobbies data
            let skillsData: any[] = [];
            let hobbiesData: any[] = [];
            
            if (skillsResponse.ok) {
              try {
                skillsData = await skillsResponse.json();
              } catch (error) {
                console.warn('⚠️ Error fetching skills:', error);
              }
            }
            
            if (hobbiesResponse.ok) {
              try {
                hobbiesData = await hobbiesResponse.json();
              } catch (error) {
                console.warn('⚠️ Error fetching hobbies:', error);
              }
            }
            
            // Transform WordPress REST data to expected format
            const transformedData = {
              page: {
                id: aboutPage.id.toString(),
                title: aboutPage.title?.rendered || 'About Edris Husein',
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
                  // Hero Section
                  aboutHeroTitle: aboutPage.acf?.about_hero_title || "About Edris Husein",
                  aboutHeroSubtitle: aboutPage.acf?.about_hero_subtitle || "Full-stack developer passionate about creating exceptional digital experiences",
                  aboutHeroImage: aboutPage.acf?.about_hero_image ? {
                    node: {
                      sourceUrl: aboutPage.acf.about_hero_image.url || aboutPage.acf.about_hero_image.source_url,
                      altText: aboutPage.acf.about_hero_image.alt || aboutPage.acf.about_hero_image.alt_text || 'About Hero Image',
                      mediaDetails: {
                        width: aboutPage.acf.about_hero_image.width || 400,
                        height: aboutPage.acf.about_hero_image.height || 400
                      }
                    }
                  } : null,
                  
                  // Experience Section
                  experienceSection: {
                    sectionTitle: aboutPage.acf?.experience_section_title || "Experience",
                    experienceItems: (() => {
                      const experienceItems = aboutPage.acf?.experience_items;
                      
                      if (!experienceItems || !Array.isArray(experienceItems)) {
                        return FALLBACK_ABOUT_DATA.page.aboutPageFields?.experienceSection?.experienceItems || [];
                      }
                      
                      const validItems = experienceItems
                        .filter((item: any) => item.company_name || item.position || item.duration || item.description)
                        .map((item: any) => ({
                          company_name: item.company_name || '',
                          position: item.position || '',
                          duration: item.duration || '',
                          description: item.description || '',
                          technologies: item.technologies
                        }));
                      
                      if (validItems.length === 0) {
                        return FALLBACK_ABOUT_DATA.page.aboutPageFields?.experienceSection?.experienceItems || [];
                      }
                      
                      return validItems;
                    })()
                  },
                  
                  // Skills Section
                  skillsSection: {
                    sectionTitle: aboutPage.acf?.skills_section_title || "Skills & Technologies",
                    selectedSkills: aboutPage.acf?.selected_skills?.length > 0 
                      ? aboutPage.acf.selected_skills.map((skill: any) => ({
                          ID: skill.ID || skill.id,
                          post_title: skill.post_title || skill.title?.rendered || skill.title,
                          post_content: skill.post_content || skill.content?.rendered || skill.content,
                          post_excerpt: skill.post_excerpt || skill.excerpt?.rendered || skill.excerpt
                        }))
                      : skillsData.map(skill => ({
                          ID: skill.id,
                          post_title: skill.title?.rendered || skill.title,
                          post_content: skill.content?.rendered || skill.content,
                          post_excerpt: skill.excerpt?.rendered || skill.excerpt
                        }))
                  },
                  
                  // Personal Section
                  personalSection: {
                    sectionTitle: aboutPage.acf?.personal_section_title || "Personal",
                    personalContent: aboutPage.acf?.personal_content || FALLBACK_ABOUT_DATA.page.aboutPageFields?.personalSection?.personalContent || "",
                    personalImage: aboutPage.acf?.personal_image ? {
                      node: {
                        sourceUrl: aboutPage.acf.personal_image.url || aboutPage.acf.personal_image.source_url,
                        altText: aboutPage.acf.personal_image.alt || aboutPage.acf.personal_image.alt_text || 'Personal Image',
                        mediaDetails: {
                          width: aboutPage.acf.personal_image.width || 400,
                          height: aboutPage.acf.personal_image.height || 400
                        }
                      }
                    } : null,
                    selectedHobbies: aboutPage.acf?.selected_hobbies?.length > 0
                      ? aboutPage.acf.selected_hobbies.map((hobby: any) => ({
                          ID: hobby.ID || hobby.id,
                          post_title: hobby.post_title || hobby.title?.rendered || hobby.title,
                          post_content: hobby.post_content || hobby.content?.rendered || hobby.content,
                          post_excerpt: hobby.post_excerpt || hobby.excerpt?.rendered || hobby.excerpt
                        }))
                      : hobbiesData.map(hobby => ({
                          ID: hobby.id,
                          post_title: hobby.title?.rendered || hobby.title,
                          post_content: hobby.content?.rendered || hobby.content,
                          post_excerpt: hobby.excerpt?.rendered || hobby.excerpt
                        }))
                  }
                }
              }
            };
            
            setAboutData(transformedData);
            console.log('✅ About page data loaded from WordPress');
          }
        }
      } catch (error) {
        console.error('❌ Error fetching about page data:', error);
        // Keep fallback data
      }
    }

    fetchAboutData();
  }, []);

  const page = aboutData.page;
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
                    <div 
                      className="description"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                    {item.technologies && (
                      <div className="technologies">
                        <span className="tech-label">Technologies:</span>
                        <span className="tech-list">
                          {Array.isArray(item.technologies)
                            ? item.technologies
                                .map((tech: any) => 
                                  typeof tech === 'string' 
                                    ? tech 
                                    : tech.post_title || tech.title?.rendered || tech.title || 'Tech'
                                )
                                .join(', ')
                            : typeof item.technologies === 'string'
                            ? item.technologies
                            : item.technologies.post_title || item.technologies.title?.rendered || item.technologies.title || 'Technologies'
                          }
                        </span>
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
                      {typeof skill.post_title === 'string' 
                        ? skill.post_title 
                        : skill.post_title?.rendered || skill.title?.rendered || skill.title || 'Skill'}
                    </h3>
                    {skill.post_excerpt && (
                      <p className="skill-description">
                        {typeof skill.post_excerpt === 'string' 
                          ? skill.post_excerpt 
                          : skill.post_excerpt?.rendered || skill.excerpt?.rendered || ''}
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
              <h2 className="section-title">Interests & Hobbies</h2>
              <div className="hobbies-list">
                {fields.personalSection.selectedHobbies.map((hobby, index) => (
                  <div key={hobby.ID || index} className="hobby-item">
                    <span className="hobby-name">
                      {typeof hobby.post_title === 'string' 
                        ? hobby.post_title 
                        : hobby.post_title?.rendered || hobby.title?.rendered || hobby.title || 'Hobby'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}