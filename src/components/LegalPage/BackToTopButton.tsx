'use client';

interface BackToTopButtonProps {
  className?: string;
}

export default function BackToTopButton({ className }: BackToTopButtonProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button 
      onClick={scrollToTop}
      className={className}
      aria-label="Back to top"
    >
      ↑ Back to Top
    </button>
  );
}