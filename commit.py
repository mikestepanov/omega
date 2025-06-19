#!/usr/bin/env python3
import subprocess
import sys
import re
from typing import List, Tuple

COMMIT_TYPES = {
    'feat': 'A new feature',
    'fix': 'A bug fix',
    'docs': 'Documentation only changes',
    'style': 'Changes that do not affect the meaning of the code',
    'refactor': 'A code change that neither fixes a bug nor adds a feature',
    'test': 'Adding missing tests or correcting existing tests',
    'chore': 'Changes to the build process or auxiliary tools'
}

def run_command(cmd: List[str]) -> Tuple[int, str, str]:
    """Run a command and return exit code, stdout, and stderr."""
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode, result.stdout, result.stderr

def get_git_status() -> Tuple[List[str], List[str], List[str]]:
    """Get lists of untracked, modified, and staged files."""
    _, status_output, _ = run_command(['git', 'status', '--porcelain'])
    
    untracked = []
    modified = []
    staged = []
    
    for line in status_output.strip().split('\n'):
        if not line:
            continue
        
        status = line[:2]
        filename = line[3:]
        
        if status == '??':
            untracked.append(filename)
        elif status[0] in 'AM':
            staged.append(filename)
        elif status[1] == 'M':
            modified.append(filename)
    
    return untracked, modified, staged

def analyze_changes() -> str:
    """Analyze staged changes to suggest commit type and scope."""
    _, diff_output, _ = run_command(['git', 'diff', '--cached', '--name-only'])
    changed_files = diff_output.strip().split('\n')
    
    if not changed_files or changed_files == ['']:
        return 'chore'
    
    # Simple heuristics for commit type
    if any('test' in f for f in changed_files):
        return 'test'
    elif any('README' in f or 'docs/' in f or '.md' in f for f in changed_files):
        return 'docs'
    elif any('fix' in f or 'bug' in f for f in changed_files):
        return 'fix'
    else:
        return 'feat'

def generate_commit_message(files: List[str]) -> str:
    """Generate a commit message based on staged files."""
    commit_type = analyze_changes()
    
    # Determine scope from files
    if not files:
        scope = ''
    else:
        # Try to extract common directory or file type
        if len(files) == 1:
            file = files[0]
            if '/' in file:
                scope = file.split('/')[0]
            else:
                scope = file.split('.')[0]
        else:
            # Find common prefix
            common_dirs = set()
            for f in files:
                if '/' in f:
                    common_dirs.add(f.split('/')[0])
            
            if len(common_dirs) == 1:
                scope = list(common_dirs)[0]
            else:
                scope = 'multiple'
    
    # Get diff summary for description
    _, diff_stat, _ = run_command(['git', 'diff', '--cached', '--stat'])
    
    print(f"\nSuggested commit type: {commit_type}")
    print(f"Detected scope: {scope}")
    print("\nChanges to be committed:")
    print(diff_stat)
    
    # Prompt for commit message
    print(f"\nEnter commit message (format: type(scope): description)")
    print(f"Available types: {', '.join(COMMIT_TYPES.keys())}")
    print(f"Example: {commit_type}({scope}): add initial implementation")
    
    message = input("> ").strip()
    
    # Validate format
    pattern = r'^(feat|fix|docs|style|refactor|test|chore)(\([^)]+\))?: .+$'
    if not re.match(pattern, message):
        print("Invalid format! Using conventional commit format...")
        description = input("Enter description: ").strip()
        message = f"{commit_type}({scope}): {description}" if scope else f"{commit_type}: {description}"
    
    return message

def main():
    # Check if we're in a git repository
    returncode, _, _ = run_command(['git', 'rev-parse', '--git-dir'])
    if returncode != 0:
        print("Error: Not in a git repository")
        sys.exit(1)
    
    # Get current status
    untracked, modified, staged = get_git_status()
    
    if not untracked and not modified and not staged:
        print("No changes to commit")
        sys.exit(0)
    
    # Show current status
    print("Current git status:")
    if untracked:
        print(f"\nUntracked files ({len(untracked)}):")
        for f in untracked:
            print(f"  - {f}")
    
    if modified:
        print(f"\nModified files ({len(modified)}):")
        for f in modified:
            print(f"  - {f}")
    
    if staged:
        print(f"\nStaged files ({len(staged)}):")
        for f in staged:
            print(f"  + {f}")
    
    # If no staged files, ask what to stage
    if not staged:
        print("\nNo files staged. What would you like to stage?")
        print("1) All modified files")
        print("2) All untracked files")
        print("3) All changes (modified + untracked)")
        print("4) Select individually")
        print("5) Cancel")
        
        choice = input("Choice (1-5): ").strip()
        
        if choice == '1' and modified:
            run_command(['git', 'add'] + modified)
        elif choice == '2' and untracked:
            run_command(['git', 'add'] + untracked)
        elif choice == '3':
            if modified:
                run_command(['git', 'add'] + modified)
            if untracked:
                run_command(['git', 'add'] + untracked)
        elif choice == '4':
            all_files = modified + untracked
            for i, f in enumerate(all_files):
                response = input(f"Stage {f}? (y/n): ").strip().lower()
                if response == 'y':
                    run_command(['git', 'add', f])
        else:
            print("Cancelled")
            sys.exit(0)
        
        # Update staged files
        _, _, staged = get_git_status()
    
    if not staged:
        print("No files staged for commit")
        sys.exit(0)
    
    # Generate and get commit message
    message = generate_commit_message(staged)
    
    # Commit
    print(f"\nCommitting with message: {message}")
    returncode, stdout, stderr = run_command(['git', 'commit', '-m', message])
    
    if returncode == 0:
        print("\nCommit successful!")
        print(stdout)
    else:
        print("\nCommit failed:")
        print(stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()