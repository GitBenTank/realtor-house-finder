class RealtorHouseFinder {
    constructor() {
        this.properties = [];
        this.currentPage = 1;
        this.propertiesPerPage = 12; // Show 12 properties per page
        this.totalPages = 1;
        this.selectedIndex = -1; // For location autocomplete
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAPIHealth();
    }

    bindEvents() {
        console.log('Binding events...');
        
        const searchForm = document.getElementById('searchForm');
        const propertyListingsBtn = document.getElementById('propertyListingsBtn');
        const marketIntelligenceBtn = document.getElementById('marketIntelligenceBtn');
        const investmentAnalysisBtn = document.getElementById('investmentAnalysisBtn');
        const clearBtn = document.getElementById('clearBtn');
        const testBtn = document.getElementById('testBtn');
        const searchBtn = document.getElementById('searchBtn');

        console.log('Elements found:', {
            searchForm: !!searchForm,
            propertyListingsBtn: !!propertyListingsBtn,
            marketIntelligenceBtn: !!marketIntelligenceBtn,
            investmentAnalysisBtn: !!investmentAnalysisBtn,
            clearBtn: !!clearBtn,
            testBtn: !!testBtn,
            searchBtn: !!searchBtn
        });

        // Add both form submit and button click handlers
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                console.log('Form submit event triggered');
                this.handleSearch(e);
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', (e) => {
                console.log('Search button clicked');
                e.preventDefault();
                this.handleSearch(e);
            });
        }
        
        // Report button handlers
        if (propertyListingsBtn) propertyListingsBtn.addEventListener('click', () => this.createPropertyListingsReport());
        if (marketIntelligenceBtn) marketIntelligenceBtn.addEventListener('click', () => this.createMarketIntelligenceReport());
        if (investmentAnalysisBtn) investmentAnalysisBtn.addEventListener('click', () => this.createInvestmentAnalysisReport());
        if (clearBtn) clearBtn.addEventListener('click', () => this.handleClear());
        if (testBtn) testBtn.addEventListener('click', () => this.handleTestSearch());
        
        // Analytics button
        const analyticsBtn = document.getElementById('analyticsBtn');
        const analyticsModal = document.getElementById('analyticsModal');
        const closeAnalytics = document.getElementById('closeAnalytics');
        
        if (analyticsBtn) analyticsBtn.addEventListener('click', () => this.showMarketAnalytics());
        if (closeAnalytics) closeAnalytics.addEventListener('click', () => this.hideAnalytics());
        if (analyticsModal) analyticsModal.addEventListener('click', (e) => {
            if (e.target === analyticsModal) this.hideAnalytics();
        });

        // Market report button
        const marketReportBtn = document.getElementById('marketReportBtn');
        if (marketReportBtn) marketReportBtn.addEventListener('click', () => this.createMarketReport());

        // Location autocomplete
        const locationInput = document.getElementById('location');
        if (locationInput) {
            this.setupLocationAutocomplete(locationInput);
        }

        // Pagination controls
        const prevPageBtn = document.getElementById('prevPage');
        const nextPageBtn = document.getElementById('nextPage');
        
        if (prevPageBtn) prevPageBtn.addEventListener('click', () => this.previousPage());
        if (nextPageBtn) nextPageBtn.addEventListener('click', () => this.nextPage());
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
        console.log('Search form submitted - event:', e.type);
        
        // Get form values directly from the form elements
        const locationInput = document.getElementById('location').value.trim();
        console.log('Location input:', locationInput);
        
        const searchParams = {
            location: this.formatLocation(locationInput),
            propertyType: document.getElementById('propertyType')?.value || 'house',
            minPrice: parseInt(document.getElementById('minPrice')?.value) || 0,
            bedrooms: parseInt(document.getElementById('bedrooms')?.value) || 0,
            bathrooms: 0, // Not available in current form
            limit: parseInt(document.getElementById('limit')?.value) || 200,
            dateRange: document.getElementById('dateRange')?.value || 'any',
            priceChange: document.getElementById('priceChange')?.value || 'any',
            daysOnMarket: document.getElementById('daysOnMarket')?.value || 'any'
        };
        
        // Only add maxPrice if it's not the default value
        const maxPriceValue = parseInt(document.getElementById('maxPrice')?.value);
        if (maxPriceValue && maxPriceValue !== 1000000) {
            searchParams.maxPrice = maxPriceValue;
        }

        console.log('Search params:', searchParams);
        this.showLoading(true);
        this.hideMessages();

        try {
            console.log('Making API request...');
            console.log('Request URL:', window.location.origin + '/api/search');
            console.log('Request body:', JSON.stringify(searchParams));
            
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(searchParams)
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
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
            this.hidePagination();
        } else {
            this.totalPages = Math.ceil(properties.length / this.propertiesPerPage);
            this.currentPage = 1; // Reset to first page
            this.updatePagination();
            this.displayCurrentPage();
        }

        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    displayCurrentPage() {
        const propertiesList = document.getElementById('propertiesList');
        const startIndex = (this.currentPage - 1) * this.propertiesPerPage;
        const endIndex = startIndex + this.propertiesPerPage;
        const currentPageProperties = this.properties.slice(startIndex, endIndex);
        
        propertiesList.innerHTML = '';
        currentPageProperties.forEach(property => {
            const propertyCard = this.createPropertyCard(property);
            propertiesList.appendChild(propertyCard);
        });
    }

    updatePagination() {
        const paginationControls = document.getElementById('paginationControls');
        const currentPageSpan = document.getElementById('currentPage');
        const totalPagesSpan = document.getElementById('totalPages');
        const prevPageBtn = document.getElementById('prevPage');
        const nextPageBtn = document.getElementById('nextPage');

        if (this.totalPages > 1) {
            paginationControls.classList.remove('hidden');
            currentPageSpan.textContent = this.currentPage;
            totalPagesSpan.textContent = this.totalPages;
            
            prevPageBtn.disabled = this.currentPage === 1;
            nextPageBtn.disabled = this.currentPage === this.totalPages;
        } else {
            this.hidePagination();
        }
    }

    hidePagination() {
        const paginationControls = document.getElementById('paginationControls');
        paginationControls.classList.add('hidden');
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.displayCurrentPage();
            this.updatePagination();
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.displayCurrentPage();
            this.updatePagination();
        }
    }

    createPropertyCard(property) {
        const card = document.createElement('div');
        card.className = 'property-card rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 fade-in';
        
        const price = this.formatCurrency(property.price);
        const pricePerSqft = property.squareFeet > 0 ? Math.round(property.price / property.squareFeet) : 0;
        const daysOnMarket = Math.floor((new Date() - new Date(property.listDate)) / (1000 * 60 * 60 * 24));
        const isNewListing = daysOnMarket <= 7;
        const isPriceReduced = property.priceReducedAmount && property.priceReducedAmount > 0;

        // Get the primary photo URL from the property data
        const primaryPhoto = property.primary_photo?.href || property.images?.[0];
        const hasValidImage = primaryPhoto && !primaryPhoto.includes('placeholder') && !primaryPhoto.includes('via.placeholder');
        
        card.innerHTML = `
            <!-- Property Image -->
            <div class="relative mb-6 rounded-xl overflow-hidden">
                ${hasValidImage ? 
                    `<img src="${primaryPhoto}" alt="${property.address}" class="w-full h-48 object-cover transition-transform duration-300 hover:scale-105" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` :
                    ``
                }
                <div class="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center" style="display: ${hasValidImage ? 'none' : 'flex'};">
                    <i class="fas fa-home text-4xl text-gray-400"></i>
                </div>
                <div class="absolute top-4 left-4 flex flex-col space-y-2">
                    ${isNewListing ? '<span class="status-badge bg-gradient-to-r from-green-500 to-emerald-500">New Listing</span>' : ''}
                    ${isPriceReduced ? '<span class="status-badge bg-gradient-to-r from-red-500 to-pink-500">Price Reduced</span>' : ''}
                </div>
                <div class="absolute top-4 right-4">
                    <span class="status-badge bg-gradient-to-r from-blue-500 to-purple-500">${property.status.replace('_', ' ').toUpperCase()}</span>
                </div>
            </div>

            <!-- Property Header -->
            <div class="mb-4">
                <h4 class="text-lg font-bold mb-2 line-clamp-2 leading-tight" style="color: var(--text-primary);">${property.address}</h4>
                <div class="flex items-center justify-between">
                    <span class="text-3xl font-bold price-highlight">${price}</span>
                    <div class="text-right">
                        <div class="text-sm" style="color: var(--text-muted);">${pricePerSqft.toLocaleString()}/sq ft</div>
                        <div class="text-xs" style="color: var(--text-muted);">${daysOnMarket} days on market</div>
                    </div>
                </div>
            </div>
            
            <!-- Property Details -->
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="flex items-center space-x-3 p-3 rounded-xl" style="background: rgba(99, 102, 241, 0.1);">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: var(--accent-primary);">
                        <i class="fas fa-bed text-white text-sm"></i>
                    </div>
                    <div>
                        <div class="text-lg font-bold" style="color: var(--text-primary);">${property.bedrooms}</div>
                        <div class="text-xs" style="color: var(--text-muted);">Bedrooms</div>
                    </div>
                </div>
                <div class="flex items-center space-x-3 p-3 rounded-xl" style="background: rgba(6, 182, 212, 0.1);">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: var(--accent-tertiary);">
                        <i class="fas fa-bath text-white text-sm"></i>
                    </div>
                    <div>
                        <div class="text-lg font-bold" style="color: var(--text-primary);">${property.bathrooms}</div>
                        <div class="text-xs" style="color: var(--text-muted);">Bathrooms</div>
                    </div>
                </div>
                <div class="flex items-center space-x-3 p-3 rounded-xl" style="background: rgba(139, 92, 246, 0.1);">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: var(--accent-secondary);">
                        <i class="fas fa-ruler-combined text-white text-sm"></i>
                    </div>
                    <div>
                        <div class="text-lg font-bold" style="color: var(--text-primary);">${property.squareFeet.toLocaleString()}</div>
                        <div class="text-xs" style="color: var(--text-muted);">Sq Ft</div>
                    </div>
                </div>
                <div class="flex items-center space-x-3 p-3 rounded-xl" style="background: rgba(245, 158, 11, 0.1);">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: #f59e0b;">
                        <i class="fas fa-calendar text-white text-sm"></i>
                    </div>
                    <div>
                        <div class="text-lg font-bold" style="color: var(--text-primary);">${daysOnMarket}</div>
                        <div class="text-xs" style="color: var(--text-muted);">Days Listed</div>
                    </div>
                </div>
            </div>
            
            <!-- Property Features -->
            <div class="flex flex-wrap gap-2 mb-6">
                <span class="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-full font-medium">
                    ${property.propertyType.replace('_', ' ').toUpperCase()}
                </span>
                ${property.pool ? '<span class="px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs rounded-full font-medium">🏊 Pool</span>' : ''}
                ${property.garage > 0 ? `<span class="px-3 py-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs rounded-full font-medium">🚗 ${property.garage} Garage</span>` : ''}
                ${property.yearBuilt !== 'Unknown' ? `<span class="px-3 py-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-xs rounded-full font-medium">🏗️ Built ${property.yearBuilt}</span>` : ''}
            </div>
            
            <!-- Agent Info -->
            <div class="flex items-center justify-between pt-4" style="border-top: 1px solid var(--border-color);">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center" style="background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));">
                        <i class="fas fa-user text-white text-xs"></i>
                    </div>
                    <div>
                        <div class="text-sm font-medium" style="color: var(--text-primary);">${property.agent.name}</div>
                        <div class="text-xs" style="color: var(--text-muted);">Real Estate Agent</div>
                    </div>
                </div>
                ${property.url ? `
                    <a href="${property.url}" target="_blank" 
                       class="text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl touch-target"
                       style="background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); min-height: 44px;">
                        <span>View Details</span>
                        <i class="fas fa-external-link-alt text-xs"></i>
                    </a>
                ` : ''}
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
            // Use server-side export for better reliability
            const response = await fetch('/api/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    properties: this.properties
                })
            });

            if (response.ok) {
                // Get the filename from the Content-Disposition header
                const contentDisposition = response.headers.get('Content-Disposition');
                const filename = contentDisposition 
                    ? contentDisposition.split('filename=')[1].replace(/"/g, '')
                    : `realtor_listings_${new Date().toISOString().split('T')[0]}.xlsx`;

                // Create blob and download
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                this.showSuccess(`Excel file downloaded successfully! ${this.properties.length} properties exported.`);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Export failed');
            }
        } catch (error) {
            console.error('Export error:', error);
            this.showError('Export failed: ' + error.message);
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
        
        // Get the current location from the form
        const locationInput = document.getElementById('location').value.trim();
        const testLocation = locationInput ? this.formatLocation(locationInput) : 'Nashville, TN';
        
        const searchParams = {
            location: testLocation,
            propertyType: document.getElementById('propertyType')?.value || 'house',
            minPrice: parseInt(document.getElementById('minPrice')?.value) || 0,
            bedrooms: parseInt(document.getElementById('bedrooms')?.value) || 0,
            bathrooms: 0, // Not available in current form
            limit: parseInt(document.getElementById('limit')?.value) || 200,
            dateRange: document.getElementById('dateRange')?.value || 'any'
        };
        
        // Only add maxPrice if it's not the default value
        const maxPriceValue = parseInt(document.getElementById('maxPrice')?.value);
        if (maxPriceValue && maxPriceValue !== 1000000) {
            searchParams.maxPrice = maxPriceValue;
        }

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

    async showAnalytics() {
        try {
            const response = await fetch('/api/analytics');
            const data = await response.json();
            
            const modal = document.getElementById('analyticsModal');
            const content = document.getElementById('analyticsContent');
            
            content.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="p-6 rounded-xl" style="background: var(--bg-tertiary); border: 1px solid var(--border-color);">
                        <div class="text-center">
                            <i class="fas fa-search text-3xl mb-3" style="color: var(--accent-primary);"></i>
                            <h4 class="text-xl font-bold mb-2" style="color: var(--text-primary);">Total Searches</h4>
                            <p class="text-3xl font-bold" style="color: var(--accent-primary);">${data.totalSearches}</p>
                        </div>
                    </div>
                    <div class="p-6 rounded-xl" style="background: var(--bg-tertiary); border: 1px solid var(--border-color);">
                        <div class="text-center">
                            <i class="fas fa-bolt text-3xl mb-3" style="color: var(--accent-tertiary);"></i>
                            <h4 class="text-xl font-bold mb-2" style="color: var(--text-primary);">API Calls</h4>
                            <p class="text-3xl font-bold" style="color: var(--accent-tertiary);">${data.totalApiCalls}</p>
                        </div>
                    </div>
                    <div class="p-6 rounded-xl" style="background: var(--bg-tertiary); border: 1px solid var(--border-color);">
                        <div class="text-center">
                            <i class="fas fa-clock text-3xl mb-3" style="color: var(--accent-secondary);"></i>
                            <h4 class="text-xl font-bold mb-2" style="color: var(--text-primary);">Uptime</h4>
                            <p class="text-lg font-bold" style="color: var(--accent-secondary);">${Math.floor(data.uptime / 3600)}h ${Math.floor((data.uptime % 3600) / 60)}m</p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="p-6 rounded-xl" style="background: var(--bg-tertiary); border: 1px solid var(--border-color);">
                        <h4 class="text-xl font-bold mb-4" style="color: var(--text-primary);">
                            <i class="fas fa-map-marker-alt mr-2" style="color: var(--accent-primary);"></i>
                            Top Locations
                        </h4>
                        <div class="space-y-2">
                            ${data.topLocations.map(location => `
                                <div class="flex justify-between items-center p-2 rounded-lg" style="background: var(--bg-primary);">
                                    <span style="color: var(--text-primary);">${location.location}</span>
                                    <span class="px-2 py-1 rounded-full text-sm font-bold" style="background: var(--accent-primary); color: white;">${location.count}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="p-6 rounded-xl" style="background: var(--bg-tertiary); border: 1px solid var(--border-color);">
                        <h4 class="text-xl font-bold mb-4" style="color: var(--text-primary);">
                            <i class="fas fa-history mr-2" style="color: var(--accent-tertiary);"></i>
                            Recent Searches
                        </h4>
                        <div class="space-y-2 max-h-64 overflow-y-auto">
                            ${data.recentSearches.map(search => `
                                <div class="p-3 rounded-lg" style="background: var(--bg-primary);">
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <p class="font-medium" style="color: var(--text-primary);">${search.location}</p>
                                            <p class="text-sm" style="color: var(--text-muted);">${search.propertyType} • ${search.limit} results</p>
                                        </div>
                                        <span class="text-xs" style="color: var(--text-muted);">${new Date(search.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="mt-6 p-4 rounded-xl" style="background: var(--bg-primary); border: 1px solid var(--border-color);">
                    <h4 class="text-lg font-bold mb-2" style="color: var(--text-primary);">
                        <i class="fas fa-info-circle mr-2" style="color: var(--accent-primary);"></i>
                        Today's Stats
                    </h4>
                    <p style="color: var(--text-secondary);">
                        Searches: ${data.todayStats.searches} | API Calls: ${data.todayStats.apiCalls}
                    </p>
                </div>
            `;
            
            modal.classList.remove('hidden');
        } catch (error) {
            console.error('Error loading analytics:', error);
            this.showError('Failed to load analytics data');
        }
    }

    hideAnalytics() {
        const modal = document.getElementById('analyticsModal');
        modal.classList.add('hidden');
    }

    showMarketAnalytics() {
        if (this.properties.length === 0) {
            this.showError('No properties to analyze. Please search for properties first.');
            return;
        }

        const analyticsSection = document.getElementById('analyticsSection');
        if (analyticsSection) {
            analyticsSection.classList.remove('hidden');
            this.populateMarketAnalytics();
            analyticsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    populateMarketAnalytics() {
        const properties = this.properties;
        
        // Calculate basic statistics
        const totalListings = properties.length;
        const prices = properties.map(p => p.price).filter(p => p > 0);
        const averagePrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
        
        // Calculate days on market
        const daysOnMarket = properties.map(p => {
            const listDate = new Date(p.listDate);
            const now = new Date();
            return Math.floor((now - listDate) / (1000 * 60 * 60 * 24));
        });
        const avgDaysOnMarket = daysOnMarket.length > 0 ? Math.round(daysOnMarket.reduce((a, b) => a + b, 0) / daysOnMarket.length) : 0;
        
        // Recent listings (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentListings = properties.filter(p => new Date(p.listDate) >= sevenDaysAgo).length;
        
        // Update the analytics display
        document.getElementById('totalListings').textContent = totalListings.toLocaleString();
        document.getElementById('averagePrice').textContent = this.formatCurrency(averagePrice);
        document.getElementById('priceRange').textContent = `${this.formatCurrency(minPrice)} - ${this.formatCurrency(maxPrice)}`;
        document.getElementById('avgDaysOnMarket').textContent = avgDaysOnMarket;
        document.getElementById('recentListings').textContent = `${recentListings} properties listed in the last 7 days`;
        
        // Property type distribution
        this.populatePropertyTypeChart(properties);
        
        // Price distribution
        this.populatePriceDistributionChart(properties);
    }

    populatePropertyTypeChart(properties) {
        const typeCounts = {};
        properties.forEach(property => {
            const type = property.propertyType || 'Unknown';
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });
        
        const chartContainer = document.getElementById('propertyTypeChart');
        chartContainer.innerHTML = '';
        
        Object.entries(typeCounts).forEach(([type, count]) => {
            const percentage = ((count / properties.length) * 100).toFixed(1);
            const typeDisplay = type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            const chartItem = document.createElement('div');
            chartItem.className = 'bg-gray-700 rounded-lg p-4 text-center';
            chartItem.innerHTML = `
                <div class="text-2xl font-bold text-white">${count}</div>
                <div class="text-sm text-gray-300">${typeDisplay}</div>
                <div class="text-xs text-gray-400">${percentage}%</div>
            `;
            chartContainer.appendChild(chartItem);
        });
    }

    populatePriceDistributionChart(properties) {
        const priceRanges = [
            { label: 'Under $200K', min: 0, max: 200000, color: 'bg-red-500' },
            { label: '$200K - $400K', min: 200000, max: 400000, color: 'bg-orange-500' },
            { label: '$400K - $600K', min: 400000, max: 600000, color: 'bg-yellow-500' },
            { label: '$600K - $800K', min: 600000, max: 800000, color: 'bg-green-500' },
            { label: '$800K - $1M', min: 800000, max: 1000000, color: 'bg-blue-500' },
            { label: 'Over $1M', min: 1000000, max: Infinity, color: 'bg-purple-500' }
        ];
        
        const chartContainer = document.getElementById('priceDistributionChart');
        chartContainer.innerHTML = '';
        
        priceRanges.forEach(range => {
            const count = properties.filter(p => p.price >= range.min && p.price < range.max).length;
            const percentage = properties.length > 0 ? ((count / properties.length) * 100).toFixed(1) : 0;
            
            const barItem = document.createElement('div');
            barItem.className = 'flex items-center space-x-4';
            barItem.innerHTML = `
                <div class="w-24 text-sm text-gray-300">${range.label}</div>
                <div class="flex-1 bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div class="h-full ${range.color} transition-all duration-500" style="width: ${percentage}%"></div>
                </div>
                <div class="w-16 text-sm text-gray-300 text-right">${count} (${percentage}%)</div>
            `;
            chartContainer.appendChild(barItem);
        });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    async createMarketReport() {
        if (this.properties.length === 0) {
            this.showError('No properties to analyze. Please search for properties first.');
            return;
        }

        this.showLoading(true);
        this.hideMessages();

        try {
            const location = document.getElementById('location')?.value || 'Unknown';
            
            const response = await fetch('/api/market-analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    properties: this.properties,
                    location: location
                })
            });

            if (response.ok) {
                // Get the filename from the Content-Disposition header
                const contentDisposition = response.headers.get('Content-Disposition');
                const filename = contentDisposition 
                    ? contentDisposition.split('filename=')[1].replace(/"/g, '')
                    : `market_analysis_${new Date().toISOString().split('T')[0]}.xlsx`;

                // Create blob and download
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                this.showSuccess(`Market analysis report downloaded successfully! ${this.properties.length} properties analyzed.`);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Market report creation failed');
            }
        } catch (error) {
            console.error('Market report error:', error);
            this.showError('Market report creation failed: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    // Report Type 1: Property Listings Report
    async createPropertyListingsReport() {
        if (this.properties.length === 0) {
            this.showError('No properties to analyze. Please search for properties first.');
            return;
        }

        this.showLoading(true);
        this.hideMessages();

        try {
            const location = document.getElementById('location')?.value || 'Unknown';
            
            const response = await fetch('/api/reports/property-listings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    properties: this.properties,
                    location: location
                })
            });

            if (response.ok) {
                // Get the filename from the Content-Disposition header
                const contentDisposition = response.headers.get('Content-Disposition');
                const filename = contentDisposition 
                    ? contentDisposition.split('filename=')[1].replace(/"/g, '')
                    : `property_listings_${new Date().toISOString().split('T')[0]}.xlsx`;

                // Create blob and download
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                this.showSuccess(`📊 Property Listings Report downloaded! Includes detailed property data, executive summary, and agent contacts for ${this.properties.length} properties.`);
            } else {
                const errorText = await response.text();
                throw new Error(`Property Listings report creation failed: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('Property Listings report error:', error);
            this.showError('Property Listings report creation failed: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    // Report Type 2: Market Intelligence Report
    async createMarketIntelligenceReport() {
        if (this.properties.length === 0) {
            this.showError('No properties to analyze. Please search for properties first.');
            return;
        }

        this.showLoading(true);
        this.hideMessages();

        try {
            const location = document.getElementById('location')?.value || 'Unknown';
            
            const response = await fetch('/api/reports/market-intelligence', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    properties: this.properties,
                    location: location
                })
            });

            if (response.ok) {
                // Get the filename from the Content-Disposition header
                const contentDisposition = response.headers.get('Content-Disposition');
                const filename = contentDisposition 
                    ? contentDisposition.split('filename=')[1].replace(/"/g, '')
                    : `market_intelligence_${new Date().toISOString().split('T')[0]}.xlsx`;

                // Create blob and download
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                this.showSuccess(`📈 Market Intelligence Report downloaded! Includes market trends, competitive analysis, neighborhood insights, and strategic recommendations for ${this.properties.length} properties.`);
            } else {
                const errorText = await response.text();
                throw new Error(`Market Intelligence report creation failed: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('Market Intelligence report error:', error);
            this.showError('Market Intelligence report creation failed: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    // Report Type 3: Investment Analysis Report
    async createInvestmentAnalysisReport() {
        if (this.properties.length === 0) {
            this.showError('No properties to analyze. Please search for properties first.');
            return;
        }

        this.showLoading(true);
        this.hideMessages();

        try {
            const location = document.getElementById('location')?.value || 'Unknown';
            
            const response = await fetch('/api/reports/investment-analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    properties: this.properties,
                    location: location
                })
            });

            if (response.ok) {
                // Get the filename from the Content-Disposition header
                const contentDisposition = response.headers.get('Content-Disposition');
                const filename = contentDisposition 
                    ? contentDisposition.split('filename=')[1].replace(/"/g, '')
                    : `investment_analysis_${new Date().toISOString().split('T')[0]}.xlsx`;

                // Create blob and download
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                this.showSuccess(`💰 Investment Analysis Report downloaded! Includes ROI analysis, investment scores, risk assessment, and investment recommendations for ${this.properties.length} properties.`);
            } else {
                const errorText = await response.text();
                throw new Error(`Investment Analysis report creation failed: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('Investment Analysis report error:', error);
            this.showError('Investment Analysis report creation failed: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    prepareExcelData(properties) {
        const propertiesData = properties.map(property => ({
            'Property ID': property.id,
            'Address': property.address,
            'Price': property.price,
            'Price Formatted': this.formatCurrency(property.price),
            'Bedrooms': property.bedrooms,
            'Bathrooms': property.bathrooms,
            'Square Feet': property.squareFeet,
            'Lot Size (sq ft)': property.lotSize,
            'Property Type': property.propertyType,
            'Status': property.status,
            'List Date': new Date(property.listDate).toLocaleDateString(),
            'Year Built': property.yearBuilt,
            'Garage Spaces': property.garage,
            'Pool': property.pool ? 'Yes' : 'No',
            'Agent Name': property.agent.name,
            'Agent Phone': property.agent.phone,
            'Agent Email': property.agent.email,
            'Latitude': property.coordinates.lat,
            'Longitude': property.coordinates.lng,
            'Property URL': property.url,
            'Price per Sq Ft': property.squareFeet > 0 ? Math.round(property.price / property.squareFeet) : 0,
            'Days on Market': Math.floor((new Date() - new Date(property.listDate)) / (1000 * 60 * 60 * 24)),
            'Last Updated': new Date(property.lastUpdated).toLocaleString()
        }));

        const summary = this.generateSummary(properties);
        const analysis = this.generateMarketAnalysis(properties);

        return {
            properties: propertiesData,
            summary: summary,
            analysis: analysis
        };
    }

    generateSummary(properties) {
        const totalProperties = properties.length;
        const totalValue = properties.reduce((sum, p) => sum + p.price, 0);
        const avgPrice = totalValue / totalProperties;
        const minPrice = Math.min(...properties.map(p => p.price));
        const maxPrice = Math.max(...properties.map(p => p.price));
        
        const propertyTypes = {};
        const bedroomCounts = {};
        const bathroomCounts = {};

        properties.forEach(property => {
            propertyTypes[property.propertyType] = (propertyTypes[property.propertyType] || 0) + 1;
            bedroomCounts[property.bedrooms] = (bedroomCounts[property.bedrooms] || 0) + 1;
            bathroomCounts[property.bathrooms] = (bathroomCounts[property.bathrooms] || 0) + 1;
        });

        return [
            { 'Metric': 'Total Properties', 'Value': totalProperties },
            { 'Metric': 'Total Market Value', 'Value': this.formatCurrency(totalValue) },
            { 'Metric': 'Average Price', 'Value': this.formatCurrency(avgPrice) },
            { 'Metric': 'Lowest Price', 'Value': this.formatCurrency(minPrice) },
            { 'Metric': 'Highest Price', 'Value': this.formatCurrency(maxPrice) },
            { 'Metric': 'Report Generated', 'Value': new Date().toLocaleString() },
            { 'Metric': 'Data Source', 'Value': 'RapidAPI Real Estate' },
            { 'Metric': '', 'Value': '' },
            { 'Metric': 'Property Types', 'Value': '' },
            ...Object.entries(propertyTypes).map(([type, count]) => ({
                'Metric': `  ${type}`, 'Value': count
            })),
            { 'Metric': '', 'Value': '' },
            { 'Metric': 'Bedroom Distribution', 'Value': '' },
            ...Object.entries(bedroomCounts).map(([beds, count]) => ({
                'Metric': `  ${beds} bedrooms`, 'Value': count
            })),
            { 'Metric': '', 'Value': '' },
            { 'Metric': 'Bathroom Distribution', 'Value': '' },
            ...Object.entries(bathroomCounts).map(([baths, count]) => ({
                'Metric': `  ${baths} bathrooms`, 'Value': count
            }))
        ];
    }

    generateMarketAnalysis(properties) {
        const priceRanges = [
            { range: 'Under $200K', min: 0, max: 200000 },
            { range: '$200K - $400K', min: 200000, max: 400000 },
            { range: '$400K - $600K', min: 400000, max: 600000 },
            { range: '$600K - $800K', min: 600000, max: 800000 },
            { range: '$800K - $1M', min: 800000, max: 1000000 },
            { range: 'Over $1M', min: 1000000, max: Infinity }
        ];

        const analysis = priceRanges.map(range => {
            const count = properties.filter(p => p.price >= range.min && p.price < range.max).length;
            const percentage = properties.length > 0 ? ((count / properties.length) * 100).toFixed(1) : 0;
            return {
                'Price Range': range.range,
                'Count': count,
                'Percentage': `${percentage}%`
            };
        });

        // Add additional analysis
        const avgDaysOnMarket = properties.reduce((sum, p) => {
            return sum + Math.floor((new Date() - new Date(p.listDate)) / (1000 * 60 * 60 * 24));
        }, 0) / properties.length;

        analysis.push(
            { 'Price Range': '', 'Count': '', 'Percentage': '' },
            { 'Price Range': 'Average Days on Market', 'Count': Math.round(avgDaysOnMarket), 'Percentage': 'days' },
            { 'Price Range': 'Properties with Pool', 'Count': properties.filter(p => p.pool).length, 'Percentage': `${((properties.filter(p => p.pool).length / properties.length) * 100).toFixed(1)}%` },
            { 'Price Range': 'Properties with Garage', 'Count': properties.filter(p => p.garage > 0).length, 'Percentage': `${((properties.filter(p => p.garage > 0).length / properties.length) * 100).toFixed(1)}%` }
        );

        return analysis;
    }

    setupLocationAutocomplete(input) {
        const suggestionsContainer = document.getElementById('locationSuggestions');
        let currentSuggestions = [];
        this.selectedIndex = -1;

        // Comprehensive list of US cities and states
        const locations = [
            // Major Cities
            'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
            'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
            'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
            'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Washington, DC',
            'Boston, MA', 'El Paso, TX', 'Detroit, MI', 'Portland, OR', 'Las Vegas, NV',
            'Milwaukee, WI', 'Albuquerque, NM', 'Tucson, AZ', 'Fresno, CA', 'Sacramento, CA',
            'Mesa, AZ', 'Kansas City, MO', 'Atlanta, GA', 'Long Beach, CA', 'Colorado Springs, CO',
            'Raleigh, NC', 'Miami, FL', 'Virginia Beach, VA', 'Omaha, NE', 'Oakland, CA',
            'Minneapolis, MN', 'Tulsa, OK', 'Arlington, TX', 'Tampa, FL', 'New Orleans, LA',
            'Wichita, KS', 'Bakersfield, CA', 'Cleveland, OH', 'Aurora, CO', 'Anaheim, CA',
            'Honolulu, HI', 'Santa Ana, CA', 'Corpus Christi, TX', 'Riverside, CA', 'Lexington, KY',
            'Stockton, CA', 'Toledo, OH', 'St. Paul, MN', 'Newark, NJ', 'Greensboro, NC',
            'Plano, TX', 'Henderson, NV', 'Lincoln, NE', 'Buffalo, NY', 'Jersey City, NJ',
            'Chula Vista, CA', 'Fort Wayne, IN', 'Orlando, FL', 'St. Petersburg, FL', 'Chandler, AZ',
            'Laredo, TX', 'Norfolk, VA', 'Durham, NC', 'Madison, WI', 'Lubbock, TX',
            'Irvine, CA', 'Winston Salem, NC', 'Glendale, AZ', 'Garland, TX', 'Hialeah, FL',
            'Reno, NV', 'Chesapeake, VA', 'Gilbert, AZ', 'Baton Rouge, LA', 'Irving, TX',
            'Scottsdale, AZ', 'North Las Vegas, NV', 'Fremont, CA', 'Boise, ID', 'Richmond, VA',
            'San Bernardino, CA', 'Birmingham, AL', 'Spokane, WA', 'Rochester, NY', 'Des Moines, IA',
            'Modesto, CA', 'Fayetteville, NC', 'Tacoma, WA', 'Oxnard, CA', 'Fontana, CA',
            'Columbus, GA', 'Montgomery, AL', 'Moreno Valley, CA', 'Shreveport, LA', 'Aurora, IL',
            'Yonkers, NY', 'Akron, OH', 'Huntington Beach, CA', 'Glendale, CA', 'Grand Rapids, MI',
            'Salt Lake City, UT', 'Tallahassee, FL', 'Huntsville, AL', 'Grand Prairie, TX',
            'Worcester, MA', 'Newport News, VA', 'Brownsville, TX', 'Overland Park, KS',
            'Santa Clarita, CA', 'Providence, RI', 'Garden Grove, CA', 'Oceanside, CA',
            'Jackson, MS', 'Fort Lauderdale, FL', 'Santa Rosa, CA', 'Rancho Cucamonga, CA',
            'Port St. Lucie, FL', 'Tempe, AZ', 'Ontario, CA', 'Vancouver, WA', 'Sioux Falls, SD',
            'Springfield, MO', 'Peoria, IL', 'Pembroke Pines, FL', 'Elk Grove, CA', 'Rockford, IL',
            'Palmdale, CA', 'Corona, CA', 'Salinas, CA', 'Pomona, CA', 'Pasadena, TX',
            'Joliet, IL', 'Paterson, NJ', 'Torrance, CA', 'Bridgeport, CT', 'Hayward, CA',
            'Sunnyvale, CA', 'Escondido, CA', 'Lakewood, CO', 'Hollywood, FL', 'Fort Collins, CO',
            'Hampton, VA', 'Thousand Oaks, CA', 'West Valley City, UT', 'Boulder, CO', 'West Covina, CA',
            'Ventura, CA', 'Elgin, IL', 'Richardson, TX', 'Downey, CA', 'Costa Mesa, CA',
            'Miami Gardens, FL', 'Carlsbad, CA', 'Westminster, CO', 'Santa Clara, CA', 'Clearwater, FL',
            'Pearland, TX', 'Concord, CA', 'Topeka, KS', 'Simi Valley, CA', 'Olathe, KS',
            'Thornton, CO', 'Carrollton, TX', 'Midland, TX', 'West Palm Beach, FL', 'Cedar Rapids, IA',
            'Elizabeth, NJ', 'Round Rock, TX', 'Columbia, SC', 'Sterling Heights, MI', 'Kent, WA',
            'Fargo, ND', 'Clarksville, TN', 'Palm Bay, FL', 'Pompano Beach, FL', 'Lancaster, CA',
            'Chico, CA', 'Savannah, GA', 'Mesquite, TX', 'Rocky Mount, NC', 'Westminster, CA',
            'Daly City, CA', 'Santa Monica, CA', 'Burbank, CA', 'Pasadena, CA', 'Allen, TX',
            'High Point, NC', 'Nashville, TN', 'Memphis, TN', 'Knoxville, TN', 'Chattanooga, TN',
            'Murfreesboro, TN', 'Franklin, TN', 'Jackson, TN', 'Johnson City, TN', 'Kingsport, TN',
            'Clarksville, TN', 'Smyrna, TN', 'Brentwood, TN', 'Bartlett, TN', 'Hendersonville, TN'
        ];

        input.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (query.length < 1) {
                this.hideSuggestions();
                return;
            }

            // Filter locations based on query
            currentSuggestions = locations.filter(location => 
                location.toLowerCase().includes(query)
            ).slice(0, 8); // Limit to 8 suggestions

            // Always show suggestions if there are any matches
            if (currentSuggestions.length > 0) {
                this.showSuggestions(currentSuggestions);
            } else {
                // If no matches, hide suggestions but allow free text input
                this.hideSuggestions();
            }
        });

        input.addEventListener('keydown', (e) => {
            if (!suggestionsContainer.classList.contains('hidden')) {
                switch (e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        this.selectedIndex = Math.min(this.selectedIndex + 1, currentSuggestions.length - 1);
                        this.updateSelection();
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                        this.updateSelection();
                        break;
                    case 'Enter':
                        e.preventDefault();
                        if (this.selectedIndex >= 0 && currentSuggestions[this.selectedIndex]) {
                            input.value = currentSuggestions[this.selectedIndex];
                            this.hideSuggestions();
                        }
                        break;
                    case 'Escape':
                        this.hideSuggestions();
                        break;
                }
            }
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                this.hideSuggestions();
            }
        });
    }

    showSuggestions(suggestions) {
        const suggestionsContainer = document.getElementById('locationSuggestions');
        
        if (suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        const html = suggestions.map((suggestion, index) => `
            <div class="suggestion-item px-4 py-3 cursor-pointer hover:bg-opacity-20 hover:bg-blue-500 transition-colors duration-200 flex items-center" 
                 data-index="${index}" style="color: var(--text-primary);">
                <i class="fas fa-map-marker-alt mr-3 text-sm" style="color: var(--accent-primary);"></i>
                <span>${suggestion}</span>
            </div>
        `).join('');

        suggestionsContainer.innerHTML = html;
        suggestionsContainer.classList.remove('hidden');

        // Add click handlers
        suggestionsContainer.querySelectorAll('.suggestion-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                document.getElementById('location').value = suggestions[index];
                this.hideSuggestions();
            });
        });
    }

    updateSelection() {
        const suggestionsContainer = document.getElementById('locationSuggestions');
        const items = suggestionsContainer.querySelectorAll('.suggestion-item');
        
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.style.backgroundColor = 'rgba(99, 102, 241, 0.2)';
            } else {
                item.style.backgroundColor = 'transparent';
            }
        });
    }

    hideSuggestions() {
        const suggestionsContainer = document.getElementById('locationSuggestions');
        suggestionsContainer.classList.add('hidden');
        this.selectedIndex = -1;
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing RealtorHouseFinder...');
    try {
        window.realtorApp = new RealtorHouseFinder();
        console.log('RealtorHouseFinder initialized successfully');
        
        // Add a global test function
        window.testAPI = async (location = 'Nashville, TN') => {
            console.log('Testing API with location:', location);
            try {
                const response = await fetch('/api/search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ location, limit: 3 })
                });
                const data = await response.json();
                console.log('API Response:', data);
                return data;
            } catch (error) {
                console.error('API Test Error:', error);
                return null;
            }
        };
        
        console.log('Test function available: window.testAPI("Miami, FL")');
    } catch (error) {
        console.error('Error initializing RealtorHouseFinder:', error);
    }
});
