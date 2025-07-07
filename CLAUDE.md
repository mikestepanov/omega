# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CRITICAL: Pumble Bot Messages
**NEVER use `asBot: true` when sending Pumble messages!** The bot should send messages as the authenticated user (Agent Smith), not with the bot flag. Always use `asBot: false` or omit the parameter (defaults to false).

## Project Overview

Omega is a personal automation workspace for scripts, Google Slides management, and workflow tools.

## Directory Structure

```
/presentations/    - All presentation materials and processing scripts
  /slides/         - PowerPoint files and compilations
  /3Cs/           - Company, Customer, Competition framework
  /corporate_meetings/ - Corporate meeting materials
  
/bots/            - All bot implementations and automation
  /kimai/         - Kimai timesheet bot system
  /pumble-bot-docs/ - Pumble bot documentation
  /lib/           - Shared bot libraries
  /api/           - Bot API endpoints
  
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

## Key Files

- `VOCAB.md` - Tracks communication style and preferences (READ THIS)
- `commit.sh` / `commit.py` - Commit helpers enforcing conventional commits

## Development Setup

1. Scripts go in `/scripts/` with descriptive names
2. Use conventional commits: `type(scope): description`
3. Run `./commit.sh` for guided commits

## Key Commands

**Calendar & Meetings:**
<<<<<<< HEAD
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

**Bot Operations:**
- `node bots/kimai-extract-timesheets.js` - Extract Kimai timesheets
- `node bots/monday-reminder.js` - Send Monday reminders
- `./bots/start_discord_bot.sh` - Start Discord bot
=======
- `python3 scripts/fetch_calendar_simple.py` - Fetch latest calendar data
- `python3 scripts/status_meeting_tracker.py` - Analyze STATUS meeting patterns
- `python3 scripts/refresh_token.py` - Refresh Google auth token when expired

**PowerPoint Processing:**
- `python3 scripts/pptx_detailed_reader.py` - Extract content from .pptx files in docs/slides/
- `python3 scripts/compile_presentations.py` - Create compiled markdown versions

**Compiled Outputs:**
- Individual compilations: `/docs/slides/compiled/*_compiled.md`
- Master compilation: `/docs/slides/compiled/STATUS_MASTER_COMPILATION.md`
- Quick reference: `/docs/slides/compiled/STATUS_QUICK_REFERENCE.md`
>>>>>>> 432385d2c3f9ee703a489c477e231daae70d0466

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
<<<<<<< HEAD
- STATUS presentations stored in `/presentations/slides/` as .pptx files
- Presentations follow STATUS framework: Successes, Troubles, Actions, Tracking, Upcoming, Support
- Project has been reorganized into 4 main folders: presentations, bots, misc, courses
=======
- STATUS presentations stored in `/docs/slides/` as .pptx files
- Presentations follow STATUS framework: Successes, Troubles, Actions, Tracking, Upcoming, Support
>>>>>>> 432385d2c3f9ee703a489c477e231daae70d0466
