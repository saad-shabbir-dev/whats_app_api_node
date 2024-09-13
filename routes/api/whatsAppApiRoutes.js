// api/whatsAppMessageSendApis.js

import express from 'express';
import { sendMessage, sendGroupMessage, sendMessageToGroupById, getAllGroupIds } from '../../helper/whatsAppApiFunctions/whatsAppMessageFuntions.js'; // Ensure the correct path to your API functions

// Create a new router object
const router = express.Router();

// API endpoint to send a WhatsApp message
router.post('/send-message-single', async (req, res) => {
  const { number, message } = req.body;

  // Check if the required fields are provided
  if (!number || !message) {
    return res.status(400).json({ error: 'Number and message are required.' });
  }

  // Call the sendMessage function
  const result = await sendMessage(number, message);

  // Send the response based on the result
  res.status(result.success ? 200 : 500).json(result);
});

// API endpoint to send a message to a WhatsApp group
router.post('/send-group-message', async (req, res) => {
  const { groupName, message } = req.body;

  if (!groupName || !message) {
    return res.status(400).json({ error: 'Group name and message are required.' });
  }

  const result = await sendGroupMessage(groupName, message);
  res.status(result.success ? 200 : 500).json(result);
});

// API endpoint to send a message to a WhatsApp group by its unique ID
router.post('/send-group-message-by-id', async (req, res) => {
  const { groupId, message } = req.body;

  if (!groupId || !message) {
    return res.status(400).json({ error: 'Group ID and message are required.' });
  }

  const result = await sendMessageToGroupById(groupId, message);
  res.status(result.success ? 200 : 500).json(result);
});



// API endpoint to get all WhatsApp group IDs
router.get('/get-group-ids', async (req, res) => {
  try {
    const groups = await getAllGroupIds();
    res.status(200).json({ success: true, groups });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch group IDs.' });
  }
});

export default router;
