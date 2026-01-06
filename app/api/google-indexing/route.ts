import { NextRequest, NextResponse } from 'next/server';
import { submitUrlToGoogle } from '@/lib/google-indexing';

/**
 * API endpoint to manually submit URLs to Google Search Console
 * POST /api/google-indexing
 * Body: { url: string, type?: 'URL_UPDATED' | 'URL_DELETED' }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, type = 'URL_UPDATED' } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const success = await submitUrlToGoogle(url, type);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'URL submitted to Google Search Console successfully',
        url,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to submit URL (check server logs for details)',
        url,
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error in Google indexing API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

