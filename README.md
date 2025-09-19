# 🏡 Realtor House Finder - Weekly Excel Listings

A complete web application for real estate professionals to search, analyze, and export property listings to Excel using RapidAPI. This tool automates the process of generating weekly realtor reports with comprehensive market analysis.

## ✨ Features

- **🔍 Advanced Property Search**: Search properties by location, price range, bedrooms, bathrooms, and property type
- **📊 Excel Export**: Export search results to detailed Excel files with multiple sheets
- **⏰ Automated Reports**: Set up weekly automated reports that generate Excel files
- **📈 Market Analysis**: Comprehensive market analysis including price ranges and property statistics
- **🎨 Modern UI**: Beautiful, responsive interface built with Tailwind CSS
- **🚀 Real-time Data**: Live property data from RapidAPI Real Estate endpoints

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **API**: RapidAPI Real Estate Data
- **Excel Export**: XLSX library
- **Scheduling**: node-cron for automated reports
- **Styling**: Tailwind CSS, Font Awesome icons

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A [RapidAPI](https://rapidapi.com/) account
- A text editor or IDE (VS Code recommended)

## 🚀 Quick Start

### 1. Clone or Download the Project

```bash
# If using git
git clone <repository-url>
cd Realtor-House-Finder

# Or simply download and extract the project files
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up RapidAPI

1. Go to [RapidAPI](https://rapidapi.com/)
2. Create a free account or sign in
3. Search for "Realtor Data" or "Real Estate API"
4. Subscribe to a plan (free tier available)
5. Copy your API key

### 4. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit the `.env` file and add your RapidAPI key:
   ```env
   RAPIDAPI_KEY=your_rapidapi_key_here
   RAPIDAPI_HOST=realtor-data1.p.rapidapi.com
   PORT=3000
   NODE_ENV=development
   EXCEL_OUTPUT_DIR=./exports
   MAX_LISTINGS_PER_WEEK=1000
   ```

### 5. Start the Application

```bash
# Development mode (with auto-restart)
npm run dev

# Or production mode
npm start
```

### 6. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 📖 Usage Guide

### Basic Search

1. **Enter Location**: Type in a city, state, or ZIP code (e.g., "New York, NY")
2. **Set Filters**: Choose property type, price range, bedrooms, bathrooms
3. **Click Search**: View the results in real-time
4. **Export to Excel**: Click "Export to Excel" to download a comprehensive report

### Excel Export Features

The exported Excel file includes three sheets:

#### 1. Properties Sheet
- Complete property details
- Formatted prices and measurements
- Agent information
- Property URLs and coordinates

#### 2. Summary Sheet
- Total properties count
- Market value statistics
- Property type distribution
- Bedroom/bathroom breakdowns

#### 3. Market Analysis Sheet
- Price range analysis
- Market trends
- Property features analysis
- Days on market statistics

### Automated Weekly Reports

The application automatically generates weekly reports every Monday at 9:00 AM for multiple locations:

- New York, NY
- Los Angeles, CA
- Chicago, IL
- Houston, TX
- Phoenix, AZ

Reports are saved in the `./exports` directory.

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `RAPIDAPI_KEY` | Your RapidAPI key | Required |
| `RAPIDAPI_HOST` | RapidAPI host | realtor-data1.p.rapidapi.com |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `EXCEL_OUTPUT_DIR` | Excel export directory | ./exports |
| `MAX_LISTINGS_PER_WEEK` | Max listings per weekly report | 1000 |

### Customizing Weekly Reports

Edit `services/cronService.js` to modify:
- Report schedule (currently Mondays at 9:00 AM)
- Target locations
- Report frequency

## 🔧 API Endpoints

### Search Properties
```http
POST /api/search
Content-Type: application/json

{
  "location": "New York, NY",
  "propertyType": "house",
  "minPrice": 200000,
  "maxPrice": 800000,
  "bedrooms": 3,
  "bathrooms": 2,
  "limit": 50
}
```

### Export to Excel
```http
POST /api/export
Content-Type: application/json

{
  "properties": [...],
  "filename": "custom_report.xlsx"
}
```

### Get Weekly Listings
```http
GET /api/weekly-listings?location=New York, NY&limit=100
```

## 📁 Project Structure

```
Realtor-House-Finder/
├── public/
│   ├── index.html          # Main application interface
│   └── app.js             # Frontend JavaScript
├── services/
│   ├── realEstateAPI.js   # RapidAPI integration
│   ├── excelService.js    # Excel export functionality
│   └── cronService.js     # Automated scheduling
├── exports/               # Generated Excel files
├── server.js             # Main server file
├── package.json          # Dependencies and scripts
├── env.example           # Environment variables template
└── README.md            # This file
```

## 🚨 Troubleshooting

### Common Issues

1. **"RAPIDAPI_KEY is required" error**
   - Make sure you've created a `.env` file with your RapidAPI key
   - Verify the key is correct and active

2. **"Failed to fetch properties" error**
   - Check your internet connection
   - Verify your RapidAPI subscription is active
   - Check the API rate limits

3. **Excel export fails**
   - Ensure the `exports` directory exists
   - Check file permissions
   - Verify you have enough disk space

4. **Port already in use**
   - Change the PORT in your `.env` file
   - Or kill the process using the port: `lsof -ti:3000 | xargs kill`

### Debug Mode

Run with debug logging:
```bash
DEBUG=* npm start
```

## 📊 Sample Data

The application works with real property data from RapidAPI. Sample search results include:

- Property addresses and details
- Price information
- Square footage and lot size
- Bedroom/bathroom counts
- Property type and status
- Agent contact information
- Property photos and URLs

## 🔒 Security Notes

- Never commit your `.env` file to version control
- Keep your RapidAPI key secure
- Use environment variables for all sensitive data
- Consider rate limiting for production use

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review the RapidAPI documentation
3. Check the application logs
4. Create an issue in the repository

## 🎯 Future Enhancements

- [ ] Email notifications for weekly reports
- [ ] Advanced filtering options
- [ ] Property comparison features
- [ ] Market trend charts
- [ ] Mobile app version
- [ ] Database integration for historical data
- [ ] Multi-user support
- [ ] Custom report templates

---

**Happy House Hunting! 🏡✨**

*Built with ❤️ for real estate professionals*


