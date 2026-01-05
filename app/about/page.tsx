// app/about/page.tsx
import Image from 'next/image';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import { Metadata } from 'next';
import { generateEnhancedMetadata, generateStructuredData } from '@/src/lib/seo-utils';
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

// Comprehensive fallback data - mirrors complete WordPress About page content
const FALLBACK_ABOUT_DATA = {
  page: {
    id: "about-fallback",
    title: "About Edris Husein",
    content: `<div class="about-text">
    <h3 class="wp-block-heading"><span class="q-box qu-userSelect--text">From a very young age</span></h3>

<p>Technology has fascinated me since childhood. I was the kid fixing old PCs, repairing phones, and helping neighbors with anything that had a cable. Back then it was just curiosity, but deep down I dreamed of one day becoming a software engineer.</p>

<h3 class="wp-block-heading">A path shaped by responsibility</h3>

<p>That dream of going to college never became reality. War forced me to leave my home, and at seventeen I arrived in Austria as a refugee. I came alone, carrying the responsibilities of a thirty-year-old man while still a teenager.</p>

<p>Even before that I had already started working young to help my father provide for our family. My teenage years were not about freedom, but about making sure my siblings had food on the table and the chance to go to school in peace.</p>

<p>Life in Austria was a new beginning but not an easy one. I did not speak the language, I had no network, no mentors, and no direct path into the tech world I dreamed of. I faced rejection after rejection when I tried to get a chance to learn code. Most days it was just me, my laptop, and many failures.</p>

<p>My first break came when a company trusted me with a tiny PHP assignment. Ten lines of code, nothing more. For most developers it would have been trivial, but for me it was everything. Solving that small problem lit a fire. It proved that even without a degree or a mentor, I could figure things out. That moment turned persistence into passion.</p>

<h3 class="wp-block-heading">From assistant to developer</h3>

<p>In 2019 I started as a Digital Assistant, handling website updates and client tasks. I could have stopped there, but I kept digging deeper. I wanted to understand the systems behind the screens, not just push the buttons in front of them.</p>

<p>Step by step, through long nights of study and failure, I grew into WordPress development and later into modern frameworks like React and Next.js. What began as survival slowly became a craft. Today I build websites that are not only fast and functional but also truly useful for the people who rely on them.</p>

<h3 class="wp-block-heading">What I do today</h3>

<p><strong data-start="2354" data-end="2379">WordPress development</strong>: custom themes, WooCommerce setups, performance tuning, and plugin customizations that most developers avoid.</p>

<p><strong data-start="2493" data-end="2519">Modern web development</strong>: React, Next.js, TypeScript. I combine these tools with WordPress to create hybrid solutions that are flexible, scalable, and future-ready.</p>

<h3 class="wp-block-heading">Why I love this work</h3>

<p>Every project is a puzzle with a human side hidden in the technical one.<br data-start="2899" data-end="2902">How do you make healthcare information clear and accessible?<br data-start="2962" data-end="2965">How do you explain complex security services without drowning users in jargon?<br data-start="3043" data-end="3046">How do you design something that works on a slow phone connection in rural Austria as well as on a large screen in Vienna?</p>

<p>For me, development is not just about code. It is about solving problems in a way that makes life easier for real people.</p>

<h3 class="wp-block-heading">Beyond code</h3>

<p>I am a husband and a father, and those roles keep me grounded. My son teaches me patience and perspective in ways no project ever could. My family reminds me daily why I do this work and why persistence matters.</p>

<p>Outside of client work I read constantly, explore new frameworks, and push myself to grow. I am driven by the belief that pressure and responsibility can be turned into fuel, and that becoming better at what I do also means becoming a better coworker and a better person.</p>

<h3 class="wp-block-heading">What drives me</h3>

<p>Belonging is not about blending in. It is about being accepted as you are and having the chance to contribute. That belief runs through both my life and my work.</p>

<p>I build bridges. Between design and functionality. Between businesses and users. Between the life I came from and the one I am creating now.</p>
</div>`,
    featuredImage: {
      node: {
        sourceUrl: "/images/Edris-Husein-Hero.png",
        altText: "Edris Husein - Full-Stack Developer",
        mediaDetails: { width: 450, height: 450 }
      }
    },
    seo: {
      title: "About Edris Husein - Full-Stack Developer",
      metaDesc: "Learn about Edris Husein, a full-stack developer specializing in React, Next.js, and WordPress. Discover his experience, skills, and passion for creating modern web applications.",
      canonical: "https://edrishusein.com/about"
    },
    aboutPageFields: {
      aboutHeroTitle: "About Edris Husein",
      aboutHeroSubtitle: "Full-stack developer passionate about creating exceptional digital experiences",
      aboutHeroImage: {
        node: {
          sourceUrl: "/images/Edris-Husein-Hero.png",
          altText: "Edris Husein - Professional Developer Portrait",
          mediaDetails: { width: 450, height: 450 }
        }
      },
      experienceSection: {
        sectionTitle: "Professional Experience",
        experienceItems: [
          {
            company_name: "Self-Employed",
            position: "Freelance Web Developer",
            duration: "May 2024 – Present",
            description: "<p><strong>What I do:</strong></p><ul><li>Design and develop custom WordPress websites with a focus on performance, usability, and scalability</li><li>Create and customize themes and plugins using PHP, JavaScript, and modern frontend tools</li><li>Manage complete project lifecycles from consultation to launch, including planning, development, and delivery</li><li>Integrate APIs and third-party services to extend functionality</li><li>Provide ongoing website maintenance, performance optimization, and troubleshooting</li><li>Work directly with clients to align solutions with business goals and ensure long-term results</li></ul><p><strong>Key achievements:</strong></p><ul><li>Delivered multiple client projects independently, from scratch builds to redesigns and optimizations</li><li>Established a consistent workflow combining WordPress with modern frameworks like React and Next.js</li><li>Built lasting client relationships by providing reliable support and clear technical solutions</li></ul>",
            technologies: "WordPress, PHP, React, Next.js, JavaScript, CSS, SCSS"
          },
          {
            company_name: "Baschnegger Ammann Partner",
            position: "Web Developer",
            duration: "2023 - May 2024",
            description: "<p><strong>What I do:</strong></p><ul><li>Built custom WordPress themes and plugins using PHP, JavaScript, and modern CSS</li><li>Collaborate with design and strategy teams to translate business requirements into technical solutions</li><li>Handle multiple client projects simultaneously while maintaining code quality standards</li></ul><p><strong>Key achievements:</strong></p><ul><li>Successfully delivered 10+ client projects with zero critical bugs post-launch</li><li>Improved average website loading speeds by 40% through code optimization</li><li>Implemented custom booking systems and e-commerce solutions for local businesses</li></ul>",
            technologies: "WordPress, PHP, JavaScript, CSS, SCSS, Elementor"
          },
          {
            company_name: "bobdo GmbH",
            position: "Junior WordPress Developer",
            duration: "2021 - 2023",
            description: "<p>The learning phase: This role marked my transition from general digital assistance to specialized WordPress development. Here's where I really sharpened my technical skills.</p><p><strong>What I accomplished:</strong></p><ul><li>Develop custom WordPress functionalities that directly improve client website usability and user experience</li><li>Collaborated with senior developers to implement complex website features</li><li>Mastered plugin integration and custom code implementation for unique design requirements</li></ul><p><strong>Skills developed:</strong></p><ul><li>Advanced PHP programming for WordPress</li><li>Custom post types and advanced custom fields</li><li>Performance optimization techniques</li><li>Client communication and project management</li></ul>",
            technologies: "PHP, CSS, SCSS, GitHub, LocalWP, WordPress, JavaScript, jQuery"
          },
          {
            company_name: "bobdo GmbH",
            position: "Digital Assistant & Webmaster",
            duration: "2019 - 2021",
            description: "<p>Where it all started: My entry point into the web development world. Started handling client inquiries but quickly gravitated toward the technical side.</p><p><strong>Key responsibilities:</strong></p><ul><li>Assisted clients with training and education-related inquiries (developed strong client communication skills)</li><li>Built landing pages, dashboards, and online shops using Elementor, WooCommerce, and Unbounce</li><li>Managed website content and basic technical maintenance</li><li>Learned the fundamentals of user experience and client needs</li></ul><p>The turning point: This role showed me that I loved the problem-solving aspect of web development more than general digital assistance, leading me to pursue formal full-stack training.</p>",
            technologies: "CSS, JavaScript, WordPress, Elementor"
          }
        ]
      },
      skillsSection: {
        sectionTitle: "Skills & Technologies",
        selectedSkills: [
          { ID: 1, post_title: "Adaptability", post_excerpt: "" },
          { ID: 2, post_title: "Flexibility", post_excerpt: "" },
          { ID: 3, post_title: "Initiative", post_excerpt: "" },
          { ID: 4, post_title: "Networking", post_excerpt: "" },
          { ID: 5, post_title: "Organization", post_excerpt: "" },
          { ID: 6, post_title: "Project management", post_excerpt: "" },
          { ID: 7, post_title: "Research & analysis", post_excerpt: "" },
          { ID: 8, post_title: "Teaching / mentoring", post_excerpt: "" },
          { ID: 9, post_title: "Time management", post_excerpt: "" }
        ]
      },
      personalSection: {
        sectionTitle: "Beyond the Code",
        personalContent: "<p>When I'm not immersed in code, life is wonderfully full and varied. I'm a devoted family man who cherishes time with my partner and our energetic toddler, who constantly reminds me that the best user interfaces are often the simplest ones.</p><p>I'm an avid reader with a particular passion for technical literature that expands my understanding of software architecture, system design, and development best practices. My bookshelf is filled with classics like 'Clean Code' and 'The Pragmatic Programmer,' alongside newer insights on modern web development and emerging technologies.</p><p>I actively contribute to open-source projects when time permits, believing that knowledge sharing strengthens our entire developer community. I also enjoy attending tech meetups and conferences (both virtual and in-person) to stay connected with industry trends and learn from fellow developers.</p><p>Technology research is more than a professional requirement for me—it's a genuine hobby. I love exploring emerging frameworks, experimenting with new tools, and understanding how they might solve real-world problems more elegantly.</p><p>In quieter moments, I enjoy photography, particularly capturing the interplay between natural and urban environments, which often inspires my approach to user interface design and the balance between functionality and aesthetics.</p>",
        personalImage: {
          node: {
            sourceUrl: "/images/Edris-Husein-Hero.png",
            altText: "Edris Husein - Personal Life and Interests",
            mediaDetails: { width: 450, height: 450 }
          }
        },
        selectedHobbies: [
          { 
            ID: 1, 
            post_title: "Family IT Nerd", 
            post_excerpt: ""
          },
          { 
            ID: 2, 
            post_title: "Football", 
            post_excerpt: ""
          },
          { 
            ID: 3, 
            post_title: "Video games", 
            post_excerpt: ""
          },
          { 
            ID: 4, 
            post_title: "Chasing after my toddler who likes to test my keyboard durability.", 
            post_excerpt: ""
          }
        ]
      }
    }
  }
};

// Helper function to test WordPress API endpoint
async function testWordPressAPI(baseUrl: string): Promise<{success: boolean, issue?: string}> {
  try {
    // console.log(`🔍 Testing WordPress API at: ${baseUrl}`);
    
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
    // console.log(`✅ WordPress API is accessible. Routes available:`, Object.keys(apiData.routes || { }).length);
    return {success: true };
    
  } catch (error) {
    return {
      success: false,
    issue: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

    async function getAboutPageData(): Promise<AboutPageData> {
  try {
    // console.log('🔍 About page: Trying GraphQL first, then REST API fallback');

    // Try GraphQL first
    try {
      const {client} = await import('@/src/lib/client');
      const {GET_ABOUT_PAGE_DATA, GET_ALL_SKILLS, GET_ALL_HOBBIES} = await import('@/src/lib/queries/about');

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
        // console.log('✅ About page: GraphQL data loaded successfully');
      }

      if (skillsResponse.status === 'fulfilled' && skillsResponse.value?.skills?.nodes) {
        skillsData = skillsResponse.value.skills.nodes;
        // console.log(`✅ Found ${skillsData.length} skills via GraphQL`);
      }

      if (hobbiesResponse.status === 'fulfilled' && hobbiesResponse.value?.hobbies?.nodes) {
        hobbiesData = hobbiesResponse.value.hobbies.nodes;
        // console.log(`✅ Found ${hobbiesData.length} hobbies via GraphQL`);
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
        // console.warn('⚠️ GraphQL failed, falling back to REST API:', graphqlError);
      }

    // Fallback to REST API
      // console.log('🔍 About page: Using REST API fallback');
      const WORDPRESS_REST_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '') || 'https://cms.edrishusein.com';

      // Test WordPress API connection first
      const apiTest = await testWordPressAPI(WORDPRESS_REST_URL);
      if (!apiTest.success) {
      // console.error(`❌ WordPress API test failed: ${apiTest.issue}`);
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
      // console.error(`❌ WordPress REST API failed: ${aboutResponse.status} ${aboutResponse.statusText}`);
      const errorText = await aboutResponse.text();
      // console.error('Error response body:', errorText.substring(0, 200));
      throw new Error(`WordPress REST API failed: ${aboutResponse.status}`);
    }

      // Check if response is actually JSON
      const contentType = aboutResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
      // console.error(`❌ WordPress returned non-JSON response. Content-Type: ${contentType}`);
      const responseText = await aboutResponse.text();
      // console.error('Response preview:', responseText.substring(0, 300));
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
          // console.log(`✅ Found ${skillsData.length} skills from WordPress`);
        } else {
          // console.warn('⚠️ Skills endpoint returned non-JSON response');
          const skillsText = await skillsResponse.text();
          // console.warn('Skills response preview:', skillsText.substring(0, 200));
        }
      } catch (error) {
        // console.warn('⚠️ Error parsing skills JSON:', error);
      }
    } else {
        // console.warn(`⚠️ Skills API failed: ${skillsResponse.status} ${skillsResponse.statusText}`);
      }

    // Handle hobbies response
      if (hobbiesResponse.ok) {
      try {
        const hobbiesContentType = hobbiesResponse.headers.get('content-type');
      if (hobbiesContentType && hobbiesContentType.includes('application/json')) {
        hobbiesData = await hobbiesResponse.json();
          // console.log(`✅ Found ${hobbiesData.length} hobbies from WordPress`);
        } else {
          // console.warn('⚠️ Hobbies endpoint returned non-JSON response');
          const hobbiesText = await hobbiesResponse.text();
          // console.warn('Hobbies response preview:', hobbiesText.substring(0, 200));
        }
      } catch (error) {
        // console.warn('⚠️ Error parsing hobbies JSON:', error);
      }
    } else {
        // console.warn(`⚠️ Hobbies API failed: ${hobbiesResponse.status} ${hobbiesResponse.statusText}`);
      }

      const aboutPage = aboutPages[0];
      // console.log('✅ About page: WordPress REST API data loaded');

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
                // console.warn('⚠️ No experience_items found or not an array');
                return FALLBACK_ABOUT_DATA.page.aboutPageFields?.experienceSection?.experienceItems || [];
              }

      // Filter and transform valid experience items
      const validItems = experienceItems
                .filter((item: any) => {
                  // Check if item has the expected field structure
                  const hasValidFields = item.company_name || item.position || item.duration || item.description;
      if (!hasValidFields) {
                    // console.warn('⚠️ Experience item missing required fields:', item);
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
                // console.warn('⚠️ No valid experience items found, using fallback data');
                return FALLBACK_ABOUT_DATA.page.aboutPageFields?.experienceSection?.experienceItems || [];
              }

              // console.log(`✅ Found ${validItems.length} valid experience items`);
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
    // console.error('❌ About page: WordPress API error, using fallback:', error);
    return FALLBACK_ABOUT_DATA;
  }
}

      export async function generateMetadata(): Promise<Metadata> {
  const data = await getAboutPageData();
        const page = data.page;

        return generateEnhancedMetadata(
        page.seo,
        {
          title: 'About - Edris Husein',
        description: 'Learn more about Edris Husein, full-stack developer passionate about creating exceptional digital experiences.',
        path: '/about',
        type: 'website'
    }
        );
}

        export default async function AboutPage() {
  const data = await getAboutPageData();
        const page = data.page;
        const fields = page.aboutPageFields;

        // Generate structured data
        const structuredData = generateStructuredData('WebPage', {
          title: page.title,
        description: page.seo?.metaDesc || 'Learn more about Edris Husein',
        canonical: page.seo?.canonical || 'https://edrishusein.com/about'
  });

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

          {/* Structured Data for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData),
            }}
          />
        </>
        );
}