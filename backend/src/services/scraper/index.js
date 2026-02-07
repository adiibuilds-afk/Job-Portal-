const axios = require('axios');
const cheerio = require('cheerio');
const scrapeTalentdJobs = require('./talentdScraper');
const scrapeRgJobs = require('./rgJobsScraper');
const scrapeTelegramChannel = require('./telegramScraper');

const scrapeJobPage = async (url) => {
  try {
    // Special handling for RG Jobs API
    if (url.includes('rgjobs.in/job/')) {
        const match = url.match(/job\/(\d+)/);
        if (match && match[1]) {
            const id = match[1];
            try {
                const apiRes = await axios.get(`https://api.rgjobs.in/api/job/${id}`, { 
                    timeout: 10000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                });
                
                if (apiRes.data && (apiRes.data.status === 200 || apiRes.data.id)) {
                    const job = apiRes.data;
                    return {
                        success: true,
                        title: job.title,
                        content: `${job.description || ''}\n\nRoles & Responsibilities:\n${job.rolesAndResponsibilities || ''}\n\nRequirements:\n${job.requirements || ''}`,
                        applyUrl: job.joblink || url,
                        companyLogo: job.image ? (job.image.startsWith('http') ? job.image : `https://api.rgjobs.in/${job.image}`) : '',
                        sourceUrl: url,
                    };
                }
            } catch (apiErr) {
                console.warn(`[Scraper] RG Jobs API failed for ${url}: ${apiErr.message}`);
            }
        }
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    // JSON-LD extraction
    const jsonLdScripts = $('script[type="application/ld+json"]');
    let structuredData = null;
    
    jsonLdScripts.each((i, el) => {
        try {
            const text = $(el).html();
            if (!text) return;
            const data = JSON.parse(text);
            
            const searchJobPosting = (obj) => {
                if (!obj) return null;
                if (obj['@type'] === 'JobPosting') return obj;
                if (Array.isArray(obj)) return obj.find(searchJobPosting);
                if (obj['@graph']) return obj['@graph'].find(searchJobPosting);
                return null;
            };
            const jobPosting = searchJobPosting(data);
            if (jobPosting) {
                structuredData = jobPosting;
                return false; 
            }
        } catch (e) {}
    });

    let logo = structuredData?.hiringOrganization?.logo;
    if (!logo) {
         const logoSelectors = ['img[alt*="logo"]', 'img[src*="logo"]', '.company-logo img', '.employer-logo img', '.logo img', 'img[class*="CompanyLogo"]'];
         for (const sel of logoSelectors) {
             const img = $(sel).first();
             if (img.length) {
                 logo = img.attr('src');
                 if (logo) break;
             }
         }
         if (logo && !logo.startsWith('http')) {
             try {
                logo = new URL(logo, url).href;
             } catch(e) {}
         }
    }

    if (structuredData) {
        return {
            success: true,
            title: structuredData.title,
            content: structuredData.description,
            applyUrl: structuredData.url || url,
            companyLogo: logo || '',
            sourceUrl: url,
        };
    }

    // Fallback scraping
    $('script, style, nav, footer, header, aside, iframe, noscript').remove();
    $('[class*="cookie"], [class*="popup"], [class*="modal"], [class*="newsletter"]').remove();

    let content = '';
    const jobSelectors = ['[class*="job-description"]', '[class*="job-details"]', '[class*="job-content"]', '[class*="career"]', '[id*="job"]', '.description', '.details', 'article', 'main', '.content'];

    for (const selector of jobSelectors) {
      const element = $(selector).first();
      if (element.length && element.text().trim().length > 100) {
        content = element.text().trim();
        break;
      }
    }

    if (!content || content.length < 100) {
      content = $('body').text().trim();
    }

    content = content.replace(/\s+/g, ' ').replace(/\n+/g, '\n').trim().substring(0, 8000);

    const title = $('title').text().trim() || '';
    let applyUrl = ''; 
    const applySelectors = ['a[href*="apply"]', 'a:contains("Apply")', 'a:contains("APPLY")', 'a.wp-block-button__link', '.wp-block-button__link', 'a:contains("Visit")', 'a:contains("Official")'];

    for (const selector of applySelectors) {
        $(selector).each((i, el) => {
            const href = $(el).attr('href');
            if (href && href.length > 5) {
                let absoluteUrl = href;
                if (!href.startsWith('http')) {
                    if (href.startsWith('/')) absoluteUrl = `${new URL(url).origin}${href}`;
                    else return;
                }
                if (absoluteUrl === url) return;
                
                // For Talentd, prefer external links but also accept their apply page
                if (url.includes('talentd.in')) {
                    if (!absoluteUrl.includes('talentd.in') || absoluteUrl.includes('/apply')) {
                        applyUrl = absoluteUrl;
                        return false;
                    }
                } else {
                    if (!absoluteUrl.includes(new URL(url).hostname)) {
                        applyUrl = absoluteUrl;
                        return false;
                    }
                    if (!applyUrl) applyUrl = absoluteUrl;
                }
            }
        });
        if (applyUrl && !applyUrl.includes(new URL(url).hostname)) break;
    }

    // If no external apply URL found, skip this job (don't post it)
    if (!applyUrl) {
        console.log(`[Scraper] Skipping ${url} - no external apply link found`);
        return { success: false, error: 'No external apply link found', skipped: true };
    }

    return {
      success: true,
      title,
      content,
      applyUrl,
      companyLogo: logo || '',
      sourceUrl: url,
    };
  } catch (error) {
    console.error('Scraping error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { scrapeJobPage, scrapeTalentdJobs, scrapeRgJobs, scrapeTelegramChannel };
