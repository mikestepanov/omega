#!/usr/bin/env python3
"""
PowerPoint reader - extracts content from .pptx files
Options for reading PPTX files:
"""

import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
import json
import re

def extract_text_from_xml(xml_content):
    """Extract text from PowerPoint XML"""
    try:
        root = ET.fromstring(xml_content)
        
        # Find all text elements
        texts = []
        for elem in root.iter():
            if elem.tag.endswith('}t'):  # Text elements
                if elem.text:
                    texts.append(elem.text.strip())
        
        return ' '.join(texts)
    except:
        return ""

def read_pptx_basic(pptx_path):
    """Basic PPTX reading - extracts all text content"""
    slides_content = []
    
    with zipfile.ZipFile(pptx_path, 'r') as pptx:
        # List all files in the PPTX
        slide_files = [f for f in pptx.namelist() if f.startswith('ppt/slides/slide') and f.endswith('.xml')]
        slide_files.sort()
        
        for slide_file in slide_files:
            slide_num = int(re.search(r'slide(\d+)\.xml', slide_file).group(1))
            
            # Read slide XML
            xml_content = pptx.read(slide_file)
            text_content = extract_text_from_xml(xml_content)
            
            if text_content:
                slides_content.append({
                    'slide_number': slide_num,
                    'text': text_content
                })
    
    return slides_content

def analyze_pptx_structure(pptx_path):
    """Analyze PPTX structure and components"""
    info = {
        'filename': Path(pptx_path).name,
        'slides': [],
        'images': [],
        'charts': [],
        'total_slides': 0
    }
    
    with zipfile.ZipFile(pptx_path, 'r') as pptx:
        all_files = pptx.namelist()
        
        # Count slides
        slides = [f for f in all_files if f.startswith('ppt/slides/slide') and f.endswith('.xml')]
        info['total_slides'] = len(slides)
        
        # Find media files
        info['images'] = [f for f in all_files if f.startswith('ppt/media/')]
        
        # Find charts
        info['charts'] = [f for f in all_files if f.startswith('ppt/charts/')]
        
        # Extract notes if present
        notes_files = [f for f in all_files if f.startswith('ppt/notesSlides/')]
        info['has_notes'] = len(notes_files) > 0
    
    return info

def main():
    """Analyze all PPTX files in docs/slides/"""
    slides_dir = Path('docs/slides')
    pptx_files = list(slides_dir.glob('*.pptx'))
    
    if not pptx_files:
        print("No PPTX files found in docs/slides/")
        return
    
    print("🔍 Analyzing PowerPoint presentations...\n")
    
    all_presentations = []
    
    for pptx_file in pptx_files:
        print(f"📊 {pptx_file.name}")
        print("-" * 50)
        
        # Get structure info
        info = analyze_pptx_structure(pptx_file)
        print(f"Total slides: {info['total_slides']}")
        print(f"Images: {len(info['images'])}")
        print(f"Charts: {len(info['charts'])}")
        
        # Extract text content
        slides_content = read_pptx_basic(pptx_file)
        info['content'] = slides_content
        
        # Show preview of content
        print("\nContent preview:")
        for slide in slides_content[:3]:  # First 3 slides
            text_preview = slide['text'][:200] + "..." if len(slide['text']) > 200 else slide['text']
            print(f"  Slide {slide['slide_number']}: {text_preview}")
        
        print("\n")
        all_presentations.append(info)
    
    # Save analysis
    output_file = slides_dir / 'presentations_analysis.json'
    with open(output_file, 'w') as f:
        json.dump(all_presentations, f, indent=2)
    
    print(f"💾 Analysis saved to: {output_file}")

if __name__ == "__main__":
    main()