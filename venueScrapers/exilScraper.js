import Scraper from './scraper.js';

class ExilScraper extends Scraper {
  venuename = `Exil`;
  
  _url = 'https://exil.club/';
  
  _scrapedData($) {
    let scrapedData = [];
    
    $('.events-list-item').each((index, element) => {
      const [day, month, year] = $(element).find('.date').text().trim().slice(0, 8).split(`.`)
      const eventDate = `20${year}-${month}-${day}`
      // console.log(`this is the eventDate: ${eventDate}... 
      //   day: ${day} 
      //   month: ${month} 
      //   year: ${year}`);
        
        let event = '';
      
        // Extract each element's text and concatenate it with a space
        $(element).find('.title > .float').each((index, el) => {
          const text = $(el).text().trim();
          if (text) {
            event += text + ' '; // Concatenate with a space
          }
        });
        
        
        // Trim the trailing space
        event = event.trim();
        
      // console.log(`this is an event: ${event}`);
      // .text().trim();  

    const venueName = this.venuename; // Access venue name properly

    const img_src = ``

    const eventlink = $(element).attr('href');

    const description = $(element).find(`.block-text`).text().trim()

      // Only push data if event is not empty
      if (event) {
        scrapedData.push({ venueName, event, eventDate, img_src, eventlink, description}); // Store all data
      }
    });

    return scrapedData;
  }
}

export default new ExilScraper();
