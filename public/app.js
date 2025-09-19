class RealtorHouseFinder {
    constructor() {
        this.properties = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAPIHealth();
    }

    bindEvents() {
        const searchForm = document.getElementById('searchForm');
        const exportBtn = document.getElementById('exportBtn');
        const clearBtn = document.getElementById('clearBtn');
        const testBtn = document.getElementById('testBtn');

        searchForm.addEventListener('submit', (e) => this.handleSearch(e));
        exportBtn.addEventListener('click', () => this.handleExport());
        clearBtn.addEventListener('click', () => this.handleClear());
        testBtn.addEventListener('click', () => this.handleTestSearch());
    }

    async checkAPIHealth() {
        try {
            const response = await fetch('/api/health');
            const data = await response.json();
            console.log('API Status:', data);
            console.log('Frontend loaded successfully');
        } catch (error) {
            console.error('API Health Check Failed:', error);
            this.showError('Unable to connect to the API. Please check your server configuration.');
        }
    }

    async handleSearch(e) {
        e.preventDefault();
        console.log('Search form submitted');
        
        // Get form values directly from the form elements
        const locationInput = document.getElementById('location').value.trim();
        const searchParams = {
            location: this.formatLocation(locationInput),
            propertyType: document.getElementById('propertyType').value,
            minPrice: parseInt(document.getElementById('minPrice').value) || 0,
            maxPrice: parseInt(document.getElementById('maxPrice').value) || 1000000,
            bedrooms: parseInt(document.getElementById('bedrooms').value) || 0,
            bathrooms: parseInt(document.getElementById('bathrooms').value) || 0,
            limit: parseInt(document.getElementById('limit').value) || 50
        };

        console.log('Search params:', searchParams);
        this.showLoading(true);
        this.hideMessages();

        try {
            console.log('Making API request...');
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(searchParams)
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (data.success) {
                this.properties = data.data;
                this.displayResults(data.data);
                this.showSuccess(`Found ${data.count} properties matching your criteria!`);
            } else {
                this.showError(data.error || 'Search failed. Please try again.');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Search failed. Please check your connection and try again.');
        } finally {
            this.showLoading(false);
        }
    }

    displayResults(properties) {
        const resultsSection = document.getElementById('resultsSection');
        const resultsCount = document.getElementById('resultsCount');
        const propertiesList = document.getElementById('propertiesList');

        resultsCount.textContent = `Showing ${properties.length} properties`;
        propertiesList.innerHTML = '';

        if (properties.length === 0) {
            propertiesList.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-search text-4xl mb-4"></i>
                    <p>No properties found matching your criteria.</p>
                    <p class="text-sm">Try adjusting your search parameters.</p>
                </div>
            `;
        } else {
            properties.forEach(property => {
                const propertyCard = this.createPropertyCard(property);
                propertiesList.appendChild(propertyCard);
            });
        }

        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    createPropertyCard(property) {
        const card = document.createElement('div');
        card.className = 'border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-300';
        
        const price = this.formatCurrency(property.price);
        const pricePerSqft = property.squareFeet > 0 ? Math.round(property.price / property.squareFeet) : 0;
        const daysOnMarket = Math.floor((new Date() - new Date(property.listDate)) / (1000 * 60 * 60 * 24));

        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h4 class="text-lg font-semibold text-gray-800">${property.address}</h4>
                <span class="text-2xl font-bold text-green-600">${price}</span>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm text-gray-600">
                <div class="flex items-center">
                    <i class="fas fa-bed mr-2 text-blue-600"></i>
                    <span>${property.bedrooms} bed</span>
                </div>
                <div class="flex items-center">
                    <i class="fas fa-bath mr-2 text-blue-600"></i>
                    <span>${property.bathrooms} bath</span>
                </div>
                <div class="flex items-center">
                    <i class="fas fa-ruler-combined mr-2 text-blue-600"></i>
                    <span>${property.squareFeet.toLocaleString()} sq ft</span>
                </div>
                <div class="flex items-center">
                    <i class="fas fa-calendar mr-2 text-blue-600"></i>
                    <span>${daysOnMarket} days</span>
                </div>
            </div>
            
            <div class="flex flex-wrap gap-2 mb-3">
                <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">${property.propertyType}</span>
                <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">${property.status}</span>
                ${property.pool ? '<span class="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Pool</span>' : ''}
                ${property.garage > 0 ? `<span class="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">${property.garage} Garage</span>` : ''}
            </div>
            
            <div class="text-sm text-gray-600 mb-2">
                <span class="font-medium">Price per sq ft:</span> $${pricePerSqft.toLocaleString()}
                ${property.yearBuilt !== 'Unknown' ? ` | <span class="font-medium">Built:</span> ${property.yearBuilt}` : ''}
            </div>
            
            ${property.description ? `<p class="text-sm text-gray-600 mb-3 line-clamp-2">${property.description}</p>` : ''}
            
            <div class="flex justify-between items-center">
                <div class="text-xs text-gray-500">
                    <i class="fas fa-user mr-1"></i>
                    ${property.agent.name}
                </div>
                ${property.url ? `<a href="${property.url}" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm font-medium">View Details <i class="fas fa-external-link-alt ml-1"></i></a>` : ''}
            </div>
        `;

        return card;
    }

    async handleExport() {
        if (this.properties.length === 0) {
            this.showError('No properties to export. Please search for properties first.');
            return;
        }

        this.showLoading(true);
        this.hideMessages();

        try {
            const response = await fetch('/api/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    properties: this.properties,
                    filename: `realtor_listings_${new Date().toISOString().split('T')[0]}.xlsx`
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showSuccess(`Excel file created successfully! ${this.properties.length} properties exported.`);
                this.downloadFile(data.filePath);
            } else {
                this.showError(data.error || 'Export failed. Please try again.');
            }
        } catch (error) {
            console.error('Export error:', error);
            this.showError('Export failed. Please check your connection and try again.');
        } finally {
            this.showLoading(false);
        }
    }

    downloadFile(filePath) {
        const filename = filePath.split('/').pop();
        const link = document.createElement('a');
        link.href = `/api/download/${filename}`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    handleClear() {
        this.properties = [];
        document.getElementById('resultsSection').classList.add('hidden');
        document.getElementById('searchForm').reset();
        this.hideMessages();
    }

    async handleTestSearch() {
        console.log('Test search button clicked');
        const searchParams = {
            location: 'New York, NY',
            propertyType: 'house',
            minPrice: 0,
            maxPrice: 1000000,
            bedrooms: 0,
            bathrooms: 0,
            limit: 5
        };

        console.log('Test search params:', searchParams);
        this.showLoading(true);
        this.hideMessages();

        try {
            console.log('Making test API request...');
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(searchParams)
            });

            console.log('Test response status:', response.status);
            const data = await response.json();
            console.log('Test response data:', data);

            if (data.success) {
                this.properties = data.data;
                this.displayResults(data.data);
                this.showSuccess(`Test successful! Found ${data.count} properties.`);
            } else {
                this.showError(data.error || 'Test search failed. Please try again.');
            }
        } catch (error) {
            console.error('Test search error:', error);
            this.showError('Test search failed. Please check your connection and try again.');
        } finally {
            this.showLoading(false);
        }
    }

    showLoading(show) {
        const loadingSpinner = document.getElementById('loadingSpinner');
        const searchBtn = document.getElementById('searchBtn');
        
        if (show) {
            loadingSpinner.classList.remove('hidden');
            searchBtn.disabled = true;
            searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Searching...';
        } else {
            loadingSpinner.classList.add('hidden');
            searchBtn.disabled = false;
            searchBtn.innerHTML = '<i class="fas fa-search mr-2"></i>Search Properties';
        }
    }

    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
        
        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 5000);
    }

    showSuccess(message) {
        const successMessage = document.getElementById('successMessage');
        const successText = document.getElementById('successText');
        
        successText.textContent = message;
        successMessage.classList.remove('hidden');
        
        setTimeout(() => {
            successMessage.classList.add('hidden');
        }, 5000);
    }

    hideMessages() {
        document.getElementById('errorMessage').classList.add('hidden');
        document.getElementById('successMessage').classList.add('hidden');
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    formatLocation(location) {
        if (!location) return 'New York, NY';
        
        // If it already has a state, return as is
        if (location.includes(',') && location.split(',').length >= 2) {
            return location;
        }
        
        // Common city mappings to help users
        const cityMappings = {
            'nashville': 'Nashville, TN',
            'miami': 'Miami, FL',
            'chicago': 'Chicago, IL',
            'los angeles': 'Los Angeles, CA',
            'san francisco': 'San Francisco, CA',
            'seattle': 'Seattle, WA',
            'denver': 'Denver, CO',
            'austin': 'Austin, TX',
            'dallas': 'Dallas, TX',
            'houston': 'Houston, TX',
            'phoenix': 'Phoenix, AZ',
            'las vegas': 'Las Vegas, NV',
            'atlanta': 'Atlanta, GA',
            'boston': 'Boston, MA',
            'philadelphia': 'Philadelphia, PA',
            'detroit': 'Detroit, MI',
            'minneapolis': 'Minneapolis, MN',
            'portland': 'Portland, OR',
            'san diego': 'San Diego, CA',
            'tampa': 'Tampa, FL',
            'orlando': 'Orlando, FL',
            'charlotte': 'Charlotte, NC',
            'raleigh': 'Raleigh, NC',
            'columbus': 'Columbus, OH',
            'indianapolis': 'Indianapolis, IN',
            'kansas city': 'Kansas City, MO',
            'milwaukee': 'Milwaukee, WI',
            'salt lake city': 'Salt Lake City, UT',
            'nashville tn': 'Nashville, TN',
            'miami fl': 'Miami, FL',
            'chicago il': 'Chicago, IL',
            'los angeles ca': 'Los Angeles, CA',
            'san francisco ca': 'San Francisco, CA',
            'seattle wa': 'Seattle, WA',
            'denver co': 'Denver, CO',
            'austin tx': 'Austin, TX',
            'dallas tx': 'Dallas, TX',
            'houston tx': 'Houston, TX',
            'phoenix az': 'Phoenix, AZ',
            'las vegas nv': 'Las Vegas, NV',
            'atlanta ga': 'Atlanta, GA',
            'boston ma': 'Boston, MA',
            'philadelphia pa': 'Philadelphia, PA',
            'detroit mi': 'Detroit, MI',
            'minneapolis mn': 'Minneapolis, MN',
            'portland or': 'Portland, OR',
            'san diego ca': 'San Diego, CA',
            'tampa fl': 'Tampa, FL',
            'orlando fl': 'Orlando, FL',
            'charlotte nc': 'Charlotte, NC',
            'raleigh nc': 'Raleigh, NC',
            'columbus oh': 'Columbus, OH',
            'indianapolis in': 'Indianapolis, IN',
            'kansas city mo': 'Kansas City, MO',
            'milwaukee wi': 'Milwaukee, WI',
            'salt lake city ut': 'Salt Lake City, UT'
        };
        
        const lowerLocation = location.toLowerCase().trim();
        return cityMappings[lowerLocation] || location;
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RealtorHouseFinder();
});
