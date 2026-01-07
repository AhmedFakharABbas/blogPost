import { NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/mongodb";
import { toPSTISOString } from '@/lib/date-utils';

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

export async function GET() {
  const baseUrl = getSiteUrl();
  
  try {
    await connectToDatabase();
    
    const Post = (await import("@/models/Post")).default;
    const posts = await Post.find({ published: true })
      .select('slug updatedAt createdAt')
      .sort({ updatedAt: -1 })
      .lean();

    const urls = posts.map((post) => {
      const lastmod = post.updatedAt || post.createdAt || new Date();
      // Higher priority for recent posts (updated in last 7 days)
      const daysSinceUpdate = (Date.now() - new Date(lastmod).getTime()) / (1000 * 60 * 60 * 24);
      const priority = daysSinceUpdate < 7 ? '0.9' : daysSinceUpdate < 30 ? '0.8' : '0.7';
      const changefreq = daysSinceUpdate < 7 ? 'daily' : daysSinceUpdate < 30 ? 'weekly' : 'monthly';
      
      return `  <url>
    <loc>${baseUrl}/latest/${post.slug}</loc>
    <lastmod>${toPSTISOString(new Date(lastmod))}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    }).join('\n');

    const now = new Date();
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${toPSTISOString(now)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${toPSTISOString(now)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
${urls}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=0, must-revalidate', // No cache - always fresh for SEO
      },
    });
  } catch (error: any) {
    console.error('Error generating posts sitemap:', error);
    // Return a basic sitemap even on error
    const now = new Date();
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${toPSTISOString(now)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${toPSTISOString(now)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;
    
    return new NextResponse(fallbackSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }
}

