# 🚀 Complete Setup Guide for Weekly Realtor Excel Listings

This comprehensive guide will walk you through setting up your Realtor House Finder application step by step.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [RapidAPI Setup](#rapidapi-setup)
3. [Project Installation](#project-installation)
4. [Configuration](#configuration)
5. [Testing the Application](#testing-the-application)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### Required Software

1. **Node.js** (version 14 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Text Editor** (recommended: VS Code)
   - Download from [code.visualstudio.com](https://code.visualstudio.com/)

### Required Accounts

1. **RapidAPI Account**
   - Go to [rapidapi.com](https://rapidapi.com/)
   - Sign up for a free account

## 🔑 RapidAPI Setup

### Step 1: Create RapidAPI Account

1. Visit [rapidapi.com](https://rapidapi.com/)
2. Click "Sign Up" in the top right
3. Choose your preferred sign-up method (Google, GitHub, or email)
4. Verify your email address

### Step 2: Find Real Estate API

1. In the RapidAPI dashboard, search for "Realtor Data" or "Real Estate"
2. Look for APIs like:
   - **Realtor Data API**
   - **Real Estate API**
   - **Property Data API**

### Step 3: Subscribe to API

1. Click on a suitable real estate API
2. Review the pricing plans
3. Start with the **Basic** or **Free** plan
4. Click "Subscribe to Test"
5. Note your API key (X-RapidAPI-Key)

### Step 4: Test API Access

You can test your API key using this curl command:

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
    "limit": 10
  }'
```

## 📦 Project Installation

### Step 1: Download Project Files

1. Download all project files to a folder named `Realtor-House-Finder`
2. Open terminal/command prompt
3. Navigate to the project directory:

```bash
cd /path/to/Realtor-House-Finder
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- express (web server)
- cors (cross-origin requests)
- dotenv (environment variables)
- axios (HTTP requests)
- xlsx (Excel file creation)
- multer (file uploads)
- node-cron (scheduled tasks)
- moment (date handling)

### Step 3: Verify Installation

Check that all files are in place:

```bash
ls -la
```

You should see:
- `package.json`
- `server.js`
- `services/` directory
- `public/` directory
- `env.example`

## ⚙️ Configuration

### Step 1: Create Environment File

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Open `.env` in your text editor

### Step 2: Configure API Settings

Edit the `.env` file with your RapidAPI details:

```env
# RapidAPI Configuration
RAPIDAPI_KEY=your_actual_api_key_here
RAPIDAPI_HOST=realtor-data1.p.rapidapi.com

# Server Configuration
PORT=3000
NODE_ENV=development

# Excel Export Settings
EXCEL_OUTPUT_DIR=./exports
MAX_LISTINGS_PER_WEEK=1000

# Email Settings (Optional)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
NOTIFICATION_EMAIL=
```

**Important**: Replace `your_actual_api_key_here` with your real RapidAPI key!

### Step 3: Create Exports Directory

```bash
mkdir exports
```

This directory will store your generated Excel files.

## 🧪 Testing the Application

### Step 1: Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Or production mode
npm start
```

You should see:
```
🏡 Realtor House Finder server running on port 3000
📊 Visit http://localhost:3000 to access the application
⏰ Weekly export cron job scheduled for Mondays at 9:00 AM
```

### Step 2: Test in Browser

1. Open your web browser
2. Navigate to `http://localhost:3000`
3. You should see the Realtor House Finder interface

### Step 3: Test Search Functionality

1. Enter a location (e.g., "New York, NY")
2. Set some search criteria
3. Click "Search Properties"
4. Wait for results to load

### Step 4: Test Excel Export

1. After getting search results
2. Click "Export to Excel"
3. Check the `exports` directory for the generated file

### Step 5: Verify API Connection

Check the browser console for any API errors. If you see errors:

1. Verify your RapidAPI key is correct
2. Check your internet connection
3. Ensure your RapidAPI subscription is active

## 🚀 Production Deployment

### Option 1: Local Production

1. Set `NODE_ENV=production` in `.env`
2. Run `npm start`
3. Access via `http://localhost:3000`

### Option 2: Cloud Deployment

#### Heroku Deployment

1. Install Heroku CLI
2. Create Heroku app:
   ```bash
   heroku create your-app-name
   ```
3. Set environment variables:
   ```bash
   heroku config:set RAPIDAPI_KEY=your_key_here
   heroku config:set RAPIDAPI_HOST=realtor-data1.p.rapidapi.com
   ```
4. Deploy:
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push heroku main
   ```

#### VPS Deployment

1. Upload files to your VPS
2. Install Node.js and npm
3. Install PM2 for process management:
   ```bash
   npm install -g pm2
   ```
4. Start the application:
   ```bash
   pm2 start server.js --name "realtor-finder"
   pm2 save
   pm2 startup
   ```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. "RAPIDAPI_KEY is required" Error

**Problem**: Application can't find the API key

**Solution**:
- Ensure `.env` file exists in the project root
- Check that the key is correctly set in `.env`
- Restart the application after changing `.env`

#### 2. "Failed to fetch properties" Error

**Problem**: API requests are failing

**Solutions**:
- Verify your RapidAPI key is correct and active
- Check your internet connection
- Ensure you haven't exceeded API rate limits
- Try a different location or search criteria

#### 3. Port Already in Use

**Problem**: Port 3000 is already in use

**Solutions**:
- Change the PORT in `.env` file to a different number (e.g., 3001)
- Kill the process using port 3000:
  ```bash
  lsof -ti:3000 | xargs kill
  ```

#### 4. Excel Export Fails

**Problem**: Can't create Excel files

**Solutions**:
- Ensure `exports` directory exists
- Check file permissions
- Verify you have enough disk space
- Check the application logs for specific errors

#### 5. No Search Results

**Problem**: Search returns no properties

**Solutions**:
- Try different search criteria
- Use a different location
- Check if the API has data for your area
- Verify your API subscription includes the data you need

### Debug Mode

Run the application with debug logging:

```bash
DEBUG=* npm start
```

This will show detailed logs to help identify issues.

### Checking Logs

1. **Server logs**: Check the terminal where you started the application
2. **Browser logs**: Open browser developer tools (F12) and check the Console tab
3. **API logs**: Check your RapidAPI dashboard for usage and errors

## 📞 Getting Help

If you're still having issues:

1. **Check the logs** for specific error messages
2. **Verify your setup** against this guide
3. **Test your API key** with the curl command above
4. **Check RapidAPI documentation** for your specific API
5. **Search online** for similar error messages

## ✅ Verification Checklist

Before considering your setup complete, verify:

- [ ] Node.js and npm are installed
- [ ] RapidAPI account is created and active
- [ ] API key is correctly set in `.env`
- [ ] All dependencies are installed (`npm install` completed)
- [ ] Server starts without errors
- [ ] Web interface loads at `http://localhost:3000`
- [ ] Search functionality works
- [ ] Excel export works
- [ ] No errors in browser console
- [ ] Exports directory is created and writable

## 🎉 Success!

If you've completed all steps and the checklist, your Realtor House Finder application is ready to use! You can now:

- Search for properties in any location
- Export results to detailed Excel reports
- Set up automated weekly reports
- Customize the application for your needs

Happy house hunting! 🏡✨


