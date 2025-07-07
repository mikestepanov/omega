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

# Final missing links to verify
final_links = [
    # Notion outages
    {
        'url': 'https://techcrunch.com/2021/02/15/notions-hours-long-outage-was-caused-by-phishing-complaints/',
        'keywords': ['Notion', 'outage', '2021', 'users']
    },
    {
        'url': 'https://techcrunch.com/2021/02/12/notion-outage-dns-domain-issues/',
        'keywords': ['Notion', 'outage', 'DNS', 'domain']
    },
    # QuickBooks
    {
        'url': 'https://www.business.com/reviews/quickbooks-online/',
        'keywords': ['QuickBooks', 'complicated', 'complex', 'overwhelming']
    }
]

print("="*60)
print("VERIFYING FINAL MISSING LINKS")
print("="*60)

for link_info in final_links:
    verify_link(link_info['url'], link_info['keywords'])
    time.sleep(1)

print("\n" + "="*60)