import './SectionHeader.scss';

interface SectionHeaderProps {
  number: string;
  title: string;
  variant?: 'dark' | 'light';
}

const SectionHeader = ({ 
  number, 
  title, 
  variant = 'dark' 
}: SectionHeaderProps) => {
  return (
    <div className={`section-header ${variant}`}>
      <h2 className="section-number">{number}</h2>
      <h2 className="section-title">{title}</h2>
    </div>
  );
};

export default SectionHeader;