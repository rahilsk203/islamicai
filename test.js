import axios from 'axios';
import { load } from 'cheerio';
import { writeFileSync } from 'fs';

async function scrapeGoogleWeather() {
  const query = 'weather DELHI';
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

  // Rotate User-Agent to avoid detection
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0'
  ];
  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

  const headers = {
    'User-Agent': randomUserAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'DNT': '1',
    'Referer': 'https://www.google.com/'
  };

  try {
    // Fetch the Google search results page
    const response = await axios.get(url, { headers, timeout: 10000 });
    const html = response.data;

    // Save HTML to file for debugging
    writeFileSync('google.html', html);
    console.log(`HTML Length: ${html.length} characters`);
    console.log(`HTML saved to google.html for inspection`);

    // Load HTML into cheerio
    const $ = load(html);
    const results = [];

    // Check for weather card (e.g., temperature, condition)
    const weatherCard = $('div.wob_df, div.wob_unit, div.kCrYT');
    if (weatherCard.length > 0) {
      const temperature = weatherCard.find('span.wob_t').first().text() || 'No temperature';
      const condition = weatherCard.find('div.QrNVmd').text() || 'No condition';
      console.log('Weather Card Found:');
      console.log(`Temperature: ${temperature}`);
      console.log(`Condition: ${condition}\n`);
      results.push({ type: 'weather', temperature, condition });
    } else {
      console.log('No weather card found.');
    }

    // Target organic search results with div.MjjYud
    const selector = 'div.MjjYud';
    const elements = $(selector);
    console.log(`Selector ${selector} matched ${elements.length} elements`);

    elements.each((index, element) => {
      // Log raw HTML of each matched element for debugging
      console.log(`Raw HTML for result ${index + 1}:`, $(element).html().substring(0, 200) + '...');

      const title = $(element).find('h3').text() || $(element).find('div[role="heading"]').text() || 'No title';
      const link = $(element).find('a').attr('href') || 'No link';
      const description = $(element).find('div.IsZvec, span.aCOpRe, div.VwiC3b, div.yuRUbf, div.BNeawe').text() || 'No description';

      // Relaxed filtering: include if either title or link is present
      if (title !== 'No title' || link !== 'No link') {
        results.push({ type: 'organic', title, link, description });
      }
    });

    if (results.length === 0) {
      console.log('No results found. Possible reasons: selector mismatch, nested structure, or bot detection.');
      console.log('Inspect google.html and check div.MjjYud structure in browser DevTools.');
    }

    // Output results
    console.log(`Search Results for "${query}":`);
    results.forEach((result, index) => {
      console.log(`Result ${index + 1}:`);
      if (result.type === 'weather') {
        console.log(`Type: Weather Card`);
        console.log(`Temperature: ${result.temperature}`);
        console.log(`Condition: ${result.condition}\n`);
      } else {
        console.log(`Type: Organic`);
        console.log(`Title: ${result.title}`);
        console.log(`Link: ${result.link}`);
        console.log(`Description: ${result.description}\n`);
      }
    });

    return results;
  } catch (error) {
    console.error('Error scraping Google:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.statusText);
    }
    return [];
  }
}

// Run the scraper with a random delay to avoid detection
setTimeout(scrapeGoogleWeather, Math.random() * 5000);