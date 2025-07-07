# Google Calendar Setup - 5 Minute Guide

## Step 1: Install Dependencies (30 seconds)

**Important**: Run this in WSL (Ubuntu), not Windows CMD/PowerShell!

```bash
# Make sure you're in WSL
pip install -r requirements.txt

# If pip not found, install it first:
# sudo apt update && sudo apt install python3-pip
```

## Step 2: Create Google Cloud Project (2 minutes)

1. Open: https://console.cloud.google.com/projectcreate
2. Project name: `omega-calendar` (or whatever)
3. Click "Create"

## Step 3: Enable Calendar API (30 seconds)

1. Direct link: https://console.cloud.google.com/apis/library/calendar-json.googleapis.com
2. Click "Enable"

## Step 4: Create Credentials (2 minutes)

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "+ CREATE CREDENTIALS" → "OAuth client ID"
3. If prompted, configure consent screen:
   - User Type: Internal (for corporate account)
   - App name: `Omega Calendar`
   - Skip everything else
4. Application type: Desktop app
5. Name: `Omega Calendar Client`
6. Click "Create"
7. Click "DOWNLOAD JSON"

## Step 5: Save Credentials (30 seconds)

1. Create folder: `mkdir -p .credentials`
2. Move downloaded file to: `.credentials/credentials.json`

## Step 6: Run Setup (30 seconds)

```bash
python scripts/google_calendar_setup.py
```

This will:
- Open browser for authentication
- Let you select which calendars to sync
- Save your preferences

## Done!

From now on, just run:
```bash
python scripts/quick_calendar_fetch.py
```

Your calendar data will be in `/docs/calendars/calendar_latest.json`