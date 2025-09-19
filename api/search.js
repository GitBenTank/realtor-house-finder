const realEstateAPI = require('../services/realEstateAPI');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'GET') {
            const { location, propertyType, minPrice, maxPrice, bedrooms, bathrooms, limit = 50 } = req.query;
            
            const searchParams = {
                location,
                propertyType: propertyType || 'house',
                minPrice: minPrice || 0,
                maxPrice: maxPrice || 10000000,
                bedrooms: bedrooms || 0,
                bathrooms: bathrooms || 0,
                limit: Math.min(limit, 100)
            };

            const properties = await realEstateAPI.searchProperties(searchParams);
            res.json({ success: true, data: properties, count: properties.length });
        } else if (req.method === 'POST') {
            const { location, propertyType, minPrice, maxPrice, bedrooms, bathrooms, limit = 50 } = req.body;
            
            const searchParams = {
                location,
                propertyType: propertyType || 'house',
                minPrice: minPrice || 0,
                maxPrice: maxPrice || 10000000,
                bedrooms: bedrooms || 0,
                bathrooms: bathrooms || 0,
                limit: Math.min(limit, 100)
            };

            const properties = await realEstateAPI.searchProperties(searchParams);
            res.json({ success: true, data: properties, count: properties.length });
        } else {
            res.status(405).json({ success: false, error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
