#!/usr/bin/env node

const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs').promises;
const path = require('path');

const TOKEN_PATH = '.credentials/token.json';
const CREDENTIALS_PATH = '.credentials/credentials.json';
const CONFIG_PATH = '.credentials/calendar-config.json';

async function quickFetch() {
  try {
    // Load token
    const token = JSON.parse(await fs.readFile(TOKEN_PATH, 'utf8'));
    
    // Load credentials
    const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH, 'utf8'));
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    
    // Create OAuth2 client
    const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(token);
    
    // Load config
    const config = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf8'));
    const calendarsToFetch = config.selectedCalendars || ['primary'];
    
    // Create calendar client
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    
    // Fetch events
    const now = new Date();
    const timeMin = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const allEvents = {};
    
    for (const calId of calendarsToFetch) {
      console.log(`📅 Fetching ${calId}...`);
      
      const res = await calendar.events.list({
        calendarId: calId,
        timeMin,
        timeMax,
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime',
      });
      
      allEvents[calId] = res.data.items;
      console.log(`   ✓ Found ${res.data.items.length} events`);
    }
    
    // Save data
    const outputDir = path.join('docs', 'calendars');
    await fs.mkdir(outputDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    await fs.writeFile(
      path.join(outputDir, 'calendar_latest.json'),
      JSON.stringify(allEvents, null, 2)
    );
    
    // Also save timestamped version
    await fs.writeFile(
      path.join(outputDir, `calendar_${timestamp}.json`),
      JSON.stringify(allEvents, null, 2)
    );
    
    console.log('\n✅ Calendar data updated!');
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('❌ Not set up yet! Run: pnpm calendar:setup');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

quickFetch();