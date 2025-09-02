import Image from 'next/image';
import '../../loading.scss';

export default function Loading() {
  return (
    <div className="loading-page">
      <div className="loading-container">
        <div className="logo-spinner">
          <div className="logo-circle">
            <Image
              src="/edrishusein-logo.svg"
              alt="Edris Husein Logo"
              width={60}
              height={30}
              className="logo-image"
            />
          </div>
          <div className="pulse-rings">
            <div className="pulse-ring"></div>
            <div className="pulse-ring"></div>
            <div className="pulse-ring"></div>
          </div>
        </div>
        <p className="loading-text">Loading project...</p>
      </div>
    </div>
  );
}