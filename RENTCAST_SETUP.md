# RentCast API Setup Guide

## 🚀 **RentCast API Integration**

RentCast API provides a great alternative to the primary real estate API with a generous free tier.

### **Why RentCast API?**

- ✅ **50 free calls per month** (vs 100 for realtor-data1)
- ✅ **No credit card required** for free tier
- ✅ **Property listings, valuations, market trends**
- ✅ **Easy integration** with simple API calls
- ✅ **Reliable data** from multiple sources

### **Step 1: Get Your API Key**

1. **Visit RentCast**: https://rentcast.io/
2. **Sign up** for a free account
3. **Navigate to API section** in your dashboard
4. **Copy your API key**

### **Step 2: Add to Environment Variables**

#### **For Local Development:**
Add to your `.env` file:
```bash
RENTCAST_API_KEY=your_rentcast_api_key_here
```

#### **For Vercel Deployment:**
1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Name**: `RENTCAST_API_KEY`
   - **Value**: `your_rentcast_api_key_here`
   - **Environment**: Production

### **Step 3: How It Works**

The app now has **intelligent API fallback**:

1. **Primary API** (realtor-data1) - 100 calls/month
2. **RentCast API** (backup) - 50 calls/month  
3. **Mock Data** (fallback) - Unlimited

**When primary API quota is exceeded:**
- ✅ Automatically tries RentCast API
- ✅ Uses real data if available
- ✅ Falls back to mock data if both fail
- ✅ Caches results to reduce API calls

### **Step 4: Test the Integration**

1. **Deploy** your updated code to Vercel
2. **Test a search** - should work with real data
3. **Check logs** to see which API is being used

### **API Usage Tracking**

The app tracks usage for both APIs:
- **Analytics dashboard** shows total calls
- **Console logs** indicate which API is used
- **Caching** reduces repeated calls

### **Benefits of This Setup**

- **Higher reliability** with multiple API sources
- **Better free tier** with combined quotas (150 calls/month)
- **Automatic failover** when one API is exhausted
- **Smart caching** reduces actual API usage
- **No downtime** even when APIs are exhausted

### **Troubleshooting**

**If RentCast API isn't working:**
1. Check your API key is correct
2. Verify the key is set in environment variables
3. Check RentCast dashboard for usage limits
4. Look at console logs for error messages

**If you need more calls:**
1. **Upgrade RentCast plan** for more calls
2. **Wait for monthly reset** of both APIs
3. **Use caching** to reduce API usage

### **API Documentation**

- **RentCast API Docs**: https://rentcast.io/docs
- **Free Tier Limits**: 50 calls/month
- **Rate Limits**: 1 call per second
- **Data Coverage**: US properties only

---

**Your app now has multiple API sources for maximum reliability!** 🎉
