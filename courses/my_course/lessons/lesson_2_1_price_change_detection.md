# Lesson 2.1: Price Change Detection System

## Title
Price Change Detection System

## Description
Set up automated monitoring that catches competitor price increases within 24 hours. Configure alerts for pricing pages, press releases, and customer complaints. Build the trigger system that starts your hijack sequence.

## Video Script
"Welcome to Chapter 2, where we start hunting. In Chapter 1, you built the machine. Now we're going to feed it targets.

Price increases are pure gold for competitor customer hijacking. Why? Because angry customers announce themselves. They literally post 'I can't believe [Competitor] raised prices by 40%!' on social media. It's like they're waving a flag saying 'Please steal me as a customer.'

But here's the thing - timing is everything. If you reach out 6 months after a price increase, you look like spam. If you reach out within 24-48 hours, you look like a savior who was paying attention.

The key is building a detection system that catches price changes from three angles: official announcements, website changes, and customer reactions. Most people only monitor one or two of these, which is why they miss 70% of opportunities.

We're going to set up monitoring for pricing pages using Browse.ai, Google Alerts for press releases and blog posts, social media monitoring for customer complaints, and even email monitoring in case competitors announce changes to their customer base first.

By the end of this lesson, you'll have a system that notifies you within hours when any competitor makes a pricing move, and automatically starts enriching the complaints before you even see them.

Let's start hunting."

## Detection Strategy Overview

### Three-Layer Monitoring System

**Layer 1: Official Sources** (1-4 hour detection)
- Competitor pricing pages
- Company blog posts
- Press releases
- Investor updates

**Layer 2: Customer Reactions** (1-24 hour detection)
- Social media complaints
- Review site updates
- Forum discussions
- Support ticket patterns

**Layer 3: Industry Coverage** (4-48 hour detection)
- Industry news sites
- Competitor analysis blogs
- LinkedIn company updates
- Newsletter mentions

## Setup: Official Source Monitoring

### Browse.ai Pricing Page Monitoring

**Step 1: Identify Target Pages**
```
Primary Targets:
- [Competitor 1]/pricing
- [Competitor 2]/plans-pricing
- [Competitor 3]/subscription

Secondary Targets:
- [Competitor 1]/enterprise-pricing
- [Competitor 2]/startup-plans
- [Competitor 3]/volume-discounts
```

**Step 2: Configure Browse.ai Robot**
- **Robot Name**: "Competitor Pricing Monitor"
- **Schedule**: Every 6 hours
- **Change Detection**: Text and price elements only
- **Alert Threshold**: Any price change >5%
- **Webhook**: Send to Zapier when changes detected

**Step 3: Data Extraction Setup**
```
Extract Elements:
- Plan names
- Monthly prices
- Annual prices
- Feature changes
- Promotional offers
- Effective dates
```

### Google Alerts for Official Announcements

**Alert Setup Pattern**:
```
"[Competitor Name]" + "price increase"
"[Competitor Name]" + "pricing update"
"[Competitor Name]" + "new pricing"
"[Competitor Name]" + "subscription cost"
"[Competitor Name]" + "plan changes"
```

**Advanced Alert Configuration**:
- **Frequency**: As-it-happens
- **Sources**: News + Blogs + Web
- **Language**: English
- **Region**: Your target market
- **Deliver to**: Dedicated Gmail address

### Press Release Monitoring

**RSS Feeds to Monitor**:
- Company investor relations pages
- PR Newswire company sections
- Business Wire company profiles
- Company LinkedIn pages

**Bardeen Automation**:
- Monitor RSS feeds every 2 hours
- Extract pricing-related keywords
- Send matches to central spreadsheet
- Trigger enrichment for recent announcements

## Setup: Customer Reaction Monitoring

### Social Media Complaint Detection

**Twitter/X Monitoring**:
```
Search Queries:
"@[CompetitorHandle] price increase"
"@[CompetitorHandle] more expensive"
"@[CompetitorHandle] cost too much"
"[CompetitorName] pricing" + negative sentiment
"can't afford [CompetitorName]"
```

**Reddit Monitoring**:
```
Subreddits to Watch:
- r/[YourIndustry]
- r/smallbusiness
- r/entrepreneur
- r/startups
- r/[CompetitorName] (if exists)
```

**PhantomBuster Social Scraping**:
- Daily searches for competitor mentions + price keywords
- Extract user profiles showing frustration
- Export to CSV for enrichment pipeline
- Filter for business accounts vs. personal complaints

### Review Site Monitoring

**Target Review Platforms**:
- G2.com competitor pages
- Capterra competitor listings
- Trustpilot company pages
- Software Advice reviews

**Browse.ai Review Scraping**:
- Monitor "Recent Reviews" sections
- Alert on 1-2 star reviews mentioning "price" or "cost"
- Extract reviewer names and companies
- Feed into enrichment pipeline

## Setup: Industry Coverage Monitoring

### News Site Monitoring

**Target Publications**:
- TechCrunch
- VentureBeat
- Industry-specific publications
- Competitor analysis blogs

**Google Alerts Setup**:
```
"[Competitor]" + "raises prices"
"[Competitor]" + "pricing strategy"
"[Competitor]" + "subscription increase"
"[Competitor]" + "cost more"
```

### LinkedIn Monitoring

**Company Page Monitoring**:
- Official competitor LinkedIn pages
- Key executive accounts
- Company update feeds
- Employee shared content

**Sales Navigator Setup**:
- Follow competitor companies
- Set alerts for pricing-related posts
- Monitor employee sentiment changes
- Track leadership announcements

## Automation Flow Configuration

### Zapier Integration Workflow

**Trigger Sources** → **Processing** → **Actions**

```
Browse.ai Price Change → 
  Parse price difference → 
    If >10% increase → 
      Start complaint search → 
        Enrich findings → 
          Queue for outreach

Google Alert → 
  Extract announcement details → 
    Search social for reactions → 
      Find complainers → 
        Add to hot leads

Social Mention → 
  Verify complaint authenticity → 
    Enrich user profile → 
      Score lead quality → 
        Route to appropriate template
```

### Data Processing Rules

**Price Change Significance**:
- <5% increase: Monitor only
- 5-15% increase: Standard alert
- 15-25% increase: High priority
- >25% increase: Emergency response mode

**Complaint Freshness Scoring**:
- <24 hours: Hot (score 10)
- 1-7 days: Warm (score 7)
- 1-4 weeks: Cool (score 4)
- >1 month: Cold (score 1)

**Lead Quality Filters**:
- Business email address: +3 points
- Company size >10 employees: +2 points
- Decision maker title: +3 points
- Multiple complaints: +2 points
- Public complaint: +1 point

## Alert Configuration

### Notification Hierarchy

**Immediate Alerts** (Slack/SMS):
- Price increases >20%
- Major feature removals
- Service outages >2 hours
- Viral negative complaints

**Hourly Alerts** (Email):
- Price increases 10-20%
- New negative reviews
- Social media complaints
- Press coverage mentions

**Daily Alerts** (Email digest):
- Minor price adjustments
- General competitor mentions
- Industry news coverage
- Weekly summary metrics

### Alert Message Templates

**Price Increase Alert**:
```
🚨 PRICE ALERT: [Competitor] increased [Plan] pricing by [X]%
- Old Price: $[X]/month
- New Price: $[Y]/month  
- Effective: [Date]
- Source: [URL]
- Complaints Found: [Number]
- Next Action: [Automated/Manual]
```

**Social Complaint Alert**:
```
💬 NEW COMPLAINT: [Platform] user frustrated with [Competitor]
- User: [Name] at [Company]
- Complaint: "[Quote]"
- Reach Score: [X]/10
- Email Found: [Yes/No]
- Template Matched: [Which one]
```

## Monitoring Dashboard Setup

### Google Sheets Dashboard

**Tab 1: Price Changes Detected**
- Competitor
- Old Price
- New Price
- % Change
- Detection Date
- Source
- Complaints Found
- Status

**Tab 2: Active Complaints**
- Platform
- User
- Company
- Complaint Text
- Freshness Score
- Lead Quality
- Email Status
- Outreach Status

**Tab 3: Performance Metrics**
- Detection Speed (hours)
- Complaint Volume
- Lead Quality Distribution
- Conversion Rates
- Weekly/Monthly Trends

### Real-Time Monitoring View

**Slack Channel Setup**:
- #competitor-alerts (immediate notifications)
- #price-changes (daily digest)
- #social-complaints (customer reactions)
- #lead-pipeline (enrichment status)

## Quality Control & Validation

### False Positive Prevention

**Price Change Validation**:
- Require 2+ sources for major increases
- Verify effective dates
- Check for promotional vs. permanent changes
- Validate percentage calculations

**Complaint Authenticity**:
- Filter bot accounts
- Verify business context
- Check complaint specificity
- Validate user engagement history

### Accuracy Monitoring

**Weekly Quality Checks**:
☐ Verify 5 random price change detections
☐ Validate complaint authenticity sample
☐ Check enrichment accuracy rates
☐ Review false positive patterns
☐ Update filtering rules based on learnings

## Optimization Guidelines

### Performance Tuning

**Detection Speed Optimization**:
- Increase monitoring frequency for hot prospects
- Prioritize high-value competitor monitoring
- Reduce checks on stable competitors
- Focus on business hours for social monitoring

**Lead Quality Improvement**:
- Refine scoring algorithms based on conversions
- Add new complaint sentiment indicators
- Improve business vs. personal filtering
- Enhance competitor relevance scoring

### Scaling Considerations

**Monthly Capacity Planning**:
- Monitor detection volume trends
- Adjust tool limits before hitting caps
- Rotate monitoring focus by competitor importance
- Plan enrichment pipeline capacity

**Tool Rotation Strategy**:
- Primary tools for tier 1 competitors
- Secondary tools for tier 2 competitors
- Basic monitoring for tier 3 competitors
- Weekly rotation to maximize free limits

Your price change detection system is now your early warning system for competitor customer hijacking opportunities. In the next lesson, we'll build the outage opportunity monitor that catches competitors when they're down.