#!/usr/bin/env python3
"""
Detailed PowerPoint content extractor
Extracts slide titles, bullet points, and structure
"""

import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
import json
import re

def parse_slide_content(xml_content):
    """Parse slide XML to extract structured content"""
    try:
        root = ET.fromstring(xml_content)
        
        # Define namespaces
        namespaces = {
            'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
            'a': 'http://schemas.openxmlformats.org/drawingml/2006/main'
        }
        
        slide_content = {
            'title': '',
            'body': [],
            'all_text': []
        }
        
        # Find all shape trees
        for shape in root.findall('.//p:sp', namespaces):
            # Check if it's a title
            is_title = False
            for ph in shape.findall('.//p:ph', namespaces):
                ph_type = ph.get('type')
                if ph_type in ['title', 'ctrTitle']:
                    is_title = True
                    break
            
            # Extract text from this shape
            texts = []
            for paragraph in shape.findall('.//a:p', namespaces):
                para_text = []
                for run in paragraph.findall('.//a:t', namespaces):
                    if run.text:
                        para_text.append(run.text)
                
                if para_text:
                    full_text = ' '.join(para_text).strip()
                    if full_text:
                        texts.append(full_text)
            
            # Store the text
            if texts:
                if is_title and not slide_content['title']:
                    slide_content['title'] = texts[0]
                else:
                    slide_content['body'].extend(texts)
                
                slide_content['all_text'].extend(texts)
        
        return slide_content
    
    except Exception as e:
        return {'title': '', 'body': [], 'all_text': [], 'error': str(e)}

def extract_detailed_content(pptx_path):
    """Extract detailed content from PPTX file"""
    presentation = {
        'filename': Path(pptx_path).name,
        'slides': []
    }
    
    with zipfile.ZipFile(pptx_path, 'r') as pptx:
        # Get slide files
        slide_files = sorted([f for f in pptx.namelist() 
                            if f.startswith('ppt/slides/slide') and f.endswith('.xml')])
        
        for slide_file in slide_files:
            slide_num = int(re.search(r'slide(\d+)\.xml', slide_file).group(1))
            
            # Read and parse slide
            xml_content = pptx.read(slide_file)
            content = parse_slide_content(xml_content)
            
            presentation['slides'].append({
                'slide_number': slide_num,
                'title': content['title'],
                'body': content['body'],
                'all_text': content['all_text']
            })
    
    return presentation

def format_slide_summary(slide):
    """Format slide content for readable summary"""
    lines = []
    
    if slide['title']:
        lines.append(f"**{slide['title']}**")
    
    for text in slide['body']:
        if text and text != slide['title']:
            lines.append(f"- {text}")
    
    return '\n'.join(lines)

def main():
    """Extract and analyze all presentations"""
    slides_dir = Path('docs/slides')
    pptx_files = sorted(slides_dir.glob('*.pptx'))
    
    print("📊 Extracting detailed content from STATUS presentations...\n")
    
    all_presentations = []
    
    for pptx_file in pptx_files:
        print(f"📄 {pptx_file.name}")
        presentation = extract_detailed_content(pptx_file)
        
        # Save individual presentation content
        output_name = pptx_file.stem + '_content.json'
        output_path = slides_dir / output_name
        with open(output_path, 'w') as f:
            json.dump(presentation, f, indent=2)
        
        print(f"   Saved to: {output_name}")
        
        # Create markdown summary
        md_name = pptx_file.stem + '_summary.md'
        md_path = slides_dir / md_name
        
        with open(md_path, 'w') as f:
            f.write(f"# {presentation['filename']}\n\n")
            
            for slide in presentation['slides']:
                if slide['all_text']:  # Only include slides with content
                    f.write(f"## Slide {slide['slide_number']}\n\n")
                    f.write(format_slide_summary(slide))
                    f.write("\n\n")
        
        print(f"   Summary: {md_name}\n")
        
        all_presentations.append(presentation)
    
    # Create master summary
    print("\n📝 Creating master STATUS presentations summary...")
    
    master_summary = []
    for pres in all_presentations:
        # Extract key information
        summary = {
            'file': pres['filename'],
            'date': pres['filename'].split(' - ')[1].split(' Engineering')[0] if ' - ' in pres['filename'] else 'Unknown',
            'total_slides': len(pres['slides']),
            'key_topics': []
        }
        
        # Extract key topics from slides
        for slide in pres['slides']:
            if slide['title'] and any(keyword in slide['title'].lower() 
                                    for keyword in ['successes', 'troubles', 'priorities', 'support']):
                summary['key_topics'].append({
                    'slide': slide['slide_number'],
                    'topic': slide['title'],
                    'points': len(slide['body'])
                })
        
        master_summary.append(summary)
    
    # Save master summary
    with open(slides_dir / 'status_presentations_master.json', 'w') as f:
        json.dump(master_summary, f, indent=2)
    
    print("✅ Complete! Check docs/slides/ for:")
    print("   - *_content.json files (full content)")
    print("   - *_summary.md files (readable summaries)")
    print("   - status_presentations_master.json (overview)")

if __name__ == "__main__":
    main()