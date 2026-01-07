import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
// No revalidate needed - force-dynamic makes it always fresh

function getSiteUrl(): string {
  // Prioritize NEXT_PUBLIC_SITE_URL, then VERCEL_URL, then fallback
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, ''); // Remove trailing slash
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Fallback for local development
  return 'http://localhost:3000';
}

// WordPress-style sitemap index
export async function GET() {
  try {
    const baseUrl = getSiteUrl();
    
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-posts.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-pages.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-categories.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;

    return new NextResponse(sitemapIndex, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=0, must-revalidate', // No cache - always fresh for SEO
      },
    });
  } catch (error: any) {
    console.error('Error generating sitemap index:', error);
    // Return a basic sitemap even on error
    const baseUrl = getSiteUrl();
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-posts.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-pages.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-categories.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;
    
    return new NextResponse(fallbackSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }
}

