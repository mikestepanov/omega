#!/usr/bin/env python3
"""
STATUS Meeting Tracker
Tracks monthly STATUS meetings with Avraham and related prep calls
"""

import json
from datetime import datetime, timedelta
from pathlib import Path
import re

def load_calendar_data():
    """Load the latest calendar data"""
    calendar_file = Path('docs/calendars/calendar_latest.json')
    if not calendar_file.exists():
        print("❌ No calendar data found. Run: python3 scripts/fetch_calendar_simple.py")
        return None
    
    with open(calendar_file, 'r') as f:
        return json.load(f)

def is_status_meeting(event):
    """Check if an event is STATUS-related"""
    summary = event.get('summary', '').lower()
    patterns = [
        'status',
        'avraham',
        'demo prep',
        'prep call',
        '1-on-1',
        '1:1',
        'one on one'
    ]
    return any(pattern in summary for pattern in patterns)

def extract_person_name(summary):
    """Extract person's name from meeting title"""
    # Pattern: "Name: STATUS Demo Prep" or "1-on-1 with Name"
    patterns = [
        r'^(\w+):\s*STATUS',
        r'1-on-1 with (\w+)',
        r'1:1 with (\w+)',
        r'^(\w+)\s*[-–]\s*STATUS',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, summary, re.IGNORECASE)
        if match:
            return match.group(1)
    
    # If no pattern matches but it's STATUS-related, return the summary
    if 'status' in summary.lower():
        return summary.split(':')[0].strip() if ':' in summary else summary
    
    return None

def analyze_status_meetings(calendar_data):
    """Analyze STATUS meeting patterns"""
    events = calendar_data.get('primary', [])
    
    status_meetings = []
    for event in events:
        if is_status_meeting(event):
            start = event.get('start', {})
            start_time = start.get('dateTime', start.get('date'))
            
            if start_time:
                # Parse the datetime
                if 'T' in start_time:
                    dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
                else:
                    dt = datetime.fromisoformat(start_time)
                
                status_meetings.append({
                    'date': dt,
                    'summary': event.get('summary', 'No title'),
                    'person': extract_person_name(event.get('summary', '')),
                    'attendees': [a.get('email', '').split('@')[0] for a in event.get('attendees', [])]
                })
    
    # Sort by date
    status_meetings.sort(key=lambda x: x['date'])
    
    return status_meetings

def group_by_month(meetings):
    """Group meetings by month"""
    monthly_groups = {}
    
    for meeting in meetings:
        month_key = meeting['date'].strftime('%Y-%m')
        if month_key not in monthly_groups:
            monthly_groups[month_key] = {
                'main_meeting': None,
                'prep_meetings': [],
                'people_met': set()
            }
        
        # Check if it's the main meeting with Avraham
        if 'avraham' in meeting['summary'].lower() and 'prep' not in meeting['summary'].lower():
            monthly_groups[month_key]['main_meeting'] = meeting
        else:
            monthly_groups[month_key]['prep_meetings'].append(meeting)
            if meeting['person']:
                monthly_groups[month_key]['people_met'].add(meeting['person'])
    
    return monthly_groups

def generate_report(monthly_groups):
    """Generate STATUS meeting report"""
    print("📊 STATUS Meeting Report")
    print("=" * 50)
    
    for month, data in sorted(monthly_groups.items(), reverse=True):
        month_name = datetime.strptime(month, '%Y-%m').strftime('%B %Y')
        print(f"\n📅 {month_name}")
        print("-" * 30)
        
        # Main meeting
        if data['main_meeting']:
            meeting = data['main_meeting']
            print(f"✓ Main STATUS with Avraham: {meeting['date'].strftime('%b %d, %I:%M %p')}")
        else:
            print("✗ No main STATUS meeting scheduled")
        
        # Prep meetings
        if data['prep_meetings']:
            print(f"\n  Prep Meetings ({len(data['prep_meetings'])}):")
            for meeting in data['prep_meetings']:
                person = meeting['person'] or 'Unknown'
                print(f"  - {person}: {meeting['date'].strftime('%b %d, %I:%M %p')}")
        
        # People covered
        if data['people_met']:
            print(f"\n  People covered: {', '.join(sorted(data['people_met']))}")
    
    # Save report
    report_file = Path('docs/status_reports') / f'status_report_{datetime.now().strftime("%Y%m%d")}.json'
    report_file.parent.mkdir(exist_ok=True)
    
    with open(report_file, 'w') as f:
        # Convert sets to lists for JSON serialization
        serializable_groups = {}
        for month, data in monthly_groups.items():
            serializable_groups[month] = {
                'main_meeting': data['main_meeting'],
                'prep_meetings': data['prep_meetings'],
                'people_met': list(data['people_met'])
            }
        json.dump(serializable_groups, f, indent=2, default=str)
    
    print(f"\n💾 Report saved to: {report_file}")

def main():
    # Load calendar data
    calendar_data = load_calendar_data()
    if not calendar_data:
        return
    
    # Analyze STATUS meetings
    status_meetings = analyze_status_meetings(calendar_data)
    
    if not status_meetings:
        print("No STATUS meetings found in calendar")
        return
    
    # Group by month
    monthly_groups = group_by_month(status_meetings)
    
    # Generate report
    generate_report(monthly_groups)
    
    # Quick stats
    print(f"\n📈 Quick Stats:")
    print(f"   Total STATUS-related meetings: {len(status_meetings)}")
    print(f"   Months with STATUS activity: {len(monthly_groups)}")

if __name__ == "__main__":
    main()