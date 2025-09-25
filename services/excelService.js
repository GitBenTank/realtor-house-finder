const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

class ExcelService {
    constructor() {
        this.outputDir = process.env.EXCEL_OUTPUT_DIR || './exports';
        this.ensureOutputDir();
    }

    ensureOutputDir() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    async exportToExcel(properties, customFilename = null) {
        try {
            const filename = customFilename || this.generateFilename();
            const filePath = path.join(this.outputDir, filename);

            // Prepare data for Excel
            const excelData = this.prepareExcelData(properties);
            
            // Create workbook
            const workbook = XLSX.utils.book_new();
            
            // Add main properties sheet
            const propertiesSheet = XLSX.utils.json_to_sheet(excelData.properties);
            XLSX.utils.book_append_sheet(workbook, propertiesSheet, 'Properties');
            
            // Add summary sheet
            const summarySheet = XLSX.utils.json_to_sheet(excelData.summary);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
            
            // Add market analysis sheet
            const analysisSheet = XLSX.utils.json_to_sheet(excelData.analysis);
            XLSX.utils.book_append_sheet(workbook, analysisSheet, 'Market Analysis');

            // Write file
            XLSX.writeFile(workbook, filePath);
            
            console.log(`✅ Excel file created: ${filePath}`);
            return filePath;
        } catch (error) {
            console.error('Excel export error:', error);
            throw new Error(`Failed to create Excel file: ${error.message}`);
        }
    }

    async exportToExcelBuffer(properties, customFilename = null) {
        try {
            // Prepare data for Excel
            const excelData = this.prepareExcelData(properties);
            
            // Create workbook
            const workbook = XLSX.utils.book_new();
            
            // Add main properties sheet
            const propertiesSheet = XLSX.utils.json_to_sheet(excelData.properties);
            XLSX.utils.book_append_sheet(workbook, propertiesSheet, 'Properties');
            
            // Add summary sheet
            const summarySheet = XLSX.utils.json_to_sheet(excelData.summary);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
            
            // Add market analysis sheet
            const analysisSheet = XLSX.utils.json_to_sheet(excelData.analysis);
            XLSX.utils.book_append_sheet(workbook, analysisSheet, 'Market Analysis');

            // Generate buffer
            const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
            
            console.log(`✅ Excel buffer created: ${buffer.length} bytes`);
            return buffer;
        } catch (error) {
            console.error('Excel buffer export error:', error);
            throw new Error(`Failed to create Excel buffer: ${error.message}`);
        }
    }

    prepareExcelData(properties) {
        const propertiesData = properties.map(property => ({
            'Property ID': property.id,
            'Address': property.address,
            'Price': property.price,
            'Price Formatted': this.formatCurrency(property.price),
            'Bedrooms': property.bedrooms,
            'Bathrooms': property.bathrooms,
            'Square Feet': property.squareFeet,
            'Lot Size (sq ft)': property.lotSize,
            'Property Type': property.propertyType,
            'Status': property.status,
            'List Date': moment(property.listDate).format('MM/DD/YYYY'),
            'Year Built': property.yearBuilt,
            'Garage Spaces': property.garage,
            'Pool': property.pool ? 'Yes' : 'No',
            'Agent Name': property.agent.name,
            'Agent Phone': property.agent.phone,
            'Agent Email': property.agent.email,
            'Latitude': property.coordinates.lat,
            'Longitude': property.coordinates.lng,
            'Property URL': property.url,
            'Price per Sq Ft': property.squareFeet > 0 ? Math.round(property.price / property.squareFeet) : 0,
            'Days on Market': moment().diff(moment(property.listDate), 'days'),
            'Last Updated': moment(property.lastUpdated).format('MM/DD/YYYY HH:mm')
        }));

        const summary = this.generateSummary(properties);
        const analysis = this.generateMarketAnalysis(properties);

        return {
            properties: propertiesData,
            summary: summary,
            analysis: analysis
        };
    }

    generateSummary(properties) {
        const totalProperties = properties.length;
        const totalValue = properties.reduce((sum, p) => sum + p.price, 0);
        const avgPrice = totalValue / totalProperties;
        const minPrice = Math.min(...properties.map(p => p.price));
        const maxPrice = Math.max(...properties.map(p => p.price));
        
        const propertyTypes = {};
        const bedroomCounts = {};
        const bathroomCounts = {};

        properties.forEach(property => {
            propertyTypes[property.propertyType] = (propertyTypes[property.propertyType] || 0) + 1;
            bedroomCounts[property.bedrooms] = (bedroomCounts[property.bedrooms] || 0) + 1;
            bathroomCounts[property.bathrooms] = (bathroomCounts[property.bathrooms] || 0) + 1;
        });

        return [
            { 'Metric': 'Total Properties', 'Value': totalProperties },
            { 'Metric': 'Total Market Value', 'Value': this.formatCurrency(totalValue) },
            { 'Metric': 'Average Price', 'Value': this.formatCurrency(avgPrice) },
            { 'Metric': 'Lowest Price', 'Value': this.formatCurrency(minPrice) },
            { 'Metric': 'Highest Price', 'Value': this.formatCurrency(maxPrice) },
            { 'Metric': 'Report Generated', 'Value': moment().format('MM/DD/YYYY HH:mm') },
            { 'Metric': 'Data Source', 'Value': 'RapidAPI Real Estate' },
            { 'Metric': '', 'Value': '' },
            { 'Metric': 'Property Types', 'Value': '' },
            ...Object.entries(propertyTypes).map(([type, count]) => ({
                'Metric': `  ${type}`, 'Value': count
            })),
            { 'Metric': '', 'Value': '' },
            { 'Metric': 'Bedroom Distribution', 'Value': '' },
            ...Object.entries(bedroomCounts).map(([beds, count]) => ({
                'Metric': `  ${beds} bedrooms`, 'Value': count
            })),
            { 'Metric': '', 'Value': '' },
            { 'Metric': 'Bathroom Distribution', 'Value': '' },
            ...Object.entries(bathroomCounts).map(([baths, count]) => ({
                'Metric': `  ${baths} bathrooms`, 'Value': count
            }))
        ];
    }

    generateMarketAnalysis(properties) {
        const priceRanges = [
            { range: 'Under $200K', min: 0, max: 200000 },
            { range: '$200K - $400K', min: 200000, max: 400000 },
            { range: '$400K - $600K', min: 400000, max: 600000 },
            { range: '$600K - $800K', min: 600000, max: 800000 },
            { range: '$800K - $1M', min: 800000, max: 1000000 },
            { range: 'Over $1M', min: 1000000, max: Infinity }
        ];

        const analysis = priceRanges.map(range => {
            const count = properties.filter(p => p.price >= range.min && p.price < range.max).length;
            const percentage = properties.length > 0 ? ((count / properties.length) * 100).toFixed(1) : 0;
            return {
                'Price Range': range.range,
                'Count': count,
                'Percentage': `${percentage}%`
            };
        });

        // Add additional analysis
        const avgDaysOnMarket = properties.reduce((sum, p) => {
            return sum + moment().diff(moment(p.listDate), 'days');
        }, 0) / properties.length;

        analysis.push(
            { 'Price Range': '', 'Count': '', 'Percentage': '' },
            { 'Price Range': 'Average Days on Market', 'Count': Math.round(avgDaysOnMarket), 'Percentage': 'days' },
            { 'Price Range': 'Properties with Pool', 'Count': properties.filter(p => p.pool).length, 'Percentage': `${((properties.filter(p => p.pool).length / properties.length) * 100).toFixed(1)}%` },
            { 'Price Range': 'Properties with Garage', 'Count': properties.filter(p => p.garage > 0).length, 'Percentage': `${((properties.filter(p => p.garage > 0).length / properties.length) * 100).toFixed(1)}%` }
        );

        return analysis;
    }

    generateFilename() {
        const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
        return `realtor_listings_${timestamp}.xlsx`;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    async createWeeklyReport(location = 'New York, NY') {
        try {
            const realEstateAPI = require('./realEstateAPI');
            const properties = await realEstateAPI.searchProperties({
                location,
                limit: parseInt(process.env.MAX_LISTINGS_PER_WEEK) || 100
            });

            const filename = `weekly_report_${moment().format('YYYY-MM-DD')}.xlsx`;
            const filePath = await this.exportToExcel(properties, filename);
            
            console.log(`📊 Weekly report created: ${filePath}`);
            return filePath;
        } catch (error) {
            console.error('Weekly report error:', error);
            throw error;
        }
    }

    async createMarketAnalysisReport(properties, location = 'Unknown') {
        try {
            const filename = `market_analysis_${moment().format('YYYY-MM-DD')}.xlsx`;
            const filePath = path.join(this.outputDir, filename);

            // Create workbook
            const workbook = XLSX.utils.book_new();
            
            // Add properties sheet
            const propertiesData = this.prepareExcelData(properties);
            const propertiesSheet = XLSX.utils.json_to_sheet(propertiesData.properties);
            XLSX.utils.book_append_sheet(workbook, propertiesSheet, 'Properties');
            
            // Add market summary
            const marketSummary = this.generateMarketSummary(properties, location);
            const summarySheet = XLSX.utils.json_to_sheet(marketSummary);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Market Summary');
            
            // Add price trends
            const priceTrends = this.generatePriceTrends(properties);
            const trendsSheet = XLSX.utils.json_to_sheet(priceTrends);
            XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Price Trends');
            
            // Add neighborhood analysis
            const neighborhoodAnalysis = this.generateNeighborhoodAnalysis(properties);
            const neighborhoodSheet = XLSX.utils.json_to_sheet(neighborhoodAnalysis);
            XLSX.utils.book_append_sheet(workbook, neighborhoodSheet, 'Neighborhood Analysis');
            
            // Add investment analysis
            const investmentAnalysis = this.generateInvestmentAnalysis(properties);
            const investmentSheet = XLSX.utils.json_to_sheet(investmentAnalysis);
            XLSX.utils.book_append_sheet(workbook, investmentSheet, 'Investment Analysis');

            // Write file
            XLSX.writeFile(workbook, filePath);
            
            console.log(`📊 Market analysis report created: ${filePath}`);
            return filePath;
        } catch (error) {
            console.error('Market analysis report error:', error);
            throw error;
        }
    }

    async createMarketAnalysisReportBuffer(properties, location = 'Unknown') {
        try {
            // Create workbook
            const workbook = XLSX.utils.book_new();
            
            // Add properties sheet
            const propertiesData = this.prepareExcelData(properties);
            const propertiesSheet = XLSX.utils.json_to_sheet(propertiesData.properties);
            XLSX.utils.book_append_sheet(workbook, propertiesSheet, 'Properties');
            
            // Add market summary
            const marketSummary = this.generateMarketSummary(properties, location);
            const summarySheet = XLSX.utils.json_to_sheet(marketSummary);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Market Summary');
            
            // Add price trends
            const priceTrends = this.generatePriceTrends(properties);
            const trendsSheet = XLSX.utils.json_to_sheet(priceTrends);
            XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Price Trends');
            
            // Add neighborhood analysis
            const neighborhoodAnalysis = this.generateNeighborhoodAnalysis(properties);
            const neighborhoodSheet = XLSX.utils.json_to_sheet(neighborhoodAnalysis);
            XLSX.utils.book_append_sheet(workbook, neighborhoodSheet, 'Neighborhood Analysis');
            
            // Add investment analysis
            const investmentAnalysis = this.generateInvestmentAnalysis(properties);
            const investmentSheet = XLSX.utils.json_to_sheet(investmentAnalysis);
            XLSX.utils.book_append_sheet(workbook, investmentSheet, 'Investment Analysis');

            // Generate buffer
            const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
            
            console.log(`📊 Market analysis buffer created: ${buffer.length} bytes`);
            return buffer;
        } catch (error) {
            console.error('Market analysis buffer error:', error);
            throw error;
        }
    }

    generateMarketSummary(properties, location) {
        const totalProperties = properties.length;
        const prices = properties.map(p => p.price).filter(p => p > 0);
        const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
        const medianPrice = prices.length > 0 ? this.calculateMedian(prices) : 0;
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
        
        // Calculate days on market
        const daysOnMarket = properties.map(p => {
            const listDate = new Date(p.listDate);
            const now = new Date();
            return Math.floor((now - listDate) / (1000 * 60 * 60 * 24));
        });
        const avgDaysOnMarket = daysOnMarket.length > 0 ? Math.round(daysOnMarket.reduce((a, b) => a + b, 0) / daysOnMarket.length) : 0;
        
        // Recent listings (last 7, 14, 30 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recent7Days = properties.filter(p => new Date(p.listDate) >= sevenDaysAgo).length;
        const recent14Days = properties.filter(p => new Date(p.listDate) >= fourteenDaysAgo).length;
        const recent30Days = properties.filter(p => new Date(p.listDate) >= thirtyDaysAgo).length;
        
        return [
            { 'Metric': 'Location', 'Value': location },
            { 'Metric': 'Report Date', 'Value': moment().format('MM/DD/YYYY HH:mm') },
            { 'Metric': '', 'Value': '' },
            { 'Metric': 'TOTAL PROPERTIES', 'Value': totalProperties },
            { 'Metric': 'Average Price', 'Value': this.formatCurrency(avgPrice) },
            { 'Metric': 'Median Price', 'Value': this.formatCurrency(medianPrice) },
            { 'Metric': 'Lowest Price', 'Value': this.formatCurrency(minPrice) },
            { 'Metric': 'Highest Price', 'Value': this.formatCurrency(maxPrice) },
            { 'Metric': 'Price Range', 'Value': `${this.formatCurrency(maxPrice - minPrice)}` },
            { 'Metric': '', 'Value': '' },
            { 'Metric': 'MARKET ACTIVITY', 'Value': '' },
            { 'Metric': 'Average Days on Market', 'Value': `${avgDaysOnMarket} days` },
            { 'Metric': 'Listings Last 7 Days', 'Value': recent7Days },
            { 'Metric': 'Listings Last 14 Days', 'Value': recent14Days },
            { 'Metric': 'Listings Last 30 Days', 'Value': recent30Days },
            { 'Metric': '', 'Value': '' },
            { 'Metric': 'MARKET INSIGHTS', 'Value': '' },
            { 'Metric': 'Market Activity Level', 'Value': this.getMarketActivityLevel(recent7Days, totalProperties) },
            { 'Metric': 'Price Volatility', 'Value': this.calculatePriceVolatility(prices) },
            { 'Metric': 'Inventory Turnover', 'Value': this.calculateInventoryTurnover(avgDaysOnMarket) }
        ];
    }

    generatePriceTrends(properties) {
        const priceRanges = [
            { range: 'Under $200K', min: 0, max: 200000 },
            { range: '$200K - $400K', min: 200000, max: 400000 },
            { range: '$400K - $600K', min: 400000, max: 600000 },
            { range: '$600K - $800K', min: 600000, max: 800000 },
            { range: '$800K - $1M', min: 800000, max: 1000000 },
            { range: 'Over $1M', min: 1000000, max: Infinity }
        ];

        return priceRanges.map(range => {
            const count = properties.filter(p => p.price >= range.min && p.price < range.max).length;
            const percentage = properties.length > 0 ? ((count / properties.length) * 100).toFixed(1) : 0;
            const avgPrice = properties.filter(p => p.price >= range.min && p.price < range.max)
                .map(p => p.price)
                .reduce((a, b) => a + b, 0) / count || 0;
            
            return {
                'Price Range': range.range,
                'Count': count,
                'Percentage': `${percentage}%`,
                'Average Price': this.formatCurrency(avgPrice),
                'Market Share': percentage > 20 ? 'High' : percentage > 10 ? 'Medium' : 'Low'
            };
        });
    }

    generateNeighborhoodAnalysis(properties) {
        const neighborhoods = {};
        
        properties.forEach(property => {
            const city = property.city || 'Unknown';
            const state = property.state || 'Unknown';
            const neighborhood = `${city}, ${state}`;
            
            if (!neighborhoods[neighborhood]) {
                neighborhoods[neighborhood] = {
                    count: 0,
                    totalPrice: 0,
                    prices: [],
                    propertyTypes: {}
                };
            }
            
            neighborhoods[neighborhood].count++;
            neighborhoods[neighborhood].totalPrice += property.price;
            neighborhoods[neighborhood].prices.push(property.price);
            neighborhoods[neighborhood].propertyTypes[property.propertyType] = 
                (neighborhoods[neighborhood].propertyTypes[property.propertyType] || 0) + 1;
        });
        
        return Object.entries(neighborhoods).map(([neighborhood, data]) => ({
            'Neighborhood': neighborhood,
            'Properties': data.count,
            'Average Price': this.formatCurrency(data.totalPrice / data.count),
            'Median Price': this.formatCurrency(this.calculateMedian(data.prices)),
            'Price Range': `${this.formatCurrency(Math.min(...data.prices))} - ${this.formatCurrency(Math.max(...data.prices))}`,
            'Dominant Type': Object.entries(data.propertyTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown',
            'Market Share': `${((data.count / properties.length) * 100).toFixed(1)}%`
        }));
    }

    generateInvestmentAnalysis(properties) {
        const analysis = properties.map(property => {
            const pricePerSqFt = property.squareFeet > 0 ? Math.round(property.price / property.squareFeet) : 0;
            const daysOnMarket = Math.floor((new Date() - new Date(property.listDate)) / (1000 * 60 * 60 * 24));
            
            // Simple investment score (0-100)
            let investmentScore = 50; // Base score
            
            // Price per sq ft scoring
            if (pricePerSqFt < 100) investmentScore += 20;
            else if (pricePerSqFt < 200) investmentScore += 10;
            else if (pricePerSqFt > 400) investmentScore -= 20;
            
            // Days on market scoring
            if (daysOnMarket < 30) investmentScore += 15;
            else if (daysOnMarket > 90) investmentScore -= 15;
            
            // Property type scoring
            if (property.propertyType === 'single_family') investmentScore += 10;
            else if (property.propertyType === 'condo') investmentScore += 5;
            
            // Price range scoring
            if (property.price < 300000) investmentScore += 10;
            else if (property.price > 1000000) investmentScore -= 10;
            
            return {
                'Property ID': property.id,
                'Address': property.address,
                'Price': this.formatCurrency(property.price),
                'Price per Sq Ft': `$${pricePerSqFt}`,
                'Square Feet': property.squareFeet,
                'Days on Market': daysOnMarket,
                'Property Type': property.propertyType,
                'Investment Score': Math.max(0, Math.min(100, investmentScore)),
                'Investment Rating': this.getInvestmentRating(investmentScore),
                'Recommendation': this.getInvestmentRecommendation(investmentScore)
            };
        });
        
        return analysis.sort((a, b) => b['Investment Score'] - a['Investment Score']);
    }

    calculateMedian(numbers) {
        const sorted = numbers.slice().sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
    }

    getMarketActivityLevel(recent7Days, totalProperties) {
        const activityRate = (recent7Days / totalProperties) * 100;
        if (activityRate > 20) return 'Very High';
        if (activityRate > 10) return 'High';
        if (activityRate > 5) return 'Medium';
        return 'Low';
    }

    calculatePriceVolatility(prices) {
        if (prices.length < 2) return 'Low';
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
        const variance = prices.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / prices.length;
        const stdDev = Math.sqrt(variance);
        const coefficient = (stdDev / avg) * 100;
        
        if (coefficient > 30) return 'High';
        if (coefficient > 15) return 'Medium';
        return 'Low';
    }

    calculateInventoryTurnover(avgDaysOnMarket) {
        if (avgDaysOnMarket < 30) return 'Fast';
        if (avgDaysOnMarket < 60) return 'Normal';
        return 'Slow';
    }

    getInvestmentRating(score) {
        if (score >= 80) return 'Excellent';
        if (score >= 70) return 'Good';
        if (score >= 60) return 'Fair';
        if (score >= 50) return 'Average';
        return 'Poor';
    }

    getInvestmentRecommendation(score) {
        if (score >= 80) return 'Strong Buy';
        if (score >= 70) return 'Buy';
        if (score >= 60) return 'Consider';
        if (score >= 50) return 'Hold';
        return 'Avoid';
    }
}

module.exports = new ExcelService();
