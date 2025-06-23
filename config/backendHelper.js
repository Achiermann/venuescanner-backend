import cron from 'node-cron';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// server.js wird alle 5min ausgeführt
cron.schedule('*/5 * * * *', () => {
  console.log('⏰ Running backendController.js...');

  // Construct the absolute path to backendController.js
  const controllerPath = path.join(__dirname, '..', 'backendController.js');

  exec(`node ${controllerPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Backend job failed:', error.message);
      return;
    }
    if (stderr) {
      console.warn('⚠️ Backend job stderr:', stderr);
    }
    console.log('✅ Backend job completed');
  });
});