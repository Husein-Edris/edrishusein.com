// app/page.tsx
export const dynamic = 'force-dynamic'; // Always fetch fresh data from WordPress

export default async function HomePage() {
  return (
    <main>
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Site is being updated...</h1>
        <p>WordPress content caching fixes in progress.</p>
      </div>
    </main>
  );
}