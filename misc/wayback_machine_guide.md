# Wayback Machine Guide for Finding Archived Links

## How to Search Wayback Machine for Specific Dates

### 1. Basic URL Search
- Go to https://web.archive.org/
- Paste the full URL in the search box
- Click "Browse History"
- You'll see a calendar view with dots on dates when the page was archived

### 2. Direct URL Format for Specific Dates
The Wayback Machine uses this URL structure:
```
https://web.archive.org/web/YYYYMMDDHHMMSS/[original-url]
```

Example:
```
https://web.archive.org/web/20220515120000/https://mailchimp.com/resources/pricing-update-may-2022/
```

### 3. Using Wildcards to Find All Versions
To see all archived versions of a URL:
```
https://web.archive.org/web/*/[original-url]
```

### 4. Date Range Searches
You can specify date ranges in the calendar view or use the CDX API:
```
https://web.archive.org/cdx/search/cdx?url=[original-url]&from=202105&to=202112
```

## Checking Your Specific Links

### 1. Mailchimp Pricing Update (May 2022)
**Original URL:** https://mailchimp.com/resources/pricing-update-may-2022/

**How to check:**
```
https://web.archive.org/web/*/https://mailchimp.com/resources/pricing-update-may-2022/
```

**Alternative searches:**
- Try the main blog: https://web.archive.org/web/*/https://mailchimp.com/resources/
- Search for May 2022 snapshots: https://web.archive.org/web/202205*/https://mailchimp.com/resources/

### 2. The Verge - Evernote Device Limit Article
**Original URL:** https://www.theverge.com/2021/6/24/22548858/evernote-free-tier-device-limit

**How to check:**
```
https://web.archive.org/web/*/https://www.theverge.com/2021/6/24/22548858/evernote-free-tier-device-limit
```

**Note:** The Verge articles are frequently archived, so this likely exists.

### 3. TechCrunch - Notion Outage Article
**Original URL:** https://techcrunch.com/2021/11/08/notion-goes-down/

**How to check:**
```
https://web.archive.org/web/*/https://techcrunch.com/2021/11/08/notion-goes-down/
```

**Note:** TechCrunch is heavily archived, so this should be available.

## Tips for Finding Archived Content

### 1. If Exact URL Doesn't Work
- Remove trailing slashes
- Try without "www"
- Check the parent directory
- Search for keywords on the archived site

### 2. Using Google Cache as Alternative
While not as comprehensive as Wayback Machine:
```
cache:[original-url]
```

### 3. Other Web Archives to Try
- **archive.today**: https://archive.is/
- **Google Cache**: Search Google and click the cached link
- **Bing Cache**: Similar to Google
- **Library of Congress Web Archives**: https://www.loc.gov/websites/

### 4. Finding Similar Content
If the exact article isn't archived:
- Search the publication's archive page for that time period
- Look for press releases on the company's site
- Check social media archives (Twitter announcements, etc.)

## Example Working Archived Links

Here are examples of how archived links typically look:

1. **For news articles around specific dates:**
   ```
   https://web.archive.org/web/20210624*/https://www.theverge.com/2021/6/24/*
   ```

2. **For company announcements:**
   ```
   https://web.archive.org/web/202205*/https://mailchimp.com/resources/*
   ```

3. **For tech news:**
   ```
   https://web.archive.org/web/20211108*/https://techcrunch.com/2021/11/08/*
   ```

## Quick Reference Commands

To quickly check if your links are archived, use these direct searches:

1. **Mailchimp May 2022:**
   - https://web.archive.org/web/202205*/mailchimp.com/resources/*pricing*

2. **Evernote June 2021:**
   - https://web.archive.org/web/20210624*/theverge.com/*evernote*

3. **Notion November 2021:**
   - https://web.archive.org/web/20211108*/techcrunch.com/*notion*

## Next Steps

1. Start with the direct URL search for each link
2. If not found, try the wildcard searches
3. Check parent directories and date ranges
4. Use alternative archives if Wayback Machine doesn't have it
5. Search for related coverage from the same time period