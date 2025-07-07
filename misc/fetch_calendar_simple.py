#!/usr/bin/env python3
import json
import urllib.request
import urllib.parse
from datetime import datetime, timedelta
from pathlib import Path

# Load token
with open('.credentials/token.json', 'r') as f:
    token_data = json.load(f)

access_token = token_data['access_token']

# Set date range
now = datetime.now()
time_min = (now - timedelta(days=7)).isoformat() + 'Z'
time_max = (now + timedelta(days=30)).isoformat() + 'Z'

# Fetch primary calendar events
params = urllib.parse.urlencode({
    'timeMin': time_min,
    'timeMax': time_max,
    'singleEvents': 'true',
    'orderBy': 'startTime',
    'maxResults': '100'
})

url = f'https://www.googleapis.com/calendar/v3/calendars/primary/events?{params}'
req = urllib.request.Request(url)
req.add_header('Authorization', f'Bearer {access_token}')

print("Fetching calendar events...")

try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read())
    
    events = data.get('items', [])
    print(f"Found {len(events)} events")
    
    # Save data
    output_dir = Path('docs/calendars')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    output_file = output_dir / 'calendar_latest.json'
    with open(output_file, 'w') as f:
        json.dump({'primary': events}, f, indent=2)
    
    print(f"✅ Saved to {output_file}")
    
    # Show next 5 events
    print("\nNext 5 events:")
    for event in events[:5]:
        start = event.get('start', {})
        start_time = start.get('dateTime', start.get('date', 'N/A'))
        summary = event.get('summary', 'No title')
        print(f"  - {start_time}: {summary}")
        
except urllib.error.HTTPError as e:
    if e.code == 401:
        print("❌ Token expired. Need to re-authenticate.")
    else:
        print(f"❌ Error: {e}")
        print(e.read().decode())