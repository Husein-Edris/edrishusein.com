import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found - Edris Husein',
  description: 'The page you are looking for could not be found.',
  robots: 'noindex, nofollow',
};

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="container">
        <h2>Not Found</h2>
        <p>Could not find the requested resource</p>
        <Link href="/">Return Home</Link>
      </div>
    </div>
  );
}