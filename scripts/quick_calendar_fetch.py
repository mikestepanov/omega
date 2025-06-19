#!/usr/bin/env python3
"""
Quick calendar fetch - run this after initial setup
"""

import pickle
import json
from pathlib import Path
from datetime import datetime, timedelta
from googleapiclient.discovery import build

TOKEN_FILE = '.credentials/token.pickle'

def quick_fetch():
    """Quickly fetch calendar data using saved credentials"""
    token_path = Path(TOKEN_FILE)
    
    if not token_path.exists():
        print("No credentials found. Run google_calendar_setup.py first")
        return
    
    # Load credentials
    with open(token_path, 'rb') as token:
        creds = pickle.load(token)
    
    # Build service
    service = build('calendar', 'v3', credentials=creds)
    
    # Load previous calendar selection
    config_file = Path('.credentials/calendar_config.json')
    if config_file.exists():
        with open(config_file, 'r') as f:
            config = json.load(f)
            selected_calendars = config.get('selected_calendars', ['primary'])
    else:
        selected_calendars = ['primary']
    
    # Fetch events
    now = datetime.utcnow()
    time_min = (now - timedelta(days=7)).isoformat() + 'Z'
    time_max = (now + timedelta(days=30)).isoformat() + 'Z'
    
    all_events = {}
    
    for cal_id in selected_calendars:
        try:
            events_result = service.events().list(
                calendarId=cal_id,
                timeMin=time_min,
                timeMax=time_max,
                maxResults=50,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            all_events[cal_id] = events
            print(f"✓ Fetched {len(events)} events from {cal_id}")
            
        except Exception as e:
            print(f"✗ Error fetching {cal_id}: {e}")
    
    # Save data
    output_dir = Path(__file__).parent.parent / 'docs' / 'calendars'
    output_dir.mkdir(exist_ok=True, parents=True)
    
    output_file = output_dir / 'calendar_latest.json'
    with open(output_file, 'w') as f:
        json.dump(all_events, f, indent=2, default=str)
    
    print(f"\nSaved to: {output_file}")

if __name__ == "__main__":
    quick_fetch()