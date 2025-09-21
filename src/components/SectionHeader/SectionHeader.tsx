import './SectionHeader.scss';

interface SectionHeaderProps {
  number?: string;
  title: string;
  variant?: 'dark' | 'light';
  hideNumber?: boolean;
}

const SectionHeader = ({ 
  number, 
  title, 
  variant = 'dark',
  hideNumber = false
}: SectionHeaderProps) => {
  return (
    <div className={`section-header ${variant}`}>
      {!hideNumber && number && <h2 className="section-number">{number}</h2>}
      <h2 className="section-title">{title}</h2>
    </div>
  );
};

export default SectionHeader;