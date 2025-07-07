#!/usr/bin/env python3
"""
Compile PowerPoint presentations into comprehensive documents
Creates both individual and master compilations
"""

import json
from pathlib import Path
from datetime import datetime

def load_presentation_data(content_file):
    """Load presentation content from JSON"""
    with open(content_file, 'r') as f:
        return json.load(f)

def compile_individual_presentation(presentation_data, output_path):
    """Compile individual presentation into comprehensive markdown"""
    with open(output_path, 'w') as f:
        # Header
        f.write(f"# {presentation_data['filename']}\n\n")
        f.write(f"**Total Slides:** {len(presentation_data['slides'])}\n\n")
        
        # Table of Contents
        f.write("## Table of Contents\n\n")
        for slide in presentation_data['slides']:
            if slide['title']:
                f.write(f"- [Slide {slide['slide_number']}: {slide['title']}](#slide-{slide['slide_number']})\n")
        f.write("\n---\n\n")
        
        # Full content
        for slide in presentation_data['slides']:
            if slide['all_text']:  # Only include slides with content
                f.write(f"## Slide {slide['slide_number']}\n\n")
                
                if slide['title']:
                    f.write(f"### {slide['title']}\n\n")
                
                # Write body content
                for text in slide['body']:
                    if text and text != slide['title']:
                        # Check if it's a bullet point or regular text
                        if any(text.startswith(marker) for marker in ['•', '-', '*', '1)', '2)', '3)']):
                            f.write(f"{text}\n")
                        else:
                            f.write(f"- {text}\n")
                
                f.write("\n---\n\n")

def compile_master_document(all_presentations, output_path):
    """Compile all presentations into a master document"""
    with open(output_path, 'w') as f:
        # Header
        f.write("# STATUS Meetings Master Compilation\n\n")
        f.write(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")
        f.write(f"**Total Presentations:** {len(all_presentations)}\n\n")
        
        # Overview table
        f.write("## Overview\n\n")
        f.write("| Date | Presentation | Slides | Key Topics |\n")
        f.write("|------|--------------|--------|------------|\n")
        
        for pres in all_presentations:
            filename = pres['filename']
            date = filename.split(' - ')[1].split(' Engineering')[0] if ' - ' in filename else 'Unknown'
            slide_count = len(pres['slides'])
            
            # Find key topics
            key_topics = []
            for slide in pres['slides']:
                if slide['title'] and any(keyword in slide['title'].lower() 
                                        for keyword in ['successes', 'troubles', 'priorities', 'support']):
                    key_topics.append(slide['title'])
            
            topics_str = ', '.join(key_topics[:3])
            if len(key_topics) > 3:
                topics_str += '...'
            
            f.write(f"| {date} | {filename} | {slide_count} | {topics_str} |\n")
        
        f.write("\n---\n\n")
        
        # STATUS Framework Reference
        f.write("## STATUS Framework\n\n")
        f.write("- **S** - Successes: Wins, achievements, progress\n")
        f.write("- **T** - Troubles: Roadblocks and challenges\n")
        f.write("- **A** - Actions: Steps taken to overcome troubles\n")
        f.write("- **T** - Tracking: Metrics and progress reports\n")
        f.write("- **U** - Upcoming Priorities: Next month's objectives\n")
        f.write("- **S** - Support Needed: Outside help required\n\n")
        
        f.write("---\n\n")
        
        # Team members tracking
        team_members = set()
        for pres in all_presentations:
            for slide in pres['slides']:
                # Look for team member names in slide titles
                for name in ['Raheel', 'Ariful', 'Anatoly', 'Dharam', 'Mori', 'Alex', 'Mohit']:
                    if name in str(slide.get('title', '')):
                        team_members.add(name)
        
        if team_members:
            f.write("## Team Members Tracked\n\n")
            f.write(", ".join(sorted(team_members)))
            f.write("\n\n---\n\n")
        
        # Individual presentations
        for i, pres in enumerate(all_presentations):
            f.write(f"# Presentation {i+1}: {pres['filename']}\n\n")
            
            # Extract STATUS sections
            status_sections = {
                'successes': [],
                'troubles': [],
                'actions': [],
                'tracking': [],
                'upcoming': [],
                'support': []
            }
            
            for slide in pres['slides']:
                title_lower = str(slide.get('title', '')).lower()
                
                if 'successes' in title_lower:
                    status_sections['successes'].extend(slide['body'])
                elif 'troubles' in title_lower:
                    status_sections['troubles'].extend(slide['body'])
                elif 'actions' in title_lower:
                    status_sections['actions'].extend(slide['body'])
                elif 'tracking' in title_lower:
                    status_sections['tracking'].extend(slide['body'])
                elif 'upcoming' in title_lower:
                    status_sections['upcoming'].extend(slide['body'])
                elif 'support' in title_lower:
                    status_sections['support'].extend(slide['body'])
            
            # Write STATUS sections if found
            for section, items in status_sections.items():
                if items:
                    f.write(f"## {section.title()}\n\n")
                    for item in items:
                        f.write(f"- {item}\n")
                    f.write("\n")
            
            # Key slides
            f.write("## Key Slides\n\n")
            for slide in pres['slides']:
                if slide['title'] and len(slide['body']) > 2:
                    f.write(f"### {slide['title']} (Slide {slide['slide_number']})\n\n")
                    for text in slide['body'][:5]:  # First 5 points
                        if text != slide['title']:
                            f.write(f"- {text}\n")
                    if len(slide['body']) > 5:
                        f.write(f"- ... and {len(slide['body']) - 5} more points\n")
                    f.write("\n")
            
            f.write("\n---\n\n")

def main():
    """Compile all presentations"""
    slides_dir = Path('docs/slides')
    compiled_dir = slides_dir / 'compiled'
    compiled_dir.mkdir(exist_ok=True)
    
    print("📚 Compiling presentations...\n")
    
    # Find all content JSON files
    content_files = sorted(slides_dir.glob('*_content.json'))
    
    if not content_files:
        print("❌ No presentation content files found. Run pptx_detailed_reader.py first.")
        return
    
    all_presentations = []
    
    # Compile individual presentations
    for content_file in content_files:
        print(f"📄 Compiling {content_file.stem}...")
        
        # Load data
        presentation_data = load_presentation_data(content_file)
        all_presentations.append(presentation_data)
        
        # Create compiled version
        output_name = content_file.stem.replace('_content', '_compiled.md')
        output_path = compiled_dir / output_name
        
        compile_individual_presentation(presentation_data, output_path)
        print(f"   ✓ Created {output_name}")
    
    # Create master compilation
    print("\n📋 Creating master compilation...")
    master_path = compiled_dir / 'STATUS_MASTER_COMPILATION.md'
    compile_master_document(all_presentations, master_path)
    print(f"   ✓ Created STATUS_MASTER_COMPILATION.md")
    
    # Create quick reference
    print("\n📌 Creating quick reference...")
    quick_ref_path = compiled_dir / 'STATUS_QUICK_REFERENCE.md'
    create_quick_reference(all_presentations, quick_ref_path)
    print(f"   ✓ Created STATUS_QUICK_REFERENCE.md")
    
    print(f"\n✅ Complete! All compilations saved to: {compiled_dir}")
    print("\nUsage: python3 scripts/compile_presentations.py")

def create_quick_reference(all_presentations, output_path):
    """Create a quick reference guide"""
    with open(output_path, 'w') as f:
        f.write("# STATUS Meetings Quick Reference\n\n")
        
        # Action items across all presentations
        f.write("## All Action Items\n\n")
        
        for pres in all_presentations:
            date = pres['filename'].split(' - ')[1].split(' Engineering')[0] if ' - ' in pres['filename'] else pres['filename']
            f.write(f"### {date}\n\n")
            
            # Find upcoming priorities and support needed
            for slide in pres['slides']:
                title_lower = str(slide.get('title', '')).lower()
                
                if any(keyword in title_lower for keyword in ['upcoming', 'priorities', 'support']):
                    if slide['body']:
                        f.write(f"**{slide['title']}:**\n")
                        for item in slide['body'][:10]:  # First 10 items
                            f.write(f"- {item}\n")
                        if len(slide['body']) > 10:
                            f.write(f"- ... and {len(slide['body']) - 10} more\n")
                        f.write("\n")
        
        # Team member summary
        f.write("\n## Team Member Updates Summary\n\n")
        
        team_updates = {}
        for pres in all_presentations:
            for slide in pres['slides']:
                # Check for team member names
                for name in ['Raheel', 'Ariful', 'Anatoly', 'Dharam', 'Mori', 'Alex', 'Mohit']:
                    if name in str(slide.get('title', '')):
                        if name not in team_updates:
                            team_updates[name] = []
                        # Extract date safely
                        date = 'Unknown'
                        if ' - ' in pres['filename']:
                            parts = pres['filename'].split(' - ')
                            if len(parts) > 1:
                                date = parts[1].split(' Engineering')[0]
                        
                        team_updates[name].append({
                            'date': date,
                            'content': slide['body'][:3]  # First 3 points
                        })
        
        for member, updates in sorted(team_updates.items()):
            f.write(f"### {member}\n\n")
            for update in updates:
                f.write(f"**{update['date']}:**\n")
                for item in update['content']:
                    f.write(f"- {item}\n")
                f.write("\n")

if __name__ == "__main__":
    main()