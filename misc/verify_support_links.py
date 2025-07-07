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

# Support-related links to verify
support_links = [
    # Zendesk
    {
        'url': 'https://www.trustpilot.com/review/www.zendesk.com',
        'keywords': ['Zendesk', 'support', 'slow', 'response']
    },
    # GoDaddy
    {
        'url': 'https://www.trustpilot.com/review/www.godaddy.com',
        'keywords': ['GoDaddy', 'support', 'wait', 'customer']
    },
    # LastPass
    {
        'url': 'https://blog.lastpass.com/posts/changes-to-lastpass-free',
        'keywords': ['LastPass', 'free', 'device', 'changes']
    },
    {
        'url': 'https://www.androidpolice.com/2021/03/16/lastpass-nerfs-free-tier-effectively-forcing-users-to-pay-for-premium/',
        'keywords': ['LastPass', 'free', 'tier', 'device']
    },
    # Dropbox
    {
        'url': 'https://www.engadget.com/2019-03-14-dropbox-basic-three-device-limit.html',
        'keywords': ['Dropbox', 'device', 'limit', 'three']
    },
    # Jira
    {
        'url': 'https://dev.to/linearb_inc/jira-is-a-microcosm-of-what-s-broken-in-software-development-4lj3',
        'keywords': ['Jira', 'complex', 'broken', 'development']
    },
    # Salesforce
    {
        'url': 'https://www.salesmate.io/blog/salesforce-for-small-businesses-expensive/',
        'keywords': ['Salesforce', 'expensive', 'small', 'business']
    }
]

print("="*60)
print("VERIFYING SUPPORT-RELATED LINKS")
print("="*60)

working_links = []
for link_info in support_links:
    if verify_link(link_info['url'], link_info['keywords']):
        working_links.append(link_info['url'])
    time.sleep(1)

print(f"\n✅ Working links: {len(working_links)}")
print("="*60)