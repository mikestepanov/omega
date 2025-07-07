# Lesson 6.1: Competitor Intelligence Dashboard

## Title
Competitor Intelligence Dashboard

## Description
Build a real-time dashboard tracking competitor health, customer satisfaction, and market vulnerabilities. Spot trends before they become opportunities and position yourself ahead of market shifts.

## Video Script
"Most people react to competitor problems. We're going to predict them. Because by the time a competitor has a public meltdown, it's actually too late - everyone's already fighting over those customers.

The real opportunity is seeing the problems brewing. Support response times gradually increasing. Employee satisfaction dropping. Feature development slowing. Customer complaints shifting from minor to major. These are leading indicators of future opportunities.

Think of this like having a Bloomberg terminal for your competitors' health. You'll track everything from their Glassdoor ratings to their support response times, from their product update frequency to their customer satisfaction trends.

This isn't creepy corporate espionage - it's aggregating public information into actionable intelligence. Every data point we track is publicly available. We're just connecting dots that others miss.

By the end of this lesson, you'll have a dashboard that alerts you to competitor vulnerabilities weeks before they explode into public problems. You'll see price increases coming, predict feature removals, and spot support degradation before customers start complaining.

Let's build your competitive intelligence command center."

## Dashboard Architecture

### Key Performance Indicators (KPIs)

**Competitor Health Metrics**:
```
Product Stability:
- Uptime percentage (last 30 days)
- Incident frequency trend
- Resolution time average
- Feature release velocity
- Bug report volume

Customer Satisfaction:
- Review rating trends (G2, Capterra)
- NPS score changes
- Support response times
- Community engagement levels
- Complaint volume patterns

Business Health:
- Employee satisfaction (Glassdoor)
- Hiring/firing patterns
- Executive turnover
- Funding/financial news
- Market share changes

Vulnerability Indicators:
- Price change signals
- Feature deprecation hints
- Support team stress
- Technical debt indicators
- Customer churn signals
```

### Data Collection Framework

**Automated Monitoring Points**:
```
Daily Collection:
- Status page checks
- Social media mentions
- Support response times
- Community activity
- Review monitoring

Weekly Collection:
- Employee reviews
- Job posting changes
- Product updates
- Press coverage
- Forum sentiment

Monthly Collection:
- Pricing page changes
- Feature comparisons
- Market analysis
- Financial indicators
- Strategic shifts
```

## Google Sheets Dashboard Setup

### Master Dashboard Structure

**Sheet 1: Executive Summary**
```
Competitor Overview Table:
| Competitor | Health Score | Trend | Key Issues | Opportunities | Action |
|------------|--------------|-------|------------|---------------|--------|
| Comp A     | 72/100      | ↓     | Support    | High          | Monitor|
| Comp B     | 45/100      | ↓↓    | Reliability| Critical      | Attack |
| Comp C     | 88/100      | →     | None       | Low           | Watch  |

Key Metrics Summary:
- Total vulnerabilities detected: ___
- High-priority opportunities: ___
- Leads generated this week: ___
- Conversion rate from intel: ___%
```

**Sheet 2: Competitor Deep Dives**
```
[Competitor A] Tab:
- Uptime tracking (daily)
- Support metrics (hourly)
- Review trends (weekly)
- Employee sentiment (monthly)
- Vulnerability timeline
- Opportunity pipeline
```

**Sheet 3: Automated Alerts**
```
Alert Configuration:
- Score drops below 60
- Uptime below 95%
- Support response >4 hours
- Employee rating <3.0
- Major incident detected
- Price change detected
```

### Scoring Algorithm

**Competitor Health Score (0-100)**:
```
Components:
Product Stability (30 points):
- Uptime: 15 points (99.9% = 15, 95% = 0)
- Incident rate: 10 points
- Update frequency: 5 points

Customer Satisfaction (40 points):
- Review ratings: 20 points
- Support metrics: 10 points  
- Community health: 10 points

Business Health (30 points):
- Employee satisfaction: 15 points
- Financial stability: 10 points
- Market position: 5 points

Formula:
=ROUND(
  (Uptime_Score * 0.15) +
  (Incident_Score * 0.10) +
  (Update_Score * 0.05) +
  (Review_Score * 0.20) +
  (Support_Score * 0.10) +
  (Community_Score * 0.10) +
  (Employee_Score * 0.15) +
  (Financial_Score * 0.10) +
  (Market_Score * 0.05)
* 100, 0)
```

## Automated Data Collection

### Web Scraping Configuration

**Browse.ai Monitoring Robots**:
```
Status Page Monitor:
- URL: status.[competitor].com
- Frequency: Every hour
- Extract: Current status, incident history
- Alert: Any degradation

Review Aggregator:
- URLs: G2, Capterra, TrustRadius pages
- Frequency: Daily
- Extract: New reviews, rating changes
- Alert: 1-2 star reviews

Glassdoor Tracker:
- URL: glassdoor.com/[competitor]
- Frequency: Weekly
- Extract: Rating, review count, themes
- Alert: Rating drop >0.3

Pricing Monitor:
- URL: [competitor].com/pricing
- Frequency: Daily
- Extract: All pricing elements
- Alert: Any changes detected
```

### API Integrations

**Data Source APIs**:
```
Uptime Monitoring:
- StatusPage API
- Pingdom public stats
- DownDetector data
- Custom endpoint monitoring

Social Listening:
- Twitter API (mentions, sentiment)
- Reddit API (complaint mining)
- LinkedIn (company updates)

Review Platforms:
- G2 API (if available)
- Public review feeds
- RSS aggregation
- Manual scraping fallback
```

## Predictive Analytics

### Leading Indicator Patterns

**Price Increase Predictors**:
```
Early Warning Signs (60-90 days before):
- Funding announcements end
- Enterprise focus increases
- Feature development slows
- Grandfathering language appears
- Support tiers restructure

Score Adjustment:
Each indicator detected: -5 points
Multiple indicators: Exponential decrease
```

**Outage Risk Indicators**:
```
Technical Debt Signals:
- Bug reports increasing
- Feature releases delayed
- Hotfix frequency up
- Performance complaints
- Infrastructure job postings

Reliability Prediction:
Low risk: 0-2 indicators
Medium risk: 3-4 indicators  
High risk: 5+ indicators
Adjust monitoring frequency accordingly
```

### Trend Analysis

**Moving Average Calculations**:
```
7-Day Trends:
=AVERAGE(B2:B8) vs AVERAGE(B9:B15)
Direction: =IF(Recent > Previous, "↑", "↓")
Velocity: =ABS(Recent - Previous) / Previous

30-Day Patterns:
- Support response degradation
- Review rating trajectory
- Employee satisfaction shifts
- Incident frequency changes
```

## Alert System Configuration

### Multi-Channel Alerting

**Slack Integration**:
```
Critical Alerts (Immediate):
/alert-critical
"🚨 [Competitor] DOWN - Outage detected at [time]"
"🚨 [Competitor] employee rating dropped to 2.4/5"
"🚨 [Competitor] raising prices effective [date]"

Opportunity Alerts (Within 1 hour):
/alert-opportunity  
"💰 New 1-star review from [Company] about [Competitor]"
"💰 [Competitor] support backlog growing - 8hr response times"
"💰 Major feature removal announced at [Competitor]"

Intelligence Updates (Daily digest):
/intel-daily
Summary of all competitor movements
Score changes and trajectories
New opportunities identified
```

### Email Alert Templates

**Weekly Intelligence Report**:
```
Subject: Competitor Intel: 3 opportunities this week

This Week's Highlights:
1. [Competitor A] reliability dropping - 3 outages
2. [Competitor B] support overwhelmed - 24hr waits  
3. [Competitor C] losing enterprise features

Detailed Analysis:
[Automated content from dashboard]

Action Items:
- Target [Competitor A] customers re: reliability
- Prepare support comparison for [B] prospects
- Create feature preservation campaign for [C]

Dashboard: [Link]
```

## Competitive Response Playbooks

### Automated Campaign Triggers

**Score-Based Actions**:
```
Score 80-100: Minimal Action
- Monitor only
- Quarterly review
- Learn from success

Score 60-79: Active Monitoring
- Weekly review
- Opportunity scanning
- Prep campaigns

Score 40-59: Attack Mode
- Daily monitoring
- Active lead generation
- Launch campaigns

Score <40: Full Assault
- Real-time monitoring
- All hands response
- Maximum extraction
```

### Opportunity Prioritization

**Lead Quality Scoring**:
```
Opportunity Value = 
  (Competitor Weakness Severity) x
  (Number of Affected Customers) x
  (Our Solution Fit) x
  (Timing Urgency)

Example:
Outage affecting enterprise (High x High x High x High) = Priority 1
Price increase for SMBs (Medium x High x Medium x Low) = Priority 3
```

## Advanced Intelligence Techniques

### Competitive War Gaming

**Scenario Planning**:
```
"What If" Monitoring:
- What if they raise prices 30%?
- What if their CTO leaves?
- What if they get acquired?
- What if they have weekly outages?

Pre-Built Responses:
- Price increase campaigns ready
- Stability comparison content
- Migration guides prepared
- Emergency capacity reserved
```

### Market Share Tracking

**Relative Performance Metrics**:
```
Win/Loss Tracking:
- Deals won from each competitor
- Deals lost to each competitor
- Neutral (kept existing solution)
- Win rate trends

Market Movement:
- New customers citing competitor
- Churned customers destination
- Industry mindshare changes
- Analyst sentiment shifts
```

## Dashboard Maintenance

### Data Quality Assurance

**Weekly Validation Tasks**:
```
□ Verify scraping still working
□ Check for website changes
□ Validate score calculations
□ Review alert accuracy
□ Update thresholds if needed
□ Archive old data
□ Plan next week's focus
```

### Continuous Improvement

**Monthly Optimization**:
```
Questions to Answer:
- Which metrics predicted opportunities?
- Which alerts generated leads?
- What patterns did we miss?
- How can we predict earlier?

Adjustments:
- Add new data sources
- Refine scoring weights
- Improve alert timing
- Enhance predictive models
```

## ROI Measurement

### Intelligence Value Tracking

**Attribution Metrics**:
```
Leads from Intelligence:
- Outage detection: ___ leads
- Price monitoring: ___ leads
- Review mining: ___ leads
- Support tracking: ___ leads

Conversion Impact:
- Intel-sourced close rate: ___%
- Regular close rate: ___%
- Speed to close: ___ days faster
- Deal size: $____ larger
```

Your competitor intelligence dashboard now serves as your strategic command center, turning market monitoring into predictable revenue generation through systematic opportunity detection.