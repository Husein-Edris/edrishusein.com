import './SectionHeader.scss';

interface SectionHeaderProps {
  number: string;
  title: string;
}

const SectionHeader = ({ number, title }: SectionHeaderProps) => {
  return (
    <div className="section-header">
      <h2 className="section-number">{number}</h2>
      <h2 className="section-title">{title}</h2>
    </div>
  );
};

export default SectionHeader;