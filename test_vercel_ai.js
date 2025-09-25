const axios = require('axios');

// Test if AI reports work on Vercel
async function testVercelAIReports() {
    console.log('🚀 Testing AI Reports on Vercel...\n');
    
    // Replace with your actual Vercel URL
    const vercelURL = 'https://realtor-house-finder.vercel.app'; // Update this with your actual Vercel URL
    
    const mockProperties = [
        {
            list_price: 450000,
            list_date: '2025-09-20T10:00:00.000Z',
            location: {
                address: {
                    line: '123 Main Street',
                    city: 'Nashville',
                    state: 'TN'
                }
            },
            description: {
                beds: 3,
                baths: 2,
                sqft: 1800,
                type: 'single_family'
            },
            flags: {
                is_new_construction: false,
                is_price_reduced: false
            },
            price_reduced_amount: 0
        }
    ];
    
    const testData = {
        properties: mockProperties,
        location: 'Nashville, TN'
    };
    
    try {
        console.log('📊 Testing AI Property Analysis Report on Vercel...');
        const propertyResponse = await axios.post(`${vercelURL}/api/reports/property-listings`, testData, {
            responseType: 'arraybuffer',
            timeout: 30000 // 30 second timeout
        });
        console.log(`✅ AI Property Analysis Report: ${propertyResponse.data.length} bytes`);
        
        console.log('📊 Testing AI Market Intelligence Report on Vercel...');
        const marketResponse = await axios.post(`${vercelURL}/api/reports/market-intelligence`, testData, {
            responseType: 'arraybuffer',
            timeout: 30000
        });
        console.log(`✅ AI Market Intelligence Report: ${marketResponse.data.length} bytes`);
        
        console.log('📊 Testing AI Investment Analysis Report on Vercel...');
        const investmentResponse = await axios.post(`${vercelURL}/api/reports/investment-analysis`, testData, {
            responseType: 'arraybuffer',
            timeout: 30000
        });
        console.log(`✅ AI Investment Analysis Report: ${investmentResponse.data.length} bytes`);
        
        console.log('\n🎉 All AI reports working on Vercel!');
        
    } catch (error) {
        console.error('❌ Error testing Vercel AI reports:');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data: ${error.response.data}`);
        } else if (error.request) {
            console.error('No response received. Check if Vercel URL is correct.');
            console.error('Make sure to update the vercelURL variable with your actual Vercel deployment URL.');
        } else {
            console.error('Error:', error.message);
        }
    }
}

testVercelAIReports();
