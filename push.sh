#!/bin/bash
echo "=== EduSubmit Manual Push Control ==="
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check if there are any changes to commit
if git diff --quiet && git diff --cached --quiet; then
    echo "ℹ️  No changes to commit"
    echo ""
    echo "Current status:"
    git status
    exit 0
fi

# Get commit message from user
read -p "Enter commit message: " msg

# Validate commit message
if [ -z "$msg" ]; then
    echo "❌ Error: Commit message cannot be empty"
    exit 1
fi

echo ""
echo "🔄 Staging all changes..."
git add .

echo ""
echo "📝 Committing with message: '$msg'"
git commit -m "$msg"

if [ $? -eq 0 ]; then
    echo ""
    echo "📤 Pushing to origin/main..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Push completed successfully!"
        echo ""
        echo "📊 Latest commit:"
        git log --oneline -1
    else
        echo ""
        echo "❌ Error: Failed to push to origin/main"
        echo "   Check your internet connection and repository permissions"
        exit 1
    fi
else
    echo ""
    echo "❌ Error: Failed to commit changes"
    echo "   Check the commit message and try again"
    exit 1
fi

echo ""
echo "=== Push Control Complete ==="
