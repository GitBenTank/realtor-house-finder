const axios = require('axios');

class RealEstateAPI {
    constructor() {
        this.apiKey = process.env.RAPIDAPI_KEY;
        this.host = process.env.RAPIDAPI_HOST || 'realtor16.p.rapidapi.com';
        this.baseURL = 'https://realtor16.p.rapidapi.com';
        
        if (!this.apiKey) {
            console.warn('RAPIDAPI_KEY not found, will use mock data');
            this.apiKey = 'mock';
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

            // If API key is mock or quota is likely exceeded, use mock data
            if (this.apiKey === 'mock') {
                console.log('Using mock data (no API key)');
                return this.getMockProperties(location, limit);
            }

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
            
            // Check if it's a quota exceeded error
            if (error.message.includes('quota') || error.message.includes('exceeded') || 
                (error.response?.data && error.response.data.message && 
                 error.response.data.message.includes('quota'))) {
                console.log('API quota exceeded, using mock data for demonstration');
            } else {
                console.log('API failed, using mock data for demonstration');
            }
            
            return this.getMockProperties(location, limit);
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

    getMockProperties(location, limit = 5) {
        const mockProperties = [
            {
                property_id: 'mock-1',
                listing_id: 'mock-1',
                location: {
                    address: {
                        line: `123 Main St`,
                        city: location.split(',')[0]?.trim() || 'Nashville',
                        state_code: location.split(',')[1]?.trim() || 'TN',
                        postal_code: '37201',
                        coordinate: { lat: 36.1627, lon: -86.7816 }
                    }
                },
                list_price: 350000,
                description: {
                    beds: 3,
                    baths_consolidated: '2',
                    sqft: 1500,
                    lot_sqft: 8000,
                    type: 'single_family',
                    year_built: 2010,
                    name: 'Beautiful family home in great location'
                },
                status: 'for_sale',
                list_date: new Date().toISOString(),
                photos: ['https://via.placeholder.com/400x300?text=Property+1'],
                branding: [{ name: 'Mock Realty', type: 'Office' }],
                permalink: 'mock-property-1'
            },
            {
                property_id: 'mock-2',
                listing_id: 'mock-2',
                location: {
                    address: {
                        line: `456 Oak Ave`,
                        city: location.split(',')[0]?.trim() || 'Nashville',
                        state_code: location.split(',')[1]?.trim() || 'TN',
                        postal_code: '37202',
                        coordinate: { lat: 36.1527, lon: -86.7916 }
                    }
                },
                list_price: 275000,
                description: {
                    beds: 2,
                    baths_consolidated: '1.5',
                    sqft: 1200,
                    lot_sqft: 6000,
                    type: 'single_family',
                    year_built: 2005,
                    name: 'Charming starter home with updated kitchen'
                },
                status: 'for_sale',
                list_date: new Date().toISOString(),
                photos: ['https://via.placeholder.com/400x300?text=Property+2'],
                branding: [{ name: 'Mock Realty', type: 'Office' }],
                permalink: 'mock-property-2'
            },
            {
                property_id: 'mock-3',
                listing_id: 'mock-3',
                location: {
                    address: {
                        line: `789 Pine St`,
                        city: location.split(',')[0]?.trim() || 'Nashville',
                        state_code: location.split(',')[1]?.trim() || 'TN',
                        postal_code: '37203',
                        coordinate: { lat: 36.1727, lon: -86.7716 }
                    }
                },
                list_price: 450000,
                description: {
                    beds: 4,
                    baths_consolidated: '3',
                    sqft: 2200,
                    lot_sqft: 10000,
                    type: 'single_family',
                    year_built: 2015,
                    name: 'Luxury home with modern amenities'
                },
                status: 'for_sale',
                list_date: new Date().toISOString(),
                photos: ['https://via.placeholder.com/400x300?text=Property+3'],
                branding: [{ name: 'Mock Realty', type: 'Office' }],
                permalink: 'mock-property-3'
            }
        ];

        return this.formatProperties(mockProperties.slice(0, limit));
    }
}

module.exports = new RealEstateAPI();
