const cron = require('node-cron');
const excelService = require('./excelService');
const realEstateAPI = require('./realEstateAPI');

class CronService {
    constructor() {
        this.jobs = new Map();
    }

    startWeeklyExport() {
        // Run every Monday at 9:00 AM
        const weeklyJob = cron.schedule('0 9 * * 1', async () => {
            try {
                console.log('🔄 Starting weekly realtor listings export...');
                
                const locations = [
                    'New York, NY',
                    'Los Angeles, CA',
                    'Chicago, IL',
                    'Houston, TX',
                    'Phoenix, AZ'
                ];

                for (const location of locations) {
                    try {
                        console.log(`📊 Generating report for ${location}...`);
                        await excelService.createWeeklyReport(location);
                    } catch (error) {
                        console.error(`❌ Error generating report for ${location}:`, error.message);
                    }
                }

                console.log('✅ Weekly export completed successfully');
            } catch (error) {
                console.error('❌ Weekly export failed:', error);
            }
        }, {
            scheduled: false,
            timezone: "America/New_York"
        });

        this.jobs.set('weekly-export', weeklyJob);
        weeklyJob.start();
        
        console.log('⏰ Weekly export cron job scheduled for Mondays at 9:00 AM');
    }

    startDailyExport() {
        // Run every day at 6:00 PM
        const dailyJob = cron.schedule('0 18 * * *', async () => {
            try {
                console.log('🔄 Starting daily realtor listings export...');
                
                const location = process.env.DEFAULT_LOCATION || 'New York, NY';
                await excelService.createWeeklyReport(location);
                
                console.log('✅ Daily export completed successfully');
            } catch (error) {
                console.error('❌ Daily export failed:', error);
            }
        }, {
            scheduled: false,
            timezone: "America/New_York"
        });

        this.jobs.set('daily-export', dailyJob);
        dailyJob.start();
        
        console.log('⏰ Daily export cron job scheduled for 6:00 PM');
    }

    startCustomSchedule(schedule, location = 'New York, NY') {
        const jobId = `custom-${Date.now()}`;
        
        const customJob = cron.schedule(schedule, async () => {
            try {
                console.log(`🔄 Starting custom export for ${location}...`);
                await excelService.createWeeklyReport(location);
                console.log('✅ Custom export completed successfully');
            } catch (error) {
                console.error('❌ Custom export failed:', error);
            }
        }, {
            scheduled: false,
            timezone: "America/New_York"
        });

        this.jobs.set(jobId, customJob);
        customJob.start();
        
        console.log(`⏰ Custom export cron job scheduled: ${schedule}`);
        return jobId;
    }

    stopJob(jobId) {
        const job = this.jobs.get(jobId);
        if (job) {
            job.stop();
            this.jobs.delete(jobId);
            console.log(`⏹️ Stopped job: ${jobId}`);
            return true;
        }
        return false;
    }

    stopAllJobs() {
        this.jobs.forEach((job, jobId) => {
            job.stop();
            console.log(`⏹️ Stopped job: ${jobId}`);
        });
        this.jobs.clear();
    }

    getActiveJobs() {
        const activeJobs = [];
        this.jobs.forEach((job, jobId) => {
            activeJobs.push({
                id: jobId,
                running: job.running,
                scheduled: job.scheduled
            });
        });
        return activeJobs;
    }

    // Manual trigger for testing
    async triggerWeeklyExport() {
        try {
            console.log('🔄 Manually triggering weekly export...');
            await excelService.createWeeklyReport();
            console.log('✅ Manual weekly export completed');
        } catch (error) {
            console.error('❌ Manual weekly export failed:', error);
            throw error;
        }
    }
}

module.exports = new CronService();


