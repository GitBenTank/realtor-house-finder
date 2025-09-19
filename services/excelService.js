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
}

module.exports = new ExcelService();
