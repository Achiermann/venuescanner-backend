import puppeteer from 'puppeteer';
import Scraper from './scraper.js';
import db from '../config/db.js';

class MoodsScraper extends Scraper {
  venuename = 'Moods';
  _url = 'https://moods.ch/en';

  async _scrapeData() {
    console.log('🎷 Scraping Moods.ch...');

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(this._url, { waitUntil: 'networkidle2' });

    try {
      const clicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const target = buttons.find(btn =>
          btn.textContent.toLowerCase().includes('load full program')
        );
        if (target) {
          target.click();
          return true;
        }
        return false;
      });

      if (clicked) {
        console.log('🔘 Clicked "load full program"...');
        await page.waitForFunction(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return !buttons.some(btn =>
            btn.textContent.toLowerCase().includes('load full program')
          );
        }, { timeout: 10000 });

        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        console.warn("⚠️ Couldn't find 'load full program' button.");
      }
    } catch (e) {
      console.warn("⚠️ Error clicking or waiting for 'load full program':", e.message);
    }

    // Scroll to each event (lazy-loading safety)
    await page.evaluate(() => {
      document.querySelectorAll('li > div.relative').forEach(el => el.scrollIntoView());
    });

    await new Promise(resolve => setTimeout(resolve, 2000)); // let content fully hydrate

    const events = await page.$$eval('li > div.relative', nodes => {
      return nodes.map(el => {
        const timeEl = el.querySelector('time');
        const eventDate = timeEl?.getAttribute('datetime')?.slice(0, 10) || '';

        const event = el.querySelector('h3.h3')?.innerText.trim() || '';

        const genre = Array.from(el.querySelectorAll('.paragraph-2 span'))
          .map(span => span.textContent.trim())
          .filter(Boolean)
          .join(', ');

        const description = el.querySelector('.text-2xs')?.textContent.trim() || '';

        const relativeLink = el.querySelector('a.absolute')?.getAttribute('href') || '';
        const eventlink = relativeLink ? `https://moods.ch${relativeLink}` : '';

        // ✅ Get high-res image from <picture><source srcset=...>
        let img_src = '';
        const source = el.querySelector('picture source');
        if (source) {
          const srcset = source.getAttribute('srcset');
          if (srcset) {
            const candidates = srcset.split(',').map(entry => entry.trim().split(' ')[0]);
            img_src = candidates[candidates.length - 1] || '[no src]';
          }
        }

        return {
          venueName: 'Moods',
          event,
          eventDate,
          genre,
          description,
          img_src,
          eventlink,
        };
      });
    });

    await browser.close();

    for (let data of events) {
      if (!data.event || !data.eventDate) continue;

      const query = `INSERT INTO events (venue, event, date, img_src, eventlink, description) VALUES (?, ?, ?, ?, ?, ?)`;
      await new Promise((resolve, reject) => {
        db.query(
          query,
          [data.venueName, data.event, data.eventDate, data.img_src, data.eventlink, `${data.genre}\n${data.description}`],
          (err, result) => {
            if (err) reject(err);
            resolve(result);
          }
        );
      });
    }

    console.log(`🎉 Scraped and saved ${events.length} events from Moods.`);
  }
}

export default new MoodsScraper();
