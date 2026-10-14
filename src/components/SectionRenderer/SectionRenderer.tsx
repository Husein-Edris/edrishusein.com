// Dynamic section renderer for homepage sections
import { SectionConfig } from '@/src/lib/section-registry';
import Hero from '@/src/components/Hero/Hero';
import About from '@/src/components/about/about';
import InfoCards from '@/src/components/InfoCards/InfoCards';
import Contact from '@/src/components/Contact/Contact';
import Testimonials from '@/src/components/Testimonials/Testimonials';
import HeroScene from '@/src/components/HeroScene/HeroScene';

interface SectionRendererProps {
  sections: SectionConfig[];
}

interface SectionWrapperProps {
  config: SectionConfig;
}

// Component mapping
const COMPONENT_MAP = {
  hero: Hero,
  about: About,
  projects: InfoCards,
  infocards: InfoCards,
  contact: Contact,
  testimonials: Testimonials,
} as const;

// Leading sections drawn over the shared hero background.
const BAND_COMPONENTS = new Set<string>(['hero', 'testimonials']);

// Individual section wrapper
function SectionWrapper({ config }: SectionWrapperProps) {
  if (!config.enabled) return null;

  const Component = COMPONENT_MAP[config.component];

  if (!Component) {
    console.warn(`Component not found for: ${config.component}`);
    return null;
  }

  return (
    <section 
      id={config.id} 
      data-section={config.component}
      data-order={config.order}
    >
      <Component {...config.props} />
    </section>
  );
}

// Main section renderer
export default function SectionRenderer({ sections }: SectionRendererProps) {
  // Sort sections by order
  const sortedSections = sections.sort((a, b) => a.order - b.order);

  // Hero and testimonials share one background (the dot terrain), so the
  // opening of the page reads as one block. Other sections render as before.
  const bandEnd = sortedSections.findIndex((section) => !BAND_COMPONENTS.has(section.component));
  const band = bandEnd === -1 ? sortedSections : sortedSections.slice(0, bandEnd);
  const rest = bandEnd === -1 ? [] : sortedSections.slice(bandEnd);

  return (
    <>
      {band.length > 0 && (
        <div className="hero-band">
          <HeroScene />
          {band.map((section) => (
            <SectionWrapper key={section.id} config={section} />
          ))}
        </div>
      )}
      {rest.map((section) => (
        <SectionWrapper key={section.id} config={section} />
      ))}
    </>
  );
}

// Hook for managing sections
export function useSections(sections: SectionConfig[]) {
  const enabledSections = sections.filter(s => s.enabled);
  const disabledSections = sections.filter(s => !s.enabled);
  
  return {
    enabled: enabledSections,
    disabled: disabledSections,
    total: sections.length,
    enabledCount: enabledSections.length
  };
}