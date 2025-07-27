// app.js
import express from 'express';
import bodyParser from 'body-parser';
import messageRoutes from './routes/api/whatsAppApiRoutes.js';
import { configDotenv } from 'dotenv';
import cors from 'cors';

const app = express();
const port = process.env.APP_PORT || 2266;

app.use(cors());
configDotenv()

const SECRET_API_KEY = process.env.APP_KEY; // Change this to a random string

const apiKeyMiddleware = (req, res, next) => {

  if (req.method === 'OPTIONS') {
    return next();
  }

  const providedApiKey = req.get('X-API-KEY');
  if (!providedApiKey || providedApiKey !== SECRET_API_KEY) {
    return res.status(403).json({ error: 'Forbidden: Invalid or missing API Key.' });
  }
  next(); // Key is valid, proceed to the next middleware/route
};

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Use the routes defined in whatsAppMessageSendApis.js
app.use('/api', apiKeyMiddleware, messageRoutes);

// Start the Express server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
