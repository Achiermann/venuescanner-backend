import axios from 'axios';
import * as cheerio from 'cheerio';
import mysql from 'mysql2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/db.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class Scraper {

result = ``

async _clearTable() {

    try {
      // Step 1: Clear the table before inserting new data
      const clearTableQuery = `DELETE FROM events`;
      await new Promise((resolve, reject) => {
        db.query(clearTableQuery, (err, result) => {
          if (err) reject('Error clearing the table:', err);
          if (err) {
            return reject(err);
          }
          resolve(result);
        });
      });
      console.log('Table cleared successfully.');
      // db.end();
}catch (err) {
  console.error('Error clearing the table:', err);
}
}
  

  async _scrapeData() {

    try {
   
      // Step 2: Fetch HTML from the website
      const response = await axios.get(this._url);
      const $ = cheerio.load(response.data); // Load HTML content into Cheerio

      // Step 3: Extract specific data by calling _scrapedData
      const scrapedData = await this._scrapedData($); // Now this calls the subclass method

      // Step 4: Insert the concatenated data into MySQL
      if (scrapedData.length > 0) {
        for (let data of scrapedData) {
          const query = `INSERT INTO events (venue, event, date, img_src, eventlink, description) VALUES (?, ?, ?, ?, ?, ?)`;
          await new Promise((resolve, reject) => {
            db.query(query, [data.venueName, data.event, data.eventDate, data.img_src, data.eventlink, data.description], (err, result) => {
              if (err) reject(err);
              resolve(result);
            });
          });
        }
      } else {
        console.log('No data to insert into the database.');
      }

    } catch (error) {
      console.error('Error scraping website:', error);
    } 
  }

// Function to export data from MySQL to a JSON file
async _exportDataToJSON() {
  const query = `SELECT * FROM events`;

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });

 // Create a timestamp in [dd.mm.yy hh.mm] format
 const now = new Date();
 const formattedDate = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getFullYear()).slice(2)} ${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`;

 // Insert timestamp as first element in the array
 results.unshift({ info: `last updated ${formattedDate}` });
    const jsonData = JSON.stringify(results, null, 2); // Convert data to JSON and format it

    // Define the path to the file inside the backend folder
const filePath = path.join(__dirname,'..','data.json');

    // Write JSON data to a file
    fs.writeFile(filePath, jsonData, (err) => {
      if (err) {
        console.error('Error writing to file:', err);
        return;
      }
      console.log(`Data saved to ${filePath}`);
    });
  } catch (error) {
    console.error('Error exporting data:', error);
  } 

  };
};



    