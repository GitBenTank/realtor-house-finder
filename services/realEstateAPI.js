const axios = require('axios');

class RealEstateAPI {
    constructor() {
        this.apiKey = process.env.RAPIDAPI_KEY;
        this.host = process.env.RAPIDAPI_HOST || 'realtor-data1.p.rapidapi.com';
        this.baseURL = 'https://realtor-data1.p.rapidapi.com';
        
        console.log('RealEstateAPI Constructor Debug:', {
            apiKey: this.apiKey ? 'present' : 'missing',
            host: this.host,
            baseURL: this.baseURL,
            envRapidAPIKey: process.env.RAPIDAPI_KEY ? 'present' : 'missing',
            envRapidAPIHost: process.env.RAPIDAPI_HOST ? 'present' : 'missing'
        });
        
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

            console.log('API Service Debug:', {
                apiKey: this.apiKey ? 'present' : 'missing',
                host: this.host,
                location: params.location
            });

            // If API key is mock or quota is likely exceeded, use mock data
            if (this.apiKey === 'mock') {
                console.log('Using mock data (no API key)');
                return this.getMockProperties(params.location, params.limit);
            }

            // Use the property_list endpoint for realtor-data1 API
            const payload = {
                query: {
                    status: ["for_sale"],
                    postal_code: this.extractPostalCode(location) || "10001" // Default to NYC if no postal code
                },
                limit: Math.min(limit, 100),
                offset: offset,
                sort: {
                    direction: "desc",
                    field: "list_date"
                }
            };

            // Add optional parameters if provided
            if (minPrice > 0) payload.query.price_min = minPrice;
            if (maxPrice < 10000000) payload.query.price_max = maxPrice;
            if (bedrooms > 0) payload.query.beds_min = bedrooms;
            if (bathrooms > 0) payload.query.baths_min = bathrooms;

            const response = await axios.post(`${this.baseURL}/property_list/`, payload, {
                headers: {
                    'X-RapidAPI-Key': this.apiKey,
                    'X-RapidAPI-Host': this.host,
                    'Content-Type': 'application/json'
                }
            });

            return this.formatProperties(response.data.data?.home_search?.properties || []);
        } catch (error) {
            console.error('Real Estate API Error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            });
            
            // Check if it's a quota exceeded error
            if (error.message.includes('quota') || error.message.includes('exceeded') || 
                (error.response?.data && error.response.data.message && 
                 error.response.data.message.includes('quota'))) {
                console.log('API quota exceeded, using mock data for demonstration');
            } else {
                console.log('API failed, using mock data for demonstration');
            }
            
            return this.getMockProperties(params.location, params.limit);
        }
    }

    formatProperties(properties) {
        return properties.map(property => ({
            id: property.property_id || property.listing_id || property.id,
            address: this.formatAddress(property),
            price: this.formatPrice(property.list_price || property.price),
            bedrooms: property.description?.beds || property.beds || 0,
            bathrooms: this.parseBathrooms(property.description?.baths_consolidated || property.baths),
            squareFeet: property.description?.sqft || property.sqft || 0,
            lotSize: property.description?.lot_sqft || property.lot_sqft || 0,
            propertyType: property.description?.type || property.property_type || 'Unknown',
            status: property.status || 'For Sale',
            listDate: property.list_date || new Date().toISOString(),
            description: property.description?.name || property.name || '',
            yearBuilt: property.year_built || 'Unknown',
            garage: property.garage || 0,
            pool: property.pool || false,
            images: property.photos?.map(photo => photo.href) || property.images || [],
            agent: {
                name: property.branding?.[0]?.name || property.advertisers?.[0]?.name || 'Unknown',
                phone: property.agent?.phone || '',
                email: property.agent?.email || ''
            },
            coordinates: {
                lat: property.location?.address?.coordinate?.lat || property.lat || 0,
                lng: property.location?.address?.coordinate?.lon || property.lng || 0
            },
            url: `https://www.realtor.com/realestateandhomes-detail/${property.permalink || property.id}`,
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
        // Ensure location is a string and has a default value
        const locationStr = location || 'Nashville, TN';
        const city = locationStr.split(',')[0]?.trim() || 'Nashville';
        const state = locationStr.split(',')[1]?.trim() || 'TN';
        
        const mockProperties = [
            {
                property_id: 'mock-1',
                listing_id: 'mock-1',
                location: {
                    address: {
                        line: `123 Main St`,
                        city: city,
                        state_code: state,
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
                        city: city,
                        state_code: state,
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
                        city: city,
                        state_code: state,
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

    extractPostalCode(location) {
        // Try to extract postal code from location string
        const postalMatch = location.match(/\b\d{5}(-\d{4})?\b/);
        return postalMatch ? postalMatch[0] : null;
    }
}

module.exports = new RealEstateAPI();
