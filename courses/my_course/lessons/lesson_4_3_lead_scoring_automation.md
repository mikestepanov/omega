# Lesson 4.3: Lead Scoring & Automation

## Title
Lead Scoring & Automation

## Description
Build an intelligent lead scoring system that prioritizes your hottest prospects automatically. Route leads to different campaigns based on pain level, urgency, and company fit. Make every minute count.

## Video Script
"Here's the brutal truth about lead scoring: most people do it backwards. They score leads based on demographics - company size, industry, location. But that's like judging how hungry someone is by their height. 

We're going to score leads based on pain intensity. A 10-person startup CEO who just tweeted 'We're switching from [Competitor] TODAY' is worth more than a Fortune 500 middle manager who casually mentioned pricing concerns.

The magic happens when you combine pain signals with timing. Someone complaining about an outage scores higher during the outage than a week later. Someone asking for alternatives before their renewal scores higher than someone locked in a contract.

We'll build a dynamic scoring system that updates in real-time based on competitor actions, complaint freshness, and buying signals. Then we'll automatically route leads to different campaigns - emergency response for the highest scorers, nurture sequences for medium scores, and passive monitoring for low scores.

By the end of this lesson, your system will automatically prioritize the leads most likely to convert right now, while nurturing future opportunities without any manual intervention.

Let's build your lead scoring intelligence."

## Pain-Based Scoring Framework

### Core Scoring Components

**Pain Intensity Score (0-10)**:
```
Critical Pain (8-10 points):
- Service down/outage mentions
- "Can't work" / "Blocking us"
- "Losing money" / "Missing deadlines"
- "Emergency" / "Urgent" / "ASAP"
- Public escalation attempts

High Pain (5-7 points):
- Feature removal impacts
- Price increase complaints
- "Looking for alternatives"
- Support complaint + time mention
- "Frustrated" / "Disappointed"

Medium Pain (3-4 points):
- General complaints
- Feature requests ignored
- "Considering options"
- Performance issues
- "Not happy with"

Low Pain (1-2 points):
- Minor annoyances
- Wishlist features
- Comparison shopping
- Price shopping only
- No urgency language
```

### Timing Decay Function

**Complaint Freshness Multiplier**:
```
Age-Based Scoring:
< 1 hour: 2.0x multiplier
1-6 hours: 1.8x multiplier
6-24 hours: 1.5x multiplier
1-3 days: 1.2x multiplier
3-7 days: 1.0x multiplier
1-2 weeks: 0.8x multiplier
2-4 weeks: 0.5x multiplier
> 1 month: 0.3x multiplier

Formula:
Final Score = Pain Score × Timing Multiplier × Other Factors
```

### Authority & Fit Scoring

**Decision Maker Authority**:
```
High Authority (+3 points):
- C-level titles
- VP/Director level
- "Head of" roles
- Founder/Owner
- Decision maker language

Influencer (+2 points):
- Manager level
- Team lead
- Senior roles
- Technical authority
- Budget influence mentioned

User (+1 point):
- Individual contributor
- End user
- No title mentioned
- Junior roles
- Team member

Company Fit Bonus:
Perfect ICP match: +2 points
Good fit: +1 point
Acceptable fit: 0 points
Poor fit: -2 points
```

## Automated Scoring Implementation

### Google Sheets Formula System

**Master Scoring Formula**:
```
=IF(ISBLANK(B2),"",
  (
    IFS(
      REGEXMATCH(LOWER(F2),"emergency|urgent|asap|down|outage"),10,
      REGEXMATCH(LOWER(F2),"losing money|can't work|blocking"),9,
      REGEXMATCH(LOWER(F2),"switching|leaving|alternative"),7,
      REGEXMATCH(LOWER(F2),"frustrated|terrible|disappointed"),5,
      REGEXMATCH(LOWER(F2),"considering|looking|evaluating"),4,
      TRUE,2
    )
    *
    IF(DAYS(TODAY(),E2)<1,2,
      IF(DAYS(TODAY(),E2)<3,1.5,
        IF(DAYS(TODAY(),E2)<7,1.2,
          IF(DAYS(TODAY(),E2)<14,0.8,0.5)
        )
      )
    )
    +
    IFS(
      REGEXMATCH(LOWER(D2),"ceo|cto|cfo|founder|owner"),3,
      REGEXMATCH(LOWER(D2),"vp|director|head of"),2,
      REGEXMATCH(LOWER(D2),"manager|lead|senior"),1,
      TRUE,0
    )
    +
    IF(G2="Perfect Fit",2,IF(G2="Good Fit",1,0))
  )
)
```

### Dynamic Score Updates

**Real-Time Recalculation**:
```
Trigger Events:
- New complaint detected
- Time threshold passed
- Competitor event occurs
- Additional signal found
- Enrichment completed

Score Adjustments:
- Outage detected: +3 to all related leads
- Price increase announced: +2 to price complaints
- Feature removed: +2 to feature complaints
- Support issues trending: +1 to support complaints
```

## Lead Routing Automation

### Score-Based Campaign Assignment

**Routing Rules**:
```
Score 9-10: Emergency Response Campaign
- Immediate outreach (< 2 hours)
- Emergency access offer
- Direct phone call attempt
- Slack/LinkedIn parallel contact
- Executive involvement

Score 7-8: Hot Pursuit Campaign
- Same-day outreach
- Personalized video
- Calendar link included
- Multiple touchpoints
- Solution-specific focus

Score 5-6: Active Evaluation Campaign
- 24-48 hour outreach
- Educational content
- Competitive comparison
- Case study inclusion
- Gradual urgency build

Score 3-4: Nurture Campaign
- Weekly touchpoints
- Value-first content
- Thought leadership
- Community building
- Long-term positioning

Score 1-2: Monitor Only
- Monthly check-ins
- Newsletter inclusion
- General updates
- Market education
- Competitor monitoring
```

### Zapier Routing Workflows

**Automated Campaign Distribution**:
```
Trigger: Score Calculated in Sheet
↓
Filter: Score >= 9
Action: Add to Emergency CRM Campaign
Action: Send Slack Alert
Action: Create Priority Task
↓
Filter: Score 7-8
Action: Add to Hot Pursuit Campaign
Action: Schedule Same-Day Email
Action: Add to Sales Queue
↓
[Continue for all score ranges]
```

## Multi-Signal Intelligence

### Signal Stacking Bonuses

**Compound Scoring Events**:
```
Multiple Complaints (+2):
- Same person, multiple platforms
- Escalating frustration
- Repeated attempts
- Growing urgency

Team Complaints (+3):
- Multiple people, same company
- Department-wide issues
- Systematic problems
- Enterprise opportunity

Competitor Actions (+1-3):
- During active outage: +3
- After price increase: +2
- Post feature removal: +2
- Following bad support: +1
```

### Behavioral Scoring Signals

**Engagement Indicators**:
```
Research Behavior (+1 each):
- Visited pricing page
- Downloaded comparison guide
- Attended webinar
- Engaged with content
- Requested demo

Social Signals (+0.5 each):
- Liked competitor alternative post
- Shared switching content
- Joined evaluation community
- Asked for recommendations
- Connected with your team
```

## Advanced Scoring Algorithms

### Machine Learning Preparation

**Historical Pattern Analysis**:
```
Conversion Correlation Data:
- Which scores actually converted
- Time from score to close
- Score stability over time
- False positive patterns
- Score inflation indicators

Predictive Adjustments:
- Industry-specific multipliers
- Seasonal adjustments
- Competitor event impacts
- Economic indicators
- Market timing factors
```

### Score Normalization

**Preventing Score Inflation**:
```
Distribution Targets:
- 1-5% score 9-10 (emergency)
- 5-10% score 7-8 (hot)
- 15-20% score 5-6 (warm)
- 30-40% score 3-4 (nurture)
- 30-40% score 1-2 (monitor)

Automatic Adjustments:
IF >10% scoring 9-10
THEN increase thresholds by 10%

IF <1% scoring 9-10
THEN decrease thresholds by 10%
```

## Campaign Performance Optimization

### A/B Testing by Score Range

**Score-Specific Testing**:
```
High Scores (9-10):
- Test: Immediate vs 2-hour delay
- Test: Phone vs email first
- Test: Emergency offer variations
- Test: Executive vs rep outreach

Medium Scores (5-6):
- Test: Education vs solution focus
- Test: Single vs multi-touch
- Test: Content types
- Test: Urgency creation methods

Low Scores (1-4):
- Test: Frequency of touch
- Test: Content topics
- Test: Channel preferences
- Test: Conversion triggers
```

### Score Accuracy Validation

**Monthly Calibration Process**:
```
Review Metrics:
1. Score distribution analysis
2. Conversion rate by score
3. False positive rate
4. Score decay accuracy
5. Manual override frequency

Adjustments:
- Pain keyword updates
- Timing decay refinement
- Authority recognition
- Fit criteria updates
- Threshold modifications
```

## Integration and Automation

### CRM Score Syncing

**Real-Time Updates**:
```
Score Change Triggers:
- New activity detected
- Time threshold passed
- Enrichment completed
- Engagement occurred
- Status changed

CRM Field Updates:
- Current score
- Score history
- Score components
- Last update time
- Trend direction
```

### Alert and Notification System

**Smart Alerting Rules**:
```
Immediate Alerts (Score 9-10):
- Slack: @channel notification
- SMS: Sales rep
- Email: Team lead
- CRM: Priority flag
- Calendar: Book time

Hourly Digest (Score 7-8):
- Slack: Channel post
- Email: Team summary
- CRM: Task creation
- Dashboard: Update

Daily Summary (Score 5-6):
- Email: Lead report
- CRM: Campaign addition
- Dashboard: Metrics
```

## Reporting and Analytics

### Score Performance Dashboard

**Key Metrics Display**:
```
Real-Time Metrics:
- Current lead distribution
- Average scores by source
- Score velocity (trending up/down)
- Conversion rate by score
- Time-to-contact by score

Historical Analysis:
- Score accuracy trends
- Campaign performance
- Source quality scoring
- Competitor event impacts
- Seasonal patterns
```

### ROI by Score Range

**Financial Impact Analysis**:
```
Revenue Attribution:
- Revenue per score point
- CAC by score range
- LTV by initial score
- Velocity by score
- Win rate correlation

Resource Optimization:
- Time invested by score
- Tool credits by score
- Human touch by score
- Automation percentage
- Efficiency metrics
```

Your lead scoring automation now acts as an intelligent triage system, ensuring your hottest prospects get immediate attention while nurturing future opportunities on autopilot.