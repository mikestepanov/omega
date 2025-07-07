#!/usr/bin/env node

const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');
const http = require('http');
const url = require('url');
const open = require('open');

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = '.credentials/token.json';
const CREDENTIALS_PATH = '.credentials/credentials.json';

async function getAuthUrl(oAuth2Client) {
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
}

async function getAccessToken(oAuth2Client, code) {
  const { tokens } = await oAuth2Client.getToken(code);
  return tokens;
}

async function authenticate() {
  // Check for existing token
  try {
    const token = await fs.readFile(TOKEN_PATH, 'utf8');
    return JSON.parse(token);
  } catch (err) {
    // No token, need to authenticate
  }

  // Load credentials
  let credentials;
  try {
    const content = await fs.readFile(CREDENTIALS_PATH, 'utf8');
    credentials = JSON.parse(content);
  } catch (err) {
    console.error(`
❌ No credentials found!

Follow these steps:
1. Go to: https://console.cloud.google.com/
2. Create new project or select existing
3. Enable Google Calendar API
4. Create OAuth2 credentials (Desktop type)
5. Download JSON and save as: ${CREDENTIALS_PATH}
`);
    process.exit(1);
  }

  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

  // Get auth URL
  const authUrl = await getAuthUrl(oAuth2Client);
  
  console.log('Opening browser for authorization...');
  console.log('If browser doesn\'t open, visit this URL:');
  console.log(authUrl);

  // Open browser
  console.log('\nTrying to open browser...');
  open(authUrl).catch(() => {
    console.log('Could not open browser automatically.');
  });

  // Wait for callback
  const code = await waitForCallback();
  
  // Get token
  const tokens = await getAccessToken(oAuth2Client, code);
  
  // Save token
  await fs.mkdir(path.dirname(TOKEN_PATH), { recursive: true });
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
  
  console.log('✅ Authentication successful!');
  return tokens;
}

function waitForCallback() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const queryObject = url.parse(req.url, true).query;
      if (queryObject.code) {
        res.end('Authentication successful! You can close this window.');
        server.close();
        resolve(queryObject.code);
      } else if (queryObject.error) {
        res.end('Authentication failed: ' + queryObject.error);
        server.close();
        reject(new Error(queryObject.error));
      }
    });
    
    server.listen(3000, () => {
      console.log('\n⏳ Waiting for authentication callback...');
      console.log('   Server listening on http://localhost:3000');
      console.log('\n📋 After you authorize in the browser, you\'ll be redirected back here.');
    });
    
    server.on('error', (err) => {
      console.error('Server error:', err);
      reject(err);
    });
  });
}

async function listCalendars(auth) {
  const calendar = google.calendar({ version: 'v3', auth });
  const res = await calendar.calendarList.list();
  return res.data.items;
}

async function fetchEvents(auth, calendarId = 'primary') {
  const calendar = google.calendar({ version: 'v3', auth });
  
  const now = new Date();
  const timeMin = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const res = await calendar.events.list({
    calendarId,
    timeMin,
    timeMax,
    maxResults: 100,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return res.data.items;
}

async function main() {
  console.log('🗓️  Google Calendar Setup\n');
  console.log('Starting authentication process...');

  // Authenticate
  const tokens = await authenticate();
  
  // Create OAuth2 client
  const content = await fs.readFile(CREDENTIALS_PATH, 'utf8');
  const credentials = JSON.parse(content);
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);
  oAuth2Client.setCredentials(tokens);

  // List calendars
  console.log('\n📅 Available Calendars:');
  const calendars = await listCalendars(oAuth2Client);
  
  calendars.forEach((cal, index) => {
    console.log(`${index + 1}. ${cal.summary} (${cal.accessRole})`);
  });

  // Create config file
  const calendarConfig = {
    calendars: calendars.map(cal => ({
      id: cal.id,
      summary: cal.summary,
      accessRole: cal.accessRole
    })),
    selectedCalendars: ['primary'],
    lastSync: new Date().toISOString()
  };

  await fs.writeFile('.credentials/calendar-config.json', JSON.stringify(calendarConfig, null, 2));

  // Fetch events from primary calendar
  console.log('\n📊 Fetching events from primary calendar...');
  const events = await fetchEvents(oAuth2Client, 'primary');
  
  // Save events
  const outputDir = path.join('docs', 'calendars');
  await fs.mkdir(outputDir, { recursive: true });
  
  const outputPath = path.join(outputDir, 'calendar_latest.json');
  await fs.writeFile(outputPath, JSON.stringify({ primary: events }, null, 2));

  console.log(`✅ Saved ${events.length} events to ${outputPath}`);
  console.log('\n🎉 Setup complete! Run "node scripts/quick-fetch.js" to update calendar data.');
}

main().catch(console.error);