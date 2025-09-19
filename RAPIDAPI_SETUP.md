# 🔑 How to Get Your RapidAPI Key - Step by Step Guide

This guide will walk you through getting your RapidAPI key for the Realtor House Finder application.

## 📋 Step-by-Step Instructions

### Step 1: Create a RapidAPI Account

1. **Go to RapidAPI Website**
   - Open your web browser
   - Navigate to [https://rapidapi.com](https://rapidapi.com)

2. **Sign Up for Free Account**
   - Click the **"Sign Up"** button in the top right corner
   - Choose one of these options:
     - **Google** (recommended - fastest)
     - **GitHub** (if you have a GitHub account)
     - **Email** (traditional signup)

3. **Complete Registration**
   - Fill in your details if using email signup
   - Verify your email address if required
   - You'll be redirected to the RapidAPI dashboard

### Step 2: Find the Real Estate API

1. **Search for Real Estate APIs**
   - In the RapidAPI dashboard, look for the search bar
   - Type: `"Realtor Data"` or `"Real Estate API"`
   - Press Enter to search

2. **Choose the Right API**
   Look for APIs like:
   - **"Realtor Data API"** (most popular)
   - **"Real Estate API"**
   - **"Property Data API"**
   - **"Zillow API Alternative"**

3. **Click on the API**
   - Click on the API name to view details
   - Look for one that has a **free tier** available

### Step 3: Subscribe to the API

1. **Review the API Details**
   - Check the pricing plans
   - Look for a **"Basic"** or **"Free"** plan
   - Read the API documentation

2. **Subscribe to Free/Basic Plan**
   - Click **"Subscribe to Test"** or **"Subscribe to Basic"**
   - Choose the **free tier** if available
   - Confirm your subscription

3. **Get Your API Key**
   - After subscribing, you'll see your API key
   - It looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
   - **Copy this key** - you'll need it for the app

### Step 4: Test Your API Key

1. **Go to the API Testing Page**
   - In the API dashboard, look for **"Test"** or **"Try it out"**
   - You should see a test interface

2. **Make a Test Request**
   - Look for a simple endpoint like `/property_list/`
   - Fill in required parameters:
     - `postal_code`: `10022` (New York ZIP code)
     - `limit`: `5`
   - Click **"Test Endpoint"**

3. **Verify the Response**
   - You should see property data returned
   - If you get data, your API key is working!

## 🔧 Configure Your Application

### Step 1: Create Your .env File

1. **Copy the template:**
   ```bash
   cp env.example .env
   ```

2. **Edit the .env file:**
   ```bash
   nano .env
   # or use any text editor like VS Code
   ```

3. **Add your API key:**
   ```env
   RAPIDAPI_KEY=your_actual_api_key_here
   RAPIDAPI_HOST=realtor-data1.p.rapidapi.com
   PORT=3000
   NODE_ENV=development
   EXCEL_OUTPUT_DIR=./exports
   MAX_LISTINGS_PER_WEEK=1000
   ```

### Step 2: Test Your Setup

1. **Start the application:**
   ```bash
   npm start
   ```

2. **Open the web interface:**
   - Go to `http://localhost:3000`
   - Try searching for properties
   - If it works, you're all set!

## 🚨 Troubleshooting

### Common Issues:

#### "RAPIDAPI_KEY is required" Error
- **Problem**: The app can't find your API key
- **Solution**: 
  - Make sure you created a `.env` file
  - Check that the key is correctly copied (no extra spaces)
  - Restart the application after changing `.env`

#### "Failed to fetch properties" Error
- **Problem**: API requests are failing
- **Solutions**:
  - Double-check your API key is correct
  - Make sure your RapidAPI subscription is active
  - Check if you've exceeded the free tier limits
  - Try a different location in your search

#### No Search Results
- **Problem**: Search returns no properties
- **Solutions**:
  - Try different locations (e.g., "Los Angeles, CA", "Chicago, IL")
  - Check if the API has data for your area
  - Verify your API subscription includes the data you need

### Testing Your API Key Manually

You can test your API key using this command in your terminal:

```bash
curl --request POST \
  --url https://realtor-data1.p.rapidapi.com/property_list/ \
  --header 'X-RapidAPI-Key: YOUR_API_KEY_HERE' \
  --header 'X-RapidAPI-Host: realtor-data1.p.rapidapi.com' \
  --header 'Content-Type: application/json' \
  --data '{
    "query": {
      "status": ["for_sale"],
      "postal_code": "10022"
    },
    "limit": 5
  }'
```

Replace `YOUR_API_KEY_HERE` with your actual API key.

## 💡 Pro Tips

1. **Start with Free Tier**: Most APIs offer a free tier with limited requests per month
2. **Check Rate Limits**: Free tiers usually have daily/monthly limits
3. **Test Different Locations**: Some APIs have better data coverage in certain areas
4. **Keep Your Key Secure**: Never share your API key publicly
5. **Monitor Usage**: Check your RapidAPI dashboard for usage statistics

## 📞 Need Help?

If you're still having trouble:

1. **Check RapidAPI Support**: Look for help documentation on the API page
2. **Verify Your Account**: Make sure your RapidAPI account is fully activated
3. **Try a Different API**: If one doesn't work, try another real estate API
4. **Check the Logs**: Look at your application logs for specific error messages

## ✅ Success Checklist

Before you're done, make sure:

- [ ] RapidAPI account created and verified
- [ ] API subscribed to (free tier is fine)
- [ ] API key copied correctly
- [ ] `.env` file created with your key
- [ ] Application starts without errors
- [ ] Search functionality works in the web interface
- [ ] You can export results to Excel

Once all these are checked off, you're ready to start using your Realtor House Finder application! 🎉


