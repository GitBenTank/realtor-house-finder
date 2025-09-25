const axios = require('axios');

async function getRealProperties() {
    try {
        console.log('🔍 Fetching real properties for testing...');
        const response = await axios.post('http://localhost:3000/api/search', {
            location: 'Nashville, TN',
            limit: 5
        });
        
        if (response.data.success) {
            console.log(`✅ Found ${response.data.data.length} real properties`);
            return response.data.data;
        } else {
            throw new Error('Failed to fetch properties');
        }
    } catch (error) {
        console.error('❌ Error fetching properties:', error.message);
        return null;
    }
}

async function testReport(endpoint, reportName, properties) {
    try {
        console.log(`\n🧪 Testing ${reportName}...`);
        
        const response = await axios.post(`http://localhost:3000${endpoint}`, {
            properties: properties,
            location: 'Nashville, TN'
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
            if (error.response.data && typeof error.response.data === 'string') {
                console.log(`   Data: ${error.response.data.substring(0, 200)}...`);
            } else {
                console.log(`   Data: ${JSON.stringify(error.response.data)}`);
            }
        }
        return false;
    }
}

async function runTests() {
    console.log('🚀 Starting Real Data Report Tests...');
    
    // Get real properties first
    const properties = await getRealProperties();
    if (!properties || properties.length === 0) {
        console.log('❌ No properties found. Cannot test reports.');
        return;
    }
    
    console.log(`📍 Test Location: Nashville, TN`);
    console.log(`🏠 Test Properties: ${properties.length}`);
    
    const tests = [
        { endpoint: '/api/reports/property-listings', name: 'Property Listings Report' },
        { endpoint: '/api/reports/market-intelligence', name: 'Market Intelligence Report' },
        { endpoint: '/api/reports/investment-analysis', name: 'Investment Analysis Report' }
    ];
    
    const results = [];
    
    for (const test of tests) {
        const success = await testReport(test.endpoint, test.name, properties);
        results.push({ name: test.name, success });
        
        // Wait a moment between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
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
