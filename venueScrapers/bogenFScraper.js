import Scraper from './scraper.js';

class BogenFScraper extends Scraper {
  venuename = 'Bogen F';
  _url = 'https://www.bogenf.ch/';

  _scrapedData($) {
    const scrapedData = [];

    $('.upcoming-item').each((i, el) => {
      const venueName = this.venuename;

      // Event title
      const event = $(el).find('.band-headline').text().trim();

      // Date from <time datetime="...">
      const rawDate = $(el).find('time').attr('datetime');
      let eventDate = '';
      if (rawDate) {
        eventDate = rawDate.split(' ')[0]; // Extract YYYY-MM-DD
      }

      // Image
      let img_src = $(el).find('.image img').attr('src') || '';
      if (img_src.startsWith('/')) {
        img_src = `https://www.bogenf.ch${img_src}`;
      }

      // Event link
      let eventlink = $(el).find('.concert-info-top a').first().attr('href') || '';
      if (eventlink.startsWith('/')) {
        eventlink = `https://www.bogenf.ch${eventlink}`;
      }

      // No description available for now
      const description = '';

      if (event) {
        scrapedData.push({ venueName, event, eventDate, img_src, eventlink, description });
      }
    });

    return scrapedData;
  }
}

export default new BogenFScraper();
