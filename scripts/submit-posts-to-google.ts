/**
 * Script to submit all published posts to Google Search Console
 * 
 * Usage:
 *   tsx scripts/submit-posts-to-google.ts
 *   tsx scripts/submit-posts-to-google.ts --limit 50
 *   tsx scripts/submit-posts-to-google.ts --updated-since "2024-01-01"
 * 
 * This script will:
 * 1. Connect to MongoDB
 * 2. Find all published posts (or posts updated since a date)
 * 3. Generate canonical URLs for each post
 * 4. Submit them to Google Search Console Indexing API
 */

import { connectToDatabase } from '../lib/mongodb';
import Post from '../models/Post';
import { submitUrlsToGoogle } from '../lib/google-indexing';
import { getCanonicalUrl } from '../lib/canonical-url';

async function main() {
  try {
    console.log('🚀 Starting Google Search Console bulk submission...\n');

    // Parse command line arguments
    const args = process.argv.slice(2);
    let limit: number | undefined;
    let updatedSince: Date | undefined;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--limit' && args[i + 1]) {
        limit = parseInt(args[i + 1]);
        i++;
      } else if (args[i] === '--updated-since' && args[i + 1]) {
        updatedSince = new Date(args[i + 1]);
        i++;
      }
    }

    // Check if Google Search Console is configured
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.error('❌ Error: Google Search Console not configured!');
      console.error('Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY environment variables.');
      console.error('See GOOGLE_INDEXING_SETUP.md for setup instructions.');
      process.exit(1);
    }

    // Connect to database
    console.log('📦 Connecting to database...');
    await connectToDatabase();
    console.log('✅ Connected to database\n');

    // Build query
    const query: any = { published: true };
    if (updatedSince) {
      query.updatedAt = { $gte: updatedSince };
      console.log(`📅 Filtering posts updated since: ${updatedSince.toISOString()}`);
    }

    // Fetch published posts
    console.log('🔍 Fetching published posts...');
    const posts = await Post.find(query)
      .select('slug title updatedAt createdAt')
      .sort({ updatedAt: -1 })
      .limit(limit || 10000)
      .lean();

    console.log(`✅ Found ${posts.length} published post(s)\n`);

    if (posts.length === 0) {
      console.log('ℹ️  No posts to submit. Exiting.');
      process.exit(0);
    }

    // Generate URLs
    console.log('🔗 Generating URLs...');
    const urls: string[] = [];
    const failedUrls: { slug: string; error: string }[] = [];

    for (const post of posts) {
      try {
        const url = await getCanonicalUrl(`/latest/${post.slug}`);
        urls.push(url);
        console.log(`  ✓ ${post.slug}`);
      } catch (error: any) {
        console.error(`  ✗ ${post.slug}: ${error.message}`);
        failedUrls.push({ slug: post.slug, error: error.message });
      }
    }

    console.log(`\n✅ Generated ${urls.length} URL(s)\n`);

    if (urls.length === 0) {
      console.error('❌ No valid URLs generated. Exiting.');
      process.exit(1);
    }

    // Submit to Google
    console.log('📤 Submitting URLs to Google Search Console...');
    console.log('⏳ This may take a while (Google has rate limits)...\n');

    const startTime = Date.now();
    const successCount = await submitUrlsToGoogle(urls, 'URL_UPDATED');
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Results
    console.log('\n' + '='.repeat(50));
    console.log('📊 SUBMISSION RESULTS');
    console.log('='.repeat(50));
    console.log(`✅ Successfully submitted: ${successCount} of ${urls.length}`);
    console.log(`❌ Failed: ${urls.length - successCount} of ${urls.length}`);
    console.log(`⏱️  Time taken: ${duration} seconds`);
    console.log('='.repeat(50) + '\n');

    if (failedUrls.length > 0) {
      console.log('⚠️  Failed URLs:');
      failedUrls.forEach(({ slug, error }) => {
        console.log(`  - ${slug}: ${error}`);
      });
      console.log('');
    }

    if (successCount > 0) {
      console.log('✅ Success! Your posts have been submitted to Google Search Console.');
      console.log('📝 Note: It may take a few minutes to a few hours for Google to index them.');
      console.log('🔍 Check Google Search Console for indexing status.');
    }

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

