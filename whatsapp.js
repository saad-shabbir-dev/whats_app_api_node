// app.js
import express from 'express';
import bodyParser from 'body-parser';
import messageRoutes from './routes/api/whatsAppApiRoutes.js';

const app = express();
const port = 2266;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Use the routes defined in whatsAppMessageSendApis.js
app.use('/api', messageRoutes);

// Start the Express server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
