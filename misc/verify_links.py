#!/usr/bin/env python3
import requests
from html.parser import HTMLParser
import re
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
            if cleaned and len(cleaned) > 20:  # Skip very short text
                self.text_content.append(cleaned)

def verify_link(url, keywords):
    """Verify if a URL contains expected content"""
    print(f"\n{'='*60}")
    print(f"Checking: {url}")
    print(f"Looking for: {', '.join(keywords)}")
    print('-'*60)
    
    try:
        # Add headers to avoid bot detection
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        status = response.status_code
        
        if status == 404:
            print(f"❌ 404 Not Found")
            return False
            
        if status != 200:
            print(f"⚠️  Status Code: {status}")
            return False
            
        # Extract text content
        parser = ContentExtractor()
        parser.feed(response.text)
        text = ' '.join(parser.text_content).lower()
        
        # Check for keywords
        found_keywords = []
        for keyword in keywords:
            if keyword.lower() in text:
                found_keywords.append(keyword)
                
        if found_keywords:
            print(f"✅ Status 200 - Found keywords: {', '.join(found_keywords)}")
            
            # Show some relevant excerpts
            print("\nRelevant excerpts:")
            for sentence in parser.text_content[:100]:  # Check first 100 text blocks
                if any(kw.lower() in sentence.lower() for kw in keywords):
                    print(f"  - {sentence[:150]}...")
                    
            return True
        else:
            print(f"⚠️  Status 200 but no relevant content found")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False

# Test our verified links
links_to_verify = [
    # Unity/Godot
    {
        'url': 'https://www.theverge.com/2023/9/12/23870547/unity-runtime-fee-pricing-change',
        'keywords': ['Unity', 'runtime fee', 'pricing', 'developers']
    },
    {
        'url': 'https://www.gamingonlinux.com/2023/09/godot-engine-hits-over-50k-euros-per-month-in-funding/',
        'keywords': ['Godot', 'funding', 'Unity', '50k', 'euros']
    },
    # Heroku
    {
        'url': 'https://blog.heroku.com/next-chapter',
        'keywords': ['Heroku', 'free', 'dynos', 'tier']
    },
    # Docker
    {
        'url': 'https://www.theregister.com/2021/08/31/docker_desktop_no_longer_free/',
        'keywords': ['Docker', 'Desktop', 'free', 'enterprise']
    },
    # GitHub
    {
        'url': 'https://www.theregister.com/2022/03/24/github_outage_details/',
        'keywords': ['GitHub', 'outage', 'March', 'MySQL']
    },
    # Mailchimp
    {
        'url': 'https://www.mediapost.com/publications/article/336054/forever-free-mailchimp-now-charges-for-unsubscrib.html',
        'keywords': ['Mailchimp', 'unsubscribed', 'contacts', 'pricing']
    },
    # Evernote
    {
        'url': 'https://9to5mac.com/2016/06/28/evernote-price-increase-basic-two-device-limit/',
        'keywords': ['Evernote', 'device', 'limit', 'basic']
    }
]

# Run verification
working_links = []
failed_links = []

for link_info in links_to_verify:
    if verify_link(link_info['url'], link_info['keywords']):
        working_links.append(link_info['url'])
    else:
        failed_links.append(link_info['url'])
    time.sleep(1)  # Be polite to servers

print(f"\n{'='*60}")
print(f"SUMMARY:")
print(f"✅ Working links: {len(working_links)}")
print(f"❌ Failed links: {len(failed_links)}")
print(f"{'='*60}")