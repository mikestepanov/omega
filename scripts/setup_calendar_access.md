# Calendar Access Setup

## Google Calendar (Easiest)

### Option 1: Public URL (Read-only, no auth needed)
1. Go to Google Calendar settings
2. Find your calendar under "Settings for my calendars"
3. Scroll to "Integrate calendar"
4. Copy the "Secret address in iCal format"
5. Save URL in `.env` file as `CALENDAR_ICS_URL`

### Option 2: Google Calendar API
1. Go to https://console.cloud.google.com/
2. Create new project or select existing
3. Enable Google Calendar API
4. Create credentials (Service Account recommended)
5. Download JSON key file
6. Save as `credentials.json` in project root (already gitignored)

## Quick Start Script

```python
# scripts/fetch_calendar.py
import os
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

def fetch_calendar_ics():
    """Fetch calendar data from secret iCal URL"""
    url = os.getenv('CALENDAR_ICS_URL')
    if not url:
        print("Set CALENDAR_ICS_URL in .env file")
        return
    
    response = requests.get(url)
    
    # Save locally
    with open('docs/calendar_snapshot.ics', 'w') as f:
        f.write(response.text)
    
    print(f"Calendar synced at {datetime.now()}")

if __name__ == "__main__":
    fetch_calendar_ics()
```

## Microsoft/Outlook Calendar

1. Go to outlook.com
2. Settings → View all Outlook settings
3. Calendar → Shared calendars
4. Publish a calendar → Select calendar
5. Choose "Can view all details"
6. Copy the ICS link

## Next Steps

1. Choose method above
2. Get your calendar URL
3. Create `.env` file with the URL
4. Run the fetch script