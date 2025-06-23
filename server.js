import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises'; // use promise version of fs
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import authRoutes from "./routes/auth.js";


const execAsync = promisify(exec); // 👈 make exec awaitable

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'https://venuescanner.achiapps.ch',
  'http://localhost:3001',
  'http://localhost:5500', 
  'http://127.0.0.1:5500'
];

app.use(cors(
  {origin: allowedOrigins,
    credentials: true
  }
));
app.use(express.json());

app.get('/api/run-backend', async (req, res) => {
  try {
    // Await the backendController to finish
    // await execAsync('node backendController.js');
    
    const dataPath = path.join(__dirname,'data.json');
    console.log('Looking for data at:', dataPath);

    // Read the data.json file (this will throw if it doesn't exist)
    const data = await fs.readFile(dataPath, 'utf-8');
    res.json(JSON.parse(data));
    
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.use("/auth", authRoutes); 

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', reason => {
  console.error('Unhandled Rejection:', reason);
});
