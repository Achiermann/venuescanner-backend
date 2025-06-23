import Scraper from './scraper.js';
import axios from 'axios';
import * as cheerio from 'cheerio';

class BoschBarScraper extends Scraper {
  venuename = 'Boschbar';
  _url = 'https://boschbar.ch/';

  async _scrapedData($) {
  let scrapedData = [];

  // Step 1: Get all <strong> tags in order
  const strongTags = $('strong').toArray();

  let startIndex = -1;
  let endIndex = -1;

  strongTags.forEach((el, i) => {
    const text = $(el).text().toLowerCase();
    if (text.includes('das wird')) startIndex = i;
    if (text.includes('alle infos')) endIndex = i;
  });

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex + 1) {
    console.warn('Could not locate the event section between <strong> tags.');
    return scrapedData;
  }

  // The target <strong> is the one between start and end
  const targetEl = strongTags[startIndex + 1];
  const targetHtml = $.html(targetEl);
  const $$ = cheerio.load(targetHtml);
  const innerHtml = $$.root().html();

  // Step 2: Extract each <br>-separated line that starts with a date
  const lines = innerHtml
    .split('<br>')
    .map(line => line.replace(/<[^>]+>/g, '').trim()) // remove tags
    .filter(line => /^\d{2}\.\d{2}\.\d{2}/.test(line)); // lines with date

for (let line of lines) {
  const match = line.match(/^(\d{2})\.(\d{2})\.(\d{2})\s+(.+)$/);
  if (!match) continue;

  const [ , day, month, year, rawEvent ] = match;
  const eventDate = `20${year}-${month}-${day}`;

  // Remove emojis using Unicode regex
  const event = rawEvent.replace(
    /[\p{Emoji_Presentation}\p{Emoji}\u200d\uFE0F]/gu,
    ''
  ).trim();

    scrapedData.push({
      venueName: this.venuename,
      event: event.trim(),
      eventDate,
      img_src: '',
      eventlink: this._url,
      description: ''
    });
  }

  return scrapedData;
}
}

export default new BoschBarScraper();

