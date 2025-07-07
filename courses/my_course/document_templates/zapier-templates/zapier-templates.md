# Zapier Template Library - Copy These Exact Zaps

## Before You Start
- Have Zapier account ready (from Lesson 0.2)
- Connect your tools first (one-time setup)
- Test with single records before going live
- Monitor task usage (100/month free limit)

---

## Zap Template 1: Competitor Price Change Alert System

### What It Does
Detects price changes → Enriches leads → Sends to Google Sheets → Triggers email campaign

### Trigger: Browse.ai Webhook
```
1. Event: Catch Hook
2. Test: Run Browse.ai robot once to send test data
3. Sample Data Structure:
   {
     "competitor": "CompetitorName",
     "old_price": "49",
     "new_price": "69",
     "change_percent": "40",
     "detected_time": "2024-10-25T10:30:00Z"
   }
```

### Action 1: Formatter by Zapier
```
1. Event: Numbers
2. Transform: Perform Math Operation
3. Input: {{new_price}} - {{old_price}}
4. Operation: Subtract
5. Output: price_difference
```

### Action 2: Filter by Zapier
```
1. Only continue if...
2. change_percent | (Number) Greater than | 10
3. Why: Only act on significant price increases
```

### Action 3: Hunter.io Find Email
```
1. Event: Domain Search
2. Domain: {{competitor}}.com
3. Type: Personal
4. Limit: 10
5. Output: email_list
```

### Action 4: Google Sheets
```
1. Event: Create Spreadsheet Row
2. Spreadsheet: Competitor Monitoring
3. Worksheet: Price_Changes
4. Row Data:
   - Date: {{detected_time}}
   - Competitor: {{competitor}}
   - Old Price: {{old_price}}
   - New Price: {{new_price}}
   - Change %: {{change_percent}}
   - Status: "Detected - Pending Outreach"
```

### Action 5: Delay by Zapier
```
1. Event: Delay For
2. Time: 2 Hours
3. Why: Don't appear too eager/creepy
```

### Action 6: Gmail
```
1. Event: Create Draft
2. To: your-email@domain.com
3. Subject: ACTION: {{competitor}} raised prices {{change_percent}}%
4. Body: 
   Price increase detected!
   
   Competitor: {{competitor}}
   Old: ${{old_price}}
   New: ${{new_price}}
   Increase: {{change_percent}}%
   
   Target emails found: {{email_list}}
   
   Next steps:
   1. Research these companies using {{competitor}}
   2. Send price increase email template
   3. Track responses in sheet
```

---

## Zap Template 2: Email Waterfall Enrichment System

### What It Does
Takes new lead → Tries multiple email finders in sequence → Saves credits by stopping when found

### Trigger: Google Sheets
```
1. Event: New Spreadsheet Row
2. Spreadsheet: Lead Pipeline
3. Worksheet: New_Leads
4. Trigger Column: Email_Status (when empty)
```

### Action 1: Clearbit Enrichment
```
1. Event: Find Person
2. Full Name: {{First_Name}} {{Last_Name}}
3. Domain: {{Company_Domain}}
4. Output: clearbit_email
```

### Action 2: Filter - Check if Found
```
1. Only continue if...
2. clearbit_email | Does not exist
3. Why: Save credits if already found
```

### Action 3: Hunter.io (If Clearbit Failed)
```
1. Event: Email Finder
2. Full Name: {{First_Name}} {{Last_Name}}
3. Domain: {{Company_Domain}}
4. Output: hunter_email
```

### Action 4: Filter - Check Hunter Result
```
1. Only continue if...
2. hunter_email | Does not exist
3. Why: Stop if found
```

### Action 5: Snov.io (Last Resort)
```
1. Event: Email Finder
2. First Name: {{First_Name}}
3. Last Name: {{Last_Name}}
4. Domain: {{Company_Domain}}
5. Output: snov_email
```

### Action 6: Google Sheets Update
```
1. Event: Update Spreadsheet Row
2. Row: {{Row_ID}}
3. Updates:
   - Email: {{clearbit_email|hunter_email|snov_email}}
   - Email_Source: {{which_tool_found_it}}
   - Credits_Used: {{count}}
   - Status: "Email Found" or "Not Found"
```

---

## Zap Template 3: Social Complaint to Lead Pipeline

### What It Does
Monitors social mentions → Identifies complaints → Enriches poster → Adds to outreach queue

### Trigger: RSS by Zapier
```
1. Event: New Item in Feed
2. Feed URL: https://zapier.com/engine/rss/[your-saved-search]
3. Alternative: Use Mention.com or Brand24 triggers
```

### Action 1: Filter by Zapier
```
1. Only continue if...
2. Title | Contains | "frustrated" OR "annoyed" OR "terrible" OR "switching"
3. AND
4. Content | Contains | {{competitor_name}}
```

### Action 2: Formatter - Extract Username
```
1. Event: Text
2. Transform: Extract Pattern
3. Input: {{author}}
4. Pattern: @(\w+)
5. Output: twitter_username
```

### Action 3: Clay Enrichment
```
1. Event: Enrich Person
2. Twitter: {{twitter_username}}
3. Get: Email, Company, Title
4. Output: enriched_data
```

### Action 4: Lead Scoring
```
1. Event: Spreadsheet Lookup
2. Lookup: {{enriched_data.title}}
3. Table: Title_Scores
4. Return: score_value
5. Default: 50
```

### Action 5: Router by Zapier
```
Path A: High Priority (Score > 80)
  → Create Slack notification
  → Add to "Hot Leads" sheet
  → Send immediate email draft

Path B: Medium Priority (Score 50-80)
  → Add to regular pipeline
  → Schedule for tomorrow

Path C: Low Priority (Score < 50)
  → Add to nurture list only
```

---

## Zap Template 4: Outage Opportunity Alert

### What It Does
Detects competitor downtime → Finds affected users → Creates targeted campaign

### Trigger: StatusPage Webhook
```
1. Event: Status Change
2. Filter: Component status != "operational"
3. Include: Incident details
```

### Action 1: Twitter Search
```
1. Query: "{{competitor}} down" OR "{{competitor}} not working"
2. Time range: Last 2 hours
3. Output: affected_users
```

### Action 2: Looping by Zapier
```
1. Event: Create Loop From Line Items
2. Input: {{affected_users}}
3. For each user:
   - Extract username
   - Look up in database
   - Check if existing customer
```

### Action 3: Conditional Logic
```
IF existing_customer = false
  AND follower_count > 500
  AND verified_email exists
THEN add_to_outage_campaign
ELSE skip
```

### Action 4: Create Campaign
```
1. Tool: Your email tool
2. Campaign: "{{competitor}} Outage - {{date}}"
3. Template: Outage response
4. Send time: +3 hours from detection
5. Include: Status page screenshot
```

---

## Zap Template 5: Review Mining to Leads

### What It Does
Finds negative reviews → Identifies reviewer → Adds to pipeline with context

### Trigger: Schedule by Zapier
```
1. Event: Every Day
2. Time: 9:00 AM
3. Why: Fresh reviews for the day
```

### Action 1: Webhooks by Zapier
```
1. Event: GET
2. URL: https://api.reviews.io/{{competitor}}/reviews
3. Query Params: 
   - rating: 1,2,3
   - date: last_24_hours
4. Headers: API_KEY: {{your_key}}
```

### Action 2: Looping
```
For each review:
1. Extract reviewer name
2. Extract company (if mentioned)
3. Extract main complaint
4. Calculate "pain score"
```

### Action 3: Enrichment Cascade
```
Try in order:
1. Email from review platform
2. LinkedIn search → email finder
3. Company website → domain search
4. Manual research flag
```

### Action 4: Google Sheets
```
Add row with:
- Reviewer info
- Pain points (quoted)
- Suggested approach
- Priority score
- Research time investment
```

---

## Task Usage Optimization

### Calculate Tasks Per Zap
```
Price Monitor: 5 tasks per run
Email Waterfall: 2-6 tasks per lead
Social Monitor: 4 tasks per mention
Outage Alert: 10+ tasks per incident
Review Mining: 3 tasks per review
```

### 100 Free Tasks Budget Example
```
- 5 price checks daily = 35 tasks/week
- 10 leads enriched = 40 tasks/week
- 5 social mentions = 20 tasks/week
- Buffer = 5 tasks
Total: 100 tasks/month
```

### When to Upgrade
- Consistently hitting limits
- ROI proven (1+ deals closed)
- Need multi-step Zaps
- Want faster execution

---

## Common Errors & Fixes

### "Task failed: Timeout"
- API took too long
- Add delay between steps
- Reduce batch size

### "Invalid webhook data"
- Test trigger not sent
- JSON formatting error
- Check webhook URL

### "Rate limit exceeded"
- Too many API calls
- Add delays
- Upgrade API plan

### "No data returned"
- Wrong field mapping
- Empty required fields
- Check permissions

---

## Testing Checklist

Before going live:
- [ ] Test with single record
- [ ] Verify all field mappings
- [ ] Check error handling
- [ ] Calculate task usage
- [ ] Set up error notifications
- [ ] Document the workflow
- [ ] Create manual backup plan

---

## Pro Tips

1. **Name Zaps clearly**: "Price Monitor - CompetitorX to Sheets"
2. **Use folders**: Organize by function
3. **Version control**: Duplicate before major changes
4. **Monitor tasks**: Check usage weekly
5. **Document everything**: Future you will thank you

Remember: These Zaps are your automation engine. Set them up once, monitor regularly, and let them find leads while you sleep.