const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs');
const path = require('path');
const url = require('url');
require('dotenv').config();

async function finishSetup() {
  // Get the auth URL from .env
  const authCallbackUrl = process.env.GOOGLE_AUTH_URL;
  if (!authCallbackUrl) {
    console.error('ERROR: Set GOOGLE_AUTH_URL in .env file');
    console.error('Run: node scripts/calendar-auth-simple.js first');
    process.exit(1);
  }

  // Extract code from URL
  const queryObject = url.parse(authCallbackUrl, true).query;
  const code = queryObject.code;
  
  if (!code) {
    console.error('ERROR: No authorization code found in URL');
    process.exit(1);
  }

  // Load credentials
  const credentials = JSON.parse(fs.readFileSync('.credentials/credentials.json', 'utf8'));
  const { client_secret, client_id } = credentials.installed || credentials.web;
  
  // Create OAuth2 client
  const oAuth2Client = new OAuth2Client(client_id, client_secret, 'http://localhost:3000');
  
  try {
    // Exchange code for token
    console.log('Exchanging code for token...');
    const { tokens } = await oAuth2Client.getToken(code);
    
    // Save token
    fs.writeFileSync('.credentials/token.json', JSON.stringify(tokens));
    console.log('✅ Token saved!');
    
    // Set credentials
    oAuth2Client.setCredentials(tokens);
    
    // Test by listing calendars
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    const res = await calendar.calendarList.list();
    const calendars = res.data.items;
    
    console.log('\n📅 Your calendars:');
    calendars.forEach((cal, i) => {
      console.log(`${i + 1}. ${cal.summary}`);
    });
    
    // Save calendar list
    const calendarData = {
      calendars: calendars.map(c => ({ id: c.id, summary: c.summary })),
      selectedCalendars: ['primary'],
      lastSync: new Date().toISOString()
    };
    
    fs.writeFileSync('.credentials/calendar-config.json', JSON.stringify(calendarData, null, 2));
    
    console.log('\n✅ Setup complete!');
    console.log('Run "pnpm calendar:fetch" to sync your calendar data');
    
  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
}

finishSetup();