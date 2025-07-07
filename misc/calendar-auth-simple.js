const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

// Load credentials
const credentials = JSON.parse(fs.readFileSync('.credentials/credentials.json', 'utf8'));
const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

// Create OAuth2 client
const oAuth2Client = new OAuth2Client(client_id, client_secret, 'http://localhost:3000');

// Generate auth URL
const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/calendar.readonly'],
});

console.log('=================================');
console.log('GOOGLE CALENDAR AUTHORIZATION');
console.log('=================================\n');
console.log('1. Copy this URL and open it in your browser:\n');
console.log(authUrl);
console.log('\n2. After authorizing, you\'ll see a URL like:');
console.log('   http://localhost:3000/?code=SOME_LONG_CODE&scope=...');
console.log('\n3. Copy the ENTIRE URL and create a .env file with:');
console.log('   GOOGLE_AUTH_URL=<paste the entire URL here>');
console.log('\n4. Then run: pnpm calendar:finish');