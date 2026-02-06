const axios = require('axios');
const cheerio = require('cheerio');

const scrapeJobPage = async (url) => {
  try {
    // Special handling for RG Jobs API
    if (url.includes('rgjobs.in/job/')) {
        const match = url.match(/job\/(\d+)/);
        if (match && match[1]) {
            const id = match[1];
            console.log(`[Scraper] Using RG Jobs API for ID: ${id}`);
            const apiRes = await axios.get(`https://api.rgjobs.in/api/job/${id}`, { timeout: 10000 });
            if (apiRes.data && apiRes.data.status === 200) {
                const job = apiRes.data;
                return {
                    success: true,
                    title: job.title,
                    content: `${job.description}\n\nRoles & Responsibilities:\n${job.rolesAndResponsibilities}\n\nRequirements:\n${job.requirements}`,
                    applyUrl: job.joblink,
                    companyLogo: job.image ? `https://api.rgjobs.in/${job.image}` : '',
                    sourceUrl: url,
                };
            }
        }
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    // Try to find JSON-LD (Schema.org JobPosting)
    const jsonLdScripts = $('script[type="application/ld+json"]');
    let structuredData = null;
    
    jsonLdScripts.each((i, el) => {
        try {
            const data = JSON.parse($(el).html());
            // It could be a single object or an array
            const searchJobPosting = (obj) => {
                if (obj['@type'] === 'JobPosting') return obj;
                if (Array.isArray(obj)) return obj.find(searchJobPosting);
                if (obj['@graph']) return obj['@graph'].find(searchJobPosting);
                return null;
            };
            const jobPosting = searchJobPosting(data);
            if (jobPosting) {
                structuredData = jobPosting;
                return false; // Break loop
            }
        } catch (e) {}
    });

    if (structuredData) {
        console.log(`[Scraper] Found JSON-LD for: ${structuredData.title}`);
        return {
            success: true,
            title: structuredData.title,
            content: structuredData.description,
            applyUrl: structuredData.url || url,
            companyLogo: structuredData.hiringOrganization?.logo || '',
            sourceUrl: url,
        };
    }

    // Fallback to Cheerio scraping
    // Remove unnecessary elements
    $('script, style, nav, footer, header, aside, iframe, noscript').remove();
    $('[class*="cookie"], [class*="popup"], [class*="modal"], [class*="newsletter"]').remove();
    $('[id*="cookie"], [id*="popup"], [id*="modal"], [id*="newsletter"]').remove();

    // Try to find job-specific content
    let content = '';

    // Common job page selectors
    const jobSelectors = [
      '[class*="job-description"]',
      '[class*="job-details"]',
      '[class*="job-content"]',
      '[class*="career"]',
      '[id*="job"]',
      '.description',
      '.details',
      'article',
      'main',
      '.content',
    ];

    for (const selector of jobSelectors) {
      const element = $(selector).first();
      if (element.length && element.text().trim().length > 100) {
        content = element.text().trim();
        break;
      }
    }

    // Fallback to body if no specific content found
    if (!content || content.length < 100) {
      content = $('body').text().trim();
    }

    // Clean up the text
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    // Limit content length for AI processing
    if (content.length > 8000) {
      content = content.substring(0, 8000);
    }

    // Get page title
    const title = $('title').text().trim() || '';
    
    // Try to find apply URL on the page
    let applyUrl = url;
    const applyLinks = $('a[href*="apply"], a:contains("Apply"), button:contains("Apply")').first();
    // Try to find company logo
    let companyLogo = '';
    const logoSelectors = [
      'img[src*="logo"]',
      'img[class*="logo"]',
      '.company-logo img',
      '.brand-logo img',
      'header img',
      'img[alt*="logo"]',
      'img[alt*="Logo"]',
    ];

    for (const selector of logoSelectors) {
      const img = $(selector).first();
      if (img.length && img.attr('src')) {
        const src = img.attr('src');
        companyLogo = src.startsWith('http') ? src : (src.startsWith('/') ? `${new URL(url).origin}${src}` : src);
        break;
      }
    }

    if (applyLinks.attr('href')) {
      const href = applyLinks.attr('href');
      if (href.startsWith('http')) {
        applyUrl = href;
      } else if (href.startsWith('/')) {
        const urlObj = new URL(url);
        applyUrl = `${urlObj.origin}${href}`;
      }
    }

    return {
      success: true,
      title,
      content,
      applyUrl,
      companyLogo,
      sourceUrl: url,
    };
  } catch (error) {
    console.error('Scraping error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

const scrapeTalentdJobs = async () => {
    try {
        const url = 'https://www.talentd.in/jobs';
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            },
            timeout: 10000,
        });

        const $ = cheerio.load(response.data);
        const jobLinks = [];

        // Try to find all anchor tags that look like job links
        $('a[href]').each((i, el) => {
            const href = $(el).attr('href');
            if (href && (href.includes('/job/') || href.includes('/jobs/')) && !href.includes('talentd.in/jobs/page/')) {
                // Ensure absolute URL
                const absoluteUrl = href.startsWith('http') ? href : `https://www.talentd.in${href}`;
                
                // Exclude generic pages that look like job links
                const excludePatterns = ['/freshers', '/internships', '/about', '/contact', '/category', '/tag', '/experience', '/location', '/companies', '/jobs/page/'];
                if (excludePatterns.some(p => absoluteUrl.toLowerCase().includes(p))) {
                    return;
                }

                jobLinks.push(absoluteUrl);
            }
        });

        // Filter valid unique links
        const uniqueLinks = [...new Set(jobLinks)].slice(0, 10); // Limit to 10 latest for safety
        console.log(`[Talentd Scraper] Found ${uniqueLinks.length} potential jobs.`);
        
        return uniqueLinks;
    } catch (error) {
        console.error('[Talentd Scraper] Failed to fetch list:', error.message);
        return [];
    }
};

const scrapeRgJobs = async () => {
    try {
        const apiUrl = 'https://api.rgjobs.in/api/getAllJobs';
        console.log(`[RG Jobs Scraper] Fetching from API: ${apiUrl}`);
        
        const response = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            timeout: 15000,
        });

        if (!response.data || !response.data.JobsData) {
            console.error('[RG Jobs Scraper] Invalid API response format');
            return [];
        }

        const jobLinks = response.data.JobsData.map(job => {
            // Construct the internal RG Jobs link for scraping
            // Format: https://www.rgjobs.in/job/{id}/{slug}
            // We need a slug. If not provided, we can use title-based slug.
            const slug = job.title
                .toLowerCase()
                .replace(/[^a-z0-8]+/g, '-')
                .replace(/(^-|-$)/g, '');
            
            return `https://www.rgjobs.in/job/${job.id}/${slug}`;
        });

        const uniqueLinks = [...new Set(jobLinks)].slice(0, 15);
        console.log(`[RG Jobs Scraper] Successfully found ${uniqueLinks.length} jobs via API.`);
        
        return uniqueLinks;
    } catch (error) {
        console.error('[RG Jobs Scraper] API Fetch failed:', error.message);
        return [];
    }
};

module.exports = { scrapeJobPage, scrapeTalentdJobs, scrapeRgJobs };
