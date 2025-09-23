const axios = require('axios');

class RealEstateAPI {
    constructor() {
        this.apiKey = process.env.RAPIDAPI_KEY;
        this.host = process.env.RAPIDAPI_HOST || 'realtor-data1.p.rapidapi.com';
        this.baseURL = 'https://realtor-data1.p.rapidapi.com';
        
        // RentCast API configuration (alternative)
        this.rentcastApiKey = process.env.RENTCAST_API_KEY;
        this.rentcastBaseURL = 'https://api.rentcast.io/v1';
        
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
        
        // Simple in-memory cache to reduce API calls
        this.cache = new Map();
        this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
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

            // Check cache first
            const cacheKey = this.generateCacheKey(params);
            const cachedResult = this.getCachedResult(cacheKey);
            if (cachedResult) {
                console.log('Using cached result for:', cacheKey);
                return cachedResult;
            }

            // If API key is mock or quota is likely exceeded, use mock data
            if (this.apiKey === 'mock') {
                console.log('Using mock data (no API key)');
                return this.getMockProperties(params.location, params.limit);
            }

            // Use the property_list endpoint for realtor-data1 API
            const searchQuery = this.parseLocation(location);
            if (!searchQuery) {
                console.log('Could not parse location, using mock data');
                return this.getMockProperties(params.location, params.limit);
            }
            
            const payload = {
                location: location, // realtor-data1 API expects location as string
                limit: Math.min(limit, 50), // realtor-data1 API limit
                offset: offset
            };

            const response = await axios.post(`${this.baseURL}/property_list/`, payload, {
                headers: {
                    'X-RapidAPI-Key': this.apiKey,
                    'X-RapidAPI-Host': this.host,
                    'Content-Type': 'application/json'
                }
            });

            const properties = this.formatProperties(response.data?.data?.home_search?.results || response.data?.data?.home_search?.properties || response.data?.properties || []);
            
            // Apply client-side filtering since the API doesn't support these filters
            const filteredProperties = this.applyFilters(properties, { minPrice, maxPrice, bedrooms, bathrooms, propertyType, dateRange: params.dateRange });
            
            // Cache the result
            this.setCachedResult(cacheKey, filteredProperties);
            
            return filteredProperties;
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
                console.log('Primary API quota exceeded, trying RentCast API...');
                
                // Try RentCast API as fallback
                if (this.rentcastApiKey) {
                    try {
                        const rentcastData = await this.searchWithRentCast(params);
                        if (rentcastData && rentcastData.length > 0) {
                            console.log('RentCast API successful, using real data');
                            this.setCachedResult(cacheKey, rentcastData);
                            return rentcastData;
                        }
                    } catch (rentcastError) {
                        console.log('RentCast API also failed:', rentcastError.message);
                    }
                }
                
                console.log('All APIs failed, using mock data for demonstration');
                // Cache mock data to avoid repeated API calls
                const mockData = this.getMockProperties(params.location, params.limit);
                this.setCachedResult(cacheKey, mockData);
                return mockData;
            } else {
                console.log('API failed, throwing error instead of using mock data');
                throw error; // Re-throw the error instead of returning mock data
            }
        }
    }

    formatProperties(properties) {
        return properties.map(property => ({
            property_id: property.property_id || property.id,
            listing_id: property.listing_id || property.id,
            location: {
                address: {
                    line: property.location?.address?.line || property.address || 'Address not available',
                    city: property.location?.address?.city || property.address?.split(',')[1]?.trim() || 'Unknown',
                    state_code: property.location?.address?.state_code || property.address?.split(',')[2]?.trim() || 'Unknown',
                    postal_code: property.location?.address?.postal_code || property.address?.split(',')[3]?.trim() || '00000',
                    coordinate: {
                        lat: property.location?.address?.coordinate?.lat || property.coordinates?.lat || 0,
                        lon: property.location?.address?.coordinate?.lon || property.coordinates?.lng || 0
                    }
                }
            },
            list_price: property.list_price || property.price || 0,
            description: {
                beds: property.description?.beds || property.bedrooms || 0,
                baths_consolidated: property.description?.baths_consolidated || property.bathrooms?.toString() || '0',
                sqft: property.description?.sqft || property.squareFeet || 0,
                lot_sqft: property.description?.lot_sqft || property.lotSize || 0,
                type: property.description?.type || property.propertyType || 'single_family',
                year_built: property.description?.year_built || property.yearBuilt || 0,
                name: property.description?.name || property.description || 'Property description not available'
            },
            status: property.status || 'for_sale',
            list_date: property.list_date || property.listDate || new Date().toISOString(),
            photos: property.photos || property.images || ['https://via.placeholder.com/400x300?text=Property'],
            branding: property.branding || [{ name: property.agent?.name || 'Unknown', type: 'Office' }],
            permalink: property.permalink || property.url || '#'
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

    parseLocation(location) {
        if (!location) return null;
        
        // Check if it's a zip code (5 digits)
        const zipMatch = location.match(/\b\d{5}(-\d{4})?\b/);
        if (zipMatch) {
            return { postal_code: zipMatch[0] };
        }
        
        // Check if it's in "City, State" format
        const cityStateMatch = location.match(/^([^,]+),\s*([A-Z]{2})$/i);
        if (cityStateMatch) {
            const city = cityStateMatch[1].trim();
            const state = cityStateMatch[2].trim().toUpperCase();
            return { city: city, state_code: state };
        }
        
        // Check if it's just a city name (try to extract state from common patterns)
        const cityOnlyMatch = location.match(/^([^,]+)$/);
        if (cityOnlyMatch) {
            const city = cityOnlyMatch[1].trim();
            
            // Try to extract state from common city names
            const stateMap = {
                'nashville': 'TN',
                'memphis': 'TN',
                'knoxville': 'TN',
                'chattanooga': 'TN',
                'new york': 'NY',
                'los angeles': 'CA',
                'chicago': 'IL',
                'houston': 'TX',
                'phoenix': 'AZ',
                'philadelphia': 'PA',
                'san antonio': 'TX',
                'san diego': 'CA',
                'dallas': 'TX',
                'san jose': 'CA',
                'austin': 'TX',
                'jacksonville': 'FL',
                'fort worth': 'TX',
                'columbus': 'OH',
                'charlotte': 'NC',
                'san francisco': 'CA',
                'indianapolis': 'IN',
                'seattle': 'WA',
                'denver': 'CO',
                'washington': 'DC',
                'boston': 'MA',
                'el paso': 'TX',
                'nashville': 'TN',
                'detroit': 'MI',
                'nashville': 'TN',
                'portland': 'OR',
                'las vegas': 'NV',
                'milwaukee': 'WI',
                'albuquerque': 'NM',
                'tucson': 'AZ',
                'fresno': 'CA',
                'sacramento': 'CA',
                'mesa': 'AZ',
                'kansas city': 'MO',
                'atlanta': 'GA',
                'long beach': 'CA',
                'colorado springs': 'CO',
                'raleigh': 'NC',
                'miami': 'FL',
                'virginia beach': 'VA',
                'omaha': 'NE',
                'oakland': 'CA',
                'minneapolis': 'MN',
                'tulsa': 'OK',
                'arlington': 'TX',
                'tampa': 'FL',
                'new orleans': 'LA',
                'wichita': 'KS',
                'bakersfield': 'CA',
                'cleveland': 'OH',
                'aurora': 'CO',
                'anaheim': 'CA',
                'honolulu': 'HI',
                'santa ana': 'CA',
                'corpus christi': 'TX',
                'riverside': 'CA',
                'lexington': 'KY',
                'stockton': 'CA',
                'toledo': 'OH',
                'st. paul': 'MN',
                'newark': 'NJ',
                'greensboro': 'NC',
                'plano': 'TX',
                'henderson': 'NV',
                'lincoln': 'NE',
                'buffalo': 'NY',
                'jersey city': 'NJ',
                'chula vista': 'CA',
                'fort wayne': 'IN',
                'orlando': 'FL',
                'st. petersburg': 'FL',
                'chandler': 'AZ',
                'laredo': 'TX',
                'norfolk': 'VA',
                'durham': 'NC',
                'madison': 'WI',
                'lubbock': 'TX',
                'irvine': 'CA',
                'winston salem': 'NC',
                'glendale': 'AZ',
                'garland': 'TX',
                'hialeah': 'FL',
                'reno': 'NV',
                'chesapeake': 'VA',
                'gilbert': 'AZ',
                'baton rouge': 'LA',
                'irving': 'TX',
                'scottsdale': 'AZ',
                'north las vegas': 'NV',
                'fremont': 'CA',
                'boise': 'ID',
                'richmond': 'VA',
                'san bernardino': 'CA',
                'birmingham': 'AL',
                'spokane': 'WA',
                'rochester': 'NY',
                'des moines': 'IA',
                'modesto': 'CA',
                'fayetteville': 'NC',
                'tacoma': 'WA',
                'oxnard': 'CA',
                'fontana': 'CA',
                'columbus': 'GA',
                'montgomery': 'AL',
                'moreno valley': 'CA',
                'shreveport': 'LA',
                'aurora': 'IL',
                'yonkers': 'NY',
                'akron': 'OH',
                'huntington beach': 'CA',
                'glendale': 'CA',
                'grand rapids': 'MI',
                'salt lake city': 'UT',
                'tallahassee': 'FL',
                'huntsville': 'AL',
                'grand prairie': 'TX',
                'knoxville': 'TN',
                'worcester': 'MA',
                'newport news': 'VA',
                'brownsville': 'TX',
                'overland park': 'KS',
                'santa clarita': 'CA',
                'providence': 'RI',
                'garden grove': 'CA',
                'chattanooga': 'TN',
                'oceanside': 'CA',
                'jackson': 'MS',
                'fort lauderdale': 'FL',
                'santa rosa': 'CA',
                'rancho cucamonga': 'CA',
                'port st. lucie': 'FL',
                'tempe': 'AZ',
                'ontario': 'CA',
                'vancouver': 'WA',
                'sioux falls': 'SD',
                'springfield': 'MO',
                'peoria': 'IL',
                'pembroke pines': 'FL',
                'elk grove': 'CA',
                'rockford': 'IL',
                'palmdale': 'CA',
                'corona': 'CA',
                'salinas': 'CA',
                'pomona': 'CA',
                'pasadena': 'TX',
                'joliet': 'IL',
                'paterson': 'NJ',
                'torrance': 'CA',
                'bridgeport': 'CT',
                'hayward': 'CA',
                'sunnyvale': 'CA',
                'escondido': 'CA',
                'lakewood': 'CO',
                'hollywood': 'FL',
                'fort collins': 'CO',
                'hampton': 'VA',
                'thousand oaks': 'CA',
                'west valley city': 'UT',
                'boulder': 'CO',
                'west covina': 'CA',
                'ventura': 'CA',
                'inland empire': 'CA',
                'elgin': 'IL',
                'richardson': 'TX',
                'downey': 'CA',
                'costa mesa': 'CA',
                'miami gardens': 'FL',
                'carlsbad': 'CA',
                'westminster': 'CO',
                'santa clara': 'CA',
                'clearwater': 'FL',
                'pearland': 'TX',
                'concord': 'CA',
                'topeka': 'KS',
                'simi valley': 'CA',
                'olathe': 'KS',
                'thornton': 'CO',
                'carrollton': 'TX',
                'midland': 'TX',
                'west palm beach': 'FL',
                'cedar rapids': 'IA',
                'elizabeth': 'NJ',
                'round rock': 'TX',
                'columbia': 'SC',
                'sterling heights': 'MI',
                'kent': 'WA',
                'fargo': 'ND',
                'clarksville': 'TN',
                'palm bay': 'FL',
                'pearland': 'TX',
                'richardson': 'TX',
                'pompano beach': 'FL',
                'lancaster': 'CA',
                'chico': 'CA',
                'savannah': 'GA',
                'mesquite': 'TX',
                'paterson': 'NJ',
                'rocky mount': 'NC',
                'westminster': 'CA',
                'daly city': 'CA',
                'santa monica': 'CA',
                'burbank': 'CA',
                'pasadena': 'CA',
                'allen': 'TX',
                'high point': 'NC',
                'west covina': 'CA',
                'ventura': 'CA',
                'inland empire': 'CA',
                'elgin': 'IL',
                'richardson': 'TX',
                'downey': 'CA',
                'costa mesa': 'CA',
                'miami gardens': 'FL',
                'carlsbad': 'CA',
                'westminster': 'CO',
                'santa clara': 'CA',
                'clearwater': 'FL',
                'pearland': 'TX',
                'concord': 'CA',
                'topeka': 'KS',
                'simi valley': 'CA',
                'olathe': 'KS',
                'thornton': 'CO',
                'carrollton': 'TX',
                'midland': 'TX',
                'west palm beach': 'FL',
                'cedar rapids': 'IA',
                'elizabeth': 'NJ',
                'round rock': 'TX',
                'columbia': 'SC',
                'sterling heights': 'MI',
                'kent': 'WA',
                'fargo': 'ND',
                'clarksville': 'TN',
                'palm bay': 'FL',
                'pearland': 'TX',
                'richardson': 'TX',
                'pompano beach': 'FL',
                'lancaster': 'CA',
                'chico': 'CA',
                'savannah': 'GA',
                'mesquite': 'TX',
                'paterson': 'NJ',
                'rocky mount': 'NC',
                'westminster': 'CA',
                'daly city': 'CA',
                'santa monica': 'CA',
                'burbank': 'CA',
                'pasadena': 'CA',
                'allen': 'TX',
                'high point': 'NC'
            };
            
            const state = stateMap[city.toLowerCase()];
            if (state) {
                return { city: city, state_code: state };
            }
            
            // If city is not in our map, try to use it directly
            // The API might be able to handle it without a state
            console.log(`Unknown city: ${city}, trying without state`);
            return { city: city };
        }
        
        // If we can't parse the location, return null (will use mock data)
        return null;
    }

    extractPostalCode(location) {
        // Try to extract postal code from location string
        const postalMatch = location.match(/\b\d{5}(-\d{4})?\b/);
        return postalMatch ? postalMatch[0] : null;
    }

    applyFilters(properties, filters) {
        const { minPrice, maxPrice, bedrooms, bathrooms, propertyType, dateRange } = filters;
        
        return properties.filter(property => {
            // Price filtering
            if (minPrice > 0 && property.price < minPrice) return false;
            if (maxPrice > 0 && maxPrice < 10000000 && property.price > maxPrice) return false;
            
            // Bedroom filtering
            if (bedrooms > 0 && property.bedrooms < bedrooms) return false;
            
            // Bathroom filtering
            if (bathrooms > 0 && property.bathrooms < bathrooms) return false;
            
            // Property type filtering
            if (propertyType && propertyType !== 'any') {
                // Map frontend property types to API property types
                const typeMapping = {
                    'house': ['single_family', 'townhomes', 'condo'],
                    'condo': ['condo', 'townhomes'],
                    'townhouse': ['townhomes'],
                    'single_family': ['single_family']
                };
                
                const allowedTypes = typeMapping[propertyType] || [propertyType];
                if (!allowedTypes.includes(property.propertyType)) return false;
            }
            
            // Date range filtering
            if (dateRange && dateRange !== 'any') {
                const daysAgo = parseInt(dateRange);
                const propertyDate = new Date(property.listDate);
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
                
                if (propertyDate < cutoffDate) return false;
            }
            
            return true;
        });
    }

    // Cache management methods
    generateCacheKey(params) {
        const { location, propertyType, minPrice, maxPrice, bedrooms, bathrooms, limit, dateRange } = params;
        return `${location}-${propertyType}-${minPrice}-${maxPrice}-${bedrooms}-${bathrooms}-${limit}-${dateRange}`;
    }

    getCachedResult(cacheKey) {
        const cached = this.cache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
            return cached.data;
        }
        if (cached) {
            this.cache.delete(cacheKey); // Remove expired cache
        }
        return null;
    }

    setCachedResult(cacheKey, data) {
        this.cache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });
        
        // Clean up old cache entries (keep only last 100)
        if (this.cache.size > 100) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
    }

    // RentCast API integration
    async searchWithRentCast(params) {
        try {
            const { location, limit = 50 } = params;
            
            // Parse location for RentCast API
            const searchQuery = this.parseLocation(location);
            if (!searchQuery) {
                throw new Error('Could not parse location for RentCast API');
            }

            // RentCast API endpoint for property listings
            const response = await axios.get(`${this.rentcastBaseURL}/listings/sale`, {
                params: {
                    city: searchQuery.city,
                    state: searchQuery.state_code,
                    limit: Math.min(limit, 50) // RentCast free tier limit
                },
                headers: {
                    'X-Api-Key': this.rentcastApiKey,
                    'Content-Type': 'application/json'
                }
            });

            // Format RentCast data to match our expected format
            return this.formatRentCastProperties(response.data || []);
            
        } catch (error) {
            console.error('RentCast API Error:', error.message);
            throw error;
        }
    }

    formatRentCastProperties(properties) {
        return properties.map(property => ({
            property_id: property.id || `rentcast-${Math.random()}`,
            listing_id: property.listingId || property.id,
            location: {
                address: {
                    line: property.address || 'Address not available',
                    city: property.city || 'Unknown',
                    state_code: property.state || 'Unknown',
                    postal_code: property.zipCode || '00000',
                    coordinate: {
                        lat: property.latitude || 0,
                        lon: property.longitude || 0
                    }
                }
            },
            list_price: property.price || 0,
            description: {
                beds: property.bedrooms || 0,
                baths_consolidated: property.bathrooms?.toString() || '0',
                sqft: property.squareFootage || 0,
                lot_sqft: property.lotSize || 0,
                type: property.propertyType || 'single_family',
                year_built: property.yearBuilt || 0,
                name: property.description || 'Property description not available'
            },
            status: 'for_sale',
            list_date: property.listedDate || new Date().toISOString(),
            photos: property.photos || ['https://via.placeholder.com/400x300?text=Property'],
            branding: [{ name: 'RentCast', type: 'API' }],
            permalink: property.url || '#'
        }));
    }
}

module.exports = RealEstateAPI;
