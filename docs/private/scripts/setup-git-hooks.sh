#!/bin/bash

# Git Hooks Setup Script for EduSubmit Project
# This script installs pre-commit hooks to prevent accidental secret commits

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"
SCRIPTS_DIR="$PROJECT_ROOT/docs/private/scripts"

echo "🔒 Setting up secure Git hooks for EduSubmit project..."
echo "Project root: $PROJECT_ROOT"

# Create scripts directory if it doesn't exist
mkdir -p "$SCRIPTS_DIR"

# Function to install a hook
install_hook() {
    local hook_name="$1"
    local source_file="$SCRIPTS_DIR/$hook_name"
    local target_file="$HOOKS_DIR/$hook_name"
    
    echo "📦 Installing $hook_name hook..."
    
    if [ -f "$target_file" ]; then
        echo "⚠️  Existing $hook_name hook found. Backing up..."
        cp "$target_file" "$target_file.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    cp "$source_file" "$target_file"
    chmod +x "$target_file"
    echo "✅ $hook_name hook installed successfully"
}

# Check if we're in a git repository
if [ ! -d "$HOOKS_DIR" ]; then
    echo "❌ Error: Not in a Git repository or .git/hooks directory not found"
    exit 1
fi

# Install pre-commit hook
if [ -f "$SCRIPTS_DIR/pre-commit" ]; then
    install_hook "pre-commit"
else
    echo "❌ Error: pre-commit script not found at $SCRIPTS_DIR/pre-commit"
    exit 1
fi

echo ""
echo "🎉 Git hooks setup completed!"
echo ""
echo "📋 Installed hooks:"
echo "   - pre-commit: Blocks commits containing secrets, API keys, or sensitive data"
echo ""
echo "🔍 The pre-commit hook scans for:"
echo "   - API keys (AWS, Google, GitHub, etc.)"
echo "   - Database connection strings"
echo "   - JWT tokens and private keys"
echo "   - Passwords and authentication tokens"
echo "   - Environment variable assignments with sensitive values"
echo ""
echo "⚙️  Configuration:"
echo "   - Hook script: $SCRIPTS_DIR/pre-commit"
echo "   - Patterns file: $SCRIPTS_DIR/secret-patterns.txt"
echo "   - Git hooks directory: $HOOKS_DIR"
echo ""
echo "🧪 To test the hook:"
echo "   echo 'API_KEY=sk-test-123456789' >> test-secret.txt"
echo "   git add test-secret.txt"
echo "   git commit -m 'test: should be blocked'"
echo "   rm test-secret.txt"
echo ""
