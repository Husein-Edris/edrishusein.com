// app/about/page.tsx
import Image from 'next/image';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import { client } from '@/src/lib/client';
import { GET_ABOUT_PAGE } from '@/src/lib/queries';
import { Metadata } from 'next';
import '@/src/styles/pages/About.scss';

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
    experienceItems: Array<{
      companyName: string;
      position: string;
      duration: string;
      description: string;
      technologies: string;
    }>;
  };
  skillsSection?: {
    sectionTitle: string;
    skillCategories: Array<{
      categoryName: string;
      skills: Array<{
        skillName: string;
        proficiencyLevel: string;
      }>;
    }>;
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
            companyName: "Freelance",
            position: "Full-Stack Developer",
            duration: "2020 - Present",
            description: "Developing modern web applications using React, Next.js, and WordPress",
            technologies: "React, Next.js, WordPress, TypeScript"
          }
        ]
      },
      skillsSection: {
        sectionTitle: "Skills & Technologies",
        skillCategories: [
          {
            categoryName: "Frontend",
            skills: [
              { skillName: "React", proficiencyLevel: "Expert" },
              { skillName: "Next.js", proficiencyLevel: "Expert" },
              { skillName: "TypeScript", proficiencyLevel: "Advanced" },
              { skillName: "SCSS", proficiencyLevel: "Expert" }
            ]
          },
          {
            categoryName: "Backend",
            skills: [
              { skillName: "Node.js", proficiencyLevel: "Advanced" },
              { skillName: "WordPress", proficiencyLevel: "Expert" },
              { skillName: "GraphQL", proficiencyLevel: "Advanced" }
            ]
          }
        ]
      },
      personalSection: {
        sectionTitle: "Personal",
        personalContent: "When I'm not coding, I enjoy reading, exploring new technologies, and working on personal projects that challenge my creativity and technical skills."
      }
    }
  }
};

async function getAboutPageData(): Promise<AboutPageData> {
  try {
    console.log('🔍 Fetching about page data from WordPress...');
    const data: AboutPageData = await client.request(GET_ABOUT_PAGE);
    
    if (!data.page) {
      console.warn('⚠️ No about page found, using fallback data');
      return FALLBACK_ABOUT_DATA;
    }
    
    console.log('✅ About page data loaded successfully');
    return data;
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
        {fields?.experienceSection && (
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
                    <h4 className="company">{item.companyName}</h4>
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
        {fields?.skillsSection && (
          <section className="about-skills">
            <div className="container">
              <h2 className="section-title">{fields.skillsSection.sectionTitle}</h2>
              <div className="skills-grid">
                {fields.skillsSection.skillCategories.map((category, index) => (
                  <div key={index} className="skill-category">
                    <h3 className="category-title">{category.categoryName}</h3>
                    <div className="skills-list">
                      {category.skills.map((skill, skillIndex) => (
                        <div key={skillIndex} className="skill-item">
                          <span className="skill-name">{skill.skillName}</span>
                          <span className="skill-level">{skill.proficiencyLevel}</span>
                        </div>
                      ))}
                    </div>
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