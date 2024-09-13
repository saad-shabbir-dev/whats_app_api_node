import pkg from 'whatsapp-web.js';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { setTimeout } from 'timers/promises';
import { execSync } from 'child_process';
import qrcode from 'qrcode-terminal';

// Resolve __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the path for session data storage
const sessionPath = path.join(__dirname, '.wwebjs_auth');

// Import Client and LocalAuth from whatsapp-web.js
const { Client, LocalAuth } = pkg;

// Declare the client variable globally
let client;
let isReinitializing = false; // Prevents multiple reinitialization attempts

// Function to initialize the WhatsApp client
const initializeClient = async () => {
  if (isReinitializing || (client && client.info && client.info.connected)) {
    console.log('Client is already connected or in the process of reinitialization.');
    return;
  }
  isReinitializing = true;

  try {
    client = new Client({
      authStrategy: new LocalAuth({
        dataPath: sessionPath,
        clientId: 'client-one',
      }),
      puppeteer: {
        executablePath: puppeteer.executablePath(),
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
          '--disable-extensions',
          '--disable-software-rasterizer',
          '--disable-background-networking',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
        ],
      },
    });

    // Ensure the QR code is displayed when needed
    client.on('qr', (qr) => {
      console.log('QR event triggered. Scan the QR code to log in to WhatsApp:');
      qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
      console.log('WhatsApp Client is ready!');
      isReinitializing = false;
    });

    client.on('disconnected', async (reason) => {
      console.log(`WhatsApp Client disconnected: ${reason}.`);
      await handleDisconnection(reason);
    });

    client.on('error', async (error) => {
      console.error('WhatsApp Client encountered an error:', error.message);
      await handleDisconnection('ERROR');
    });

    await client.initialize();
  } catch (error) {
    console.error('Error during client initialization:', error.message);
    await handleDisconnection('INIT_ERROR');
  }
};

// Unified function to handle disconnection
const handleDisconnection = async (reason) => {
  try {
    console.log(`Handling disconnection due to: ${reason}`);
    if (fs.existsSync(sessionPath)) {
      console.log('Session data found. Attempting to clear session data...');
      await clearSessionData(sessionPath);
    }
    console.log('Attempting to reinitialize the client after clearing the session...');
    await initializeClient(); // Reinitialize immediately after clearing the session
  } catch (error) {
    console.error('Error during disconnection handling:', error.message);
    isReinitializing = false; // Resetting to allow reinitialization
    setTimeout(() => {
      console.log('Retrying client reinitialization...');
      initializeClient();
    }, 5000); // Adding a retry mechanism
  }
};

// Function to safely clear session data and related folders
const clearSessionData = async (pathToClear) => {
  try {
    if (fs.existsSync(pathToClear)) {
      await forceUnlockFiles(pathToClear);
      fs.rmSync(pathToClear, { recursive: true, force: true });
      console.log('Successfully cleared session data.');
    }
  } catch (error) {
    console.error('Error clearing session data:', error.message);
    // Ensure the server does not crash and attempts to reinitialize the client
    isReinitializing = false;
    setTimeout(() => {
      console.log('Retrying client reinitialization after failed session clear...');
      initializeClient();
    }, 5000);
  }
};

// Function to forcefully unlock files using system commands
const forceUnlockFiles = (path) => {
  try {
    console.log(`Attempting to unlock files in: ${path}`);
    execSync(`handle.exe -p chrome.exe -c -a ${path} -f`, { stdio: 'ignore' });
    console.log('Files unlocked successfully.');
  } catch (error) {
    console.error('Error unlocking files:', error.message);
  }
};

// Function to check and handle client state on startup
const checkClientState = async () => {
  if (fs.existsSync(sessionPath)) {
    console.log('Existing session data found, checking connection status...');
    if (client && client.info && client.info.connected) {
      console.log('Using existing stable connection.');
      return;
    }
    await initializeClient();
  } else {
    console.log('No existing session found, initializing a new client session...');
    await initializeClient();
  }
};

// Call the function to check the state of the client
checkClientState();

// Export client for use in other modules
export { client, initializeClient };
