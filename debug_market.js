const excelService = require('./services/excelService');

// Simple test data
const testProperties = [
    {
        id: 'test-1',
        address: '123 Test Street',
        city: 'Nashville',
        state: 'TN',
        postal_code: '37201',
        price: 350000,
        bedrooms: 3,
        bathrooms: 2,
        squareFeet: 1500,
        lotSize: 8000,
        propertyType: 'single_family',
        yearBuilt: 2010,
        status: 'for_sale',
        listDate: new Date().toISOString(),
        agent: {
            name: 'Test Agent',
            phone: '555-1234',
            email: 'test@agent.com'
        },
        url: 'https://example.com',
        coordinates: { lat: 36.1627, lng: -86.7816 },
        priceReducedAmount: 0,
        lastUpdated: new Date().toISOString()
    }
];

async function testMarketReport() {
    try {
        console.log('Testing Market Intelligence Report...');
        const result = await excelService.createMarketIntelligenceReport(testProperties, 'Nashville, TN');
        console.log('✅ Success! Report size:', result.length, 'bytes');
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

testMarketReport();
