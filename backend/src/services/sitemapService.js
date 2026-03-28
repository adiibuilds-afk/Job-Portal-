const axios = require('axios');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

class SitemapService {
    constructor() {
        this.secret = process.env.REVALIDATION_SECRET;
        this.frontendUrl = process.env.WEBSITE_URL || 'https://jobgrid.in';
        this.indexNowKey = 'jobgrid-indexing-2026'; // Custom key for IndexNow (optional)
        
        // Google Indexing API Setup
        const keyFile = path.join(__dirname, '../../google-indexing-service-account.json');
        const userProvidedKeyFile = path.join(__dirname, '../../jobgrid-486609-dea4d0d06531.json');
        
        const finalKeyFile = fs.existsSync(userProvidedKeyFile) ? userProvidedKeyFile : (fs.existsSync(keyFile) ? keyFile : null);

        if (finalKeyFile) {
            const credentials = require(finalKeyFile);
            this.googleClient = new google.auth.JWT(
                credentials.client_email,
                null,
                credentials.private_key,
                ['https://www.googleapis.com/auth/indexing'],
                null
            );
            console.log('✅ Google Indexing API initialized');
        } else {
            console.warn('⚠️ Google Indexing Service Account file missing. Google notifications disabled.');
        }
    }

    /**
     * Trigger all sitemap and search engine notification services
     */
    async notifyNewJob(job) {
        if (!job || !job.slug) return;
        
        const jobUrl = `${this.frontendUrl}/job/${job.slug}`;
        console.log(`🚀 [SitemapService] Notifying search engines for: ${jobUrl}`);

        const results = await Promise.allSettled([
            this.triggerFrontendRevalidation(),
            this.notifyIndexNow(jobUrl),
            this.notifyGoogleIndexing(jobUrl)
        ]);

        results.forEach((res, i) => {
            if (res.status === 'rejected') {
                console.error(`❌ [SitemapService] Step ${i} failed:`, res.reason.message);
            }
        });
    }

    /**
     * 1. Trigger Next.js On-Demand Revalidation
     */
    async triggerFrontendRevalidation() {
        try {
            const endpoint = `${this.frontendUrl}/api/revalidate-sitemap`;
            // Note: In development, this might need http://localhost:3000
            const url = process.env.NODE_ENV === 'production' ? endpoint : 'http://localhost:3000/api/revalidate-sitemap';
            
            const response = await axios.post(url, {
                secret: this.secret
            });
            console.log('✅ [SitemapService] Frontend revalidated:', response.data.message);
        } catch (error) {
            console.error('❌ [SitemapService] Frontend revalidation failed:', error.response?.data?.message || error.message);
        }
    }

    /**
     * 2. Notify IndexNow (Bing / Yandex)
     */
    async notifyIndexNow(url) {
        try {
            // IndexNow API Endpoint (Bing)
            const indexNowUrl = 'https://api.indexnow.org/indexnow';
            const host = new URL(this.frontendUrl).hostname;

            await axios.post(indexNowUrl, {
                host: host,
                key: this.indexNowKey,
                keyLocation: `${this.frontendUrl}/${this.indexNowKey}.txt`, // Optional proof
                urlList: [url]
            });
            console.log('✅ [SitemapService] IndexNow notification sent (Bing/Yandex)');
        } catch (error) {
            console.error('❌ [SitemapService] IndexNow failed:', error.message);
        }
    }

    /**
     * 3. Notify Google Indexing API
     */
    async notifyGoogleIndexing(url) {
        if (!this.googleClient) return;

        try {
            const indexer = google.indexing({
                version: 'v3',
                auth: this.googleClient
            });

            const res = await indexer.urlNotifications.publish({
                requestBody: {
                    url: url,
                    type: 'URL_UPDATED'
                }
            });

            console.log('✅ [SitemapService] Google Indexing API notification sent');
            return res.data;
        } catch (error) {
            console.error('❌ [SitemapService] Google Indexing failed:', error.message);
            if (error.message.includes('Permission denied')) {
                console.warn('💡 Tip: Ensure the service account email is added as an Owner in Google Search Console.');
            }
        }
    }
}

module.exports = new SitemapService();
