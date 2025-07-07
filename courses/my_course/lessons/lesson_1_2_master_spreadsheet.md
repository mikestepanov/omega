# Lesson 1.2: The Master Spreadsheet Command Center

## Title
The Master Spreadsheet Command Center

## Description
Use our spreadsheet template structures from `/document_templates/spreadsheet_templates.md` to build your tracking system. Learn the exact formulas, automation setup, and why certain columns are critical. Set up the key views: "Hot Leads," "Processing," and "Money Made."

## Video Script
"Okay, you've got all your accounts set up. Now we need mission control - the spreadsheet that runs everything.

Head over to `/document_templates/spreadsheet_templates.md` where you'll find our exact spreadsheet structures. This isn't some generic 'lead tracker' - these are the exact templates we use, with every formula included and column structure tested.

Here's what makes this different: Most people build their spreadsheet as they go and end up with a mess. We're starting with the end in mind. This sheet is designed to handle 200+ leads per month without breaking, and it talks to all 15 tools automatically.

Three critical rules before we start:
1. Column F is sacred - it has our lead scoring formula. Touch it and everything breaks.
2. Always add data to the bottom, never insert rows in the middle
3. The 'RAW DATA' tab is append-only. Never edit, only add.

Let's walk through each tab..."

## Spreadsheet Structure

### Tab 1: Hot Leads Dashboard
**Purpose**: Your daily command center
- Live feed of high-priority leads
- Auto-sorted by complaint freshness
- Color-coded by lead quality
- Quick action buttons

**Key Columns**:
- Name, Company, Email
- Complaint Type, Complaint Date
- Lead Score (auto-calculated)
- Status, Next Action

### Tab 2: Processing Queue
**Purpose**: Leads being enriched/contacted
- Webhooks from tools update this automatically
- Shows current status in pipeline
- Error tracking and retry logic

**Automation Flow**:
- New lead added → Auto-enrichment triggered
- Email found → Moves to outreach queue
- Email sent → Starts follow-up sequence

### Tab 3: Money Made
**Purpose**: Track results and ROI
- Customers acquired from competitors
- Revenue attribution
- Campaign performance metrics
- Monthly/quarterly reporting

### Tab 4: RAW DATA (Hidden)
**Purpose**: All data gets dumped here first
- Zapier writes to this tab
- Data validation and cleaning
- Feeds the other tabs

## Critical Formulas Explained

### Lead Scoring Formula (Column F)
```
=IF(ISBLANK(E2),"",
  (DAYS(TODAY(),D2)*-1 + 10) * 
  IF(ISNUMBER(SEARCH("hate",C2)),3,
    IF(ISNUMBER(SEARCH("terrible",C2)),2,1)) *
  IF(G2="Enterprise",1.5,1))
```
**Translation**: Fresh complaints about things they "hate" from enterprise companies = highest score

### Complaint Age Calculator
```
=IF(ISBLANK(D2),"",
  IF(DAYS(TODAY(),D2)<=1,"🔥 HOT",
    IF(DAYS(TODAY(),D2)<=7,"⚡ WARM",
      IF(DAYS(TODAY(),D2)<=30,"❄️ COLD","🗑️ STALE"))))
```

### Email Status Tracker
```
=IF(ISBLANK(H2),"❌ No Email",
  IF(I2="Sent","✅ Contacted",
    IF(I2="Replied","💰 Responded","📧 Ready")))
```

## Webhook Configuration

### From Apollo (via Zapier)
- Trigger: New lead exported
- Action: Add to RAW DATA tab
- Fields: Name, Company, Title, Industry

### From Clay (via webhook)
- Trigger: Enrichment completed
- Action: Update email + personal info
- Error handling: Flag for manual review

### From YAMM (via Google Apps Script)
- Trigger: Email sent
- Action: Update status, start follow-up timer

## Views & Filters

### Hot Leads View
- Filter: Score > 7
- Sort: Complaint date (newest first)
- Auto-refresh: Every 15 minutes

### Today's Actions
- Filter: Next action = Today
- Includes: Follow-ups, new outreach, responses

### Weekly Pipeline
- Shows conversion funnel
- Leads found → Enriched → Contacted → Replied → Customers

## Backup & Security

**Daily Backups**: Auto-copy to "Backup_[DATE]" folder
**Access Control**: View-only for team, edit for you only
**Data Retention**: Keep 90 days of raw data, archive rest

## Troubleshooting Common Issues

**Problem**: Formulas showing #REF! errors
**Solution**: Don't delete columns, only hide them

**Problem**: Zapier stopped updating
**Solution**: Check webhook URLs in Zapier settings

**Problem**: Scores seem wrong
**Solution**: Check date format (should be MM/DD/YYYY)

**Problem**: Duplicate entries
**Solution**: Use Data → Remove duplicates on email column

## Setup Instructions

1. **Copy the template** (link provided in course)
2. **Rename to**: "[Your Company] Competitor Leads"
3. **Share with tools**: Get shareable link for Zapier
4. **Test with sample data**: Add yourself as a test lead
5. **Verify all formulas work**: Check calculations manually

## Maintenance Schedule

**Daily** (2 minutes):
- Check Hot Leads tab
- Review any error flags
- Clear completed actions

**Weekly** (5 minutes):
- Archive old leads
- Check automation health
- Update scoring weights if needed

**Monthly** (10 minutes):
- Review performance metrics
- Backup to new folder
- Optimize based on what's working

Your spreadsheet is now the nerve center of your operation. Everything flows through here, and everything gets tracked. In the next lesson, we'll test the entire system with yourself as the guinea pig."