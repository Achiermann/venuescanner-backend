import puppeteer from 'puppeteer';
import Scraper from './scraper.js';
import db from '../config/db.js';

class ZentralwäschereiScraper extends Scraper {
  venuename = 'ZWZ';
  _url = 'https://zentralwaescherei.space/';

  async _scrapeData() {
    console.log('🧠 Using Puppeteer for Zentralwäscherei...');

    try {
      const venueName = this.venuename;

      console.log('this is the venueName:', venueName);
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      page.on('console', msg => console.log('🧠 Browser log:', msg.text()));

      await page.goto(this._url, { waitUntil: 'networkidle2' });

      // Click all "Mehr Info" buttons to reveal descriptions
      await page.$$eval('.events_event_description__MBW41 button', buttons => {
        buttons.forEach(btn => btn.click());
      });

      await page.waitForSelector('.events_event__zMaGU', { timeout: 2000 });

      const eventElements = await page.$$('.events_event__zMaGU');
      const scrapedData = [];

      for (let [index, elHandle] of eventElements.entries()) {
        await elHandle.scrollIntoViewIfNeeded();
        await new Promise(resolve => setTimeout(resolve, 300)); // give lazy-loading time

        const data = await page.evaluate(el => {
          const rawDate = el.querySelector('.events_event_date__ml09M')?.innerText.trim() || '';
          const match = rawDate.match(/(\d{2})\.(\d{2})\.(\d{4})/);
          const eventDate = match ? `${match[3]}-${match[2]}-${match[1]}` : '';

          const event = el.querySelector('.events_event_title__eaz0V')?.innerText.trim() || '';

          const img = el.querySelector('img');
          let img_src = '';

          if (img) {
            const srcset = img.getAttribute('srcset');
            if (srcset) {
              const parts = srcset.split(',').map(s => s.trim());
              const last = parts[parts.length - 1];
              img_src = last.split(' ')[0]; // highest res (600w)
            } else {
              img_src = img.currentSrc || img.src || '';
            }
          }

          let eventlink = el.querySelector('.events_event_detail_bottom__PTC0f a')?.getAttribute('href') || '';
          if (eventlink && !eventlink.startsWith('http')) {
            eventlink = 'https://zentralwaescherei.space' + eventlink;
          }

          const description = Array.from(el.querySelectorAll('.events_event_description__MBW41 p'))
            .map(p => p.innerText.trim())
            .join('\n\n');

          return {
            venueName: 'ZWZ',
            event,
            eventDate,
            img_src,
            eventlink,
            description
          };
        }, elHandle);


        if (data.event) scrapedData.push(data);
      }

      await browser.close();

      for (let data of scrapedData) {
        const query = `INSERT INTO events (venue, event, date, img_src, eventlink, description) VALUES (?, ?, ?, ?, ?, ?)`;
        await new Promise((resolve, reject) => {
          db.query(
            query,
            [data.venueName, data.event, data.eventDate, data.img_src, data.eventlink, data.description],
            (err, result) => {
              if (err) reject(err);
              resolve(result);
            }
          );
        });
      }

    } catch (error) {
      console.error('❌ Error scraping Zentralwäscherei with Puppeteer:', error);
    }
  }
}

export default new ZentralwäschereiScraper();
