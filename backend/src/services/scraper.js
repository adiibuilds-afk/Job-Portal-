const axios = require('axios');
const cheerio = require('cheerio');

const scrapeJobPage = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

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

module.exports = { scrapeJobPage };
