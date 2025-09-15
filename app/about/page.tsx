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

// Helper function to test WordPress API endpoint
async function testWordPressAPI(baseUrl: string): Promise<{success: boolean, issue?: string}> {
  try {
    console.log(`🔍 Testing WordPress API at: ${baseUrl}`);
    
    // Test basic WordPress API
    const testResponse = await fetch(`${baseUrl}/wp-json/wp/v2/`, { 
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!testResponse.ok) {
      return { success: false, issue: `API returned ${testResponse.status} ${testResponse.statusText}` };
    }
    
    const contentType = testResponse.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const responseText = await testResponse.text();
      return { 
        success: false, 
        issue: `Non-JSON response (${contentType}). Preview: ${responseText.substring(0, 100)}` 
      };
    }
    
    const apiData = await testResponse.json();
    console.log(`✅ WordPress API is accessible. Routes available:`, Object.keys(apiData.routes || {}).length);
    return { success: true };
    
  } catch (error) {
    return { 
      success: false, 
      issue: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

async function getAboutPageData(): Promise<AboutPageData> {
  try {
    console.log('🔍 About page: Trying GraphQL first, then REST API fallback');
    
    // Try GraphQL first
    try {
      const { client } = await import('@/src/lib/client');
      const { GET_ABOUT_PAGE_DATA, GET_ALL_SKILLS, GET_ALL_HOBBIES } = await import('@/src/lib/queries/about');
      
      // Fetch all data in parallel via GraphQL
      const [aboutResponse, skillsResponse, hobbiesResponse] = await Promise.allSettled([
        client.request(GET_ABOUT_PAGE_DATA),
        client.request(GET_ALL_SKILLS),
        client.request(GET_ALL_HOBBIES)
      ]);
      
      let aboutData = null;
      let skillsData: any[] = [];
      let hobbiesData: any[] = [];
      
      if (aboutResponse.status === 'fulfilled' && aboutResponse.value?.page) {
        aboutData = aboutResponse.value.page;
        console.log('✅ About page: GraphQL data loaded successfully');
      }
      
      if (skillsResponse.status === 'fulfilled' && skillsResponse.value?.skills?.nodes) {
        skillsData = skillsResponse.value.skills.nodes;
        console.log(`✅ Found ${skillsData.length} skills via GraphQL`);
      }
      
      if (hobbiesResponse.status === 'fulfilled' && hobbiesResponse.value?.hobbies?.nodes) {
        hobbiesData = hobbiesResponse.value.hobbies.nodes;
        console.log(`✅ Found ${hobbiesData.length} hobbies via GraphQL`);
      }
      
      if (aboutData) {
        // Transform GraphQL response
        const transformedData = {
          page: {
            id: aboutData.id,
            title: aboutData.title,
            content: aboutData.content,
            featuredImage: aboutData.featuredImage,
            aboutPageFields: {
              ...aboutData.aboutPageFields,
              // Handle experience section with validation
              experienceSection: aboutData.aboutPageFields?.experienceSection?.experienceItems?.length > 0
                ? aboutData.aboutPageFields.experienceSection
                : FALLBACK_ABOUT_DATA.page.aboutPageFields?.experienceSection,
              // If selected skills/hobbies are empty, use all available ones
              skillsSection: {
                ...aboutData.aboutPageFields?.skillsSection,
                selectedSkills: aboutData.aboutPageFields?.skillsSection?.selectedSkills?.length > 0
                  ? aboutData.aboutPageFields.skillsSection.selectedSkills
                  : skillsData.map(skill => ({
                      ID: skill.id,
                      post_title: skill.title,
                      post_content: skill.content,
                      post_excerpt: skill.excerpt
                    }))
              },
              personalSection: {
                ...aboutData.aboutPageFields?.personalSection,
                selectedHobbies: aboutData.aboutPageFields?.personalSection?.selectedHobbies?.length > 0
                  ? aboutData.aboutPageFields.personalSection.selectedHobbies
                  : hobbiesData.map(hobby => ({
                      ID: hobby.id,
                      post_title: hobby.title,
                      post_content: hobby.content,
                      post_excerpt: hobby.excerpt
                    }))
              }
            },
            seo: aboutData.seo
          }
        };
        
        return transformedData;
      }
    } catch (graphqlError) {
      console.warn('⚠️ GraphQL failed, falling back to REST API:', graphqlError);
    }
    
    // Fallback to REST API
    console.log('🔍 About page: Using REST API fallback');
    const WORDPRESS_REST_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '') || 'https://cms.edrishusein.com';
    
    // Test WordPress API connection first
    const apiTest = await testWordPressAPI(WORDPRESS_REST_URL);
    if (!apiTest.success) {
      console.error(`❌ WordPress API test failed: ${apiTest.issue}`);
      throw new Error(`WordPress API is not accessible: ${apiTest.issue}`);
    }
    
    // Fetch about page, skills, and hobbies in parallel
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    
    const [aboutResponse, skillsResponse, hobbiesResponse] = await Promise.all([
      fetch(`${WORDPRESS_REST_URL}/wp-json/wp/v2/pages?slug=about-me&acf_format=standard`, { 
        cache: 'no-store', 
        headers 
      }),
      fetch(`${WORDPRESS_REST_URL}/wp-json/wp/v2/skill?per_page=50`, { 
        cache: 'no-store', 
        headers 
      }),
      fetch(`${WORDPRESS_REST_URL}/wp-json/wp/v2/hobby?per_page=50`, { 
        cache: 'no-store', 
        headers 
      })
    ]);
    
    if (!aboutResponse.ok) {
      console.error(`❌ WordPress REST API failed: ${aboutResponse.status} ${aboutResponse.statusText}`);
      const errorText = await aboutResponse.text();
      console.error('Error response body:', errorText.substring(0, 200));
      throw new Error(`WordPress REST API failed: ${aboutResponse.status}`);
    }
    
    // Check if response is actually JSON
    const contentType = aboutResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`❌ WordPress returned non-JSON response. Content-Type: ${contentType}`);
      const responseText = await aboutResponse.text();
      console.error('Response preview:', responseText.substring(0, 300));
      throw new Error('WordPress returned HTML instead of JSON - likely a PHP error or wrong endpoint');
    }
    
    const aboutPages = await aboutResponse.json();
    
    if (!aboutPages || aboutPages.length === 0) {
      throw new Error('About page not found in WordPress');
    }
    
    // Get skills and hobbies data with better error handling
    let skillsData: any[] = [];
    let hobbiesData: any[] = [];
    
    // Handle skills response
    if (skillsResponse.ok) {
      try {
        const skillsContentType = skillsResponse.headers.get('content-type');
        if (skillsContentType && skillsContentType.includes('application/json')) {
          skillsData = await skillsResponse.json();
          console.log(`✅ Found ${skillsData.length} skills from WordPress`);
        } else {
          console.warn('⚠️ Skills endpoint returned non-JSON response');
          const skillsText = await skillsResponse.text();
          console.warn('Skills response preview:', skillsText.substring(0, 200));
        }
      } catch (error) {
        console.warn('⚠️ Error parsing skills JSON:', error);
      }
    } else {
      console.warn(`⚠️ Skills API failed: ${skillsResponse.status} ${skillsResponse.statusText}`);
    }
    
    // Handle hobbies response
    if (hobbiesResponse.ok) {
      try {
        const hobbiesContentType = hobbiesResponse.headers.get('content-type');
        if (hobbiesContentType && hobbiesContentType.includes('application/json')) {
          hobbiesData = await hobbiesResponse.json();
          console.log(`✅ Found ${hobbiesData.length} hobbies from WordPress`);
        } else {
          console.warn('⚠️ Hobbies endpoint returned non-JSON response');
          const hobbiesText = await hobbiesResponse.text();
          console.warn('Hobbies response preview:', hobbiesText.substring(0, 200));
        }
      } catch (error) {
        console.warn('⚠️ Error parsing hobbies JSON:', error);
      }
    } else {
      console.warn(`⚠️ Hobbies API failed: ${hobbiesResponse.status} ${hobbiesResponse.statusText}`);
    }
    
    const aboutPage = aboutPages[0];
    console.log('✅ About page: WordPress REST API data loaded');
    
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
          // Hero Section
          aboutHeroTitle: aboutPage.acf?.about_hero_title || FALLBACK_ABOUT_DATA.page.aboutPageFields?.aboutHeroTitle,
          aboutHeroSubtitle: aboutPage.acf?.about_hero_subtitle || FALLBACK_ABOUT_DATA.page.aboutPageFields?.aboutHeroSubtitle,
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
              
              // Check if experience items exist and have proper structure
              if (!experienceItems || !Array.isArray(experienceItems)) {
                console.warn('⚠️ No experience_items found or not an array');
                return FALLBACK_ABOUT_DATA.page.aboutPageFields?.experienceSection?.experienceItems || [];
              }
              
              // Filter and transform valid experience items
              const validItems = experienceItems
                .filter((item: any) => {
                  // Check if item has the expected field structure
                  const hasValidFields = item.company_name || item.position || item.duration || item.description;
                  if (!hasValidFields) {
                    console.warn('⚠️ Experience item missing required fields:', item);
                    return false;
                  }
                  return true;
                })
                .map((item: any) => ({
                  company_name: item.company_name || '',
                  position: item.position || '',
                  duration: item.duration || '',
                  description: item.description || '',
                  technologies: item.technologies // Keep raw technologies data for proper handling
                }));
              
              if (validItems.length === 0) {
                console.warn('⚠️ No valid experience items found, using fallback data');
                return FALLBACK_ABOUT_DATA.page.aboutPageFields?.experienceSection?.experienceItems || [];
              }
              
              console.log(`✅ Found ${validItems.length} valid experience items`);
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
                            <span className="hobby-name">
                              {typeof hobby.post_title === 'string' 
                                ? hobby.post_title 
                                : hobby.post_title?.rendered || hobby.title?.rendered || hobby.title || 'Hobby'}
                            </span>
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