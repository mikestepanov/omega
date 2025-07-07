# Telegram Claude Code Bridge Setup

## Overview
Three solutions for running Claude Code from your phone:

### 1. **Simple Local Bridge** (`telegram_claude_bridge.py`)
- Runs on your PC
- Direct execution of Claude Code
- PC must be on

### 2. **Cloud Queue System** (`telegram_claude_cloud.py` + `claude_worker.py`)
- Telegram bot queues requests
- Workers on any machine process jobs
- Works even when PC is off

### 3. **Existing Solutions**
- **claude-code-telegram** (GitHub) - Full-featured Telegram integration
- **No-code platforms** (Albato, n8n, Make) - Visual workflow builders

## Quick Setup - Cloud Queue System

### 1. Get Telegram Bot Token
```bash
# Message @BotFather on Telegram
# Create new bot, get token
```

### 2. Setup Redis (Free tier)
```bash
# Option A: Redis Cloud (free 30MB)
# Sign up at redis.com

# Option B: Upstash Redis (serverless)
# Sign up at upstash.com
```

### 3. Deploy Bot (Choose one)

**Replit:**
```bash
# Create new Python repl
# Upload telegram_claude_cloud.py
# Set environment variables:
TELEGRAM_BOT_TOKEN=your_token
REDIS_URL=redis://...
ALLOWED_TELEGRAM_USERS=your_user_id
```

**Railway/Render:**
```bash
# Push to GitHub
# Connect repo
# Set env vars
# Deploy
```

### 4. Run Workers

**On your PC:**
```bash
export TELEGRAM_BOT_TOKEN=your_token
export REDIS_URL=redis://...
python3 claude_worker.py
```

**On cloud server with Claude Code:**
```bash
# Install Claude Code
npm install -g @anthropic/claude-code

# Run worker
python3 claude_worker.py
```

## Usage

1. Message your bot on Telegram
2. Send any Claude Code command
3. Bot queues request
4. Next available worker processes it
5. Results sent back to Telegram

## Multiple Workers

Run workers on:
- Your PC (when it's on)
- GitHub Codespaces
- Cloud VMs
- Replit/Railway containers

Workers automatically register/unregister as they come online.

## Environment Variables

```bash
# Required
TELEGRAM_BOT_TOKEN=xxx
REDIS_URL=redis://xxx

# Optional
ALLOWED_TELEGRAM_USERS=123456,789012  # Comma-separated user IDs
WORKER_ID=my-pc                       # Custom worker name
CLAUDE_TIMEOUT=300                    # Timeout in seconds
```

## Security

1. Set `ALLOWED_TELEGRAM_USERS` to your Telegram user ID
2. Use strong Redis password
3. Keep bot token secret
4. Consider VPN for cloud workers