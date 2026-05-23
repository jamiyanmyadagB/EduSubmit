#!/bin/bash

# EduSubmit Backend Push Script
# Author: Senior DevOps Engineer
# Description: Git workflow automation script

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_header "EDUSUBMIT BACKEND PUSH"

# 1. ASK FOR COMMIT MESSAGE
print_status "Step 1: Preparing to push changes..."

if [ -z "$1" ]; then
    echo -e "${YELLOW}Please provide a commit message:${NC}"
    echo -e "${BLUE}Usage: $0 <commit-message>${NC}"
    echo -e "${BLUE}Example: $0 \"Fix authentication issue\"${NC}"
    exit 1
fi

COMMIT_MESSAGE="$1"

# 2. RUN GIT STATUS
print_status "Step 2: Checking git status..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository"
    exit 1
fi

# Get git status
GIT_STATUS=$(git status --porcelain)

if [ -z "$GIT_STATUS" ]; then
    print_status "No changes to commit"
    print_status "✅ Nothing to push"
    exit 0
fi

print_status "Changes detected:"
echo "$GIT_STATUS"

# 3. RUN PROJECT BUILD (to ensure we're pushing working code)
print_status "Step 3: Running project build before commit..."

# Navigate to project root
cd ..

# Run clean build to verify everything compiles
print_status "Building project to verify changes..."
mvn clean test -DskipTests

if [ $? -ne 0 ]; then
    print_error "Project build failed - cannot proceed with push"
    print_error "Please fix build errors before pushing"
    exit 1
fi

print_status "✅ Project build successful - safe to proceed"

# 4. ADD CHANGES
print_status "Step 4: Adding changes to git..."

# Add all changes
git add .

# Verify add was successful
if [ $? -ne 0 ]; then
    print_error "Failed to add changes to git"
    exit 1
fi

print_status "✅ Changes added to git"

# 5. COMMIT CHANGES
print_status "Step 5: Committing changes..."

# Commit with provided message
git commit -m "$COMMIT_MESSAGE"

# Verify commit was successful
if [ $? -ne 0 ]; then
    print_error "Failed to commit changes"
    exit 1
fi

print_status "✅ Changes committed with message: '$COMMIT_MESSAGE'"

# 6. PUSH CHANGES
print_status "Step 6: Pushing to remote repository..."

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

print_status "Pushing to branch: $CURRENT_BRANCH"

# Push to remote
git push

# Verify push was successful
if [ $? -ne 0 ]; then
    print_error "Failed to push changes to remote repository"
    print_error "Please check your git configuration and network connection"
    exit 1
fi

print_status "✅ Changes pushed successfully!"

# 7. SHOW PUSH SUMMARY
print_header "PUSH COMPLETED"

echo -e "${GREEN}✅ Push completed successfully!${NC}"
echo ""
echo -e "${BLUE}Push Summary:${NC}"
echo -e "  Commit Message: $COMMIT_MESSAGE"
echo -e "  Branch: $CURRENT_BRANCH"
echo -e "  Remote: $(git remote get-url origin)"
echo ""
echo -e "${BLUE}Git Status:${NC}"
echo -e "  Last commit: $(git log -1 --pretty=format:'%h - %s')"
echo -e "  Working tree: $(git status --porcelain | head -n 5 | sed 's/^/  /  /')"

print_status "Push script completed successfully!"
