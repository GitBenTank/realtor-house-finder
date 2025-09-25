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
            // Create Property Listings Report - Clean, client-ready format
            const workbook = XLSX.utils.book_new();
            
            // Main Properties Sheet - Clean listing format
            const propertiesData = this.preparePropertyListingsData(properties);
            const propertiesSheet = XLSX.utils.json_to_sheet(propertiesData);
            XLSX.utils.book_append_sheet(workbook, propertiesSheet, 'Property Listings');
            
            // Quick Summary Sheet
            const summaryData = this.generateQuickSummary(properties);
            const summarySheet = XLSX.utils.json_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Quick Summary');

            // Generate buffer
            const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
            
            console.log(`✅ Property Listings Report created: ${buffer.length} bytes`);
            return buffer;
        } catch (error) {
            console.error('Property Listings export error:', error);
            throw new Error(`Failed to create Property Listings report: ${error.message}`);
        }
    }

    // Report Type 1: Comprehensive Property Listings Report
    async createPropertyListingsReport(properties, location = 'Unknown') {
        try {
            console.log(`Creating Property Listings Report for ${properties.length} properties in ${location}`);
            const workbook = XLSX.utils.book_new();
            
            // 1. Executive Summary Sheet
            console.log('Generating Executive Summary...');
            const executiveSummary = this.generateExecutiveSummary(properties, location);
            const executiveSheet = XLSX.utils.json_to_sheet(executiveSummary);
            XLSX.utils.book_append_sheet(workbook, executiveSheet, 'Executive Summary');
            
            // 2. Detailed Property Listings Sheet
            console.log('Preparing Detailed Property Data...');
            const detailedProperties = this.prepareDetailedPropertyData(properties);
            const propertiesSheet = XLSX.utils.json_to_sheet(detailedProperties);
            XLSX.utils.book_append_sheet(workbook, propertiesSheet, 'Property Listings');
            
            // 3. Property Analysis Sheet
            console.log('Generating Property Analysis...');
            const propertyAnalysis = this.generatePropertyAnalysis(properties);
            const analysisSheet = XLSX.utils.json_to_sheet(propertyAnalysis);
            XLSX.utils.book_append_sheet(workbook, analysisSheet, 'Property Analysis');
            
            // 4. Market Overview Sheet
            console.log('Generating Market Overview...');
            const marketOverview = this.generateMarketOverview(properties, location);
            const marketSheet = XLSX.utils.json_to_sheet(marketOverview);
            XLSX.utils.book_append_sheet(workbook, marketSheet, 'Market Overview');
            
            // 5. Agent Contact Sheet
            console.log('Generating Agent Contacts...');
            const agentContacts = this.generateAgentContacts(properties);
            const agentSheet = XLSX.utils.json_to_sheet(agentContacts);
            XLSX.utils.book_append_sheet(workbook, agentSheet, 'Agent Contacts');

            console.log('Writing Excel buffer...');
            const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
            console.log(`✅ Property Listings Report created: ${buffer.length} bytes`);
            return buffer;
        } catch (error) {
            console.error('Property Listings Report error:', error);
            console.error('Error stack:', error.stack);
            throw new Error(`Failed to create Property Listings report: ${error.message}`);
        }
    }

    // Report Type 2: Market Intelligence Report
    async createMarketIntelligenceReport(properties, location = 'Unknown') {
        try {
            const workbook = XLSX.utils.book_new();
            
            // 1. Market Overview Sheet
            const marketOverview = this.generateMarketOverview(properties, location);
            const overviewSheet = XLSX.utils.json_to_sheet(marketOverview);
            XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Market Overview');
            
            // 2. Price Analysis Sheet
            const priceAnalysis = this.generateDetailedPriceAnalysis(properties);
            const priceSheet = XLSX.utils.json_to_sheet(priceAnalysis);
            XLSX.utils.book_append_sheet(workbook, priceSheet, 'Price Analysis');
            
            // 3. Neighborhood Comparison Sheet
            const neighborhoodComparison = this.generateNeighborhoodComparison(properties);
            const neighborhoodSheet = XLSX.utils.json_to_sheet(neighborhoodComparison);
            XLSX.utils.book_append_sheet(workbook, neighborhoodSheet, 'Neighborhood Comparison');
            
            // 4. Market Trends Sheet
            const marketTrends = this.generateMarketTrends(properties);
            const trendsSheet = XLSX.utils.json_to_sheet(marketTrends);
            XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Market Trends');
            
            // 5. Competitive Analysis Sheet
            const competitiveAnalysis = this.generateCompetitiveAnalysis(properties);
            const competitiveSheet = XLSX.utils.json_to_sheet(competitiveAnalysis);
            XLSX.utils.book_append_sheet(workbook, competitiveSheet, 'Competitive Analysis');
            
            // 6. Market Recommendations Sheet
            const recommendations = this.generateMarketRecommendations(properties, location);
            const recommendationsSheet = XLSX.utils.json_to_sheet(recommendations);
            XLSX.utils.book_append_sheet(workbook, recommendationsSheet, 'Recommendations');

            const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
            console.log(`✅ Market Intelligence Report created: ${buffer.length} bytes`);
            return buffer;
        } catch (error) {
            console.error('Market Intelligence Report error:', error);
            throw new Error(`Failed to create Market Intelligence report: ${error.message}`);
        }
    }

    // Report Type 3: Investment Analysis Report
    async createInvestmentAnalysisReport(properties, location = 'Unknown') {
        try {
            const workbook = XLSX.utils.book_new();
            
            // 1. Investment Overview Sheet
            const investmentOverview = this.generateInvestmentOverview(properties, location);
            const overviewSheet = XLSX.utils.json_to_sheet(investmentOverview);
            XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Investment Overview');
            
            // 2. Property Investment Scores Sheet
            const investmentScores = this.generateInvestmentScores(properties);
            const scoresSheet = XLSX.utils.json_to_sheet(investmentScores);
            XLSX.utils.book_append_sheet(workbook, scoresSheet, 'Investment Scores');
            
            // 3. ROI Analysis Sheet
            const roiAnalysis = this.generateROIAnalysis(properties);
            const roiSheet = XLSX.utils.json_to_sheet(roiAnalysis);
            XLSX.utils.book_append_sheet(workbook, roiSheet, 'ROI Analysis');
            
            // 4. Market Value Analysis Sheet
            const marketValueAnalysis = this.generateMarketValueAnalysis(properties);
            const valueSheet = XLSX.utils.json_to_sheet(marketValueAnalysis);
            XLSX.utils.book_append_sheet(workbook, valueSheet, 'Market Value Analysis');
            
            // 5. Investment Recommendations Sheet
            const investmentRecommendations = this.generateInvestmentRecommendations(properties);
            const recommendationsSheet = XLSX.utils.json_to_sheet(investmentRecommendations);
            XLSX.utils.book_append_sheet(workbook, recommendationsSheet, 'Investment Recommendations');
            
            // 6. Risk Assessment Sheet
            const riskAssessment = this.generateRiskAssessment(properties);
            const riskSheet = XLSX.utils.json_to_sheet(riskAssessment);
            XLSX.utils.book_append_sheet(workbook, riskSheet, 'Risk Assessment');

            const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
            console.log(`✅ Investment Analysis Report created: ${buffer.length} bytes`);
            return buffer;
        } catch (error) {
            console.error('Investment Analysis Report error:', error);
            throw new Error(`Failed to create Investment Analysis report: ${error.message}`);
        }
    }

    preparePropertyListingsData(properties) {
        return properties.map(property => ({
            'Property ID': property.id,
            'Address': property.address,
            'City': property.city,
            'State': property.state,
            'Price': this.formatCurrency(property.price),
            'Price per Sq Ft': property.squareFeet > 0 ? `$${Math.round(property.price / property.squareFeet)}` : 'N/A',
            'Bedrooms': property.bedrooms,
            'Bathrooms': property.bathrooms,
            'Square Feet': property.squareFeet,
            'Lot Size': property.lotSize,
            'Property Type': this.formatPropertyType(property.propertyType),
            'Year Built': property.yearBuilt || 'Unknown',
            'Days on Market': Math.floor((new Date() - new Date(property.listDate)) / (1000 * 60 * 60 * 24)),
            'Status': property.status,
            'Agent Name': property.agent.name,
            'Agent Phone': property.agent.phone,
            'Agent Email': property.agent.email,
            'Property URL': property.url,
            'List Date': new Date(property.listDate).toLocaleDateString(),
            'Notes': this.generatePropertyNotes(property)
        }));
    }

    generateQuickSummary(properties) {
        const totalProperties = properties.length;
        const prices = properties.map(p => p.price).filter(p => p > 0);
        const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
        
        return [
            { 'Metric': 'Total Properties', 'Value': totalProperties },
            { 'Metric': 'Average Price', 'Value': this.formatCurrency(avgPrice) },
            { 'Metric': 'Price Range', 'Value': `${this.formatCurrency(minPrice)} - ${this.formatCurrency(maxPrice)}` },
            { 'Metric': 'Report Date', 'Value': new Date().toLocaleDateString() },
            { 'Metric': 'Search Location', 'Value': 'Based on current search criteria' },
            { 'Metric': '', 'Value': '' },
            { 'Metric': 'Property Types', 'Value': '' },
            ...Object.entries(this.getPropertyTypeCounts(properties)).map(([type, count]) => ({
                'Metric': `  ${this.formatPropertyType(type)}`, 'Value': count
            }))
        ];
    }

    formatPropertyType(type) {
        const typeMap = {
            'single_family': 'Single Family',
            'condo': 'Condo',
            'townhomes': 'Townhouse',
            'coop': 'Co-op',
            'apartment': 'Apartment'
        };
        return typeMap[type] || type;
    }

    generatePropertyNotes(property) {
        const notes = [];
        const daysOnMarket = Math.floor((new Date() - new Date(property.listDate)) / (1000 * 60 * 60 * 24));
        
        if (daysOnMarket <= 7) notes.push('New Listing');
        if (property.priceReducedAmount > 0) notes.push('Price Reduced');
        if (property.squareFeet > 2000) notes.push('Large Home');
        if (property.bedrooms >= 4) notes.push('Family Home');
        if (property.yearBuilt > 2010) notes.push('Modern Construction');
        
        return notes.join(', ') || 'Standard Listing';
    }

    getPropertyTypeCounts(properties) {
        const counts = {};
        properties.forEach(property => {
            const type = property.propertyType || 'Unknown';
            counts[type] = (counts[type] || 0) + 1;
        });
        return counts;
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
            // Create Market Intelligence Report - Market trends and competitive analysis
            const workbook = XLSX.utils.book_new();
            
            // Market Overview Sheet
            const marketOverview = this.generateMarketOverview(properties, location);
            const overviewSheet = XLSX.utils.json_to_sheet(marketOverview);
            XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Market Overview');
            
            // Price Analysis Sheet
            const priceAnalysis = this.generateDetailedPriceAnalysis(properties);
            const priceSheet = XLSX.utils.json_to_sheet(priceAnalysis);
            XLSX.utils.book_append_sheet(workbook, priceSheet, 'Price Analysis');
            
            // Neighborhood Comparison Sheet
            const neighborhoodComparison = this.generateNeighborhoodComparison(properties);
            const neighborhoodSheet = XLSX.utils.json_to_sheet(neighborhoodComparison);
            XLSX.utils.book_append_sheet(workbook, neighborhoodSheet, 'Neighborhood Comparison');
            
            // Market Trends Sheet
            const marketTrends = this.generateMarketTrends(properties);
            const trendsSheet = XLSX.utils.json_to_sheet(marketTrends);
            XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Market Trends');
            
            // Competitive Analysis Sheet
            const competitiveAnalysis = this.generateCompetitiveAnalysis(properties);
            const competitiveSheet = XLSX.utils.json_to_sheet(competitiveAnalysis);
            XLSX.utils.book_append_sheet(workbook, competitiveSheet, 'Competitive Analysis');

            // Generate buffer
            const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
            
            console.log(`📊 Market Intelligence Report created: ${buffer.length} bytes`);
            return buffer;
        } catch (error) {
            console.error('Market Intelligence Report error:', error);
            throw error;
        }
    }

    generateMarketOverview(properties, location) {
        const totalProperties = properties.length;
        const prices = properties.map(p => p.price).filter(p => p > 0);
        const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
        const medianPrice = prices.length > 0 ? this.calculateMedian(prices) : 0;
        
        // Market activity analysis
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentListings = properties.filter(p => new Date(p.listDate) >= sevenDaysAgo).length;
        
        // Days on market analysis
        const daysOnMarket = properties.map(p => {
            const listDate = new Date(p.listDate);
            const now = new Date();
            return Math.floor((now - listDate) / (1000 * 60 * 60 * 24));
        });
        const avgDaysOnMarket = daysOnMarket.length > 0 ? Math.round(daysOnMarket.reduce((a, b) => a + b, 0) / daysOnMarket.length) : 0;
        
        return [
            { 'Market Metric': 'Location', 'Value': location, 'Analysis': 'Search Area' },
            { 'Market Metric': 'Total Inventory', 'Value': totalProperties, 'Analysis': this.getInventoryLevel(totalProperties) },
            { 'Market Metric': 'Average Price', 'Value': this.formatCurrency(avgPrice), 'Analysis': this.getPriceLevel(avgPrice) },
            { 'Market Metric': 'Median Price', 'Value': this.formatCurrency(medianPrice), 'Analysis': 'Market Center Point' },
            { 'Market Metric': 'Price Range', 'Value': `${this.formatCurrency(Math.min(...prices))} - ${this.formatCurrency(Math.max(...prices))}`, 'Analysis': 'Market Spread' },
            { 'Market Metric': '', 'Value': '', 'Analysis': '' },
            { 'Market Metric': 'MARKET ACTIVITY', 'Value': '', 'Analysis': '' },
            { 'Market Metric': 'New Listings (7 days)', 'Value': recentListings, 'Analysis': this.getActivityLevel(recentListings, totalProperties) },
            { 'Market Metric': 'Avg Days on Market', 'Value': `${avgDaysOnMarket} days`, 'Analysis': this.getMarketSpeed(avgDaysOnMarket) },
            { 'Market Metric': 'Market Velocity', 'Value': this.calculateMarketVelocity(properties), 'Analysis': 'Overall Market Health' },
            { 'Market Metric': '', 'Value': '', 'Analysis': '' },
            { 'Market Metric': 'PRICING INSIGHTS', 'Value': '', 'Analysis': '' },
            { 'Market Metric': 'Price per Sq Ft Range', 'Value': this.getPricePerSqFtRange(properties), 'Analysis': 'Value Analysis' },
            { 'Market Metric': 'Premium Properties', 'Value': this.getPremiumPropertyCount(properties), 'Analysis': 'High-End Market' },
            { 'Market Metric': 'Value Properties', 'Value': this.getValuePropertyCount(properties), 'Analysis': 'Affordable Market' }
        ];
    }

    generateDetailedPriceAnalysis(properties) {
        const priceRanges = [
            { range: 'Under $200K', min: 0, max: 200000, category: 'Entry Level' },
            { range: '$200K - $400K', min: 200000, max: 400000, category: 'Mid-Market' },
            { range: '$400K - $600K', min: 400000, max: 600000, category: 'Upper Mid-Market' },
            { range: '$600K - $800K', min: 600000, max: 800000, category: 'Premium' },
            { range: '$800K - $1M', min: 800000, max: 1000000, category: 'Luxury' },
            { range: 'Over $1M', min: 1000000, max: Infinity, category: 'Ultra-Luxury' }
        ];

        return priceRanges.map(range => {
            const rangeProperties = properties.filter(p => p.price >= range.min && p.price < range.max);
            const count = rangeProperties.length;
            const percentage = properties.length > 0 ? ((count / properties.length) * 100).toFixed(1) : 0;
            const avgPrice = count > 0 ? Math.round(rangeProperties.reduce((sum, p) => sum + p.price, 0) / count) : 0;
            const avgDaysOnMarket = count > 0 ? Math.round(rangeProperties.reduce((sum, p) => {
                const listDate = new Date(p.listDate);
                const now = new Date();
                return sum + Math.floor((now - listDate) / (1000 * 60 * 60 * 24));
            }, 0) / count) : 0;
            
            return {
                'Price Range': range.range,
                'Category': range.category,
                'Count': count,
                'Percentage': `${percentage}%`,
                'Average Price': this.formatCurrency(avgPrice),
                'Avg Days on Market': `${avgDaysOnMarket} days`,
                'Market Share': this.getMarketShareLevel(percentage),
                'Competition Level': this.getCompetitionLevel(count),
                'Recommendation': this.getPriceRangeRecommendation(percentage, avgDaysOnMarket)
            };
        });
    }

    generateNeighborhoodComparison(properties) {
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
                    daysOnMarket: [],
                    propertyTypes: {}
                };
            }
            
            neighborhoods[neighborhood].count++;
            neighborhoods[neighborhood].totalPrice += property.price;
            neighborhoods[neighborhood].prices.push(property.price);
            
            const daysOnMarket = Math.floor((new Date() - new Date(property.listDate)) / (1000 * 60 * 60 * 24));
            neighborhoods[neighborhood].daysOnMarket.push(daysOnMarket);
            
            neighborhoods[neighborhood].propertyTypes[property.propertyType] = 
                (neighborhoods[neighborhood].propertyTypes[property.propertyType] || 0) + 1;
        });
        
        return Object.entries(neighborhoods).map(([neighborhood, data]) => {
            const avgPrice = data.totalPrice / data.count;
            const medianPrice = this.calculateMedian(data.prices);
            const avgDaysOnMarket = Math.round(data.daysOnMarket.reduce((a, b) => a + b, 0) / data.daysOnMarket.length);
            const dominantType = Object.entries(data.propertyTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
            
            return {
                'Neighborhood': neighborhood,
                'Properties': data.count,
                'Market Share': `${((data.count / properties.length) * 100).toFixed(1)}%`,
                'Average Price': this.formatCurrency(avgPrice),
                'Median Price': this.formatCurrency(medianPrice),
                'Price Range': `${this.formatCurrency(Math.min(...data.prices))} - ${this.formatCurrency(Math.max(...data.prices))}`,
                'Avg Days on Market': `${avgDaysOnMarket} days`,
                'Dominant Type': this.formatPropertyType(dominantType),
                'Market Position': this.getNeighborhoodPosition(avgPrice, data.count),
                'Investment Potential': this.getNeighborhoodInvestmentPotential(avgPrice, avgDaysOnMarket, data.count)
            };
        });
    }

    generateMarketTrends(properties) {
        const trends = [];
        
        // Price trend analysis
        const prices = properties.map(p => p.price).filter(p => p > 0);
        const priceVolatility = this.calculatePriceVolatility(prices);
        trends.push({
            'Trend Category': 'Price Volatility',
            'Current Value': priceVolatility,
            'Impact': this.getVolatilityImpact(priceVolatility),
            'Recommendation': this.getVolatilityRecommendation(priceVolatility)
        });
        
        // Market speed analysis
        const avgDaysOnMarket = properties.reduce((sum, p) => {
            const listDate = new Date(p.listDate);
            const now = new Date();
            return sum + Math.floor((now - listDate) / (1000 * 60 * 60 * 24));
        }, 0) / properties.length;
        
        trends.push({
            'Trend Category': 'Market Speed',
            'Current Value': `${Math.round(avgDaysOnMarket)} days`,
            'Impact': this.getMarketSpeedImpact(avgDaysOnMarket),
            'Recommendation': this.getMarketSpeedRecommendation(avgDaysOnMarket)
        });
        
        // Inventory analysis
        const totalProperties = properties.length;
        trends.push({
            'Trend Category': 'Inventory Level',
            'Current Value': totalProperties,
            'Impact': this.getInventoryImpact(totalProperties),
            'Recommendation': this.getInventoryRecommendation(totalProperties)
        });
        
        // New listing activity
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentListings = properties.filter(p => new Date(p.listDate) >= sevenDaysAgo).length;
        
        trends.push({
            'Trend Category': 'New Listing Activity',
            'Current Value': `${recentListings} in 7 days`,
            'Impact': this.getActivityImpact(recentListings, totalProperties),
            'Recommendation': this.getActivityRecommendation(recentListings, totalProperties)
        });
        
        return trends;
    }

    generateCompetitiveAnalysis(properties) {
        const analysis = [];
        
        // Price positioning analysis
        const prices = properties.map(p => p.price).filter(p => p > 0);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        const medianPrice = this.calculateMedian(prices);
        
        analysis.push({
            'Analysis Type': 'Price Positioning',
            'Market Average': this.formatCurrency(avgPrice),
            'Market Median': this.formatCurrency(medianPrice),
            'Competitive Advantage': this.getPriceAdvantage(avgPrice, medianPrice),
            'Strategy': this.getPricingStrategy(avgPrice, medianPrice)
        });
        
        // Days on market analysis
        const daysOnMarket = properties.map(p => {
            const listDate = new Date(p.listDate);
            const now = new Date();
            return Math.floor((now - listDate) / (1000 * 60 * 60 * 24));
        });
        const avgDaysOnMarket = daysOnMarket.reduce((a, b) => a + b, 0) / daysOnMarket.length;
        
        analysis.push({
            'Analysis Type': 'Market Velocity',
            'Average Days on Market': `${Math.round(avgDaysOnMarket)} days`,
            'Fastest Moving': `${Math.min(...daysOnMarket)} days`,
            'Slowest Moving': `${Math.max(...daysOnMarket)} days`,
            'Strategy': this.getVelocityStrategy(avgDaysOnMarket)
        });
        
        // Property type competition
        const typeCounts = this.getPropertyTypeCounts(properties);
        const dominantType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
        
        analysis.push({
            'Analysis Type': 'Property Type Competition',
            'Most Common': this.formatPropertyType(dominantType[0]),
            'Count': dominantType[1],
            'Market Share': `${((dominantType[1] / properties.length) * 100).toFixed(1)}%`,
            'Strategy': this.getTypeStrategy(dominantType[0], dominantType[1], properties.length)
        });
        
        return analysis;
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

    // ===== PROPERTY LISTINGS REPORT METHODS =====

    generateExecutiveSummary(properties, location) {
        const totalProperties = properties.length;
        const prices = properties.map(p => p.price).filter(p => p > 0);
        const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
        const medianPrice = prices.length > 0 ? this.calculateMedian(prices) : 0;
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
        
        // Market activity
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentListings = properties.filter(p => new Date(p.listDate) >= sevenDaysAgo).length;
        
        // Days on market
        const daysOnMarket = properties.map(p => {
            const listDate = new Date(p.listDate);
            const now = new Date();
            return Math.floor((now - listDate) / (1000 * 60 * 60 * 24));
        });
        const avgDaysOnMarket = daysOnMarket.length > 0 ? Math.round(daysOnMarket.reduce((a, b) => a + b, 0) / daysOnMarket.length) : 0;
        
        return [
            { 'Metric': 'Report Type', 'Value': 'Property Listings Report', 'Analysis': 'Comprehensive property search results' },
            { 'Metric': 'Search Location', 'Value': location, 'Analysis': 'Target market area' },
            { 'Metric': 'Report Date', 'Value': new Date().toLocaleDateString(), 'Analysis': 'Current market snapshot' },
            { 'Metric': '', 'Value': '', 'Analysis': '' },
            { 'Metric': 'PROPERTY INVENTORY', 'Value': '', 'Analysis': '' },
            { 'Metric': 'Total Properties Found', 'Value': totalProperties, 'Analysis': this.getInventoryLevel(totalProperties) },
            { 'Metric': 'Average Price', 'Value': this.formatCurrency(avgPrice), 'Analysis': this.getPriceLevel(avgPrice) },
            { 'Metric': 'Median Price', 'Value': this.formatCurrency(medianPrice), 'Analysis': 'Market center point' },
            { 'Metric': 'Price Range', 'Value': `${this.formatCurrency(minPrice)} - ${this.formatCurrency(maxPrice)}`, 'Analysis': 'Market spread' },
            { 'Metric': '', 'Value': '', 'Analysis': '' },
            { 'Metric': 'MARKET ACTIVITY', 'Value': '', 'Analysis': '' },
            { 'Metric': 'New Listings (7 days)', 'Value': recentListings, 'Analysis': this.getActivityLevel(recentListings, totalProperties) },
            { 'Metric': 'Average Days on Market', 'Value': `${avgDaysOnMarket} days`, 'Analysis': this.getMarketSpeed(avgDaysOnMarket) },
            { 'Metric': 'Market Velocity', 'Value': this.calculateMarketVelocity(properties), 'Analysis': 'Overall market health' },
            { 'Metric': '', 'Value': '', 'Analysis': '' },
            { 'Metric': 'PROPERTY TYPES', 'Value': '', 'Analysis': '' },
            ...Object.entries(this.getPropertyTypeCounts(properties)).map(([type, count]) => ({
                'Metric': `  ${this.formatPropertyType(type)}`, 'Value': count, 'Analysis': `${((count / totalProperties) * 100).toFixed(1)}% of market`
            }))
        ];
    }

    prepareDetailedPropertyData(properties) {
        return properties.map(property => {
            const daysOnMarket = Math.floor((new Date() - new Date(property.listDate)) / (1000 * 60 * 60 * 24));
            const pricePerSqft = property.squareFeet > 0 ? Math.round(property.price / property.squareFeet) : 0;
            
            return {
                'Property ID': property.id,
                'Address': property.address,
                'City': property.city,
                'State': property.state,
                'Postal Code': property.postal_code,
                'Price': property.price,
                'Price Formatted': this.formatCurrency(property.price),
                'Price per Sq Ft': `$${pricePerSqft}`,
                'Bedrooms': property.bedrooms,
                'Bathrooms': property.bathrooms,
                'Square Feet': property.squareFeet,
                'Lot Size (sq ft)': property.lotSize,
                'Property Type': this.formatPropertyType(property.propertyType),
                'Year Built': property.yearBuilt || 'Unknown',
                'Days on Market': daysOnMarket,
                'List Date': new Date(property.listDate).toLocaleDateString(),
                'Status': property.status.replace('_', ' ').toUpperCase(),
                'Agent Name': property.agent.name,
                'Agent Phone': property.agent.phone,
                'Agent Email': property.agent.email,
                'Property URL': property.url,
                'Coordinates': `${property.coordinates.lat}, ${property.coordinates.lng}`,
                'Price Reduced Amount': property.priceReducedAmount || 0,
                'Last Updated': new Date(property.lastUpdated).toLocaleString(),
                'Property Notes': this.generatePropertyNotes(property),
                'Investment Potential': this.getInvestmentPotential(property),
                'Market Position': this.getMarketPosition(property, properties)
            };
        });
    }

    generatePropertyAnalysis(properties) {
        const analysis = [];
        
        // Price analysis
        const prices = properties.map(p => p.price).filter(p => p > 0);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        const medianPrice = this.calculateMedian(prices);
        
        analysis.push({
            'Analysis Type': 'Price Analysis',
            'Metric': 'Average Price',
            'Value': this.formatCurrency(avgPrice),
            'Insight': this.getPriceInsight(avgPrice)
        });
        
        analysis.push({
            'Analysis Type': 'Price Analysis',
            'Metric': 'Median Price',
            'Value': this.formatCurrency(medianPrice),
            'Insight': 'Market center point'
        });
        
        // Days on market analysis
        const daysOnMarket = properties.map(p => {
            const listDate = new Date(p.listDate);
            const now = new Date();
            return Math.floor((now - listDate) / (1000 * 60 * 60 * 24));
        });
        const avgDaysOnMarket = daysOnMarket.reduce((a, b) => a + b, 0) / daysOnMarket.length;
        
        analysis.push({
            'Analysis Type': 'Market Speed',
            'Metric': 'Average Days on Market',
            'Value': `${Math.round(avgDaysOnMarket)} days`,
            'Insight': this.getMarketSpeedInsight(avgDaysOnMarket)
        });
        
        // Property type analysis
        const typeCounts = this.getPropertyTypeCounts(properties);
        const dominantType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
        
        analysis.push({
            'Analysis Type': 'Property Types',
            'Metric': 'Most Common Type',
            'Value': this.formatPropertyType(dominantType[0]),
            'Insight': `${dominantType[1]} properties (${((dominantType[1] / properties.length) * 100).toFixed(1)}%)`
        });
        
        return analysis;
    }

    generateAgentContacts(properties) {
        const agentMap = new Map();
        
        properties.forEach(property => {
            const agent = property.agent;
            const key = `${agent.name}-${agent.phone}`;
            
            if (!agentMap.has(key)) {
                agentMap.set(key, {
                    'Agent Name': agent.name,
                    'Phone': agent.phone,
                    'Email': agent.email,
                    'Properties Listed': 1,
                    'Average Price': property.price,
                    'Price Range': `${this.formatCurrency(property.price)} - ${this.formatCurrency(property.price)}`,
                    'Property Types': [property.propertyType]
                });
            } else {
                const existing = agentMap.get(key);
                existing['Properties Listed']++;
                existing['Average Price'] = (existing['Average Price'] + property.price) / 2;
                existing['Price Range'] = `${this.formatCurrency(Math.min(existing['Average Price'], property.price))} - ${this.formatCurrency(Math.max(existing['Average Price'], property.price))}`;
                if (!existing['Property Types'].includes(property.propertyType)) {
                    existing['Property Types'].push(property.propertyType);
                }
            }
        });
        
        return Array.from(agentMap.values()).map(agent => ({
            ...agent,
            'Property Types': agent['Property Types'].join(', '),
            'Average Price': this.formatCurrency(agent['Average Price'])
        }));
    }

    // ===== MARKET INTELLIGENCE REPORT METHODS =====

    generateMarketRecommendations(properties, location) {
        const recommendations = [];
        
        // Market condition recommendations
        const avgDaysOnMarket = properties.reduce((sum, p) => {
            const listDate = new Date(p.listDate);
            const now = new Date();
            return sum + Math.floor((now - listDate) / (1000 * 60 * 60 * 24));
        }, 0) / properties.length;
        
        if (avgDaysOnMarket < 30) {
            recommendations.push({
                'Category': 'Market Conditions',
                'Recommendation': 'Hot Market - Act Quickly',
                'Reasoning': `Average days on market is ${Math.round(avgDaysOnMarket)} days, indicating high demand`,
                'Action': 'Consider making offers quickly on desirable properties'
            });
        } else if (avgDaysOnMarket > 90) {
            recommendations.push({
                'Category': 'Market Conditions',
                'Recommendation': 'Buyer\'s Market - Negotiate',
                'Reasoning': `Average days on market is ${Math.round(avgDaysOnMarket)} days, indicating slower market`,
                'Action': 'You have more time to negotiate and may get better deals'
            });
        }
        
        // Price range recommendations
        const prices = properties.map(p => p.price).filter(p => p > 0);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        
        if (avgPrice < 300000) {
            recommendations.push({
                'Category': 'Price Strategy',
                'Recommendation': 'Entry-Level Market',
                'Reasoning': `Average price is ${this.formatCurrency(avgPrice)}, making this an accessible market`,
                'Action': 'Good for first-time buyers and investors'
            });
        } else if (avgPrice > 800000) {
            recommendations.push({
                'Category': 'Price Strategy',
                'Recommendation': 'Premium Market',
                'Reasoning': `Average price is ${this.formatCurrency(avgPrice)}, indicating a high-end market`,
                'Action': 'Ensure you have strong financing and consider luxury amenities'
            });
        }
        
        return recommendations;
    }

    // ===== INVESTMENT ANALYSIS REPORT METHODS =====

    generateInvestmentOverview(properties, location) {
        const totalProperties = properties.length;
        const prices = properties.map(p => p.price).filter(p => p > 0);
        const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
        
        // Calculate investment metrics
        const investmentScores = properties.map(p => this.calculateInvestmentScore(p));
        const avgInvestmentScore = investmentScores.reduce((a, b) => a + b, 0) / investmentScores.length;
        
        // Market velocity
        const avgDaysOnMarket = properties.reduce((sum, p) => {
            const listDate = new Date(p.listDate);
            const now = new Date();
            return sum + Math.floor((now - listDate) / (1000 * 60 * 60 * 24));
        }, 0) / properties.length;
        
        return [
            { 'Metric': 'Investment Report Type', 'Value': 'Real Estate Investment Analysis', 'Analysis': 'Comprehensive investment evaluation' },
            { 'Metric': 'Market Location', 'Value': location, 'Analysis': 'Investment target area' },
            { 'Metric': 'Report Date', 'Value': new Date().toLocaleDateString(), 'Analysis': 'Current market conditions' },
            { 'Metric': '', 'Value': '', 'Analysis': '' },
            { 'Metric': 'INVESTMENT OVERVIEW', 'Value': '', 'Analysis': '' },
            { 'Metric': 'Total Investment Opportunities', 'Value': totalProperties, 'Analysis': 'Properties analyzed' },
            { 'Metric': 'Average Property Price', 'Value': this.formatCurrency(avgPrice), 'Analysis': 'Entry cost for investments' },
            { 'Metric': 'Average Investment Score', 'Value': `${Math.round(avgInvestmentScore)}/100`, 'Analysis': this.getInvestmentScoreLevel(avgInvestmentScore) },
            { 'Metric': 'Market Velocity', 'Value': `${Math.round(avgDaysOnMarket)} days`, 'Analysis': this.getMarketVelocityInsight(avgDaysOnMarket) },
            { 'Metric': '', 'Value': '', 'Analysis': '' },
            { 'Metric': 'INVESTMENT CATEGORIES', 'Value': '', 'Analysis': '' },
            { 'Metric': 'High Potential (80+ score)', 'Value': investmentScores.filter(s => s >= 80).length, 'Analysis': 'Strong investment opportunities' },
            { 'Metric': 'Good Potential (60-79 score)', 'Value': investmentScores.filter(s => s >= 60 && s < 80).length, 'Analysis': 'Solid investment options' },
            { 'Metric': 'Moderate Potential (40-59 score)', 'Value': investmentScores.filter(s => s >= 40 && s < 60).length, 'Analysis': 'Consider with caution' },
            { 'Metric': 'Low Potential (<40 score)', 'Value': investmentScores.filter(s => s < 40).length, 'Analysis': 'High risk investments' }
        ];
    }

    generateInvestmentScores(properties) {
        return properties.map(property => {
            const investmentScore = this.calculateInvestmentScore(property);
            const daysOnMarket = Math.floor((new Date() - new Date(property.listDate)) / (1000 * 60 * 60 * 24));
            const pricePerSqft = property.squareFeet > 0 ? Math.round(property.price / property.squareFeet) : 0;
            
            return {
                'Property ID': property.id,
                'Address': property.address,
                'Price': this.formatCurrency(property.price),
                'Price per Sq Ft': `$${pricePerSqft}`,
                'Square Feet': property.squareFeet,
                'Bedrooms': property.bedrooms,
                'Bathrooms': property.bathrooms,
                'Property Type': this.formatPropertyType(property.propertyType),
                'Days on Market': daysOnMarket,
                'Investment Score': investmentScore,
                'Investment Rating': this.getInvestmentRating(investmentScore),
                'Investment Recommendation': this.getInvestmentRecommendation(investmentScore),
                'Key Strengths': this.getInvestmentStrengths(property),
                'Key Risks': this.getInvestmentRisks(property),
                'ROI Potential': this.getROIPotential(investmentScore),
                'Market Position': this.getMarketPosition(property, properties)
            };
        }).sort((a, b) => b['Investment Score'] - a['Investment Score']);
    }

    generateROIAnalysis(properties) {
        const roiAnalysis = [];
        
        // Price range ROI analysis
        const priceRanges = [
            { range: 'Under $200K', min: 0, max: 200000 },
            { range: '$200K - $400K', min: 200000, max: 400000 },
            { range: '$400K - $600K', min: 400000, max: 600000 },
            { range: '$600K - $800K', min: 600000, max: 800000 },
            { range: 'Over $800K', min: 800000, max: Infinity }
        ];
        
        priceRanges.forEach(range => {
            const rangeProperties = properties.filter(p => p.price >= range.min && p.price < range.max);
            if (rangeProperties.length > 0) {
                const avgScore = rangeProperties.reduce((sum, p) => sum + this.calculateInvestmentScore(p), 0) / rangeProperties.length;
                const avgDaysOnMarket = rangeProperties.reduce((sum, p) => {
                    const listDate = new Date(p.listDate);
                    const now = new Date();
                    return sum + Math.floor((now - listDate) / (1000 * 60 * 60 * 24));
                }, 0) / rangeProperties.length;
                
                roiAnalysis.push({
                    'Price Range': range.range,
                    'Properties Count': rangeProperties.length,
                    'Average Investment Score': Math.round(avgScore),
                    'Average Days on Market': Math.round(avgDaysOnMarket),
                    'ROI Potential': this.getROIPotential(avgScore),
                    'Investment Recommendation': this.getInvestmentRecommendation(avgScore),
                    'Market Activity': this.getMarketActivityLevel(avgDaysOnMarket)
                });
            }
        });
        
        return roiAnalysis;
    }

    generateMarketValueAnalysis(properties) {
        const analysis = [];
        
        // Price per square foot analysis
        const pricePerSqftData = properties
            .filter(p => p.squareFeet > 0)
            .map(p => ({
                property: p,
                pricePerSqft: Math.round(p.price / p.squareFeet)
            }))
            .sort((a, b) => a.pricePerSqft - b.pricePerSqft);
        
        if (pricePerSqftData.length > 0) {
            const avgPricePerSqft = pricePerSqftData.reduce((sum, p) => sum + p.pricePerSqft, 0) / pricePerSqftData.length;
            const medianPricePerSqft = this.calculateMedian(pricePerSqftData.map(p => p.pricePerSqft));
            
            analysis.push({
                'Analysis Type': 'Price per Square Foot',
                'Metric': 'Average Price per Sq Ft',
                'Value': `$${Math.round(avgPricePerSqft)}`,
                'Insight': this.getPricePerSqftInsight(avgPricePerSqft)
            });
            
            analysis.push({
                'Analysis Type': 'Price per Square Foot',
                'Metric': 'Median Price per Sq Ft',
                'Value': `$${Math.round(medianPricePerSqft)}`,
                'Insight': 'Market center point for value'
            });
        }
        
        // Market value distribution
        const valueRanges = [
            { range: 'Under Market Value', threshold: 0.9 },
            { range: 'At Market Value', threshold: 1.1 },
            { range: 'Above Market Value', threshold: Infinity }
        ];
        
        const avgPrice = properties.reduce((sum, p) => sum + p.price, 0) / properties.length;
        
        valueRanges.forEach(range => {
            const count = properties.filter(p => {
                const priceRatio = p.price / avgPrice;
                if (range.range === 'Under Market Value') return priceRatio < 0.9;
                if (range.range === 'At Market Value') return priceRatio >= 0.9 && priceRatio <= 1.1;
                return priceRatio > 1.1;
            }).length;
            
            analysis.push({
                'Analysis Type': 'Market Value Distribution',
                'Metric': range.range,
                'Value': count,
                'Insight': `${((count / properties.length) * 100).toFixed(1)}% of properties`
            });
        });
        
        return analysis;
    }

    generateInvestmentRecommendations(properties) {
        const recommendations = [];
        
        // Top investment opportunities
        const topProperties = properties
            .map(p => ({ property: p, score: this.calculateInvestmentScore(p) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
        
        recommendations.push({
            'Category': 'Top Opportunities',
            'Recommendation': 'Focus on High-Scoring Properties',
            'Properties': topProperties.map(p => p.property.address).join(', '),
            'Reasoning': 'These properties have the highest investment scores',
            'Action': 'Prioritize viewing and making offers on these properties'
        });
        
        // Market timing recommendations
        const avgDaysOnMarket = properties.reduce((sum, p) => {
            const listDate = new Date(p.listDate);
            const now = new Date();
            return sum + Math.floor((now - listDate) / (1000 * 60 * 60 * 24));
        }, 0) / properties.length;
        
        if (avgDaysOnMarket < 30) {
            recommendations.push({
                'Category': 'Market Timing',
                'Recommendation': 'Act Quickly',
                'Properties': 'All properties',
                'Reasoning': `Average days on market is ${Math.round(avgDaysOnMarket)} days`,
                'Action': 'Market is moving fast - prepare to make quick decisions'
            });
        }
        
        return recommendations;
    }

    generateRiskAssessment(properties) {
        const risks = [];
        
        // Market risk assessment
        const avgDaysOnMarket = properties.reduce((sum, p) => {
            const listDate = new Date(p.listDate);
            const now = new Date();
            return sum + Math.floor((now - listDate) / (1000 * 60 * 60 * 24));
        }, 0) / properties.length;
        
        if (avgDaysOnMarket > 90) {
            risks.push({
                'Risk Category': 'Market Risk',
                'Risk Level': 'High',
                'Description': 'Properties staying on market too long',
                'Impact': 'Potential price reductions or market downturn',
                'Mitigation': 'Negotiate lower prices or wait for market improvement'
            });
        }
        
        // Price volatility risk
        const prices = properties.map(p => p.price).filter(p => p > 0);
        const priceVolatility = this.calculatePriceVolatility(prices);
        
        if (priceVolatility === 'High') {
            risks.push({
                'Risk Category': 'Price Volatility',
                'Risk Level': 'High',
                'Description': 'High price variation in market',
                'Impact': 'Uncertainty in property values',
                'Mitigation': 'Focus on properties with stable pricing patterns'
            });
        }
        
        return risks;
    }

    // ===== HELPER METHODS =====

    calculateInvestmentScore(property) {
        let score = 50; // Base score
        
        // Price per sq ft scoring
        const pricePerSqft = property.squareFeet > 0 ? property.price / property.squareFeet : 0;
        if (pricePerSqft < 100) score += 20;
        else if (pricePerSqft < 200) score += 10;
        else if (pricePerSqft > 400) score -= 20;
        
        // Days on market scoring
        const daysOnMarket = Math.floor((new Date() - new Date(property.listDate)) / (1000 * 60 * 60 * 24));
        if (daysOnMarket < 30) score += 15;
        else if (daysOnMarket > 90) score -= 15;
        
        // Property type scoring
        if (property.propertyType === 'single_family') score += 10;
        else if (property.propertyType === 'condo') score += 5;
        
        // Price range scoring
        if (property.price < 300000) score += 10;
        else if (property.price > 1000000) score -= 10;
        
        return Math.max(0, Math.min(100, score));
    }

    getInvestmentPotential(property) {
        const score = this.calculateInvestmentScore(property);
        if (score >= 80) return 'Excellent';
        if (score >= 70) return 'Good';
        if (score >= 60) return 'Fair';
        if (score >= 50) return 'Average';
        return 'Poor';
    }

    getMarketPosition(property, allProperties) {
        const prices = allProperties.map(p => p.price).sort((a, b) => a - b);
        const percentile = (prices.indexOf(property.price) / prices.length) * 100;
        
        if (percentile < 25) return 'Low-end market';
        if (percentile < 75) return 'Mid-market';
        return 'High-end market';
    }

    getInvestmentStrengths(property) {
        const strengths = [];
        const pricePerSqft = property.squareFeet > 0 ? property.price / property.squareFeet : 0;
        
        if (pricePerSqft < 150) strengths.push('Good value per sq ft');
        if (property.bedrooms >= 3) strengths.push('Family-friendly size');
        if (property.yearBuilt > 2010) strengths.push('Modern construction');
        if (property.propertyType === 'single_family') strengths.push('Single-family home');
        
        return strengths.join(', ') || 'Standard property';
    }

    getInvestmentRisks(property) {
        const risks = [];
        const daysOnMarket = Math.floor((new Date() - new Date(property.listDate)) / (1000 * 60 * 60 * 24));
        
        if (daysOnMarket > 90) risks.push('Long time on market');
        if (property.price > 800000) risks.push('High price point');
        if (property.yearBuilt < 1990) risks.push('Older property');
        
        return risks.join(', ') || 'Low risk';
    }

    getROIPotential(score) {
        if (score >= 80) return 'High';
        if (score >= 60) return 'Medium';
        return 'Low';
    }

    getInvestmentScoreLevel(score) {
        if (score >= 80) return 'Excellent investment potential';
        if (score >= 70) return 'Good investment potential';
        if (score >= 60) return 'Fair investment potential';
        if (score >= 50) return 'Average investment potential';
        return 'Poor investment potential';
    }

    getMarketVelocityInsight(daysOnMarket) {
        if (daysOnMarket < 30) return 'Fast-moving market - act quickly';
        if (daysOnMarket < 60) return 'Normal market velocity';
        return 'Slow market - good for negotiation';
    }

    getPricePerSqftInsight(pricePerSqft) {
        if (pricePerSqft < 100) return 'Excellent value - below market average';
        if (pricePerSqft < 200) return 'Good value - competitive pricing';
        if (pricePerSqft < 300) return 'Average value - market rate';
        return 'Premium pricing - luxury market';
    }

    getPriceInsight(price) {
        if (price < 200000) return 'Entry-level market - good for first-time buyers';
        if (price < 400000) return 'Mid-market - balanced pricing';
        if (price < 600000) return 'Upper mid-market - quality properties';
        return 'Luxury market - high-end properties';
    }

    getMarketSpeedInsight(daysOnMarket) {
        if (daysOnMarket < 30) return 'Hot market - high demand';
        if (daysOnMarket < 60) return 'Normal market conditions';
        if (daysOnMarket < 90) return 'Slower market - more inventory';
        return 'Cold market - buyer advantage';
    }

    getInventoryLevel(count) {
        if (count > 100) return 'High inventory - buyer\'s market';
        if (count > 50) return 'Moderate inventory - balanced market';
        if (count > 20) return 'Low inventory - seller\'s market';
        return 'Very low inventory - competitive market';
    }

    getPriceLevel(price) {
        if (price < 200000) return 'Entry-level pricing';
        if (price < 400000) return 'Mid-market pricing';
        if (price < 600000) return 'Upper mid-market pricing';
        return 'Luxury market pricing';
    }

    getActivityLevel(recentListings, totalProperties) {
        const activityRate = (recentListings / totalProperties) * 100;
        if (activityRate > 20) return 'Very high activity';
        if (activityRate > 10) return 'High activity';
        if (activityRate > 5) return 'Moderate activity';
        return 'Low activity';
    }

    calculateMarketVelocity(properties) {
        const avgDaysOnMarket = properties.reduce((sum, p) => {
            const listDate = new Date(p.listDate);
            const now = new Date();
            return sum + Math.floor((now - listDate) / (1000 * 60 * 60 * 24));
        }, 0) / properties.length;
        
        if (avgDaysOnMarket < 30) return 'Fast';
        if (avgDaysOnMarket < 60) return 'Normal';
        return 'Slow';
    }

    // ===== MISSING METHODS FOR PROPERTY LISTINGS REPORT =====

    generateExecutiveSummary(properties, location) {
        const totalProperties = properties.length;
        const prices = properties.map(p => p.price).filter(p => p > 0);
        const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
        const medianPrice = prices.length > 0 ? this.calculateMedian(prices) : 0;
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
        
        // Market activity
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentListings = properties.filter(p => new Date(p.listDate) >= sevenDaysAgo).length;
        
        // Days on market
        const daysOnMarket = properties.map(p => {
            const listDate = new Date(p.listDate);
            const now = new Date();
            return Math.floor((now - listDate) / (1000 * 60 * 60 * 24));
        });
        const avgDaysOnMarket = daysOnMarket.length > 0 ? Math.round(daysOnMarket.reduce((a, b) => a + b, 0) / daysOnMarket.length) : 0;
        
        return [
            { 'Metric': 'Report Type', 'Value': 'Property Listings Report', 'Analysis': 'Comprehensive property search results' },
            { 'Metric': 'Search Location', 'Value': location, 'Analysis': 'Target market area' },
            { 'Metric': 'Report Date', 'Value': new Date().toLocaleDateString(), 'Analysis': 'Current market snapshot' },
            { 'Metric': '', 'Value': '', 'Analysis': '' },
            { 'Metric': 'PROPERTY INVENTORY', 'Value': '', 'Analysis': '' },
            { 'Metric': 'Total Properties Found', 'Value': totalProperties, 'Analysis': this.getInventoryLevel(totalProperties) },
            { 'Metric': 'Average Price', 'Value': this.formatCurrency(avgPrice), 'Analysis': this.getPriceLevel(avgPrice) },
            { 'Metric': 'Median Price', 'Value': this.formatCurrency(medianPrice), 'Analysis': 'Market center point' },
            { 'Metric': 'Price Range', 'Value': `${this.formatCurrency(minPrice)} - ${this.formatCurrency(maxPrice)}`, 'Analysis': 'Market spread' },
            { 'Metric': '', 'Value': '', 'Analysis': '' },
            { 'Metric': 'MARKET ACTIVITY', 'Value': '', 'Analysis': '' },
            { 'Metric': 'New Listings (7 days)', 'Value': recentListings, 'Analysis': this.getActivityLevel(recentListings, totalProperties) },
            { 'Metric': 'Average Days on Market', 'Value': `${avgDaysOnMarket} days`, 'Analysis': this.getMarketSpeed(avgDaysOnMarket) },
            { 'Metric': 'Market Velocity', 'Value': this.calculateMarketVelocity(properties), 'Analysis': 'Overall market health' },
            { 'Metric': '', 'Value': '', 'Analysis': '' },
            { 'Metric': 'PROPERTY TYPES', 'Value': '', 'Analysis': '' },
            ...Object.entries(this.getPropertyTypeCounts(properties)).map(([type, count]) => ({
                'Metric': `  ${this.formatPropertyType(type)}`, 'Value': count, 'Analysis': `${((count / totalProperties) * 100).toFixed(1)}% of market`
            }))
        ];
    }

    prepareDetailedPropertyData(properties) {
        return properties.map(property => {
            const daysOnMarket = Math.floor((new Date() - new Date(property.listDate)) / (1000 * 60 * 60 * 24));
            const pricePerSqft = property.squareFeet > 0 ? Math.round(property.price / property.squareFeet) : 0;
            
            return {
                'Property ID': property.id,
                'Address': property.address,
                'City': property.city,
                'State': property.state,
                'Postal Code': property.postal_code,
                'Price': property.price,
                'Price Formatted': this.formatCurrency(property.price),
                'Price per Sq Ft': `$${pricePerSqft}`,
                'Bedrooms': property.bedrooms,
                'Bathrooms': property.bathrooms,
                'Square Feet': property.squareFeet,
                'Lot Size (sq ft)': property.lotSize,
                'Property Type': this.formatPropertyType(property.propertyType),
                'Year Built': property.yearBuilt || 'Unknown',
                'Days on Market': daysOnMarket,
                'List Date': new Date(property.listDate).toLocaleDateString(),
                'Status': property.status.replace('_', ' ').toUpperCase(),
                'Agent Name': property.agent.name,
                'Agent Phone': property.agent.phone,
                'Agent Email': property.agent.email,
                'Property URL': property.url,
                'Coordinates': `${property.coordinates.lat}, ${property.coordinates.lng}`,
                'Price Reduced Amount': property.priceReducedAmount || 0,
                'Last Updated': new Date(property.lastUpdated).toLocaleString(),
                'Property Notes': this.generatePropertyNotes(property),
                'Investment Potential': this.getInvestmentPotential(property),
                'Market Position': this.getMarketPosition(property, properties)
            };
        });
    }

    generatePropertyAnalysis(properties) {
        const analysis = [];
        
        // Price analysis
        const prices = properties.map(p => p.price).filter(p => p > 0);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        const medianPrice = this.calculateMedian(prices);
        
        analysis.push({
            'Analysis Type': 'Price Analysis',
            'Metric': 'Average Price',
            'Value': this.formatCurrency(avgPrice),
            'Insight': this.getPriceInsight(avgPrice)
        });
        
        analysis.push({
            'Analysis Type': 'Price Analysis',
            'Metric': 'Median Price',
            'Value': this.formatCurrency(medianPrice),
            'Insight': 'Market center point'
        });
        
        // Days on market analysis
        const daysOnMarket = properties.map(p => {
            const listDate = new Date(p.listDate);
            const now = new Date();
            return Math.floor((now - listDate) / (1000 * 60 * 60 * 24));
        });
        const avgDaysOnMarket = daysOnMarket.reduce((a, b) => a + b, 0) / daysOnMarket.length;
        
        analysis.push({
            'Analysis Type': 'Market Speed',
            'Metric': 'Average Days on Market',
            'Value': `${Math.round(avgDaysOnMarket)} days`,
            'Insight': this.getMarketSpeedInsight(avgDaysOnMarket)
        });
        
        // Property type analysis
        const typeCounts = this.getPropertyTypeCounts(properties);
        const dominantType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
        
        analysis.push({
            'Analysis Type': 'Property Types',
            'Metric': 'Most Common Type',
            'Value': this.formatPropertyType(dominantType[0]),
            'Insight': `${dominantType[1]} properties (${((dominantType[1] / properties.length) * 100).toFixed(1)}%)`
        });
        
        return analysis;
    }

    generateAgentContacts(properties) {
        const agentMap = new Map();
        
        properties.forEach(property => {
            const agent = property.agent;
            const key = `${agent.name}-${agent.phone}`;
            
            if (!agentMap.has(key)) {
                agentMap.set(key, {
                    'Agent Name': agent.name,
                    'Phone': agent.phone,
                    'Email': agent.email,
                    'Properties Listed': 1,
                    'Average Price': property.price,
                    'Price Range': `${this.formatCurrency(property.price)} - ${this.formatCurrency(property.price)}`,
                    'Property Types': [property.propertyType]
                });
            } else {
                const existing = agentMap.get(key);
                existing['Properties Listed']++;
                existing['Average Price'] = (existing['Average Price'] + property.price) / 2;
                existing['Price Range'] = `${this.formatCurrency(Math.min(existing['Average Price'], property.price))} - ${this.formatCurrency(Math.max(existing['Average Price'], property.price))}`;
                if (!existing['Property Types'].includes(property.propertyType)) {
                    existing['Property Types'].push(property.propertyType);
                }
            }
        });
        
        return Array.from(agentMap.values()).map(agent => ({
            ...agent,
            'Property Types': agent['Property Types'].join(', '),
            'Average Price': this.formatCurrency(agent['Average Price'])
        }));
    }

    // ===== ADDITIONAL HELPER METHODS =====

    getMarketSpeed(daysOnMarket) {
        if (daysOnMarket < 30) return 'Fast-moving market';
        if (daysOnMarket < 60) return 'Normal market';
        return 'Slow market';
    }

    getInventoryLevel(count) {
        if (count > 100) return 'High inventory - buyer\'s market';
        if (count > 50) return 'Moderate inventory - balanced market';
        if (count > 20) return 'Low inventory - seller\'s market';
        return 'Very low inventory - competitive market';
    }

    getPriceLevel(price) {
        if (price < 200000) return 'Entry-level pricing';
        if (price < 400000) return 'Mid-market pricing';
        if (price < 600000) return 'Upper mid-market pricing';
        return 'Luxury market pricing';
    }

    getActivityLevel(recentListings, totalProperties) {
        const activityRate = (recentListings / totalProperties) * 100;
        if (activityRate > 20) return 'Very high activity';
        if (activityRate > 10) return 'High activity';
        if (activityRate > 5) return 'Moderate activity';
        return 'Low activity';
    }

    getPricePerSqFtRange(properties) {
        const pricePerSqFt = properties
            .filter(p => p.squareFeet > 0)
            .map(p => p.price / p.squareFeet);
        
        if (pricePerSqFt.length === 0) return 'N/A';
        
        const min = Math.min(...pricePerSqFt);
        const max = Math.max(...pricePerSqFt);
        return `$${Math.round(min)} - $${Math.round(max)}`;
    }

    getPriceInsight(avgPrice) {
        if (avgPrice < 200000) return 'Entry-level market';
        if (avgPrice < 400000) return 'Mid-market pricing';
        if (avgPrice < 600000) return 'Upper mid-market';
        return 'Luxury market segment';
    }

    getMarketSpeedInsight(avgDaysOnMarket) {
        if (avgDaysOnMarket < 30) return 'Hot market - properties selling quickly';
        if (avgDaysOnMarket < 60) return 'Normal market conditions';
        return 'Slow market - properties taking longer to sell';
    }

    generatePropertyNotes(property) {
        const notes = [];
        if (property.priceReducedAmount > 0) {
            notes.push(`Price reduced by ${this.formatCurrency(property.priceReducedAmount)}`);
        }
        if (property.yearBuilt && property.yearBuilt > 2015) {
            notes.push('New construction');
        }
        if (property.squareFeet > 2000) {
            notes.push('Large home');
        }
        return notes.join('; ') || 'Standard listing';
    }

    getInvestmentPotential(property) {
        const pricePerSqFt = property.squareFeet > 0 ? property.price / property.squareFeet : 0;
        if (pricePerSqFt < 100) return 'High potential';
        if (pricePerSqFt < 200) return 'Good potential';
        if (pricePerSqFt < 300) return 'Moderate potential';
        return 'Lower potential';
    }

    getMarketPosition(property, allProperties) {
        const prices = allProperties.map(p => p.price).sort((a, b) => a - b);
        const percentile = (prices.indexOf(property.price) / prices.length) * 100;
        
        if (percentile < 25) return 'Lower quartile';
        if (percentile < 50) return 'Below median';
        if (percentile < 75) return 'Above median';
        return 'Upper quartile';
    }

    getPremiumPropertyCount(properties) {
        const avgPrice = properties.reduce((sum, p) => sum + p.price, 0) / properties.length;
        return properties.filter(p => p.price > avgPrice * 1.5).length;
    }

    getAffordablePropertyCount(properties) {
        const avgPrice = properties.reduce((sum, p) => sum + p.price, 0) / properties.length;
        return properties.filter(p => p.price < avgPrice * 0.8).length;
    }

    getMarketHealthScore(properties) {
        const totalProperties = properties.length;
        const recentListings = properties.filter(p => {
            const listDate = new Date(p.listDate);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return listDate >= sevenDaysAgo;
        }).length;
        
        const avgDaysOnMarket = properties.reduce((sum, p) => {
            const listDate = new Date(p.listDate);
            const now = new Date();
            return sum + Math.floor((now - listDate) / (1000 * 60 * 60 * 24));
        }, 0) / totalProperties;
        
        let score = 50; // Base score
        
        // Activity bonus
        const activityRate = (recentListings / totalProperties) * 100;
        if (activityRate > 10) score += 20;
        else if (activityRate > 5) score += 10;
        
        // Speed bonus
        if (avgDaysOnMarket < 30) score += 20;
        else if (avgDaysOnMarket < 60) score += 10;
        
        // Inventory bonus
        if (totalProperties > 20) score += 10;
        
        return Math.min(100, Math.max(0, score));
    }

    getMarketTrend(properties) {
        const recentListings = properties.filter(p => {
            const listDate = new Date(p.listDate);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return listDate >= sevenDaysAgo;
        }).length;
        
        const totalProperties = properties.length;
        const activityRate = (recentListings / totalProperties) * 100;
        
        if (activityRate > 15) return 'Rising market';
        if (activityRate > 8) return 'Stable market';
        return 'Cooling market';
    }

    getCompetitiveAnalysis(properties) {
        const avgPrice = properties.reduce((sum, p) => sum + p.price, 0) / properties.length;
        const priceRange = Math.max(...properties.map(p => p.price)) - Math.min(...properties.map(p => p.price));
        const priceVariation = (priceRange / avgPrice) * 100;
        
        if (priceVariation < 50) return 'High competition - similar pricing';
        if (priceVariation < 100) return 'Moderate competition - varied pricing';
        return 'Low competition - diverse pricing';
    }

    getNeighborhoodInsights(properties) {
        const insights = [];
        
        // Price analysis
        const avgPrice = properties.reduce((sum, p) => sum + p.price, 0) / properties.length;
        if (avgPrice > 500000) insights.push('Luxury neighborhood');
        else if (avgPrice > 300000) insights.push('Upscale neighborhood');
        else insights.push('Affordable neighborhood');
        
        // Property type diversity
        const types = new Set(properties.map(p => p.propertyType));
        if (types.size > 3) insights.push('Diverse property types');
        else insights.push('Limited property variety');
        
        // Market activity
        const recentListings = properties.filter(p => {
            const listDate = new Date(p.listDate);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return listDate >= sevenDaysAgo;
        }).length;
        
        if (recentListings > 2) insights.push('Active market');
        else insights.push('Quiet market');
        
        return insights.join('; ');
    }

    getValuePropertyCount(properties) {
        const avgPrice = properties.reduce((sum, p) => sum + p.price, 0) / properties.length;
        return properties.filter(p => p.price >= avgPrice * 0.8 && p.price <= avgPrice * 1.2).length;
    }

    // ===== MARKET INTELLIGENCE REPORT METHODS =====

    getMarketShareLevel(percentage) {
        if (percentage > 50) return 'Dominant market share';
        if (percentage > 30) return 'Strong market presence';
        if (percentage > 15) return 'Moderate market share';
        return 'Limited market presence';
    }

    getPriceSegmentInsight(segment, count, total) {
        const percentage = ((count / total) * 100).toFixed(1);
        if (segment.includes('Luxury')) {
            return `Luxury segment represents ${percentage}% of market - high-end buyers`;
        } else if (segment.includes('Mid-Market')) {
            return `Mid-market represents ${percentage}% - balanced demand`;
        } else if (segment.includes('Entry-Level')) {
            return `Entry-level represents ${percentage}% - first-time buyers`;
        }
        return `${segment} represents ${percentage}% of market`;
    }

    getMarketDynamicsInsight(properties) {
        const avgDaysOnMarket = properties.reduce((sum, p) => {
            const listDate = new Date(p.listDate);
            const now = new Date();
            return sum + Math.floor((now - listDate) / (1000 * 60 * 60 * 24));
        }, 0) / properties.length;

        const recentListings = properties.filter(p => {
            const listDate = new Date(p.listDate);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return listDate >= sevenDaysAgo;
        }).length;

        const activityRate = (recentListings / properties.length) * 100;

        if (avgDaysOnMarket < 30 && activityRate > 10) {
            return 'Hot market - high activity, fast sales';
        } else if (avgDaysOnMarket < 60 && activityRate > 5) {
            return 'Active market - good activity, normal sales pace';
        } else if (avgDaysOnMarket > 90) {
            return 'Slow market - low activity, extended sales time';
        }
        return 'Balanced market - moderate activity and sales pace';
    }

    getInvestmentOpportunityInsight(properties) {
        const avgPrice = properties.reduce((sum, p) => sum + p.price, 0) / properties.length;
        const pricePerSqFt = properties
            .filter(p => p.squareFeet > 0)
            .map(p => p.price / p.squareFeet);
        
        const avgPricePerSqFt = pricePerSqFt.length > 0 ? 
            pricePerSqFt.reduce((a, b) => a + b, 0) / pricePerSqFt.length : 0;

        if (avgPricePerSqFt < 150) {
            return 'High investment potential - below market pricing';
        } else if (avgPricePerSqFt < 250) {
            return 'Good investment potential - fair market pricing';
        } else if (avgPricePerSqFt < 350) {
            return 'Moderate investment potential - premium pricing';
        }
        return 'Limited investment potential - luxury pricing';
    }

    getMarketRecommendation(properties) {
        const totalProperties = properties.length;
        const recentListings = properties.filter(p => {
            const listDate = new Date(p.listDate);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return listDate >= sevenDaysAgo;
        }).length;

        const activityRate = (recentListings / totalProperties) * 100;
        const avgPrice = properties.reduce((sum, p) => sum + p.price, 0) / totalProperties;

        if (activityRate > 15 && avgPrice < 400000) {
            return 'Strong buyer market - good opportunities for first-time buyers';
        } else if (activityRate > 10 && avgPrice < 600000) {
            return 'Balanced market - good opportunities for all buyer types';
        } else if (activityRate < 5) {
            return 'Limited inventory - consider expanding search criteria';
        }
        return 'Market conditions vary - focus on specific property types';
    }

    getCompetitionLevel(properties) {
        if (!Array.isArray(properties) || properties.length === 0) {
            return 'No competition data available';
        }
        
        const avgPrice = properties.reduce((sum, p) => sum + p.price, 0) / properties.length;
        const priceRange = Math.max(...properties.map(p => p.price)) - Math.min(...properties.map(p => p.price));
        const priceVariation = (priceRange / avgPrice) * 100;
        
        if (priceVariation < 30) return 'High competition - similar pricing';
        if (priceVariation < 60) return 'Moderate competition - varied pricing';
        return 'Low competition - diverse pricing';
    }

    getMarketSegmentInsight(segment, count, total) {
        const percentage = ((count / total) * 100).toFixed(1);
        if (segment.includes('Luxury')) {
            return `Luxury segment (${percentage}%) - high-end market with premium pricing`;
        } else if (segment.includes('Mid-Market')) {
            return `Mid-market (${percentage}%) - balanced demand and pricing`;
        } else if (segment.includes('Entry-Level')) {
            return `Entry-level (${percentage}%) - first-time buyer market`;
        }
        return `${segment} (${percentage}%) - specialized market segment`;
    }

    getMarketHealthInsight(score) {
        if (score >= 80) return 'Excellent market health - strong activity and pricing';
        if (score >= 70) return 'Good market health - stable conditions';
        if (score >= 60) return 'Fair market health - some concerns';
        return 'Poor market health - challenging conditions';
    }

    getInvestmentInsight(score) {
        if (score >= 80) return 'Excellent investment opportunity - high potential returns';
        if (score >= 70) return 'Good investment opportunity - solid potential';
        if (score >= 60) return 'Moderate investment opportunity - consider carefully';
        return 'Limited investment opportunity - high risk';
    }

    getMarketShareLevel(percentage) {
        if (percentage > 50) return 'Dominant market share';
        if (percentage > 30) return 'Strong market presence';
        if (percentage > 15) return 'Moderate market share';
        return 'Limited market presence';
    }

    getPriceRangeRecommendation(segment, avgPrice) {
        if (segment.includes('Luxury')) {
            return 'Premium pricing strategy - target high-end buyers';
        } else if (segment.includes('Mid-Market')) {
            return 'Competitive pricing - balanced market approach';
        } else if (segment.includes('Entry-Level')) {
            return 'Value pricing - attract first-time buyers';
        }
        return 'Market-based pricing strategy';
    }

    getNeighborhoodPosition(neighborhood, avgPrice) {
        if (avgPrice > 500000) {
            return 'Luxury neighborhood - premium location';
        } else if (avgPrice > 300000) {
            return 'Upscale neighborhood - desirable area';
        } else if (avgPrice > 200000) {
            return 'Mid-market neighborhood - good value';
        }
        return 'Affordable neighborhood - entry-level area';
    }

    getNeighborhoodInvestmentPotential(neighborhood, avgPrice, activity) {
        let potential = 'Moderate';
        
        if (avgPrice < 250000 && activity > 5) {
            potential = 'High - affordable with good activity';
        } else if (avgPrice < 400000 && activity > 3) {
            potential = 'Good - balanced price and activity';
        } else if (avgPrice > 600000) {
            potential = 'Limited - luxury market';
        }
        
        return potential;
    }

    getVolatilityImpact(volatility) {
        if (volatility > 0.3) return 'High volatility - significant price fluctuations';
        if (volatility > 0.15) return 'Moderate volatility - some price variation';
        return 'Low volatility - stable pricing';
    }

    getVolatilityRecommendation(volatility) {
        if (volatility > 0.3) return 'Consider waiting for market stabilization';
        if (volatility > 0.15) return 'Proceed with caution - monitor trends';
        return 'Good time to invest - stable market conditions';
    }

    getMarketSpeedImpact(speed) {
        if (speed === 'Fast') return 'Hot market - properties selling quickly';
        if (speed === 'Normal') return 'Balanced market - normal sales pace';
        return 'Slow market - properties taking longer to sell';
    }

    getMarketSpeedRecommendation(speed) {
        if (speed === 'Fast') return 'Act quickly - competitive market';
        if (speed === 'Normal') return 'Take time to evaluate options';
        return 'Negotiate - slower market favors buyers';
    }

    getInventoryImpact(inventory) {
        if (inventory > 100) return 'High inventory - buyer\'s market';
        if (inventory > 50) return 'Moderate inventory - balanced market';
        if (inventory > 20) return 'Low inventory - seller\'s market';
        return 'Very low inventory - competitive market';
    }

    getInventoryRecommendation(inventory) {
        if (inventory > 100) return 'Good time to buy - many options available';
        if (inventory > 50) return 'Balanced market - evaluate carefully';
        if (inventory > 20) return 'Limited options - act quickly if interested';
        return 'Very competitive - be prepared to move fast';
    }

    getActivityImpact(activity) {
        if (activity > 15) return 'High activity - competitive market';
        if (activity > 8) return 'Moderate activity - balanced market';
        return 'Low activity - buyer\'s market';
    }

    getActivityRecommendation(activity) {
        if (activity > 15) return 'Act quickly - high competition';
        if (activity > 8) return 'Monitor market - good opportunities';
        return 'Take your time - limited competition';
    }

    getMarketSpeed(daysOnMarket) {
        if (daysOnMarket < 30) return 'Fast';
        if (daysOnMarket < 60) return 'Normal';
        return 'Slow';
    }

    getPricePerSqFtRange(properties) {
        const pricePerSqFt = properties
            .filter(p => p.squareFeet > 0)
            .map(p => p.price / p.squareFeet);
        
        if (pricePerSqFt.length === 0) return 'N/A';
        
        const min = Math.min(...pricePerSqFt);
        const max = Math.max(...pricePerSqFt);
        return `$${Math.round(min)} - $${Math.round(max)}`;
    }

    getMarketShareLevel(percentage) {
        if (percentage > 50) return 'Dominant market share';
        if (percentage > 30) return 'Strong market presence';
        if (percentage > 15) return 'Moderate market share';
        return 'Limited market presence';
    }

    getPriceSegmentInsight(segment, count, total) {
        const percentage = ((count / total) * 100).toFixed(1);
        if (segment.includes('Luxury')) {
            return `Luxury segment represents ${percentage}% of market - high-end buyers`;
        } else if (segment.includes('Mid-Market')) {
            return `Mid-market represents ${percentage}% - balanced demand`;
        } else if (segment.includes('Entry-Level')) {
            return `Entry-level represents ${percentage}% - first-time buyers`;
        }
        return `${segment} represents ${percentage}% of market`;
    }

    getMarketDynamicsInsight(properties) {
        const avgDaysOnMarket = properties.reduce((sum, p) => {
            const listDate = new Date(p.listDate);
            const now = new Date();
            return sum + Math.floor((now - listDate) / (1000 * 60 * 60 * 24));
        }, 0) / properties.length;

        const recentListings = properties.filter(p => {
            const listDate = new Date(p.listDate);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return listDate >= sevenDaysAgo;
        }).length;

        const activityRate = (recentListings / properties.length) * 100;

        if (avgDaysOnMarket < 30 && activityRate > 10) {
            return 'Hot market - high activity, fast sales';
        } else if (avgDaysOnMarket < 60 && activityRate > 5) {
            return 'Active market - good activity, normal sales pace';
        } else if (avgDaysOnMarket > 90) {
            return 'Slow market - low activity, extended sales time';
        }
        return 'Balanced market - moderate activity and sales pace';
    }

    getInvestmentOpportunityInsight(properties) {
        const avgPrice = properties.reduce((sum, p) => sum + p.price, 0) / properties.length;
        const pricePerSqFt = properties
            .filter(p => p.squareFeet > 0)
            .map(p => p.price / p.squareFeet);
        
        const avgPricePerSqFt = pricePerSqFt.length > 0 ? 
            pricePerSqFt.reduce((a, b) => a + b, 0) / pricePerSqFt.length : 0;

        if (avgPricePerSqFt < 150) {
            return 'High investment potential - below market pricing';
        } else if (avgPricePerSqFt < 250) {
            return 'Good investment potential - fair market pricing';
        } else if (avgPricePerSqFt < 350) {
            return 'Moderate investment potential - premium pricing';
        }
        return 'Limited investment potential - luxury pricing';
    }

    getMarketRecommendation(properties) {
        const totalProperties = properties.length;
        const recentListings = properties.filter(p => {
            const listDate = new Date(p.listDate);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return listDate >= sevenDaysAgo;
        }).length;

        const activityRate = (recentListings / totalProperties) * 100;
        const avgPrice = properties.reduce((sum, p) => sum + p.price, 0) / totalProperties;

        if (activityRate > 15 && avgPrice < 400000) {
            return 'Strong buyer market - good opportunities for first-time buyers';
        } else if (activityRate > 10 && avgPrice < 600000) {
            return 'Balanced market - good opportunities for all buyer types';
        } else if (activityRate < 5) {
            return 'Limited inventory - consider expanding search criteria';
        }
        return 'Market conditions vary - focus on specific property types';
    }

    getCompetitionLevel(properties) {
        if (!Array.isArray(properties) || properties.length === 0) {
            return 'No competition data available';
        }
        
        const avgPrice = properties.reduce((sum, p) => sum + p.price, 0) / properties.length;
        const priceRange = Math.max(...properties.map(p => p.price)) - Math.min(...properties.map(p => p.price));
        const priceVariation = (priceRange / avgPrice) * 100;
        
        if (priceVariation < 30) return 'High competition - similar pricing';
        if (priceVariation < 60) return 'Moderate competition - varied pricing';
        return 'Low competition - diverse pricing';
    }

    getMarketSegmentInsight(segment, count, total) {
        const percentage = ((count / total) * 100).toFixed(1);
        if (segment.includes('Luxury')) {
            return `Luxury segment (${percentage}%) - high-end market with premium pricing`;
        } else if (segment.includes('Mid-Market')) {
            return `Mid-market (${percentage}%) - balanced demand and pricing`;
        } else if (segment.includes('Entry-Level')) {
            return `Entry-level (${percentage}%) - first-time buyer market`;
        }
        return `${segment} (${percentage}%) - specialized market segment`;
    }

    getMarketHealthInsight(score) {
        if (score >= 80) return 'Excellent market health - strong activity and pricing';
        if (score >= 70) return 'Good market health - stable conditions';
        if (score >= 60) return 'Fair market health - some concerns';
        return 'Poor market health - challenging conditions';
    }

    getInvestmentInsight(score) {
        if (score >= 80) return 'Excellent investment opportunity - high potential returns';
        if (score >= 70) return 'Good investment opportunity - solid potential';
        if (score >= 60) return 'Moderate investment opportunity - consider carefully';
        return 'Limited investment opportunity - high risk';
    }

    getPriceRangeRecommendation(segment, avgPrice) {
        if (segment.includes('Luxury')) {
            return 'Premium pricing strategy - target high-end buyers';
        } else if (segment.includes('Mid-Market')) {
            return 'Competitive pricing - balanced market approach';
        } else if (segment.includes('Entry-Level')) {
            return 'Value pricing - attract first-time buyers';
        }
        return 'Market-based pricing strategy';
    }

    getNeighborhoodPosition(neighborhood, avgPrice) {
        if (avgPrice > 500000) {
            return 'Luxury neighborhood - premium location';
        } else if (avgPrice > 300000) {
            return 'Upscale neighborhood - desirable area';
        } else if (avgPrice > 200000) {
            return 'Mid-market neighborhood - good value';
        }
        return 'Affordable neighborhood - entry-level area';
    }

    getNeighborhoodInvestmentPotential(neighborhood, avgPrice, activity) {
        let potential = 'Moderate';
        
        if (avgPrice < 250000 && activity > 5) {
            potential = 'High - affordable with good activity';
        } else if (avgPrice < 400000 && activity > 3) {
            potential = 'Good - balanced price and activity';
        } else if (avgPrice > 600000) {
            potential = 'Limited - luxury market';
        }
        
        return potential;
    }

    getVolatilityImpact(volatility) {
        if (volatility > 0.3) return 'High volatility - significant price fluctuations';
        if (volatility > 0.15) return 'Moderate volatility - some price variation';
        return 'Low volatility - stable pricing';
    }

    getVolatilityRecommendation(volatility) {
        if (volatility > 0.3) return 'Consider waiting for market stabilization';
        if (volatility > 0.15) return 'Proceed with caution - monitor trends';
        return 'Good time to invest - stable market conditions';
    }

    getMarketSpeedImpact(speed) {
        if (speed === 'Fast') return 'Hot market - properties selling quickly';
        if (speed === 'Normal') return 'Balanced market - normal sales pace';
        return 'Slow market - properties taking longer to sell';
    }

    getMarketSpeedRecommendation(speed) {
        if (speed === 'Fast') return 'Act quickly - competitive market';
        if (speed === 'Normal') return 'Take time to evaluate options';
        return 'Negotiate - slower market favors buyers';
    }

    getInventoryImpact(inventory) {
        if (inventory > 100) return 'High inventory - buyer\'s market';
        if (inventory > 50) return 'Moderate inventory - balanced market';
        if (inventory > 20) return 'Low inventory - seller\'s market';
        return 'Very low inventory - competitive market';
    }

    getInventoryRecommendation(inventory) {
        if (inventory > 100) return 'Good time to buy - many options available';
        if (inventory > 50) return 'Balanced market - evaluate carefully';
        if (inventory > 20) return 'Limited options - act quickly if interested';
        return 'Very competitive - be prepared to move fast';
    }

    getActivityImpact(activity) {
        if (activity > 15) return 'High activity - competitive market';
        if (activity > 8) return 'Moderate activity - balanced market';
        return 'Low activity - buyer\'s market';
    }

    getActivityRecommendation(activity) {
        if (activity > 15) return 'Act quickly - high competition';
        if (activity > 8) return 'Monitor market - good opportunities';
        return 'Take your time - limited competition';
    }

    getPriceAdvantage(price, avgPrice) {
        const difference = ((price - avgPrice) / avgPrice) * 100;
        if (difference < -10) return 'Significant price advantage';
        if (difference < -5) return 'Moderate price advantage';
        if (difference < 5) return 'Market price';
        if (difference < 10) return 'Premium pricing';
        return 'Significant premium';
    }

    getMarketPosition(property, allProperties) {
        const prices = allProperties.map(p => p.price).sort((a, b) => a - b);
        const percentile = (prices.indexOf(property.price) / prices.length) * 100;
        
        if (percentile < 25) return 'Lower quartile';
        if (percentile < 50) return 'Below median';
        if (percentile < 75) return 'Above median';
        return 'Upper quartile';
    }

    getInvestmentPotential(property) {
        const pricePerSqFt = property.squareFeet > 0 ? property.price / property.squareFeet : 0;
        if (pricePerSqFt < 100) return 'High potential';
        if (pricePerSqFt < 200) return 'Good potential';
        if (pricePerSqFt < 300) return 'Moderate potential';
        return 'Lower potential';
    }

    getPropertyNotes(property) {
        const notes = [];
        if (property.priceReducedAmount > 0) {
            notes.push(`Price reduced by ${this.formatCurrency(property.priceReducedAmount)}`);
        }
        if (property.yearBuilt && property.yearBuilt > 2015) {
            notes.push('New construction');
        }
        if (property.squareFeet > 2000) {
            notes.push('Large home');
        }
        return notes.join('; ') || 'Standard listing';
    }

    getPriceInsight(avgPrice) {
        if (avgPrice < 200000) return 'Entry-level market';
        if (avgPrice < 400000) return 'Mid-market pricing';
        if (avgPrice < 600000) return 'Upper mid-market';
        return 'Luxury market segment';
    }

    getMarketSpeedInsight(avgDaysOnMarket) {
        if (avgDaysOnMarket < 30) return 'Hot market - properties selling quickly';
        if (avgDaysOnMarket < 60) return 'Normal market conditions';
        return 'Slow market - properties taking longer to sell';
    }

    getNeighborhoodInsights(properties) {
        const insights = [];
        
        // Price analysis
        const avgPrice = properties.reduce((sum, p) => sum + p.price, 0) / properties.length;
        if (avgPrice > 500000) insights.push('Luxury neighborhood');
        else if (avgPrice > 300000) insights.push('Upscale neighborhood');
        else insights.push('Affordable neighborhood');
        
        // Property type diversity
        const types = new Set(properties.map(p => p.propertyType));
        if (types.size > 3) insights.push('Diverse property types');
        else insights.push('Limited property variety');
        
        // Market activity
        const recentListings = properties.filter(p => {
            const listDate = new Date(p.listDate);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return listDate >= sevenDaysAgo;
        }).length;
        
        if (recentListings > 2) insights.push('Active market');
        else insights.push('Quiet market');
        
        return insights.join('; ');
    }

    getPricingStrategy(property, avgPrice) {
        const difference = ((property.price - avgPrice) / avgPrice) * 100;
        if (difference < -10) return 'Aggressive pricing - below market';
        if (difference < -5) return 'Competitive pricing - slightly below market';
        if (difference < 5) return 'Market pricing - standard approach';
        if (difference < 10) return 'Premium pricing - above market';
        return 'Luxury pricing - significantly above market';
    }

    getMarketTrend(properties) {
        const recentListings = properties.filter(p => {
            const listDate = new Date(p.listDate);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return listDate >= thirtyDaysAgo;
        }).length;

        const totalProperties = properties.length;
        const activityRate = (recentListings / totalProperties) * 100;

        if (activityRate > 20) return 'Rising market - increasing activity';
        if (activityRate > 10) return 'Stable market - consistent activity';
        if (activityRate > 5) return 'Declining market - decreasing activity';
        return 'Stagnant market - very low activity';
    }

    getCompetitiveAnalysis(properties) {
        const avgPrice = properties.reduce((sum, p) => sum + p.price, 0) / properties.length;
        const priceRange = Math.max(...properties.map(p => p.price)) - Math.min(...properties.map(p => p.price));
        const priceVariation = (priceRange / avgPrice) * 100;

        if (priceVariation < 30) return 'High competition - similar pricing across properties';
        if (priceVariation < 60) return 'Moderate competition - varied pricing strategies';
        return 'Low competition - diverse pricing approaches';
    }

    getValuePropertyCount(properties) {
        const avgPrice = properties.reduce((sum, p) => sum + p.price, 0) / properties.length;
        return properties.filter(p => p.price < avgPrice * 0.9).length;
    }

    getPremiumPropertyCount(properties) {
        const avgPrice = properties.reduce((sum, p) => sum + p.price, 0) / properties.length;
        return properties.filter(p => p.price > avgPrice * 1.1).length;
    }

    getAffordablePropertyCount(properties) {
        return properties.filter(p => p.price < 300000).length;
    }

    getMarketHealthScore(properties) {
        let score = 50; // Base score
        
        // Activity factor
        const recentListings = properties.filter(p => {
            const listDate = new Date(p.listDate);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return listDate >= sevenDaysAgo;
        }).length;
        
        const activityRate = (recentListings / properties.length) * 100;
        if (activityRate > 15) score += 20;
        else if (activityRate > 8) score += 10;
        else if (activityRate < 3) score -= 15;
        
        // Price stability factor
        const prices = properties.map(p => p.price);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        const priceVariation = (Math.max(...prices) - Math.min(...prices)) / avgPrice;
        
        if (priceVariation < 0.5) score += 15; // Stable pricing
        else if (priceVariation > 1.5) score -= 10; // Volatile pricing
        
        // Inventory factor
        if (properties.length > 20) score += 10; // Good inventory
        else if (properties.length < 5) score -= 10; // Low inventory
        
        return Math.max(0, Math.min(100, score));
    }

    getVelocityStrategy(avgDaysOnMarket) {
        if (avgDaysOnMarket < 30) return 'Fast market - price competitively and act quickly';
        if (avgDaysOnMarket < 60) return 'Normal market - standard pricing and marketing approach';
        return 'Slow market - consider price reductions and enhanced marketing';
    }

    getTypeStrategy(propertyType) {
        if (propertyType === 'single_family') return 'Single-family focus - target families and long-term buyers';
        if (propertyType === 'condo' || propertyType === 'townhouse') return 'Condo/Townhouse focus - target first-time buyers and downsizers';
        if (propertyType === 'multi_family') return 'Multi-family focus - target investors and income property buyers';
        return 'Mixed property strategy - diverse buyer targeting';
    }
}

module.exports = new ExcelService();
