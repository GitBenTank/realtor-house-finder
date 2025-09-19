const axios = require('axios');

class RealEstateAPI {
    constructor() {
        this.apiKey = process.env.RAPIDAPI_KEY;
        this.host = process.env.RAPIDAPI_HOST || 'realtor16.p.rapidapi.com';
        this.baseURL = 'https://realtor16.p.rapidapi.com';
        
        if (!this.apiKey) {
            throw new Error('RAPIDAPI_KEY is required. Please set it in your .env file');
        }
    }

    async searchProperties(params) {
        try {
            const {
                location,
                propertyType = 'house',
                minPrice = 0,
                maxPrice = 10000000,
                bedrooms = 0,
                bathrooms = 0,
                limit = 50,
                offset = 0
            } = params;

            // Use the search/forsale endpoint for realtor16 API
            const queryParams = new URLSearchParams({
                location: location,
                limit: Math.min(limit, 200).toString(),
                offset: offset.toString(),
                sort: 'relevance'
            });

            // Add optional parameters if provided
            if (minPrice > 0) queryParams.append('price_min', minPrice.toString());
            if (maxPrice < 10000000) queryParams.append('price_max', maxPrice.toString());
            if (bedrooms > 0) queryParams.append('beds_min', bedrooms.toString());
            if (bathrooms > 0) queryParams.append('baths_min', bathrooms.toString());

            const response = await axios.get(`${this.baseURL}/search/forsale?${queryParams}`, {
                headers: {
                    'X-RapidAPI-Key': this.apiKey,
                    'X-RapidAPI-Host': this.host
                }
            });

            return this.formatProperties(response.data.properties || []);
        } catch (error) {
            console.error('Real Estate API Error:', error.response?.data || error.message);
            throw new Error(`Failed to fetch properties: ${error.response?.data?.message || error.message}`);
        }
    }

    formatProperties(properties) {
        return properties.map(property => ({
            id: property.property_id || property.listing_id,
            address: this.formatAddress(property),
            price: this.formatPrice(property.list_price),
            bedrooms: property.description?.beds || 0,
            bathrooms: this.parseBathrooms(property.description?.baths_consolidated),
            squareFeet: property.description?.sqft || 0,
            lotSize: property.description?.lot_sqft || 0,
            propertyType: property.description?.type || 'Unknown',
            status: property.status || 'For Sale',
            listDate: property.list_date || new Date().toISOString(),
            description: property.description?.name || '',
            yearBuilt: property.description?.year_built || 'Unknown',
            garage: 0, // Not available in this API
            pool: false, // Not available in this API
            images: property.photos || [],
            agent: {
                name: property.branding?.[0]?.name || 'Unknown',
                phone: '',
                email: ''
            },
            coordinates: {
                lat: property.location?.address?.coordinate?.lat || 0,
                lng: property.location?.address?.coordinate?.lon || 0
            },
            url: `https://www.realtor.com/realestateandhomes-detail/${property.permalink}`,
            lastUpdated: new Date().toISOString()
        }));
    }

    formatAddress(property) {
        const address = property.location?.address;
        if (!address) return 'Address not available';
        
        const parts = [];
        if (address.line) parts.push(address.line);
        if (address.city) parts.push(address.city);
        if (address.state_code) parts.push(address.state_code);
        if (address.postal_code) parts.push(address.postal_code);
        return parts.join(', ') || 'Address not available';
    }

    parseBathrooms(bathsConsolidated) {
        if (!bathsConsolidated) return 0;
        // Extract number from string like "4" or "2.5"
        const match = bathsConsolidated.toString().match(/(\d+(?:\.\d+)?)/);
        return match ? parseFloat(match[1]) : 0;
    }

    formatPrice(price) {
        if (!price) return 0;
        return typeof price === 'number' ? price : parseInt(price.toString().replace(/\D/g, ''));
    }

    extractPostalCode(location) {
        const match = location.match(/\b\d{5}(-\d{4})?\b/);
        return match ? match[0] : null;
    }

    extractCity(location) {
        // Simple city extraction - in a real app, you'd use a geocoding service
        const parts = location.split(',');
        return parts[0]?.trim() || location;
    }

    extractState(location) {
        const parts = location.split(',');
        if (parts.length > 1) {
            return parts[1]?.trim().substring(0, 2).toUpperCase() || null;
        }
        return null;
    }

    async getPropertyDetails(propertyId) {
        try {
            const response = await axios.get(`${this.baseURL}/property/${propertyId}`, {
                headers: {
                    'X-RapidAPI-Key': this.apiKey,
                    'X-RapidAPI-Host': this.host
                }
            });

            return this.formatProperties([response.data])[0];
        } catch (error) {
            console.error('Property details error:', error.response?.data || error.message);
            throw new Error(`Failed to fetch property details: ${error.response?.data?.message || error.message}`);
        }
    }

    async getMarketStats(location) {
        try {
            const response = await axios.get(`${this.baseURL}/market_stats`, {
                params: {
                    postal_code: this.extractPostalCode(location),
                    city: this.extractCity(location),
                    state: this.extractState(location)
                },
                headers: {
                    'X-RapidAPI-Key': this.apiKey,
                    'X-RapidAPI-Host': this.host
                }
            });

            return response.data;
        } catch (error) {
            console.error('Market stats error:', error.response?.data || error.message);
            throw new Error(`Failed to fetch market stats: ${error.response?.data?.message || error.message}`);
        }
    }
}

module.exports = new RealEstateAPI();
