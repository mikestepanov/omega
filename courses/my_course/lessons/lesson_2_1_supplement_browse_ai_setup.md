# Lesson 2.1 Supplement: Browse.ai Step-by-Step Setup Guide

## What This Guide Covers
Exactly how to set up Browse.ai robots to monitor competitor pricing, detect changes, and send alerts. No CSS selectors needed - just click and configure.

## Before You Start
- Have Browse.ai account ready (from Lesson 0.2)
- Have Zapier account connected
- Know which competitor pricing page to monitor
- Allow 15 minutes per robot setup

## Step 1: Create Your First Robot

1. **Log into Browse.ai**: https://browse.ai/dashboard
2. Click **"Create Robot"** (big blue button)
3. Select **"Monitor a website for changes"**
4. Enter competitor's pricing URL (e.g., competitor.com/pricing)
5. Click **"Start Setup"**

## Step 2: Visual Selection (No Code Needed)

Browse.ai opens your competitor's page in their selector tool.

1. **Wait for page to fully load** (crucial - be patient)
2. **Click on the first price** you want to monitor
3. A popup appears - name it clearly:
   - ❌ Bad: "price1" 
   - ✅ Good: "starter_plan_monthly_price"
4. Click **"Add to robot"**

5. **Repeat for each element**:
   - All pricing tiers
   - Plan names (they might change)
   - Feature lists (watch for removals)
   - "Contact us" buttons (enterprise changes)

**Pro tip**: Click the actual price numbers, not the whole pricing card.

## Step 3: Configure Change Detection

After selecting all elements:

1. Click **"Done selecting"** (top right)
2. Configure monitoring settings:
   - **Check frequency**: Daily (save credits)
   - **Change threshold**: Any change
   - **Screenshot**: Yes (proof for clients)
   - **Alert method**: Webhook to Zapier

## Step 4: Connect to Zapier

1. In Browse.ai, go to robot settings
2. Find **"Webhook URL"** field
3. Open new tab, go to Zapier
4. Create new Zap:
   - Trigger: **Webhooks by Zapier**
   - Event: **Catch Hook**
   - Copy the webhook URL
5. Paste back in Browse.ai
6. Click **"Test webhook"**

## Step 5: Test Your Robot

**Critical**: Test before trusting it's working.

1. In Browse.ai, click **"Run robot now"**
2. Check the Results tab
3. Verify all data captured correctly
4. Common issues:
   - Prices showing as "$0" = page loaded too fast
   - Missing elements = they're dynamically loaded
   - Error messages = site blocks bots

## Step 6: Handle Dynamic Sites

If the site loads prices with JavaScript:

1. In robot settings, find **"Advanced"**
2. Increase **"Wait time"** to 10 seconds
3. Enable **"Wait for specific element"**
4. Enter a price element selector
5. Test again

Still not working? The site might be:
- Behind a login (need credentials)
- Using anti-bot protection (try different times)
- Loading from API (need different approach)

## Common Monitoring Setups

### Setup A: SaaS Pricing Monitor
Monitor these elements:
- Monthly price (all tiers)
- Annual price (all tiers)
- User/seat limits
- Feature lists
- "Most Popular" badges
- Currency selector

### Setup B: E-commerce Price Tracker
Monitor these elements:
- Product price
- "Was/Now" pricing
- Stock status
- Shipping cost
- Bulk discounts
- Coupon codes

### Setup C: Service Business Tracker
Monitor these elements:
- Package prices
- Hourly rates
- "Starting at" prices
- Add-on services
- Location-based pricing
- Promotional banners

## Zapier Processing Setup

Once Browse.ai sends data to Zapier:

1. **Add Filter**: Only continue if price changed
2. **Add Formatter**: Calculate % change
3. **Add Paths**:
   - Path A: >10% increase → Urgent alert
   - Path B: 5-10% increase → Normal alert
   - Path C: Price decrease → Opportunity alert
4. **Add Actions**:
   - Update Google Sheet
   - Send Slack notification
   - Trigger email campaign

## Credit Optimization

**Each Browse.ai check = 1 credit**

Save credits by:
- Check daily, not hourly (30 credits/month vs 720)
- Monitor one page with multiple prices (not separate robots)
- Pause robots for stable competitors
- Delete robots for dead competitors

## Troubleshooting Guide

**"No changes detected" (but you see changes)**
- Robot checking wrong element
- Page structure changed
- Need to recreate robot

**"Error: Page didn't load"**
- Site blocking Browse.ai
- Try different check times
- Use proxy option (settings)

**"Webhook not firing"**
- Test webhook URL in browser
- Check Zapier webhook is "On"
- Regenerate webhook URL

**"Running out of credits"**
- Reduce check frequency
- Combine similar monitors
- Delete unused robots
- Upgrade if ROI justifies

## Quick Reference

**Browse.ai Limits**:
- Free: 50 credits/month
- Credits reset: Monthly on signup date
- Each check: 1 credit
- Screenshot: No extra credits

**Best Practices**:
- Name robots clearly
- Group by competitor
- Export data monthly
- Document what each monitors

## Next Steps

With Browse.ai configured:
1. Set up 2-3 competitor monitors
2. Let run for 48 hours
3. Check for false positives
4. Refine your selections
5. Build your response campaigns

---

**Remember**: Browse.ai is visual - no coding needed. If you're writing CSS selectors or code, you're overcomplicating it. Click, name, save, test.