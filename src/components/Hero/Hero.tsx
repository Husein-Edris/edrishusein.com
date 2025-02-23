// src/components/Hero/Hero.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';
import './Hero.scss';

interface MediaDetails {
  height: number;
  width: number;
}

interface HeroImageNode {
  sourceUrl: string;
  altText: string;
  mediaDetails: MediaDetails;
}

interface HeroImage {
  node: HeroImageNode;
}

interface HeroSection {
  title: string;
  heroCopy: string;
  heroImage: HeroImage;
}

interface HeroProps {
  data?: HeroSection;
}

const Hero = ({ data }: HeroProps) => {
  const [imageError, setImageError] = useState(false);

  // Fallback data
  const fallbackData = {
    title: "<span class=\"subTitle\">I'm</span>EDRIS<span class=\"wave\">👋🏻</span>",
    heroCopy: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    heroImage: {
      node: {
        sourceUrl: "/images/default-profile.jpg",
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

  // Image properties
  const imageProps = {
    src: content.heroImage?.node?.sourceUrl || '/images/default-profile.jpg',
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
            dangerouslySetInnerHTML={{ __html: processedTitle }}
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