# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Omega is a personal automation workspace for scripts, Google Slides management, and workflow tools.

## Directory Structure

```
/presentations/    - All presentation materials and processing scripts
  /slides/         - PowerPoint files and compilations
  /3Cs/           - Company, Customer, Competition framework
  /corporate_meetings/ - Corporate meeting materials
  
/misc/            - Utilities and shareable information
  /interviews/    - Interview transcripts and summaries
  /calendars/     - Calendar data and scripts
  
/courses/         - Educational content and course materials
  /my_course/     - Complete course curriculum
  
/scripts/         - Remaining utility scripts
/ideas/           - Brainstorming and experimental code
/docs/            - Documentation and templates
  /slides/        - Google Slides documentation and templates
```

## Bot Operations

**IMPORTANT**: All bot implementations have been migrated to the **chronos** repository.
- Repository: https://github.com/mikestepanov/chronos
- Location: `/home/mstepanov/Documents/GitHub/chronos`
- For bot-related work (Kimai, Pumble, Discord, Telegram), use the chronos repository

## Key Files

- `VOCAB.md` - Tracks communication style and preferences (READ THIS)
- `commit.sh` / `commit.py` - Commit helpers enforcing conventional commits

## Development Setup

1. Scripts go in `/scripts/` with descriptive names
2. Use conventional commits: `type(scope): description`
3. Run `./commit.sh` for guided commits

## Key Commands

**Calendar & Meetings:**
- `python3 misc/fetch_calendar_simple.py` - Fetch latest calendar data
- `python3 presentations/status_meeting_tracker.py` - Analyze STATUS meeting patterns
- `python3 misc/refresh_token.py` - Refresh Google auth token when expired

**PowerPoint Processing:**
- `python3 presentations/pptx_detailed_reader.py` - Extract content from .pptx files
- `python3 presentations/compile_presentations.py` - Create compiled markdown versions

**Compiled Outputs:**
- Individual compilations: `/presentations/slides/compiled/*_compiled.md`
- Master compilation: `/presentations/slides/compiled/STATUS_MASTER_COMPILATION.md`
- Quick reference: `/presentations/slides/compiled/STATUS_QUICK_REFERENCE.md`

## Communication Style

**IMPORTANT**: Check `VOCAB.md` for communication preferences. Key points:
- Direct answers, no fluff
- Point out issues bluntly
- Focus on practical solutions
- No unnecessary praise

## Environment

- **OS**: Windows (host) with WSL2 Ubuntu
- **Claude Code**: Runs in WSL environment
- **File paths**: `/mnt/c/Users/...` (accessing Windows filesystem from WSL)
- **Python/pip**: Use WSL's Python, not Windows Python

## Notes

- Main branch: `main`
- Development branch: `dev`
- Focus areas: automation scripts, Google Slides management, workflow optimization
- STATUS presentations stored in `/presentations/slides/` as .pptx files
- Presentations follow STATUS framework: Successes, Troubles, Actions, Tracking, Upcoming, Support
- Project has been reorganized into 4 main folders: presentations, misc, courses, scripts