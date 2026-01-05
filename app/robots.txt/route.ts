import { NextResponse } from 'next/server';
import { getSiteSettingsForLayout } from '@/lib/get-site-settings';

export async function GET() {
  try {
    const settings = await getSiteSettingsForLayout();
    
    // Fallback to default values if settings is null (shouldn't happen, but safety check)
    const robotsIndex = settings?.robotsIndex ?? true;
    const robotsFollow = settings?.robotsFollow ?? true;
    const revisitDays = settings?.revisitDays ?? 1;
    
    const robots = [];
    if (!robotsIndex) robots.push('noindex');
    if (!robotsFollow) robots.push('nofollow');
    
    const userAgent = '*';
    const rules = robots.length > 0 ? robots.join(', ') : 'index, follow';
    const crawlDelay = revisitDays > 1 ? `\nCrawl-delay: ${revisitDays}` : '';
    
    const robotsTxt = `User-agent: ${userAgent}
Allow: /
Disallow: /dashboard/
Disallow: /api/
${robots.length > 0 ? `\n${rules}` : ''}${crawlDelay}

Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}/sitemap.xml
`;

    return new NextResponse(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    // Fallback robots.txt if there's any error
    const robotsTxt = `User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /api/

Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}/sitemap.xml
`;

    return new NextResponse(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}

