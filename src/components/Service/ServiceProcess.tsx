import type { CSSProperties } from 'react';
import type { ServiceStep } from '@/src/lib/transform/transformService';

interface ServiceProcessProps {
  heading: string;
  steps: ServiceStep[];
}

// "How it works": numbered steps on one line that fills as the reader scrolls
// (ScrollStory sets --progress and lights each step it passes). The numbers
// carry the order, so they stay.
export default function ServiceProcess({ heading, steps }: ServiceProcessProps) {
  if (steps.length === 0) return null;
  return (
    <section className="service-block service-process" aria-labelledby="service-process-heading">
      <div className="service-wrap">
        <h2 id="service-process-heading" className="service-heading">
          {heading}
        </h2>
        <ol
          className="service-process__steps"
          data-progress
          style={{ '--count': steps.length } as CSSProperties}
        >
          {steps.map((step, index) => (
            <li key={`${step.title}-${index}`} className="service-process__step" data-step>
              <span className="service-process__marker" aria-hidden="true">
                {index + 1}
              </span>
              {step.title && <h3 className="service-process__title">{step.title}</h3>}
              {step.text && <p className="service-process__text">{step.text}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
