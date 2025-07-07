#!/bin/bash

# Conventional commit types
declare -A COMMIT_TYPES=(
    ["feat"]="A new feature"
    ["fix"]="A bug fix" 
    ["docs"]="Documentation only changes"
    ["style"]="Changes that do not affect the meaning of the code"
    ["refactor"]="A code change that neither fixes a bug nor adds a feature"
    ["test"]="Adding missing tests or correcting existing tests"
    ["chore"]="Changes to the build process or auxiliary tools"
)

# Function to analyze changes and suggest commit type
analyze_changes() {
    local files=$(git diff --cached --name-only)
    
    if [[ -z "$files" ]]; then
        echo "chore"
        return
    fi
    
    # Simple heuristics
    if echo "$files" | grep -q "test"; then
        echo "test"
    elif echo "$files" | grep -q -E "(README|docs/|\.md$)"; then
        echo "docs"
    elif echo "$files" | grep -q -E "(fix|bug)"; then
        echo "fix"
    else
        echo "feat"
    fi
}

# Function to extract scope from files
get_scope() {
    local files=$(git diff --cached --name-only)
    local file_count=$(echo "$files" | wc -l)
    
    if [[ -z "$files" ]]; then
        echo ""
        return
    fi
    
    if [[ $file_count -eq 1 ]]; then
        # Single file - use directory or filename as scope
        if [[ "$files" == *"/"* ]]; then
            echo "$files" | cut -d'/' -f1
        else
            echo "$files" | cut -d'.' -f1
        fi
    else
        # Multiple files - find common directory
        local common_dir=$(echo "$files" | cut -d'/' -f1 | sort | uniq)
        local dir_count=$(echo "$common_dir" | wc -l)
        
        if [[ $dir_count -eq 1 ]]; then
            echo "$common_dir"
        else
            echo "multiple"
        fi
    fi
}

# Main script
main() {
    # Check if in git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo "Error: Not in a git repository"
        exit 1
    fi
    
    # Get current status
    echo "Checking git status..."
    git status --short
    
    # Check if there are changes
    if [[ -z $(git status --porcelain) ]]; then
        echo "No changes to commit"
        exit 0
    fi
    
    # Check for staged files
    staged_files=$(git diff --cached --name-only)
    
    if [[ -z "$staged_files" ]]; then
        echo -e "\nNo files staged. Staging all changes..."
        git add -A
        staged_files=$(git diff --cached --name-only)
    fi
    
    # Show what will be committed
    echo -e "\nFiles to be committed:"
    echo "$staged_files" | sed 's/^/  + /'
    
    # Show diff statistics
    echo -e "\nChanges:"
    git diff --cached --stat
    
    # Analyze changes
    suggested_type=$(analyze_changes)
    suggested_scope=$(get_scope)
    
    # Generate commit message
    echo -e "\n===== Commit Message Helper ====="
    echo "Conventional commit format: type(scope): description"
    echo "Types: feat, fix, docs, style, refactor, test, chore"
    echo -e "\nSuggested: $suggested_type($suggested_scope): <your description here>"
    echo -e "\nEnter your commit message:"
    read -r commit_message
    
    # If empty, use suggestion
    if [[ -z "$commit_message" ]]; then
        echo "Enter description for $suggested_type($suggested_scope):"
        read -r description
        if [[ -n "$suggested_scope" ]]; then
            commit_message="$suggested_type($suggested_scope): $description"
        else
            commit_message="$suggested_type: $description"
        fi
    fi
    
    # Validate format
    if ! echo "$commit_message" | grep -qE "^(feat|fix|docs|style|refactor|test|chore)(\([^)]+\))?: .+$"; then
        echo "Warning: Commit message doesn't follow conventional format"
        echo "Continue anyway? (y/n)"
        read -r response
        if [[ "$response" != "y" ]]; then
            echo "Commit cancelled"
            exit 1
        fi
    fi
    
    # Commit
    echo -e "\nCommitting with message: $commit_message"
    if git commit -m "$commit_message"; then
        echo -e "\n✓ Commit successful!"
        git log --oneline -1
    else
        echo -e "\n✗ Commit failed"
        exit 1
    fi
}

# Run main function
main "$@"