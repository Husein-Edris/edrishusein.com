// app/projects/[slug]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import '@/src/styles/pages/CaseStudy.scss';

export default function ProjectPage() {
  const params = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('Fetching project data for slug:', slug);

        const response = await fetch(`/api/project?slug=${slug}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `HTTP error! Status: ${response.status}`);
        }

        if (!data.project) {
          throw new Error('Project data is missing');
        }

        console.log('Successfully received project data:', data.project.title);
        setProject(data.project);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err.message);
        setErrorDetails(err.details || null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="case-study">
          <div className="container">
            <h1 className="title">Loading project...</h1>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !project) {
    return (
      <>
        <Header />
        <main className="case-study">
          <div className="container">
            <h1 className="title">Project Not Found</h1>
            <p>Sorry, we couldn't find the project you're looking for.</p>
            {error && (
              <div className="error-details">
                <p>Error: {error}</p>
                {errorDetails && <p>Details: {errorDetails}</p>}
              </div>
            )}
            <Link href="/projects" className="link-button">
              Back to Projects
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="case-study">
        <div className="hero-section">
          <div className="container">
            <h1 className="title">{project.title}</h1>
            {project.excerpt && (
              <div
                className="overview"
                dangerouslySetInnerHTML={{ __html: project.excerpt }}
              />
            )}
          </div>
        </div>

        <div className="container">
          {/* Featured Image */}
          {project.featuredImage?.node && (
            <div className="featured-image">
              <Image
                src={project.featuredImage.node.sourceUrl}
                alt={project.featuredImage.node.altText || project.title}
                width={1200}
                height={600}
                className="project-featured-image"
              />
            </div>
          )}

          {/* Main Content */}
          <section className="project-content">
            <div
              className="content-wrapper"
              dangerouslySetInnerHTML={{ __html: project.content }}
            />
          </section>

          {/* Project Links */}
          <section className="links">
            <Link href="/projects" className="link-button">
              Back to Projects
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}