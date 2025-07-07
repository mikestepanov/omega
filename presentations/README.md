# Presentations

This folder contains all presentation-related materials and processing scripts.

## Contents

### PowerPoint Files (`slides/`)
- `1 - May 19th Engineering _ STATUS Meeting.pptx` - STATUS meeting presentation from May 19th
- `1 - May 27th Engineering _ STATUS Meeting.pptx` - STATUS meeting presentation from May 27th
- `2- June 16th Engineering _ STATUS Meeting.pptx` - STATUS meeting presentation from June 16th
- Associated JSON content files and markdown summaries for each presentation
- `compiled/` - Compiled markdown versions of all presentations

### Scripts
- `pptx_reader.py` - Basic PowerPoint reader script
- `pptx_detailed_reader.py` - Detailed PowerPoint content extractor
- `compile_presentations.py` - Creates compiled markdown versions of presentations
- `status_meeting_tracker.py` - Analyzes STATUS meeting patterns and trends

### Projects
- `3Cs/` - Company, Customer, Competition framework materials
  - Enhanced 3C documentation
  - Company culture slides
  - Employee timeline slides
  - Google Slides outlines
- `corporate_meetings/` - Corporate meeting compilations and notes

## Usage

To extract content from PowerPoint files:
```bash
python pptx_detailed_reader.py
```

To compile all presentations:
```bash
python compile_presentations.py
```

To analyze STATUS meeting patterns:
```bash
python status_meeting_tracker.py
```