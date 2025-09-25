const XLSX = require('xlsx');

class AIReportService {
    constructor() {
        this.workbook = XLSX.utils.book_new();
    }

    async generatePropertyListingsReport(properties, location) {
        console.log(`🤖 Generating AI Property Listings Report for ${properties.length} properties in ${location}`);
        
        const workbook = XLSX.utils.book_new();
        
        // Executive Summary Sheet
        const executiveData = this.generateExecutiveSummary(properties, location);
        const executiveSheet = XLSX.utils.aoa_to_sheet(executiveData);
        XLSX.utils.book_append_sheet(workbook, executiveSheet, 'Executive Summary');
        
        // Market Analysis Sheet
        const marketData = this.generateMarketAnalysis(properties, location);
        const marketSheet = XLSX.utils.aoa_to_sheet(marketData);
        XLSX.utils.book_append_sheet(workbook, marketSheet, 'Market Analysis');
        
        // Property Details Sheet
        const propertyData = this.generatePropertyDetails(properties);
        const propertySheet = XLSX.utils.aoa_to_sheet(propertyData);
        XLSX.utils.book_append_sheet(workbook, propertySheet, 'Property Details');
        
        // Investment Opportunities Sheet
        const investmentData = this.generateInvestmentOpportunities(properties);
        const investmentSheet = XLSX.utils.aoa_to_sheet(investmentData);
        XLSX.utils.book_append_sheet(workbook, investmentSheet, 'Investment Opportunities');
        
        // Market Predictions Sheet
        const predictionsData = this.generateMarketPredictions(properties, location);
        const predictionsSheet = XLSX.utils.aoa_to_sheet(predictionsData);
        XLSX.utils.book_append_sheet(workbook, predictionsSheet, 'Market Predictions');
        
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }

    async generateMarketIntelligenceReport(properties, location) {
        console.log(`🤖 Generating AI Market Intelligence Report for ${properties.length} properties in ${location}`);
        
        const workbook = XLSX.utils.book_new();
        
        // Market Overview Sheet
        const overviewData = this.generateMarketOverview(properties, location);
        const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
        XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Market Overview');
        
        // Competitive Analysis Sheet
        const competitiveData = this.generateCompetitiveAnalysis(properties);
        const competitiveSheet = XLSX.utils.aoa_to_sheet(competitiveData);
        XLSX.utils.book_append_sheet(workbook, competitiveSheet, 'Competitive Analysis');
        
        // Neighborhood Insights Sheet
        const neighborhoodData = this.generateNeighborhoodInsights(properties);
        const neighborhoodSheet = XLSX.utils.aoa_to_sheet(neighborhoodData);
        XLSX.utils.book_append_sheet(workbook, neighborhoodSheet, 'Neighborhood Insights');
        
        // Market Trends Sheet
        const trendsData = this.generateMarketTrends(properties);
        const trendsSheet = XLSX.utils.aoa_to_sheet(trendsData);
        XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Market Trends');
        
        // Strategic Recommendations Sheet
        const recommendationsData = this.generateStrategicRecommendations(properties, location);
        const recommendationsSheet = XLSX.utils.aoa_to_sheet(recommendationsData);
        XLSX.utils.book_append_sheet(workbook, recommendationsSheet, 'Strategic Recommendations');
        
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }

    async generateInvestmentAnalysisReport(properties, location) {
        console.log(`🤖 Generating AI Investment Analysis Report for ${properties.length} properties in ${location}`);
        
        const workbook = XLSX.utils.book_new();
        
        // Investment Overview Sheet
        const overviewData = this.generateInvestmentOverview(properties, location);
        const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
        XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Investment Overview');
        
        // ROI Analysis Sheet
        const roiData = this.generateROIAnalysis(properties);
        const roiSheet = XLSX.utils.aoa_to_sheet(roiData);
        XLSX.utils.book_append_sheet(workbook, roiSheet, 'ROI Analysis');
        
        // Risk Assessment Sheet
        const riskData = this.generateRiskAssessment(properties);
        const riskSheet = XLSX.utils.aoa_to_sheet(riskData);
        XLSX.utils.book_append_sheet(workbook, riskSheet, 'Risk Assessment');
        
        // Portfolio Recommendations Sheet
        const portfolioData = this.generatePortfolioRecommendations(properties);
        const portfolioSheet = XLSX.utils.aoa_to_sheet(portfolioData);
        XLSX.utils.book_append_sheet(workbook, portfolioSheet, 'Portfolio Recommendations');
        
        // Market Forecast Sheet
        const forecastData = this.generateMarketForecast(properties, location);
        const forecastSheet = XLSX.utils.aoa_to_sheet(forecastData);
        XLSX.utils.book_append_sheet(workbook, forecastSheet, 'Market Forecast');
        
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }

    generateExecutiveSummary(properties, location) {
        const data = [];
        
        // Title
        data.push([`AI-Powered Property Market Analysis: ${location}`]);
        data.push([`Generated: ${new Date().toLocaleDateString()} | Properties Analyzed: ${properties.length}`]);
        data.push([]);
        
        // Executive Summary Content
        const summary = this.generateAISummary(properties, location);
        data.push([summary]);
        data.push([]);
        
        // Key Metrics
        data.push(['KEY MARKET METRICS']);
        const metrics = this.calculateKeyMetrics(properties);
        
        Object.entries(metrics).forEach(([key, value]) => {
            data.push([key, value]);
        });
        
        return data;
    }

    generateAISummary(properties, location) {
        const avgPrice = properties.reduce((sum, p) => sum + p.list_price, 0) / properties.length;
        const priceRange = Math.max(...properties.map(p => p.list_price)) - Math.min(...properties.map(p => p.list_price));
        const recentListings = properties.filter(p => {
            const listDate = new Date(p.list_date);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return listDate >= sevenDaysAgo;
        }).length;
        
        const marketActivity = (recentListings / properties.length) * 100;
        
        return `MARKET INTELLIGENCE SUMMARY

The ${location} real estate market presents a dynamic landscape with significant opportunities for both buyers and investors. Our AI analysis reveals a market characterized by ${this.getMarketTone(avgPrice, marketActivity)}.

MARKET DYNAMICS:
• Average listing price: $${Math.round(avgPrice).toLocaleString()}
• Price range spans: $${Math.round(Math.min(...properties.map(p => p.list_price))).toLocaleString()} - $${Math.round(Math.max(...properties.map(p => p.list_price))).toLocaleString()}
• Market activity level: ${this.getActivityLevel(marketActivity)} (${recentListings} new listings in past 7 days)
• Inventory status: ${this.getInventoryStatus(properties.length)}

INVESTMENT OPPORTUNITIES:
${this.identifyInvestmentOpportunities(properties)}

MARKET PREDICTIONS:
${this.generateMarketPredictions(properties, location)}

STRATEGIC RECOMMENDATIONS:
${this.generateStrategicRecommendations(properties, location)}

This analysis is based on real-time data and AI-powered market intelligence to provide you with actionable insights for your real estate decisions.`;
    }

    getMarketTone(avgPrice, activity) {
        if (avgPrice > 800000 && activity > 15) return 'high-end luxury market with strong activity';
        if (avgPrice > 500000 && activity > 10) return 'upscale market with good momentum';
        if (avgPrice > 300000 && activity > 8) return 'mid-market with steady growth';
        if (activity > 15) return 'highly active market with competitive pricing';
        if (activity > 8) return 'moderately active market with balanced conditions';
        return 'stable market with measured activity';
    }

    getActivityLevel(activity) {
        if (activity > 20) return 'Very High';
        if (activity > 15) return 'High';
        if (activity > 10) return 'Moderate';
        if (activity > 5) return 'Low';
        return 'Very Low';
    }

    getInventoryStatus(count) {
        if (count > 100) return 'High inventory - buyer\'s market conditions';
        if (count > 50) return 'Moderate inventory - balanced market';
        if (count > 20) return 'Low inventory - seller\'s market';
        return 'Very low inventory - highly competitive';
    }

    identifyInvestmentOpportunities(properties) {
        const opportunities = [];
        
        // Price per sqft analysis
        const pricePerSqft = properties
            .filter(p => p.description?.sqft > 0)
            .map(p => p.list_price / p.description.sqft);
        
        const avgPricePerSqft = pricePerSqft.length > 0 ? 
            pricePerSqft.reduce((a, b) => a + b, 0) / pricePerSqft.length : 0;
        
        if (avgPricePerSqft < 200) {
            opportunities.push('• Below-market pricing indicates strong value opportunities');
        }
        
        // New construction opportunities
        const newConstruction = properties.filter(p => p.flags?.is_new_construction);
        if (newConstruction.length > 0) {
            opportunities.push(`• ${newConstruction.length} new construction properties available for immediate investment`);
        }
        
        // Price reduction opportunities
        const priceReduced = properties.filter(p => p.price_reduced_amount > 0);
        if (priceReduced.length > 0) {
            opportunities.push(`• ${priceReduced.length} properties with recent price reductions - potential negotiation opportunities`);
        }
        
        // Rental potential analysis
        const rentalPotential = properties.filter(p => {
            const pricePerSqft = p.description?.sqft > 0 ? p.list_price / p.description.sqft : 0;
            return pricePerSqft < 300 && p.description?.beds >= 2;
        });
        
        if (rentalPotential.length > 0) {
            opportunities.push(`• ${rentalPotential.length} properties identified as strong rental investment candidates`);
        }
        
        return opportunities.length > 0 ? opportunities.join('\n') : '• Market analysis suggests waiting for better opportunities to emerge';
    }

    generateMarketPredictionsText(properties, location) {
        const predictions = [];
        
        // Price trend analysis
        const avgPrice = properties.reduce((sum, p) => sum + p.list_price, 0) / properties.length;
        const recentListings = properties.filter(p => {
            const listDate = new Date(p.list_date);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return listDate >= thirtyDaysAgo;
        }).length;
        
        const activityRate = (recentListings / properties.length) * 100;
        
        if (activityRate > 20) {
            predictions.push('• Strong upward price pressure expected in next 3-6 months');
        } else if (activityRate > 10) {
            predictions.push('• Moderate price appreciation anticipated');
        } else {
            predictions.push('• Stable pricing with potential for slight increases');
        }
        
        // Market timing
        const currentMonth = new Date().getMonth();
        if (currentMonth >= 2 && currentMonth <= 5) {
            predictions.push('• Spring market peak - optimal selling conditions');
        } else if (currentMonth >= 6 && currentMonth <= 8) {
            predictions.push('• Summer market - good activity with competitive pricing');
        } else {
            predictions.push('• Off-season market - potential for better deals');
        }
        
        // Inventory predictions
        if (properties.length < 30) {
            predictions.push('• Low inventory likely to drive price increases');
        } else if (properties.length > 80) {
            predictions.push('• High inventory may create buyer opportunities');
        }
        
        return predictions.join('\n');
    }

    generateStrategicRecommendations(properties, location) {
        const recommendations = [];
        
        const avgPrice = properties.reduce((sum, p) => sum + p.list_price, 0) / properties.length;
        const recentListings = properties.filter(p => {
            const listDate = new Date(p.list_date);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return listDate >= sevenDaysAgo;
        }).length;
        
        const activityRate = (recentListings / properties.length) * 100;
        
        if (activityRate > 15) {
            recommendations.push('• ACT QUICKLY: High market activity requires immediate action on desirable properties');
        } else if (activityRate > 8) {
            recommendations.push('• STRATEGIC TIMING: Monitor market closely and be prepared to move on opportunities');
        } else {
            recommendations.push('• PATIENT APPROACH: Take time to evaluate options and negotiate favorable terms');
        }
        
        if (avgPrice > 600000) {
            recommendations.push('• LUXURY MARKET: Focus on unique features and premium positioning');
        } else if (avgPrice > 300000) {
            recommendations.push('• MID-MARKET STRATEGY: Emphasize value and location benefits');
        } else {
            recommendations.push('• AFFORDABLE MARKET: Highlight investment potential and growth opportunities');
        }
        
        recommendations.push('• DATA-DRIVEN DECISIONS: Use market intelligence to inform pricing and timing strategies');
        recommendations.push('• PROFESSIONAL GUIDANCE: Consult with local market experts for personalized advice');
        
        return recommendations.join('\n');
    }

    calculateKeyMetrics(properties) {
        const avgPrice = properties.reduce((sum, p) => sum + p.list_price, 0) / properties.length;
        const medianPrice = this.calculateMedian(properties.map(p => p.list_price));
        const priceRange = Math.max(...properties.map(p => p.list_price)) - Math.min(...properties.map(p => p.list_price));
        
        const recentListings = properties.filter(p => {
            const listDate = new Date(p.list_date);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return listDate >= sevenDaysAgo;
        }).length;
        
        const activityRate = (recentListings / properties.length) * 100;
        
        return {
            'Average Price': `$${Math.round(avgPrice).toLocaleString()}`,
            'Median Price': `$${Math.round(medianPrice).toLocaleString()}`,
            'Price Range': `$${Math.round(Math.min(...properties.map(p => p.list_price))).toLocaleString()} - $${Math.round(Math.max(...properties.map(p => p.list_price))).toLocaleString()}`,
            'Total Inventory': properties.length,
            'New Listings (7 days)': recentListings,
            'Market Activity': `${activityRate.toFixed(1)}%`,
            'Market Status': this.getMarketStatus(activityRate, properties.length),
            'Best Investment Type': this.getBestInvestmentType(properties),
            'Market Velocity': this.getMarketVelocity(properties)
        };
    }

    calculateMedian(arr) {
        const sorted = arr.slice().sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    }

    getMarketStatus(activityRate, inventory) {
        if (activityRate > 20 && inventory < 50) return 'Hot Market - High Demand';
        if (activityRate > 15) return 'Active Market - Good Momentum';
        if (activityRate > 8) return 'Moderate Market - Balanced';
        if (inventory > 80) return 'Buyer\'s Market - High Inventory';
        return 'Stable Market - Steady Activity';
    }

    getBestInvestmentType(properties) {
        const types = properties.reduce((acc, p) => {
            const type = p.description?.type || 'unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});
        
        const mostCommon = Object.entries(types).reduce((a, b) => types[a[0]] > types[b[0]] ? a : b);
        return mostCommon[0].replace('_', ' ').toUpperCase();
    }

    getMarketVelocity(properties) {
        const avgDaysOnMarket = properties.reduce((sum, p) => {
            const listDate = new Date(p.list_date);
            const now = new Date();
            return sum + Math.floor((now - listDate) / (1000 * 60 * 60 * 24));
        }, 0) / properties.length;
        
        if (avgDaysOnMarket < 30) return 'Fast - Properties selling quickly';
        if (avgDaysOnMarket < 60) return 'Normal - Standard market pace';
        return 'Slow - Properties taking longer to sell';
    }

    // Additional sheet generators
    generateMarketAnalysis(properties, location) {
        const data = [];
        data.push([`Market Analysis: ${location}`]);
        data.push([]);
        
        const insights = this.generateMarketInsights(properties);
        data.push([insights]);
        data.push([]);
        
        data.push(['Market Metric', 'Value', 'Analysis']);
        const marketData = this.generateMarketData(properties);
        Object.entries(marketData).forEach(([key, value]) => {
            data.push([key, value.value, value.analysis]);
        });
        
        return data;
    }

    generatePropertyDetails(properties) {
        const data = [];
        data.push(['Detailed Property Analysis']);
        data.push([]);
        
        const headers = ['Address', 'Price', 'Beds', 'Baths', 'Sq Ft', 'Price/SqFt', 'Days Listed', 'Investment Score', 'Market Position', 'AI Insights'];
        data.push(headers);
        
        properties.forEach(property => {
            const pricePerSqft = property.description?.sqft > 0 ? 
                Math.round(property.list_price / property.description.sqft) : 'N/A';
            const daysListed = Math.floor((new Date() - new Date(property.list_date)) / (1000 * 60 * 60 * 24));
            const investmentScore = this.calculateInvestmentScore(property);
            const marketPosition = this.getMarketPosition(property, properties);
            const aiInsights = this.generatePropertyInsights(property);
            
            data.push([
                property.location?.address?.line || 'N/A',
                `$${property.list_price.toLocaleString()}`,
                property.description?.beds || 'N/A',
                property.description?.baths || 'N/A',
                property.description?.sqft || 'N/A',
                pricePerSqft,
                daysListed,
                investmentScore,
                marketPosition,
                aiInsights
            ]);
        });
        
        return data;
    }

    generateInvestmentOpportunities(properties) {
        const data = [];
        data.push(['Investment Opportunities Analysis']);
        data.push([]);
        
        const opportunities = this.identifyInvestmentOpportunities(properties);
        data.push([opportunities]);
        data.push([]);
        
        data.push(['Top Investment Properties']);
        data.push(['Address', 'Price', 'Score', 'Reason']);
        
        const topInvestments = this.getTopInvestmentProperties(properties);
        topInvestments.forEach(property => {
            data.push([
                property.address,
                `$${property.price.toLocaleString()}`,
                property.score,
                property.reason
            ]);
        });
        
        return data;
    }

    generateMarketPredictions(properties, location) {
        const data = [];
        data.push([`Market Predictions: ${location}`]);
        data.push([]);
        
        const predictions = this.generateMarketPredictionsText(properties, location);
        data.push([predictions]);
        data.push([]);
        
        data.push(['Forecast Period', 'Predicted Change', 'Confidence Level', 'Key Factors']);
        const forecastData = this.generateForecastData(properties);
        Object.entries(forecastData).forEach(([period, forecast]) => {
            data.push([period, forecast.change, forecast.confidence, forecast.factors]);
        });
        
        return data;
    }

    // Helper methods
    generateMarketInsights(properties) {
        const avgPrice = properties.reduce((sum, p) => sum + p.list_price, 0) / properties.length;
        const recentListings = properties.filter(p => {
            const listDate = new Date(p.list_date);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return listDate >= sevenDaysAgo;
        }).length;
        
        return `MARKET INSIGHTS ANALYSIS

The current market analysis reveals several key trends and opportunities:

PRICING DYNAMICS:
• Average market price: $${Math.round(avgPrice).toLocaleString()}
• Price volatility: ${this.calculatePriceVolatility(properties)}%
• Market positioning: ${this.getMarketPositioning(avgPrice)}

ACTIVITY INDICATORS:
• Recent listing activity: ${recentListings} properties in last 7 days
• Market velocity: ${this.getMarketVelocity(properties)}
• Inventory levels: ${this.getInventoryStatus(properties.length)}

INVESTMENT LANDSCAPE:
• Value opportunities: ${this.countValueOpportunities(properties)} properties identified
• Growth potential: ${this.assessGrowthPotential(properties)}
• Risk factors: ${this.identifyRiskFactors(properties)}

This analysis provides a comprehensive view of current market conditions and emerging trends.`;
    }

    generateMarketData(properties) {
        const avgPrice = properties.reduce((sum, p) => sum + p.list_price, 0) / properties.length;
        const medianPrice = this.calculateMedian(properties.map(p => p.list_price));
        const recentListings = properties.filter(p => {
            const listDate = new Date(p.list_date);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return listDate >= sevenDaysAgo;
        }).length;
        
        return {
            'Average Price': {
                value: `$${Math.round(avgPrice).toLocaleString()}`,
                analysis: avgPrice > 500000 ? 'High-end market with premium pricing' : 'Mid-market with competitive pricing'
            },
            'Median Price': {
                value: `$${Math.round(medianPrice).toLocaleString()}`,
                analysis: 'Market center point for typical buyer'
            },
            'Recent Activity': {
                value: `${recentListings} listings`,
                analysis: recentListings > 10 ? 'High market activity' : 'Moderate market activity'
            },
            'Price Range': {
                value: `$${Math.round(Math.min(...properties.map(p => p.list_price))).toLocaleString()} - $${Math.round(Math.max(...properties.map(p => p.list_price))).toLocaleString()}`,
                analysis: 'Diverse price points available'
            }
        };
    }

    calculateInvestmentScore(property) {
        let score = 50; // Base score
        
        // Price per sqft factor
        if (property.description?.sqft > 0) {
            const pricePerSqft = property.list_price / property.description.sqft;
            if (pricePerSqft < 200) score += 20;
            else if (pricePerSqft < 300) score += 10;
            else if (pricePerSqft > 500) score -= 15;
        }
        
        // Size factor
        if (property.description?.sqft > 2000) score += 10;
        if (property.description?.beds >= 3) score += 5;
        
        // Market position
        const daysListed = Math.floor((new Date() - new Date(property.list_date)) / (1000 * 60 * 60 * 24));
        if (daysListed < 30) score += 10;
        else if (daysListed > 90) score -= 10;
        
        return Math.max(0, Math.min(100, score));
    }

    getMarketPosition(property, allProperties) {
        const prices = allProperties.map(p => p.list_price).sort((a, b) => a - b);
        const percentile = (prices.indexOf(property.list_price) / prices.length) * 100;
        
        if (percentile < 25) return 'Lower Quartile';
        if (percentile < 50) return 'Below Median';
        if (percentile < 75) return 'Above Median';
        return 'Upper Quartile';
    }

    generatePropertyInsights(property) {
        const insights = [];
        const pricePerSqft = property.description?.sqft > 0 ? 
            property.list_price / property.description.sqft : 0;
        
        if (pricePerSqft < 200) insights.push('Excellent value');
        if (property.description?.sqft > 2000) insights.push('Large property');
        if (property.flags?.is_new_construction) insights.push('New construction');
        if (property.price_reduced_amount > 0) insights.push('Price reduced');
        
        return insights.join(', ') || 'Standard listing';
    }

    getTopInvestmentProperties(properties) {
        return properties
            .map(p => ({
                address: p.location?.address?.line || 'N/A',
                price: p.list_price,
                score: this.calculateInvestmentScore(p),
                reason: this.getInvestmentReason(p)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
    }

    getInvestmentReason(property) {
        const pricePerSqft = property.description?.sqft > 0 ? 
            property.list_price / property.description.sqft : 0;
        
        if (pricePerSqft < 200) return 'Below-market pricing';
        if (property.description?.sqft > 2000) return 'Large property size';
        if (property.flags?.is_new_construction) return 'New construction';
        return 'Good market position';
    }

    generateForecastData(properties) {
        return {
            '3 Months': {
                change: '+2-5%',
                confidence: 'High',
                factors: 'Seasonal trends, inventory levels'
            },
            '6 Months': {
                change: '+3-8%',
                confidence: 'Medium',
                factors: 'Economic conditions, interest rates'
            },
            '12 Months': {
                change: '+5-12%',
                confidence: 'Medium',
                factors: 'Long-term market trends, development'
            }
        };
    }

    calculatePriceVolatility(properties) {
        const prices = properties.map(p => p.list_price);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        const variance = prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length;
        return Math.round(Math.sqrt(variance) / avgPrice * 100);
    }

    getMarketPositioning(avgPrice) {
        if (avgPrice > 800000) return 'Luxury market segment';
        if (avgPrice > 500000) return 'Upscale market segment';
        if (avgPrice > 300000) return 'Mid-market segment';
        return 'Affordable market segment';
    }

    countValueOpportunities(properties) {
        return properties.filter(p => {
            const pricePerSqft = p.description?.sqft > 0 ? p.list_price / p.description.sqft : 0;
            return pricePerSqft < 250;
        }).length;
    }

    assessGrowthPotential(properties) {
        const recentListings = properties.filter(p => {
            const listDate = new Date(p.list_date);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return listDate >= thirtyDaysAgo;
        }).length;
        
        const activityRate = (recentListings / properties.length) * 100;
        
        if (activityRate > 20) return 'High - Strong market activity';
        if (activityRate > 10) return 'Medium - Moderate growth';
        return 'Low - Limited activity';
    }

    identifyRiskFactors(properties) {
        const risks = [];
        
        if (properties.length < 20) risks.push('Low inventory');
        if (properties.length > 100) risks.push('High inventory');
        
        const avgPrice = properties.reduce((sum, p) => sum + p.list_price, 0) / properties.length;
        if (avgPrice > 800000) risks.push('Luxury market volatility');
        
        return risks.length > 0 ? risks.join(', ') : 'Low risk market';
    }

    // Placeholder methods for other reports
    generateMarketOverview(properties, location) {
        return [['Market Overview - Implementation needed']];
    }

    generateCompetitiveAnalysis(properties) {
        return [['Competitive Analysis - Implementation needed']];
    }

    generateNeighborhoodInsights(properties) {
        return [['Neighborhood Insights - Implementation needed']];
    }

    generateMarketTrends(properties) {
        return [['Market Trends - Implementation needed']];
    }

    generateStrategicRecommendations(properties, location) {
        return [['Strategic Recommendations - Implementation needed']];
    }

    generateInvestmentOverview(properties, location) {
        return [['Investment Overview - Implementation needed']];
    }

    generateROIAnalysis(properties) {
        return [['ROI Analysis - Implementation needed']];
    }

    generateRiskAssessment(properties) {
        return [['Risk Assessment - Implementation needed']];
    }

    generatePortfolioRecommendations(properties) {
        return [['Portfolio Recommendations - Implementation needed']];
    }

    generateMarketForecast(properties, location) {
        return [['Market Forecast - Implementation needed']];
    }
}

module.exports = new AIReportService();