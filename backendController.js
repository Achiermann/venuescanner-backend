// import sidebarView from "./views/sidebarView";
import { Buffer } from 'buffer';
import HelsinkiScraper from './venueScrapers/helsinkiScraper.js';
import ExilScraper from './venueScrapers/exilScraper.js';
import HelperScraper from './venueScrapers/helperScraper.js';
import BoschBarScraper from './venueScrapers/boschBarScraper.js';
import ZentralwäschereiScraper from './venueScrapers/zentralwäschereiScraper.js';
import bogenFScraper from './venueScrapers/bogenFScraper.js';
import moodsScraper from './venueScrapers/moodsScraper.js';

// Initialize and scrape all Data to Database
const initDB = async function () {
  await HelperScraper._clearTable();
  await ExilScraper._scrapeData();
  await HelsinkiScraper._scrapeData();
  await BoschBarScraper._scrapeData();
  await ZentralwäschereiScraper._scrapeData();
  await bogenFScraper._scrapeData();
  await moodsScraper._scrapeData();
  await HelperScraper._exportDataToJSON();
};

const init = function () {
  initDB();
};
init();