require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const RealEstateAPI = require('./services/realEstateAPI');
const excelService = require('./services/excelService');
const aiReportService = require('./services/aiReportService');
const cronService = require('./services/cronService');

// Simple analytics tracking
const analytics = {
    totalSearches: 0,
    totalApiCalls: 0,
    searches: [],
    startTime: new Date(),
    dailyStats: {}
};

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files with proper MIME types
app.use(express.static(__dirname, {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Explicit route for app.js
app.get('/app.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'app.js'));
});

// API Routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Realtor House Finder API is running',
        env: {
            hasRapidAPIKey: !!process.env.RAPIDAPI_KEY,
            hasRapidAPIHost: !!process.env.RAPIDAPI_HOST,
            rapidAPIHost: process.env.RAPIDAPI_HOST
        }
    });
});

// Analytics endpoint
app.get('/api/analytics', (req, res) => {
    const today = new Date().toDateString();
    const todayStats = analytics.dailyStats[today] || { searches: 0, apiCalls: 0 };
    
    res.json({
        totalSearches: analytics.totalSearches,
        totalApiCalls: analytics.totalApiCalls,
        todayStats: todayStats,
        uptime: Math.floor((new Date() - analytics.startTime) / 1000),
        recentSearches: analytics.searches.slice(-10).reverse(),
        topLocations: getTopLocations(),
        status: 'active'
    });
});

// Helper function to get top locations
function getTopLocations() {
    const locationCounts = {};
    analytics.searches.forEach(search => {
        const location = search.location || 'Unknown';
        locationCounts[location] = (locationCounts[location] || 0) + 1;
    });
    
    return Object.entries(locationCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([location, count]) => ({ location, count }));
}

// Helper function to track searches
function trackSearch(req, searchParams) {
    const today = new Date().toDateString();
    analytics.totalSearches++;
    analytics.totalApiCalls++;
    analytics.dailyStats[today] = analytics.dailyStats[today] || { searches: 0, apiCalls: 0 };
    analytics.dailyStats[today].searches++;
    analytics.dailyStats[today].apiCalls++;
    
    analytics.searches.push({
        timestamp: new Date(),
        location: searchParams.location,
        propertyType: searchParams.propertyType,
        limit: searchParams.limit,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress
    });

    // Keep only last 100 searches to prevent memory issues
    if (analytics.searches.length > 100) {
        analytics.searches = analytics.searches.slice(-100);
    }
}

// Test API endpoint
app.get('/api/test', async (req, res) => {
    try {
        const realEstateAPI = new RealEstateAPI();
        const result = await realEstateAPI.searchProperties({ location: '10022', limit: 1 });
        res.json({ success: true, data: result });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// Debug API endpoint
app.get('/api/debug', async (req, res) => {
    try {
        const realEstateAPI = new RealEstateAPI();
        console.log('Debug - API Service Debug Info:', {
            apiKey: realEstateAPI.apiKey ? 'present' : 'missing',
            host: realEstateAPI.host,
            baseURL: realEstateAPI.baseURL
        });
        
        // Try to make the actual API call
        const payload = {
            postal_code: "10022",
            limit: 1,
            offset: 0,
            status: ["for_sale"],
            sort: {
                direction: "desc",
                field: "list_date"
            }
        };
        
        const response = await require('axios').post(`${realEstateAPI.baseURL}/properties/v3/list`, payload, {
            headers: {
                'X-RapidAPI-Key': realEstateAPI.apiKey,
                'X-RapidAPI-Host': realEstateAPI.host,
                'Content-Type': 'application/json'
            }
        });
        
        res.json({ 
            success: true, 
            debug: {
                apiKey: realEstateAPI.apiKey ? 'present' : 'missing',
                host: realEstateAPI.host,
                baseURL: realEstateAPI.baseURL,
                responseData: response.data
            }
        });
    } catch (error) {
        res.json({ 
            success: false, 
            error: error.message,
            debug: {
                apiKey: process.env.RAPIDAPI_KEY ? 'present' : 'missing',
                host: process.env.RAPIDAPI_HOST,
                status: error.response?.status,
                statusText: error.response?.statusText,
                responseData: error.response?.data
            }
        });
    }
});

// Search properties (GET and POST)
app.get('/api/search', async (req, res) => {
    try {
        const { location, propertyType, minPrice, maxPrice, bedrooms, bathrooms, limit = 200 } = req.query;
        
        const searchParams = {
            location,
            propertyType: propertyType || 'house',
            minPrice: minPrice || 0,
            maxPrice: maxPrice || 10000000,
            bedrooms: bedrooms || 0,
            bathrooms: bathrooms || 0,
            limit: Math.min(limit, 500)
        };

        // Track this search
        trackSearch(req, searchParams);

        const realEstateAPI = new RealEstateAPI();
        const properties = await realEstateAPI.searchProperties(searchParams);
        res.json({ success: true, data: properties, count: properties.length });
    } catch (error) {
        console.error('Search error:', error);
        
        // If API fails, try to return mock data
        if (error.message.includes('quota') || error.message.includes('exceeded')) {
            console.log('API quota exceeded, returning mock data');
            const realEstateAPI = new RealEstateAPI();
            const mockProperties = realEstateAPI.getMockProperties(req.query.location, req.query.limit);
            res.json({ success: true, data: mockProperties, count: mockProperties.length });
        } else {
            res.status(500).json({ success: false, error: error.message });
        }
    }
});

app.post('/api/search', async (req, res) => {
    try {
        const { location, propertyType, minPrice, maxPrice, bedrooms, bathrooms, limit = 200 } = req.body;
        
        const searchParams = {
            location,
            propertyType: propertyType || 'house',
            minPrice: minPrice || 0,
            maxPrice: maxPrice || 10000000,
            bedrooms: bedrooms || 0,
            bathrooms: bathrooms || 0,
            limit: Math.min(limit, 500)
        };

        // Track this search
        trackSearch(req, searchParams);

        const realEstateAPI = new RealEstateAPI();
        const properties = await realEstateAPI.searchProperties(searchParams);
        res.json({ success: true, data: properties, count: properties.length });
    } catch (error) {
        console.error('Search error:', error);
        
        // If API fails, try to return mock data
        if (error.message.includes('quota') || error.message.includes('exceeded')) {
            console.log('API quota exceeded, returning mock data');
            const realEstateAPI = new RealEstateAPI();
            const mockProperties = realEstateAPI.getMockProperties(req.body.location, req.body.limit);
            res.json({ success: true, data: mockProperties, count: mockProperties.length });
        } else {
            res.status(500).json({ success: false, error: error.message });
        }
    }
});

// Export to Excel
app.post('/api/export', async (req, res) => {
    try {
        const { properties, filename } = req.body;
        
        if (!properties || !Array.isArray(properties)) {
            return res.status(400).json({ success: false, error: 'Properties array is required' });
        }

        // Generate Excel file in memory
        const excelBuffer = await excelService.exportToExcelBuffer(properties, filename);
        
        // Set headers for file download
        const downloadFilename = filename || `realtor_listings_${new Date().toISOString().split('T')[0]}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
        res.setHeader('Content-Length', excelBuffer.length);
        
        // Send the Excel file directly
        res.send(excelBuffer);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Download Excel file
app.get('/api/download/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, 'exports', filename);
        
        res.download(filePath, (err) => {
            if (err) {
                console.error('Download error:', err);
                res.status(404).json({ success: false, error: 'File not found' });
            }
        });
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Enhanced market analysis report
app.post('/api/market-analysis', async (req, res) => {
    try {
        const { properties, location } = req.body;
        
        if (!properties || !Array.isArray(properties)) {
            return res.status(400).json({ success: false, error: 'Properties array is required' });
        }

        // Generate Excel file in memory
        const excelBuffer = await excelService.createMarketAnalysisReportBuffer(properties, location || 'Unknown');
        
        // Set headers for file download
        const downloadFilename = `market_analysis_${new Date().toISOString().split('T')[0]}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
        res.setHeader('Content-Length', excelBuffer.length);
        
        // Send the Excel file directly
        res.send(excelBuffer);
    } catch (error) {
        console.error('Market analysis error:', error);
        res.status(500).json({ success: false, error: 'Failed to create market analysis report' });
    }
});

// Report Type 1: Property Listings Report
app.post('/api/reports/property-listings', async (req, res) => {
    try {
        const { properties, location } = req.body;
        
        if (!properties || !Array.isArray(properties)) {
            return res.status(400).json({ success: false, error: 'Properties array is required' });
        }

        console.log(`🤖 Generating AI Property Listings Report for ${properties.length} properties in ${location || 'Unknown'}`);
        
        // Generate AI-powered property listings report
        const excelBuffer = await aiReportService.generatePropertyListingsReport(properties, location || 'Unknown');
        
        // Set headers for file download
        const downloadFilename = `AI_Property_Analysis_${(location || 'Unknown').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
        res.setHeader('Content-Length', excelBuffer.length);
        
        // Send the Excel file directly
        res.send(excelBuffer);
    } catch (error) {
        console.error('Property Listings Report error:', error);
        res.status(500).json({ success: false, error: 'Failed to create Property Listings report' });
    }
});

// Report Type 2: Market Intelligence Report
app.post('/api/reports/market-intelligence', async (req, res) => {
    try {
        const { properties, location } = req.body;
        
        if (!properties || !Array.isArray(properties)) {
            return res.status(400).json({ success: false, error: 'Properties array is required' });
        }

        console.log(`🤖 Generating AI Market Intelligence Report for ${properties.length} properties in ${location || 'Unknown'}`);
        
        // Generate AI-powered market intelligence report
        const excelBuffer = await aiReportService.generateMarketIntelligenceReport(properties, location || 'Unknown');
        
        // Set headers for file download
        const downloadFilename = `AI_Market_Intelligence_${(location || 'Unknown').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
        res.setHeader('Content-Length', excelBuffer.length);
        
        // Send the Excel file directly
        res.send(excelBuffer);
    } catch (error) {
        console.error('Market Intelligence Report error:', error);
        res.status(500).json({ success: false, error: 'Failed to create Market Intelligence report' });
    }
});

// Report Type 3: Investment Analysis Report
app.post('/api/reports/investment-analysis', async (req, res) => {
    try {
        const { properties, location } = req.body;
        
        if (!properties || !Array.isArray(properties)) {
            return res.status(400).json({ success: false, error: 'Properties array is required' });
        }

        console.log(`🤖 Generating AI Investment Analysis Report for ${properties.length} properties in ${location || 'Unknown'}`);
        
        // Generate AI-powered investment analysis report
        const excelBuffer = await aiReportService.generateInvestmentAnalysisReport(properties, location || 'Unknown');
        
        // Set headers for file download
        const downloadFilename = `AI_Investment_Analysis_${(location || 'Unknown').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
        res.setHeader('Content-Length', excelBuffer.length);
        
        // Send the Excel file directly
        res.send(excelBuffer);
    } catch (error) {
        console.error('Investment Analysis Report error:', error);
        res.status(500).json({ success: false, error: 'Failed to create Investment Analysis report' });
    }
});

// Get weekly listings (for cron job)
app.get('/api/weekly-listings', async (req, res) => {
    try {
        const { location = 'New York, NY', limit = 100 } = req.query;
        
        const searchParams = {
            location,
            propertyType: 'house',
            limit: parseInt(limit)
        };

        const properties = await realEstateAPI.searchProperties(searchParams);
        res.json({ success: true, data: properties, count: properties.length });
    } catch (error) {
        console.error('Weekly listings error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🏡 Realtor House Finder server running on port ${PORT}`);
    console.log(`📊 Visit http://localhost:${PORT} to access the application`);
    
    // Start cron job for weekly exports
    cronService.startWeeklyExport();
});

module.exports = app;


