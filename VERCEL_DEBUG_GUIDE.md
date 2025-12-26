# Vercel Deployment Debugging Guide

## Issue: Blog posts not fetching in production

### Quick Checks

1. **Environment Variables in Vercel**
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Ensure `MONGODB_URI` is set correctly
   - Make sure it's available for Production, Preview, and Development environments
   - The URI should be in format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`

2. **Check Vercel Logs**
   - Go to your Vercel project → Deployments → Click on latest deployment → View Function Logs
   - Look for errors like:
     - `❌ MongoDB connection error`
     - `❌ Error fetching published posts`
     - `Please define MONGODB_URI in your environment variables`

3. **MongoDB Network Access**
   - Go to your MongoDB Atlas dashboard
   - Navigate to Network Access
   - Ensure `0.0.0.0/0` is allowed (or add Vercel's IP ranges)
   - Or add specific Vercel IPs if you prefer

4. **MongoDB Connection String**
   - Verify the connection string includes:
     - Correct username and password
     - Correct cluster URL
     - Database name
     - Connection options: `?retryWrites=true&w=majority`

### Common Issues & Solutions

#### Issue 1: Environment Variable Not Set
**Symptom:** Error: "Please define MONGODB_URI in your environment variables"

**Solution:**
1. Add `MONGODB_URI` in Vercel dashboard
2. Redeploy the application
3. Clear Vercel's cache if needed

#### Issue 2: Connection Timeout
**Symptom:** Connection hangs or times out

**Solution:**
- Check MongoDB Atlas Network Access settings
- Verify firewall rules allow Vercel's IPs
- Check if MongoDB cluster is paused (free tier)

#### Issue 3: Authentication Failed
**Symptom:** Authentication error in logs

**Solution:**
- Verify MongoDB username and password are correct
- Check if database user has proper permissions
- Ensure connection string is URL-encoded if it contains special characters

#### Issue 4: Caching Issues
**Symptom:** Posts not updating after changes

**Solution:**
- The code now handles caching gracefully
- First page is cached for 60 seconds
- Subsequent pages are not cached

### Testing Steps

1. **Check Vercel Function Logs:**
   ```bash
   # In Vercel dashboard, check the function logs for:
   - "✅ MongoDB connected successfully"
   - "❌" error messages
   ```

2. **Test Database Connection:**
   - The code now includes detailed error logging
   - Check logs for MongoDB connection status

3. **Verify Posts Exist:**
   - Ensure you have posts with `published: true` in your database
   - Check if posts have required fields (title, slug, etc.)

### Code Changes Made

1. **Enhanced Error Handling:**
   - Added detailed error logging
   - Graceful fallbacks to prevent page crashes
   - Better error messages for debugging

2. **Improved MongoDB Connection:**
   - Increased timeout for serverless environments
   - Better connection state checking
   - More detailed error logging

3. **Production-Safe Caching:**
   - Caching with fallback to direct calls
   - Error handling for cache failures

### Next Steps

1. Check Vercel logs after deployment
2. Verify environment variables are set
3. Test MongoDB connection from Vercel
4. Check if posts exist and are published in database

### Need More Help?

If issues persist:
1. Check Vercel function logs for specific error messages
2. Verify MongoDB Atlas cluster is running
3. Test MongoDB connection string locally
4. Check Vercel deployment logs for build errors

