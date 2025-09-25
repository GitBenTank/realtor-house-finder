const axios = require('axios');

// Test data - mock properties for testing
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
    },
    {
        id: 'test-2',
        address: '456 Sample Avenue',
        city: 'Nashville',
        state: 'TN',
        postal_code: '37202',
        price: 275000,
        bedrooms: 2,
        bathrooms: 1.5,
        squareFeet: 1200,
        lotSize: 6000,
        propertyType: 'condo',
        yearBuilt: 2005,
        status: 'for_sale',
        listDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        agent: {
            name: 'Sample Agent',
            phone: '555-5678',
            email: 'sample@agent.com'
        },
        url: 'https://example.com',
        coordinates: { lat: 36.1527, lng: -86.7916 },
        priceReducedAmount: 5000,
        lastUpdated: new Date().toISOString()
    }
];

const testLocation = 'Nashville, TN';

async function testReport(endpoint, reportName) {
    try {
        console.log(`\n🧪 Testing ${reportName}...`);
        
        const response = await axios.post(`http://localhost:3000${endpoint}`, {
            properties: testProperties,
            location: testLocation
        }, {
            responseType: 'arraybuffer',
            timeout: 30000
        });
        
        if (response.status === 200) {
            console.log(`✅ ${reportName} - SUCCESS`);
            console.log(`   📊 Response size: ${response.data.length} bytes`);
            console.log(`   📋 Content-Type: ${response.headers['content-type']}`);
            console.log(`   📁 Filename: ${response.headers['content-disposition']?.split('filename=')[1]?.replace(/"/g, '') || 'N/A'}`);
            return true;
        } else {
            console.log(`❌ ${reportName} - FAILED (Status: ${response.status})`);
            return false;
        }
    } catch (error) {
        console.log(`❌ ${reportName} - ERROR: ${error.message}`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Data: ${error.response.data}`);
        }
        return false;
    }
}

async function runTests() {
    console.log('🚀 Starting Report Tests...');
    console.log(`📍 Test Location: ${testLocation}`);
    console.log(`🏠 Test Properties: ${testProperties.length}`);
    
    const tests = [
        { endpoint: '/api/reports/property-listings', name: 'Property Listings Report' },
        { endpoint: '/api/reports/market-intelligence', name: 'Market Intelligence Report' },
        { endpoint: '/api/reports/investment-analysis', name: 'Investment Analysis Report' }
    ];
    
    const results = [];
    
    for (const test of tests) {
        const success = await testReport(test.endpoint, test.name);
        results.push({ name: test.name, success });
        
        // Wait a moment between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    results.forEach(result => {
        const status = result.success ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} - ${result.name}`);
    });
    
    const passed = results.filter(r => r.success).length;
    const total = results.length;
    
    console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
    
    if (passed === total) {
        console.log('🎉 All reports are working correctly!');
    } else {
        console.log('⚠️  Some reports need attention.');
    }
}

// Run the tests
runTests().catch(console.error);
