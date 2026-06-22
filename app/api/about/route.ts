// REST API endpoint for About page data
import { NextResponse } from 'next/server';
import { rewriteImageUrls } from '@/src/lib/image-utils';
import { cmsRest } from '@/src/lib/rest-client';
import { transformAbout } from '@/src/lib/transform/transformAbout';

export async function GET() {
  try {
    const pages = await cmsRest<unknown[]>('/pages?slug=about-me&acf_format=standard&_embed');

    if (!Array.isArray(pages) || pages.length === 0) {
      throw new Error('About page not found');
    }

    const transformed = transformAbout(pages[0] as never);

    return NextResponse.json(
      rewriteImageUrls({
        data: transformed,
        _meta: { source: 'wordpress-rest' },
      })
    );
  } catch (error) {
    console.error('About page REST API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch About page data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
