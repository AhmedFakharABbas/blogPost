# Google Search Console Bulk Submission Guide

This guide explains how to submit your published posts to Google Search Console for indexing, especially after updating post dates or publishing new posts.

## Problem

When you:
- Update post dates to "now"
- Publish new posts
- Update existing posts

Google may not immediately know about these changes. You need to notify Google Search Console so it can:
1. Index new posts
2. Update the publication date in search results
3. Re-crawl updated content

## Solutions

### Option 1: Use the API Endpoint (Recommended)

You can submit posts via HTTP request:

#### Submit All Published Posts
```bash
curl -X POST http://localhost:3000/api/google-indexing/bulk
```

Or in browser/Postman:
- **URL**: `https://your-domain.com/api/google-indexing/bulk`
- **Method**: `POST`
- **Body** (optional):
```json
{
  "limit": 100,
  "updatedSince": "2024-01-01T00:00:00Z"
}
```

#### Submit Posts Updated Since a Date
```bash
curl -X POST http://localhost:3000/api/google-indexing/bulk \
  -H "Content-Type: application/json" \
  -d '{"updatedSince": "2024-01-15T00:00:00Z"}'
```

#### Submit Limited Number of Posts
```bash
curl -X POST http://localhost:3000/api/google-indexing/bulk \
  -H "Content-Type: application/json" \
  -d '{"limit": 50}'
```

#### Using GET (Simpler)
```bash
# Submit all posts
curl https://your-domain.com/api/google-indexing/bulk

# Submit posts updated since a date
curl "https://your-domain.com/api/google-indexing/bulk?updatedSince=2024-01-15"

# Submit limited number
curl "https://your-domain.com/api/google-indexing/bulk?limit=50"
```

### Option 2: Use the Script (For Local/Server Use)

Run the script from your project root:

```bash
# Submit all published posts
npm run submit:google

# Submit only 50 posts
npm run submit:google -- --limit 50

# Submit posts updated since a specific date
npm run submit:google -- --updated-since "2024-01-15"

# Or use tsx directly
tsx scripts/submit-posts-to-google.ts
tsx scripts/submit-posts-to-google.ts --limit 100
tsx scripts/submit-posts-to-google.ts --updated-since "2024-01-15T00:00:00Z"
```

### Option 3: Submit Individual Posts

For single posts, use the individual submission endpoint:

```bash
curl -X POST https://your-domain.com/api/google-indexing \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/latest/your-post-slug",
    "type": "URL_UPDATED"
  }'
```

## When to Use Each Method

### Use Bulk Submission When:
- ✅ You've updated dates for multiple posts
- ✅ You've published many new posts
- ✅ You want to ensure all posts are indexed
- ✅ You've made bulk changes

### Use Individual Submission When:
- ✅ You've just published one new post
- ✅ You've updated a single post
- ✅ Testing the integration

## Rate Limits

Google Search Console Indexing API has limits:
- **200 requests per day** per property
- **600 requests per minute** (burst)

The bulk submission script automatically:
- Processes requests sequentially
- Adds delays between requests
- Handles rate limit errors gracefully

## Example Scenarios

### Scenario 1: Updated Post Dates to "Now"

After using the "Update Date to Now" feature in dashboard:

```bash
# Submit all posts updated today
npm run submit:google -- --updated-since "$(date -u +%Y-%m-%d)T00:00:00Z"
```

Or via API:
```bash
curl -X POST https://your-domain.com/api/google-indexing/bulk \
  -H "Content-Type: application/json" \
  -d "{\"updatedSince\": \"$(date -u +%Y-%m-%d)T00:00:00Z\"}"
```

### Scenario 2: Published New Posts

After publishing new posts:

```bash
# Submit all published posts
npm run submit:google
```

### Scenario 3: Regular Maintenance

Set up a cron job or scheduled task to submit updated posts daily:

```bash
# Run daily at 2 AM
0 2 * * * cd /path/to/project && npm run submit:google -- --updated-since "$(date -u -d '1 day ago' +%Y-%m-%d)T00:00:00Z"
```

## Verification

After submission:

1. **Check Server Logs**: Look for success messages
2. **Google Search Console**: 
   - Go to [Google Search Console](https://search.google.com/search-console)
   - Navigate to "URL Inspection"
   - Enter your post URL
   - Click "Request Indexing"
3. **Wait**: Google typically indexes within:
   - A few minutes (for instant indexing API)
   - A few hours to days (for natural crawling)

## Troubleshooting

### "Google Search Console not configured"
- Make sure `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY` are set
- See `GOOGLE_INDEXING_SETUP.md` for setup instructions

### "Rate limit exceeded"
- Google limits to 200 requests per day
- Wait 24 hours or submit in smaller batches
- Use `--limit` to control batch size

### "Failed to generate URL"
- Check that `NEXT_PUBLIC_SITE_URL` or site settings domain is configured
- Verify post slugs are valid

### Posts not appearing in Google
- Wait 24-48 hours after submission
- Check Google Search Console for errors
- Verify posts are actually published
- Ensure robots.txt allows indexing

## Best Practices

1. **Submit after bulk updates**: Always run bulk submission after updating multiple posts
2. **Monitor rate limits**: Don't exceed 200 submissions per day
3. **Use date filters**: Submit only recently updated posts to save quota
4. **Schedule regular submissions**: Set up automated daily/weekly submissions
5. **Check Search Console**: Regularly monitor indexing status

## Next Steps

1. ✅ Set up Google Search Console (if not done)
2. ✅ Configure environment variables
3. ✅ Run bulk submission for existing posts
4. ✅ Set up automatic submission for new posts (already implemented)
5. ✅ Monitor indexing status in Google Search Console

