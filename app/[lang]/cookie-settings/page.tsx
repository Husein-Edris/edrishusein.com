import { Metadata } from 'next';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import CookiePreferences from '@/src/components/CookiePreferences/CookiePreferences';
import { generateEnhancedMetadata } from '@/src/lib/seo-utils';
import { getSiteContentOrDefaults } from '@/src/lib/site-content';
import { dictionary } from '@/src/lib/i18n/dictionary';
import { langFromParams, type LangParams } from '@/src/lib/i18n/route';
import '@/src/styles/pages/CookieSettings.scss';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langFromParams(params);
  const { meta } = await getSiteContentOrDefaults(lang);
  return generateEnhancedMetadata(null, {
    title: meta.cookieSettingsTitle,
    description: meta.cookieSettingsDescription,
    path: '/cookie-settings',
    type: 'website',
    lang,
  });
}

export default async function CookieSettingsPage({ params }: LangParams) {
  const lang = await langFromParams(params);
  const { footer } = await getSiteContentOrDefaults(lang);
  const text = dictionary(lang);

  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="cookie-settings-page">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">{footer.cookieSettingsLabel}</h1>
            <p className="page-description">{text.cookieSettingsIntro}</p>
          </div>
          
          <div className="cookie-preferences-wrapper">
            <CookiePreferences isStandalone={true} />
          </div>
        </div>
      </main>
      <Footer lang={lang} />
    </>
  );
}
