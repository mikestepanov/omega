# Spreadsheet Template Library

## How to Use These Templates

Each template below shows the exact structure to copy into Google Sheets. Create separate sheets/tabs for each template in one master workbook.

---

## Template 1: Credit Tracking Dashboard

### Sheet Name: Credit_Tracker

| Tool | Total Credits | Used | Remaining | Reset Date | Next Reset | Days Until Reset | Usage % | Notes |
|------|---------------|------|-----------|------------|------------|------------------|---------|--------|
| Hunter.io | 25 | 12 | 13 | 15th | Nov 15 | =DAYS(F2,TODAY()) | =B2/A2*100 | Domain searches only |
| Clearbit | 100 | 67 | 33 | 1st | Nov 1 | =DAYS(F3,TODAY()) | =B3/A3*100 | Tech companies best |
| Snov.io | 50 | 23 | 27 | 8th | Nov 8 | =DAYS(F4,TODAY()) | =B4/A4*100 | International good |
| Browse.ai | 50 | 31 | 19 | 22nd | Nov 22 | =DAYS(F5,TODAY()) | =B5/A5*100 | 4 robots active |
| Clay | 100 | 78 | 22 | 1st | Nov 1 | =DAYS(F6,TODAY()) | =B6/A6*100 | Save for enrichment |

**Conditional Formatting Rules**:
- Column D (Remaining): Red if <20%, Yellow if <50%, Green if >50%
- Column G (Days Until Reset): Red if <3 days
- Column H (Usage %): Red if >80%

---

## Template 2: Master Lead Tracking

### Sheet Name: Lead_Pipeline

| Date Added | Company | Website | Industry | Employee Count | Contact Name | Title | Email Status | Email | Tool Used | Enrichment Date | Campaign | Status | Notes |
|------------|---------|---------|----------|----------------|--------------|--------|--------------|--------|-----------|-----------------|----------|---------|--------|
| 10/25/24 | TechCorp | techcorp.com | SaaS | 50-200 | John Smith | CTO | Verified | j.smith@techcorp.com | Hunter.io | 10/25/24 | Price_Hike_Q4 | Sent | Opened 3x |
| 10/25/24 | StartupXYZ | startup.xyz | FinTech | 10-50 | Jane Doe | CEO | Found | jane@startup.xyz | Clearbit | 10/26/24 | Outage_Response | Queued | Hot lead |
| 10/26/24 | BigCo | bigco.com | Enterprise | 1000+ | Mike Johnson | VP Sales | Searching | - | - | - | - | Research | Needs email |

**Key Formulas**:
- Email Found Rate: `=COUNTIF(H:H,"Verified")/COUNTA(B:B)*100`
- Tool Effectiveness: `=COUNTIF(J:J,"Hunter.io")/COUNTA(J:J)*100`
- Days Since Added: `=TODAY()-A2`

---

## Template 3: Campaign Performance Tracker

### Sheet Name: Campaign_Metrics

| Campaign Name | Start Date | End Date | Total Leads | Emails Sent | Opens | Open Rate | Clicks | CTR | Replies | Reply Rate | Positive | Negative | Meetings | Cost | CPL | CPM |
|---------------|------------|----------|-------------|-------------|--------|-----------|---------|-----|---------|------------|----------|----------|----------|------|-----|-----|
| Price_Hike_Oct | 10/15/24 | 10/30/24 | 127 | 98 | 43 | =F2/E2 | 12 | =H2/F2 | 8 | =J2/E2 | 5 | 3 | 2 | $49 | =O2/D2 | =O2/N2 |
| Outage_Alert_Oct | 10/22/24 | 10/25/24 | 43 | 43 | 31 | =F3/E3 | 18 | =H3/F3 | 14 | =J3/E3 | 10 | 4 | 4 | $0 | =O3/D3 | =O3/N3 |

**Benchmark Columns** (for comparison):
- Good Open Rate: >25%
- Good CTR: >15% 
- Good Reply Rate: >8%
- Target CPM: <$25

---

## Template 4: Competitor Monitoring Log

### Sheet Name: Competitor_Intel

| Date Detected | Competitor | Change Type | Old Value | New Value | % Change | Source | Response Triggered | Campaign Link | Result | Notes |
|---------------|------------|-------------|-----------|-----------|----------|---------|-------------------|---------------|---------|--------|
| 10/24/24 | CompetitorA | Price Increase | $49 | $69 | =((E2-D2)/D2)*100 | Browse.ai | Yes | Oct_PriceResponse | 3 conversions | 40% increase |
| 10/25/24 | CompetitorB | Feature Removal | Unlimited | 1000/mo | -90% | Manual | Yes | Feature_Advantage | 1 conversion | API limits added |
| 10/26/24 | CompetitorC | Outage | Online | Offline | -100% | StatusPage | No | - | - | Only 2 hours |

**Alert Formulas**:
- Price Change Alert: `=IF(F2>20,"MAJOR INCREASE",IF(F2>10,"Notable","-"))`
- Response Success: `=COUNTIF(J:J,">0 conversions")/COUNTIF(H:H,"Yes")*100`

---

## Template 5: Email Waterfall Tracker

### Sheet Name: Email_Waterfall

| Lead Name | Company | Attempt 1 Tool | Attempt 1 Result | Attempt 2 Tool | Attempt 2 Result | Attempt 3 Tool | Attempt 3 Result | Final Email | Verified | Credits Used |
|-----------|---------|----------------|------------------|----------------|------------------|----------------|------------------|-------------|----------|--------------|
| John Doe | ACME Corp | Clearbit | Not Found | Hunter.io | john.doe@acme.com | - | - | john.doe@acme.com | Yes | 2 |
| Jane Smith | XYZ Inc | Clearbit | jsmith@xyz.com | - | - | - | - | jsmith@xyz.com | Yes | 1 |
| Bob Johnson | StartupABC | Clearbit | Not Found | Hunter.io | Not Found | Snov.io | bob@startupabc.com | bob@startupabc.com | No | 3 |

**Efficiency Metrics**:
- First Attempt Success: `=COUNTIF(D:D,"<>Not Found")/COUNTA(C:C)*100`
- Average Credits per Find: `=AVERAGE(K:K)`
- Tool Success Rates: Create pivot table by tool

---

## Template 6: ROI Calculator

### Sheet Name: ROI_Analysis

| Month | Leads Generated | Emails Sent | Meetings Booked | Deals Closed | Revenue | Tool Costs | Other Costs | Total Cost | ROI | ROI % |
|-------|----------------|-------------|-----------------|--------------|---------|------------|-------------|------------|-----|-------|
| October | 312 | 287 | 12 | 3 | $4,500 | $98 | $50 | =G2+H2 | =F2-I2 | =J2/I2*100 |
| November | 425 | 398 | 18 | 5 | $7,500 | $147 | $50 | =G3+H3 | =F3-I3 | =J3/I3*100 |

**Key Metrics**:
- Cost per Lead: `=I2/B2`
- Cost per Meeting: `=I2/D2`
- Cost per Deal: `=I2/E2`
- Close Rate: `=E2/D2*100`

---

## How to Import These Templates

1. **Create new Google Sheet**: sheets.new
2. **Create 6 tabs** with names above
3. **Copy each table structure** exactly
4. **Add formulas** where indicated
5. **Set up conditional formatting** as described
6. **Test with sample data** first

## Pro Tips

1. **Link sheets together**: Use IMPORTRANGE to pull data between sheets
2. **Automate updates**: Connect Zapier to auto-update from tools
3. **Create dashboard**: Make overview tab with key metrics
4. **Backup weekly**: Download CSV copies
5. **Share carefully**: View-only for clients

---

**Note**: These templates are starting points. Customize columns based on your workflow, but keep the core tracking elements.