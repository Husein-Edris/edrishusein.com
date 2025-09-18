import { Metadata } from 'next';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import CookiePreferences from '@/src/components/CookiePreferences/CookiePreferences';
import { generateEnhancedMetadata } from '@/src/lib/seo-utils';
import '@/src/styles/pages/CookieSettings.scss';

export const metadata: Metadata = generateEnhancedMetadata(
  undefined,
  {
    title: 'Cookie Settings - Edris Husein',
    description: 'Manage your cookie preferences and privacy settings.',
    path: '/cookie-settings',
    type: 'website'
  }
);

export default function CookieSettingsPage() {
  return (
    <>
      <Header />
      <main className="cookie-settings-page">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Cookie Settings</h1>
            <p className="page-description">
              Manage your cookie preferences to control how we collect and use data on this website. 
              You can change these settings at any time.
            </p>
          </div>
          
          <div className="cookie-preferences-wrapper">
            <CookiePreferences isStandalone={true} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}