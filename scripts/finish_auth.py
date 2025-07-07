#!/usr/bin/env python3
import json
import os
import urllib.parse
import urllib.request
from pathlib import Path

# Load .env
env_path = Path('.env')
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            if line.startswith('GOOGLE_AUTH_URL='):
                auth_url = line.split('=', 1)[1].strip()
                break

# Extract code from URL
parsed = urllib.parse.urlparse(auth_url)
params = urllib.parse.parse_qs(parsed.query)
code = params['code'][0]

print(f"Got authorization code: {code[:20]}...")

# Load credentials
with open('.credentials/credentials.json', 'r') as f:
    creds = json.load(f)

client_id = creds['installed']['client_id']
client_secret = creds['installed']['client_secret']

# Exchange code for token
token_url = 'https://oauth2.googleapis.com/token'
data = urllib.parse.urlencode({
    'code': code,
    'client_id': client_id,
    'client_secret': client_secret,
    'redirect_uri': 'http://localhost:3000',
    'grant_type': 'authorization_code'
}).encode()

print("\nExchanging code for token...")
req = urllib.request.Request(token_url, data=data, method='POST')
req.add_header('Content-Type', 'application/x-www-form-urlencoded')

try:
    with urllib.request.urlopen(req) as response:
        token_data = json.loads(response.read())
    
    # Save token
    with open('.credentials/token.json', 'w') as f:
        json.dump(token_data, f, indent=2)
    
    print("✅ Success! Token saved to .credentials/token.json")
    print("\nYour calendar is now connected!")
    print("Run this to fetch your calendar data:")
    print("  python3 scripts/fetch_calendar_simple.py")
    
except urllib.error.HTTPError as e:
    print(f"❌ Error: {e}")
    print(e.read().decode())