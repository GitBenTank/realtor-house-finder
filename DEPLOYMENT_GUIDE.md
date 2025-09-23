# Deployment Guide for Realtor House Finder

## Issues Fixed for Production Deployment

### 1. Environment Variables Configuration

You need to set the following environment variables in your Vercel dashboard:

#### Required Environment Variables:
```
RAPIDAPI_KEY=your_actual_rapidapi_key_here
RAPIDAPI_HOST=realty-in-us.p.rapidapi.com
NODE_ENV=production
```

#### Optional Environment Variables:
```
RENTCAST_API_KEY=your_rentcast_key_here (if you want backup API)
EXCEL_OUTPUT_DIR=./exports
MAX_LISTINGS_PER_WEEK=1000
```

### 2. How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable:
   - **Name**: `RAPIDAPI_KEY`
   - **Value**: Your actual RapidAPI key
   - **Environment**: Production (and Preview if you want)
   
   - **Name**: `RAPIDAPI_HOST`
   - **Value**: `realty-in-us.p.rapidapi.com`
   - **Environment**: Production (and Preview if you want)
   
   - **Name**: `NODE_ENV`
   - **Value**: `production`
   - **Environment**: Production (and Preview if you want)

### 3. Fix Vercel Configuration Warning

The warning in your build logs suggests there might be a conflict between your `vercel.json` and project settings. To fix this:

1. Go to your Vercel project settings
2. Go to "Build & Development Settings"
3. Make sure the following are set:
   - **Framework Preset**: Other
   - **Build Command**: Leave empty (or `npm run build` if you have one)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

### 4. Redeploy After Setting Environment Variables

After setting the environment variables:

1. Go to your Vercel dashboard
2. Go to the "Deployments" tab
3. Click "Redeploy" on the latest deployment
4. Or push a new commit to trigger a new deployment

### 5. Test Your Deployment

Once redeployed, test these endpoints:

1. **Health Check**: `https://your-app.vercel.app/api/health`
2. **Debug Endpoint**: `https://your-app.vercel.app/api/debug`
3. **Search Test**: `https://your-app.vercel.app/api/search` (POST with JSON body)

### 6. Common Issues and Solutions

#### Issue: "API key missing" error
- **Solution**: Make sure `RAPIDAPI_KEY` is set in Vercel environment variables

#### Issue: "API host not found" error
- **Solution**: Make sure `RAPIDAPI_HOST` is set to `realty-in-us.p.rapidapi.com`

#### Issue: "SearchAPI Error" with validation message
- **Solution**: This is usually fixed by the API payload structure we already corrected

#### Issue: Empty search results
- **Solution**: Check that the API key has the correct permissions and the host is correct

### 7. Monitoring Your Deployment

- Check the "Functions" tab in Vercel dashboard for any runtime errors
- Check the "Logs" tab for detailed error messages
- Use the debug endpoint to verify API connectivity

### 8. Quick Test Commands

Test your deployed API with these curl commands:

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Debug endpoint
curl https://your-app.vercel.app/api/debug

# Search test
curl -X POST https://your-app.vercel.app/api/search \
  -H "Content-Type: application/json" \
  -d '{"location":"Nashville, TN","limit":3}'
```

## Summary

The main issue is likely that your environment variables are not set in Vercel. Once you set `RAPIDAPI_KEY` and `RAPIDAPI_HOST` in your Vercel dashboard and redeploy, your public version should work just like your local version.