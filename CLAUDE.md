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