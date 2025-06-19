#!/usr/bin/env python3
"""
Google Calendar API Setup for Corporate Accounts
Handles OAuth2 flow and multiple calendar access
"""

import os
import pickle
import json
from datetime import datetime, timedelta
from pathlib import Path
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
TOKEN_FILE = '.credentials/token.pickle'
CREDS_FILE = '.credentials/credentials.json'

def setup_credentials():
    """One-time setup for Google Calendar API"""
    print("=== Google Calendar API Setup ===")
    print("\n1. Go to: https://console.cloud.google.com/")
    print("2. Create a new project (or select existing)")
    print("3. Enable 'Google Calendar API'")
    print("4. Create credentials:")
    print("   - Type: OAuth 2.0 Client ID")
    print("   - Application type: Desktop app")
    print("5. Download the credentials JSON")
    print(f"6. Save it as: {CREDS_FILE}")
    print("\nPress Enter when ready...")
    input()

def authenticate():
    """Handle Google OAuth2 authentication"""
    creds = None
    token_path = Path(TOKEN_FILE)
    
    # Load existing token
    if token_path.exists():
        with open(token_path, 'rb') as token:
            creds = pickle.load(token)
    
    # If no valid creds, get new ones
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            creds_path = Path(CREDS_FILE)
            if not creds_path.exists():
                setup_credentials()
                return None
                
            flow = InstalledAppFlow.from_client_secrets_file(
                CREDS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        
        # Save credentials
        token_path.parent.mkdir(exist_ok=True)
        with open(token_path, 'wb') as token:
            pickle.dump(creds, token)
    
    return creds

def list_calendars(service):
    """List all available calendars"""
    try:
        calendar_list = service.calendarList().list().execute()
        calendars = calendar_list.get('items', [])
        
        print("\n=== Available Calendars ===")
        for i, cal in enumerate(calendars):
            access = cal.get('accessRole', 'unknown')
            print(f"{i+1}. {cal['summary']} (ID: {cal['id'][:20]}...) [{access}]")
        
        return calendars
    except Exception as e:
        print(f"Error listing calendars: {e}")
        return []

def fetch_events(service, calendar_id='primary', days_back=7, days_forward=30):
    """Fetch events from a specific calendar"""
    now = datetime.utcnow()
    time_min = (now - timedelta(days=days_back)).isoformat() + 'Z'
    time_max = (now + timedelta(days=days_forward)).isoformat() + 'Z'
    
    try:
        events_result = service.events().list(
            calendarId=calendar_id,
            timeMin=time_min,
            timeMax=time_max,
            maxResults=100,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        return events_result.get('items', [])
    except Exception as e:
        print(f"Error fetching events: {e}")
        return []

def save_calendar_data(calendars_data):
    """Save calendar data in multiple formats"""
    output_dir = Path(__file__).parent.parent / 'docs' / 'calendars'
    output_dir.mkdir(exist_ok=True, parents=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Save as JSON for easy parsing
    json_file = output_dir / f'calendar_data_{timestamp}.json'
    with open(json_file, 'w') as f:
        json.dump(calendars_data, f, indent=2, default=str)
    
    # Also save as latest
    latest_file = output_dir / 'calendar_latest.json'
    with open(latest_file, 'w') as f:
        json.dump(calendars_data, f, indent=2, default=str)
    
    # Create human-readable summary
    summary_file = output_dir / f'calendar_summary_{timestamp}.md'
    with open(summary_file, 'w') as f:
        f.write(f"# Calendar Summary - {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n")
        
        for cal_name, events in calendars_data.items():
            f.write(f"\n## {cal_name}\n")
            f.write(f"Total events: {len(events)}\n\n")
            
            for event in events[:10]:  # First 10 events
                start = event.get('start', {})
                start_time = start.get('dateTime', start.get('date', 'N/A'))
                summary = event.get('summary', 'No title')
                f.write(f"- {start_time}: {summary}\n")
            
            if len(events) > 10:
                f.write(f"\n... and {len(events) - 10} more events\n")
    
    print(f"\n✓ Calendar data saved to: {output_dir}")
    return json_file

def main():
    """Main function to fetch all calendar data"""
    # Authenticate
    creds = authenticate()
    if not creds:
        print("Authentication failed. Please run setup first.")
        return
    
    # Build service
    service = build('calendar', 'v3', credentials=creds)
    
    # List calendars
    calendars = list_calendars(service)
    if not calendars:
        return
    
    # Select calendars to sync
    print("\nWhich calendars to sync? (comma-separated numbers, or 'all')")
    selection = input("> ").strip()
    
    if selection.lower() == 'all':
        selected_cals = calendars
    else:
        indices = [int(x.strip()) - 1 for x in selection.split(',')]
        selected_cals = [calendars[i] for i in indices if 0 <= i < len(calendars)]
    
    # Fetch events from selected calendars
    all_calendar_data = {}
    
    for cal in selected_cals:
        cal_id = cal['id']
        cal_name = cal['summary']
        print(f"\nFetching events from: {cal_name}")
        
        events = fetch_events(service, cal_id)
        all_calendar_data[cal_name] = events
        print(f"  Found {len(events)} events")
    
    # Save data
    save_calendar_data(all_calendar_data)

if __name__ == "__main__":
    main()