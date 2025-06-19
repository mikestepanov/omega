# WSL Environment Notes

## Setup Overview
- **Host OS**: Windows
- **Development Environment**: WSL2 with Ubuntu
- **Claude Code**: Runs inside WSL
- **Repository Location**: `/mnt/c/Users/mikes/Desktop/omega`

## Key Points

### File Access
- Windows files accessible at `/mnt/c/`
- Can edit files with Windows tools (VS Code, etc)
- Git operations should be done in WSL

### Python/Scripts
- Always use WSL's Python, not Windows Python
- Install packages with: `pip` or `pip3` in WSL
- Scripts use `#!/usr/bin/env python3` for WSL compatibility

### Browser Integration
- OAuth flows will open Windows browser automatically
- Downloads go to Windows Downloads folder
- Move files to WSL with: `mv /mnt/c/Users/[username]/Downloads/file.json .`

### Common Issues
- Line endings: Git should handle CRLF/LF conversion
- Permissions: Windows files are 777 in WSL (normal)
- Path separators: Use forward slashes `/` not backslashes

## Quick Commands

```bash
# Check you're in WSL
uname -a  # Should show Linux

# Navigate to project
cd /mnt/c/Users/mikes/Desktop/omega

# Install Python if needed
sudo apt update
sudo apt install python3 python3-pip

# Run scripts
python3 scripts/script_name.py
```