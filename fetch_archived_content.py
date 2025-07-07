#!/usr/bin/env python3
import requests
from html.parser import HTMLParser
import re

class ContentExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_main_content = False
        self.content = []
        self.current_tag = None
        
    def handle_starttag(self, tag, attrs):
        self.current_tag = tag
        # Look for main content areas
        for attr in attrs:
            if attr[0] == 'class' and any(x in attr[1] for x in ['content', 'main', 'article', 'post']):
                self.in_main_content = True
                
    def handle_endtag(self, tag):
        if tag in ['div', 'article', 'main']:
            self.in_main_content = False
            
    def handle_data(self, data):
        if self.in_main_content and data.strip():
            self.content.append(data.strip())

def fetch_archived_page(url):
    """Fetch content from Wayback Machine URL"""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        # Extract text content
        parser = ContentExtractor()
        parser.feed(response.text)
        
        # Also try to find specific pricing-related content
        text = response.text
        
        # Look for pricing-related sentences
        pricing_pattern = r'[^.]*(?:pricing|price|cost|fee|charge|update|change|May|2022)[^.]*\.'
        pricing_sentences = re.findall(pricing_pattern, text, re.IGNORECASE)
        
        return {
            'full_content': parser.content,
            'pricing_mentions': pricing_sentences[:20]  # First 20 mentions
        }
        
    except Exception as e:
        return {'error': str(e)}

# Test with Mailchimp archive
url = "https://web.archive.org/web/20220520003307/https://mailchimp.com/resources/pricing-update-may-2022/"
result = fetch_archived_page(url)

print("=== PRICING-RELATED CONTENT ===")
for sentence in result.get('pricing_mentions', []):
    cleaned = sentence.strip()
    if len(cleaned) > 20:  # Skip very short snippets
        print(f"- {cleaned}")