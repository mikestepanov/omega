#!/usr/bin/env python3
import requests
from html.parser import HTMLParser
import time

class ContentExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text_content = []
        self.in_script = False
        self.in_style = False
        
    def handle_starttag(self, tag, attrs):
        if tag == 'script':
            self.in_script = True
        elif tag == 'style':
            self.in_style = True
            
    def handle_endtag(self, tag):
        if tag == 'script':
            self.in_script = False
        elif tag == 'style':
            self.in_style = False
            
    def handle_data(self, data):
        if not self.in_script and not self.in_style:
            cleaned = data.strip()
            if cleaned and len(cleaned) > 20:
                self.text_content.append(cleaned)

def verify_link(url, keywords):
    """Verify if a URL contains expected content"""
    print(f"\nChecking: {url}")
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 404:
            print(f"❌ 404 Not Found")
            return False
            
        if response.status_code != 200:
            print(f"⚠️  Status Code: {response.status_code}")
            return False
            
        # Extract text content
        parser = ContentExtractor()
        parser.feed(response.text)
        text = ' '.join(parser.text_content).lower()
        
        # Check for keywords
        found_keywords = [kw for kw in keywords if kw.lower() in text]
        
        if found_keywords:
            print(f"✅ Working - Found: {', '.join(found_keywords)}")
            return True
        else:
            print(f"⚠️  No relevant content")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

# Additional links to verify
additional_links = [
    # Re-Logic donation
    {
        'url': 'https://www.gamedeveloper.com/business/terraria-developer-re-logic-condemns-unity-donates-100k-to-godot-and-fna',
        'keywords': ['Re-Logic', '100', 'Godot', 'Unity']
    },
    # Slack outage
    {
        'url': 'https://status.slack.com/2022-02-22',
        'keywords': ['Slack', 'incident', 'outage', 'February']
    },
    # AWS outage
    {
        'url': 'https://aws.amazon.com/message/12721/',
        'keywords': ['AWS', 'outage', 'us-east-1', 'December']
    },
    # Photoshop articles
    {
        'url': 'https://www.creativebloq.com/web-design/why-you-should-switch-photoshop-sketch-11618620',
        'keywords': ['Photoshop', 'Sketch', 'switch', 'alternative']
    },
    {
        'url': 'https://www.creativebloq.com/art/digital-art-software/photoshop-vs-krita',
        'keywords': ['Photoshop', 'Krita', 'Adobe', 'alternative']
    },
    # QuickBooks
    {
        'url': 'https://www.inc.com/michelle-cheng/prices-quickbooks-accounting-software.html',
        'keywords': ['QuickBooks', 'price', 'small', 'business']
    },
    # GitHub BleepingComputer correct article
    {
        'url': 'https://www.bleepingcomputer.com/news/technology/github-explains-the-cause-behind-the-past-weeks-outages/',
        'keywords': ['GitHub', 'outage', 'March', 'MySQL']
    },
    # Zoom support page
    {
        'url': 'https://support.zoom.us/hc/en-us/articles/202460676-Time-limits-for-Zoom-Meetings',
        'keywords': ['Zoom', '40', 'minutes', 'limit']
    }
]

print("="*60)
print("VERIFYING ADDITIONAL LINKS")
print("="*60)

for link_info in additional_links:
    verify_link(link_info['url'], link_info['keywords'])
    time.sleep(1)

print("\n" + "="*60)