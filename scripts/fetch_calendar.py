#!/usr/bin/env python3
import os
import requests
from datetime import datetime, timedelta
from pathlib import Path

def fetch_calendar():
    """Fetch calendar from secret iCal URL"""
    # Try to load from .env if exists
    env_path = Path(__file__).parent.parent / '.env'
    if env_path.exists():
        from dotenv import load_dotenv
        load_dotenv()
    
    url = os.getenv('CALENDAR_ICS_URL')
    if not url:
        print("ERROR: Set CALENDAR_ICS_URL in .env file")
        print("See scripts/setup_calendar_access.md for instructions")
        return False
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        # Save snapshot
        output_dir = Path(__file__).parent.parent / 'docs'
        output_dir.mkdir(exist_ok=True)
        
        output_file = output_dir / f'calendar_{datetime.now().strftime("%Y%m%d")}.ics'
        output_file.write_text(response.text)
        
        # Also save as latest
        latest = output_dir / 'calendar_latest.ics'
        latest.write_text(response.text)
        
        print(f"✓ Calendar synced: {output_file.name}")
        return True
        
    except Exception as e:
        print(f"✗ Failed to fetch calendar: {e}")
        return False

if __name__ == "__main__":
    fetch_calendar()