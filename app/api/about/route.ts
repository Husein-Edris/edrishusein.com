// REST API endpoint for About page data
import { NextRequest, NextResponse } from 'next/server';
import { AboutPageACF, ACFImageField } from '@/src/types/api';
import { rewriteImageUrls } from '@/src/lib/image-utils';

const WORDPRESS_REST_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '') || 'https://cms.edrishusein.com';

export async function GET() {
  try {
    console.log('🔍 Fetching About page data from WordPress REST API');
    
    // Get the About page by slug
    const aboutResponse = await fetch(`${WORDPRESS_REST_URL}/wp-json/wp/v2/pages?slug=about-me`);
    
    if (!aboutResponse.ok) {
      throw new Error(`About page fetch failed: ${aboutResponse.status}`);
    }
    
    const aboutPages = await aboutResponse.json();
    
    if (!aboutPages || aboutPages.length === 0) {
      throw new Error('About page not found');
    }
    
    const aboutPage = aboutPages[0];
    console.log('✅ About page found:', aboutPage.title?.rendered);
    
    // Get ACF fields for the about page
    let acfData = null;
    try {
      const acfResponse = await fetch(`${WORDPRESS_REST_URL}/wp-json/wp/v2/pages/${aboutPage.id}?acf_format=standard`);
      if (acfResponse.ok) {
        const fullPage = await acfResponse.json();
        acfData = fullPage.acf_fields || fullPage.acf || null;
        console.log('✅ ACF fields retrieved:', acfData ? Object.keys(acfData) : 'none');
      }
    } catch (acfError) {
      console.warn('⚠️ ACF data fetch failed:', acfError instanceof Error ? acfError.message : 'Unknown error');
    }
    
    // Transform the data to match the expected structure
    const transformedData = {
      page: {
        id: aboutPage.id.toString(),
        title: aboutPage.title?.rendered || 'About',
        content: aboutPage.content?.rendered || '',
        featuredImage: aboutPage._embedded?.['wp:featuredmedia']?.[0] ? {
          node: {
            sourceUrl: aboutPage._embedded['wp:featuredmedia'][0].source_url,
            altText: aboutPage._embedded['wp:featuredmedia'][0].alt_text,
            mediaDetails: {
              width: aboutPage._embedded['wp:featuredmedia'][0].media_details?.width || 400,
              height: aboutPage._embedded['wp:featuredmedia'][0].media_details?.height || 400
            }
          }
        } : null,
        aboutPageFields: acfData ? await transformACFData(acfData) : null
      }
    };
    
    console.log('✅ About page data transformed successfully');
    
    return NextResponse.json(rewriteImageUrls({
      data: transformedData,
      _meta: {
        source: 'wordpress-rest',
        hasACF: !!acfData
      }
    }));
    
  } catch (error) {
    console.error('❌ About page REST API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch About page data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Transform ACF data to match expected structure
async function transformACFData(acf: AboutPageACF) {
  if (!acf) return null;
  
  console.log('🔄 Transforming ACF data for About page:', Object.keys(acf));
  
  return {
    aboutHeroTitle: acf.about_hero_title || '',
    aboutHeroSubtitle: acf.about_hero_subtitle || '',
    aboutHeroImage: acf.about_hero_image ? {
      node: {
        sourceUrl: acf.about_hero_image.url || acf.about_hero_image.source_url || '',
        altText: acf.about_hero_image.alt || acf.about_hero_image.alt_text || 'About Hero Image',
        mediaDetails: {
          width: acf.about_hero_image.width || 400,
          height: acf.about_hero_image.height || 400
        }
      }
    } : null,
    experienceSection: {
      sectionTitle: acf.experience_section_title || 'Experience',
      experienceItems: acf.experience_items || []
    },
    skillsSection: {
      sectionTitle: acf.skills_section_title || 'Skills & Technologies',
      selectedSkills: acf.selected_skills || []
    },
    personalSection: {
      sectionTitle: acf.personal_section_title || 'Personal',
      personalContent: acf.personal_content || '',
      personalImage: acf.personal_image ? {
        node: {
          sourceUrl: acf.personal_image.url || acf.personal_image.source_url || '',
          altText: acf.personal_image.alt || acf.personal_image.alt_text || 'Personal Image',
          mediaDetails: {
            width: acf.personal_image.width || 400,
            height: acf.personal_image.height || 400
          }
        }
      } : null,
      selectedHobbies: acf.selected_hobbies || []
    }
  };
}