#!/usr/bin/env python3
import json
import urllib.request
import urllib.parse

# Load credentials and token
with open('.credentials/credentials.json', 'r') as f:
    creds = json.load(f)

with open('.credentials/token.json', 'r') as f:
    token_data = json.load(f)

client_id = creds['installed']['client_id']
client_secret = creds['installed']['client_secret']
refresh_token = token_data.get('refresh_token')

if not refresh_token:
    print("❌ No refresh token found. Need to re-authenticate from scratch.")
    print("Run: python3 scripts/get_auth_url.py")
    exit(1)

# Refresh the token
print("Refreshing access token...")
token_url = 'https://oauth2.googleapis.com/token'
data = urllib.parse.urlencode({
    'refresh_token': refresh_token,
    'client_id': client_id,
    'client_secret': client_secret,
    'grant_type': 'refresh_token'
}).encode()

req = urllib.request.Request(token_url, data=data, method='POST')
req.add_header('Content-Type', 'application/x-www-form-urlencoded')

try:
    with urllib.request.urlopen(req) as response:
        new_token_data = json.loads(response.read())
    
    # Update token file (keep refresh token if not in response)
    if 'refresh_token' not in new_token_data:
        new_token_data['refresh_token'] = refresh_token
    
    with open('.credentials/token.json', 'w') as f:
        json.dump(new_token_data, f, indent=2)
    
    print("✅ Token refreshed successfully!")
    print("Now run: python3 scripts/fetch_calendar_simple.py")
    
except urllib.error.HTTPError as e:
    print(f"❌ Error refreshing token: {e}")
    print(e.read().decode())