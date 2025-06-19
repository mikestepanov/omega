# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Omega is a personal automation workspace for scripts, Google Slides management, and workflow tools.

## Directory Structure

```
/scripts/     - Working automation scripts and utilities
/docs/slides/ - Google Slides documentation and templates
/ideas/       - Brainstorming and experimental code
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
- STATUS presentations stored in `/docs/slides/` as .pptx files
- Presentations follow STATUS framework: Successes, Troubles, Actions, Tracking, Upcoming, Support