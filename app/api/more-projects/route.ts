// API route for fetching other projects (excluding the current one)
import { NextRequest, NextResponse } from 'next/server';
import { rewriteImageUrls } from '@/src/lib/image-utils';
import { cmsRest } from '@/src/lib/rest-client';
import { transformProjects, type RestProjectListItem } from '@/src/lib/transform/transformProjects';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const excludeSlug = searchParams.get('exclude');

  // Validate the optional exclude parameter
  if (excludeSlug && (typeof excludeSlug !== 'string' || excludeSlug.length > 100 || !/^[a-z0-9\-]+$/.test(excludeSlug))) {
    return NextResponse.json({ error: 'Invalid exclude parameter' }, { status: 400 });
  }

  try {
    const projects = await cmsRest<RestProjectListItem[]>(
      '/project?_embed&per_page=10&orderby=menu_order&order=asc&acf_format=standard'
    );

    if (!Array.isArray(projects)) {
      throw new Error('Unexpected REST projects response');
    }

    const { projects: { nodes } } = transformProjects(projects);
    const limited = nodes
      .filter((project) => project.slug !== excludeSlug)
      .slice(0, 3);

    return NextResponse.json(
      rewriteImageUrls({ projects: { nodes: limited }, source: 'wordpress' })
    );
  } catch (error) {
    console.error('Error fetching more projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
