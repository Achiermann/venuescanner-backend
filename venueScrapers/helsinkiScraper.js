import Scraper from './scraper.js';

class HelsinkiScraper extends Scraper {

  venuename = `Helsinki`;

  _url = 'https://www.helsinkiklub.ch/';

  _scrapedData($) {
    let scrapedData = [];

    $('#program .event').each((index, element) => {
      let event = '';

    // Extract each element's text and concatenate it with a space
    // Extract text from .top elements and exclude .addition class content
$(element).find('.top').each((index, el) => {
  // Remove any .addition elements inside the current .top element
  $(el).find('.addition').remove();

  // Now get the text of the remaining .top content
  const text = $(el).text().trim();
  if (text) {
    event += text + ' '; // Concatenate with a space
  }
});

    console.log(event);

      const day = $(element).find('.day').text().trim();  // Get text of .day (e.g., 26)
      const month = $(element).find('.month').text().trim();  // Get text of .month (e.g., March)
      

      const months = {
        'Januar': '01', 'Februar': '02', 'März': '03', 'April': '04',
        'Mai': '05', 'Juni': '06', 'Juli': '07', 'August': '08',
        'September': '09', 'Oktober': '10', 'November': '11', 'Dezember': '12'
      };

      const venueName = this.venuename; 
      const monthNumber = months[month] || '01';
      const year = new Date().getFullYear();  // Get the current year

      // Construct the date in YYYY-MM-DD format
      const eventDate = `${year}-${monthNumber}-${day.padStart(2, '0')}`;

      const img_src = $(element).find('.media img').first().attr('src') || '';
      
      const eventlink = `eventlink`

      const description = $(element).find(`.description`).text().trim()

      // Only push data if event is not empty
      if (event) {
        scrapedData.push({ venueName, event, eventDate, img_src, eventlink, description});  // Store both event and date
      }
    });

    return scrapedData;
  }
}

export default new HelsinkiScraper();
