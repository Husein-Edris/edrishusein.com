// app/about/page.tsx
import Image from 'next/image';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import { Metadata } from 'next';
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
    console.log('🔍 Fetching about page data via REST API...');
    
    // Use our API endpoint for proper data transformation
    const apiResponse = await fetch(`${process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : ''}/api/about`, {
      next: { revalidate: 3600 }
    });
    
    if (apiResponse.ok) {
      const result = await apiResponse.json();
      if (result.data) {
        console.log('✅ About page data loaded successfully from API');
        return result.data;
      }
    }
    
    console.warn('⚠️ REST API failed, using fallback data');
    return FALLBACK_ABOUT_DATA;
  } catch (error) {
    console.error('❌ Error fetching about page data:', error);
    console.log('🔄 Using fallback about page data');
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