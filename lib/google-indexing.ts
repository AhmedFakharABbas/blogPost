/**
 * Google Search Console Indexing API Integration
 * Submits URLs to Google for instant indexing
 * 
 * Setup Instructions:
 * 1. Go to Google Cloud Console (https://console.cloud.google.com/)
 * 2. Create a new project or select existing one
 * 3. Enable "Google Search Console API" (Indexing API)
 * 4. Create a Service Account:
 *    - Go to IAM & Admin > Service Accounts
 *    - Create new service account
 *    - Grant "Owner" role (or at minimum, access to Indexing API)
 * 5. Create a JSON key for the service account and download it
 * 6. In Google Search Console:
 *    - Go to Settings > Users and permissions
 *    - Add the service account email as an owner
 * 7. Extract from the JSON key:
 *    - client_email -> GOOGLE_SERVICE_ACCOUNT_EMAIL
 *    - private_key -> GOOGLE_PRIVATE_KEY (keep the \n characters)
 * 8. Add these to your .env file:
 *    GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
 *    GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
 */

interface GoogleIndexingResponse {
  urlNotification?: {
    url: string;
    type: 'URL_UPDATED' | 'URL_DELETED';
  };
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

/**
 * Get Google OAuth2 access token using service account
 */
async function getGoogleAccessToken(): Promise<string> {
  const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    throw new Error('Google Search Console credentials not configured. Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY environment variables.');
  }

  // Use jose library (already in dependencies) and node:crypto for JWT signing
  const { SignJWT } = await import('jose');
  const crypto = await import('node:crypto');
  
  // Create JWT for service account using jose
  const now = Math.floor(Date.now() / 1000);
  const privateKey = crypto.createPrivateKey({
    key: GOOGLE_PRIVATE_KEY,
    format: 'pem',
  });
  
  const token = await new SignJWT({
    iss: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    sub: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    aud: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/indexing',
  })
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + 3600) // Token expires in 1 hour
    .sign(privateKey);

  // Exchange JWT for access token
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: token,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Submit URL to Google Search Console for indexing
 * @param url - Full URL to submit (must include https://)
 * @param type - 'URL_UPDATED' for new/updated content, 'URL_DELETED' for removed content
 */
export async function submitUrlToGoogle(url: string, type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'): Promise<boolean> {
  try {
    // Check if Google Search Console is configured
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.warn('⚠️ Google Search Console not configured. Skipping URL submission.');
      return false;
    }

    // Validate URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error(`Invalid URL format: ${url}. URL must start with http:// or https://`);
    }

    // Get access token
    const accessToken = await getGoogleAccessToken();

    // Submit URL to Google Indexing API
    const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        url: url,
        type: type,
      }),
    });

    if (!response.ok) {
      const errorData: GoogleIndexingResponse = await response.json();
      console.error('❌ Google Indexing API error:', errorData);
      
      // Don't throw for certain errors (e.g., URL already submitted)
      if (errorData.error?.code === 429) {
        console.warn('⚠️ Rate limit exceeded. URL will be indexed when Google crawls it.');
        return false;
      }
      
      throw new Error(`Google Indexing API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data: GoogleIndexingResponse = await response.json();
    console.log('✅ URL submitted to Google:', url, data);
    return true;
  } catch (error: any) {
    console.error('❌ Error submitting URL to Google:', error.message);
    // Don't throw - we don't want to break the app if Google indexing fails
    return false;
  }
}

/**
 * Submit multiple URLs to Google (batched)
 * Note: Google Indexing API has rate limits, so we process sequentially
 */
export async function submitUrlsToGoogle(urls: string[], type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'): Promise<number> {
  let successCount = 0;
  
  for (const url of urls) {
    try {
      const success = await submitUrlToGoogle(url, type);
      if (success) {
        successCount++;
      }
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to submit ${url}:`, error);
    }
  }
  
  return successCount;
}

