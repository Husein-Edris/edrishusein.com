// src/components/Hero/Hero.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { HeroSection } from '@/src/types/wordpress';
import './Hero.scss';

interface HeroProps {
  data?: HeroSection;
}

const Hero = ({ data }: HeroProps) => {
  const [imageError, setImageError] = useState(false);

  // Fallback data
  const fallbackData: HeroSection = {
    title: "<span class=\"subTitle\">I'm</span>EDRIS<span class=\"wave\">👋🏻</span>",
    heroCopy: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    heroImage: {
      node: {
        sourceUrl: "/images/Edris-Husein-Hero.png",
        altText: "Profile Image",
        mediaDetails: {
          width: 450,
          height: 450
        }
      }
    }
  };

  const content = data || fallbackData;

  // Clean the hero copy
  const cleanHeroCopy = content.heroCopy?.replace(/\r\n/g, '').trim();

  // Process title HTML
  const processedTitle = content.title?.replace(/className=/g, 'class=');

  // Image properties - updated for ACF GraphQL structure
  const imageProps = {
    src: content.heroImage?.node?.sourceUrl || '/images/Edris-Husein-Hero.png',
    alt: content.heroImage?.node?.altText || 'Profile Image',
    width: content.heroImage?.node?.mediaDetails?.width || 450,
    height: content.heroImage?.node?.mediaDetails?.height || 450,
  };

  return (
    <section className="hero">
      <div className="container">
        <div className="profile-wrapper">
          {!imageError ? (
            <Image
              {...imageProps}
              className="profile-image"
              priority
              quality={85}
              sizes="(max-width: 768px) 280px, 450px"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAECASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8A2gA="
              style={{ width: 'auto', height: 'auto' }}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="image-error">
              Failed to load image
            </div>
          )}
        </div>
        <div className="content">
          <h1 
            className="title"
            dangerouslySetInnerHTML={{ __html: processedTitle || '' }}
          />
          <p className="description">
            {cleanHeroCopy}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;