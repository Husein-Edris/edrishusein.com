// Dynamic section renderer for homepage sections
import { SectionConfig } from '@/src/lib/section-registry';
import Hero from '@/src/components/Hero/Hero';
import About from '@/src/components/about/about';
import InfoCards from '@/src/components/InfoCards/InfoCards';
import Contact from '@/src/components/Contact/Contact';

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
} as const;

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

  return (
    <>
      {sortedSections.map((section) => (
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