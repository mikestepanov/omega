#!/usr/bin/env python3
import json
import urllib.parse

# Read credentials
with open('.credentials/credentials.json', 'r') as f:
    creds = json.load(f)
    
client_id = creds['installed']['client_id']
redirect_uri = 'http://localhost:3000'
scope = 'https://www.googleapis.com/auth/calendar.readonly'

# Build auth URL
auth_url = (
    "https://accounts.google.com/o/oauth2/v2/auth?"
    f"client_id={client_id}&"
    f"redirect_uri={urllib.parse.quote(redirect_uri)}&"
    f"response_type=code&"
    f"scope={urllib.parse.quote(scope)}&"
    f"access_type=offline"
)

print("=================================")
print("GOOGLE CALENDAR AUTHORIZATION")
print("=================================\n")
print("1. Copy this URL and open it in your browser:\n")
print(auth_url)
print("\n2. After authorizing, you'll be redirected to localhost:3000")
print("   The page will fail to load - that's OK!")
print("\n3. Copy the ENTIRE URL from your browser's address bar")
print("   It will look like: http://localhost:3000/?code=4/0AQlEd...")
print("\n4. Save it somewhere - you'll need the 'code' part")