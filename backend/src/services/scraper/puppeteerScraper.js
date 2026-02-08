let puppeteer;
try {
    puppeteer = require('puppeteer');
} catch (e) {
    console.log('[Puppeteer] Module not found (Production Mode detected). Skipping Puppeteer initialization.');
    puppeteer = null;
}

const scrapeJobPageWithPuppeteer = async (url) => {
    if (!puppeteer) {
        console.warn('[Puppeteer] Skipping scrape - Puppeteer is not installed in this environment.');
        return { success: false, error: 'Puppeteer not installed (Production Mode)' };
    }

    console.log(`[Puppeteer] Starting scrape for: ${url}`);
    
    // Launch options optimized for server environment
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu'
        ]
    });
    
    try {
        const page = await browser.newPage();
        
        // Block unnecessary resources to speed up loading
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const resourceType = req.resourceType();
            if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
                req.abort();
            } else {
                req.continue();
            }
        });

        // Set realistic User Agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Navigate
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        
        // Wait for CSR - essential for Next.js sites like Talentd
        try {
            await page.waitForNetworkIdle({ timeout: 5000 }).catch(() => {});
        } catch (e) {}

        // Small extra delay for image/skeleton resolution
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 1. Extract Basic Details
        const data = await page.evaluate(() => {
            const h1 = document.querySelector('h1')?.innerText || '';
            const bodyText = document.body.innerText || '';
            const description = document.querySelector('article') ? document.querySelector('article').innerText : 
                               (document.querySelector('main') ? document.querySelector('main').innerText : bodyText.substring(0, 5000));
            
            // Logo Extraction
            let logo = '';
            const images = Array.from(document.querySelectorAll('img'));
            
            // Priority 1: specific path for company logos
            let logoImg = images.find(img => img.src && img.src.includes('company_logos'));
            
            // Priority 2: "logo" in alt but not "Talentd"
            if (!logoImg) {
                logoImg = images.find(img => 
                    img.alt && 
                    img.alt.toLowerCase().includes('logo') && 
                    !img.alt.toLowerCase().includes('talentd') &&
                    !img.src.includes('talentd')
                );
            }
            
            if (logoImg) logo = logoImg.src;

            // Company Name Extraction
            let company = 'Company';
            
            // Try 1: Meta tags
            const metaCompany = document.querySelector('meta[property="og:site_name"]')?.content;
            if (metaCompany && !metaCompany.includes('Talentd')) company = metaCompany;

            // Try 2: Parse Title (Common format: "Role at Company" or "Role - Company")
            if (company === 'Company') {
                const titleParts = h1.split(' at ');
                if (titleParts.length > 1) {
                    company = titleParts[1].split(' | ')[0].split(' - ')[0].trim();
                }
            }

            // 3. Extract Tags (Key Skills)
            let tags = [];
            const skillsHeader = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.trim() === 'Key Skills');
            if (skillsHeader) {
                const skillsContainer = skillsHeader.nextElementSibling;
                if (skillsContainer) {
                    tags = Array.from(skillsContainer.querySelectorAll('span'))
                        .map(s => s.textContent.trim())
                        .filter(Boolean);
                }
            }

            // 4. Extract Batch
            let batch = [];
            const batchHeader = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.trim() === 'Eligible Batch Years');
            if (batchHeader) {
                const batchContainer = batchHeader.nextElementSibling;
                if (batchContainer) {
                    const batchText = batchContainer.textContent.trim();
                    batch = batchText.split(',').map(b => b.trim()).filter(Boolean);
                }
            }

            return { title: h1, content: description, companyLogo: logo, company, tags, batch };
        });

        // 2. Find and Click "Apply Now"
        // This is the critical part for Talentd
        console.log('[Puppeteer] Looking for "Apply Now" button...');
        
        const newTargetPromise = new Promise(resolve => browser.once('targetcreated', resolve));

        const clicked = await page.evaluate(() => {
            // Helper to get visible text
            const getText = (el) => el.innerText || el.textContent || '';
            
            const allButtons = Array.from(document.querySelectorAll('button, a'));
            
            const applyBtn = allButtons.find(b => {
                const text = getText(b).trim().toLowerCase();
                return text === 'apply now' && !b.closest('.ad-container');
            });

            if (applyBtn) {
                console.log('[Puppeteer Browser] Found Apply Button:', applyBtn.outerHTML);
                applyBtn.click();
                return true;
            }
            return false;
        });

        let finalApplyUrl = '';

        if (clicked) {
            console.log('[Puppeteer] Clicked "Apply Now", waiting for target...');
            try {
                const newTarget = await newTargetPromise;
                const newPage = await newTarget.page();
                
                if (newPage) {
                    await newPage.waitForNetworkIdle({ timeout: 10000 }).catch(() => {});
                    finalApplyUrl = newPage.url();
                    console.log(`🔗 CAPTURED APPLY LINK: ${finalApplyUrl}`);
                }
            } catch (e) {
                console.error('[Puppeteer] Error handling new tab:', e.message);
            }
        } else {
            console.log('[Puppeteer] No "Apply Now" button found to click.');
        }

        // Check for expiry keywords in Puppeteer content too
        const expiredKeywords = [
            'job expired', 
            'this job is closed', 
            'job is no longer available', 
            'position has been filled', 
            'applications are closed',
            'no longer accepting applications',
            'posting is closed',
            'page not found',
            '404',
            'looks like it’s time to explore',
            'we can\'t find that page'
        ];
        
        const lowerTitle = data.title.toLowerCase();
        const lowerContent = data.content.toLowerCase();
        
        if (expiredKeywords.some(k => lowerTitle.includes(k) || lowerContent.includes(k))) {
             console.log(`[Puppeteer] Skipping ${url} - Job appears to be expired/closed.`);
             return { success: false, error: 'Job is expired or closed', skipped: true };
        }

        return {
            success: true,
            title: data.title,
            content: data.content,
            companyLogo: data.companyLogo,
            company: data.company,
            tags: data.tags,
            batch: data.batch,
            applyUrl: finalApplyUrl || url, // Fallback to original if capture fails
            sourceUrl: url,
            isPuppeteer: true
        };

    } catch (error) {
        console.error('[Puppeteer] Error:', error.message);
        if (error.message.includes('Could not find Chrome')) {
            console.error('   💡 TIP: Ensure "npx puppeteer browsers install chrome" is in your build script.');
            console.error('   💡 TIP: On Render, you may need to set PUPPETEER_CACHE_DIR environment variable.');
        }
        return { success: false, error: error.message };
    } finally {
        await browser.close();
    }
};

module.exports = { scrapeJobPageWithPuppeteer };
