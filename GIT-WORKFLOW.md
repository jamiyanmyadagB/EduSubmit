# Git Workflow Guide

## 🌿 Branching Strategy

### Allowed Branches
- `main` - Production-ready code only
- `feature/*` - New features and functionality
- `fix/*` - Bug fixes and patches
- `ui/*` - UI/UX improvements and redesigns

### Strict Rules
- **NEVER** commit directly to `main`
- **ALWAYS** create feature branches from `develop`
- **EVERY** change must be in its own branch
- **MERGE** only via pull requests

---

## 🚀 Workflow Commands

### Start New Feature
```bash
# Create and switch to feature branch
git checkout develop
git checkout -b feature/feature-name

# Make changes...
git add .
git commit -m "feat: add feature description

# Push to remote
git push origin feature/feature-name
```

### Bug Fix
```bash
# Create and switch to fix branch
git checkout develop
git checkout -b fix/issue-description

# Make changes...
git add .
git commit -m "fix: correct bug description"

# Push to remote
git push origin fix/issue-description
```

### UI Changes
```bash
# Create and switch to UI branch
git checkout develop
git checkout -b ui/component-redesign

# Make changes...
git add .
git commit -m "ui: update component design"

# Push to remote
git push origin ui/component-redesign
```

### Merge to Main
```bash
# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main

# Merge feature branch
git merge --no-ff feature/feature-name

# Push to main
git push origin main
```

---

## 📝 Commit Message Standards

### Format
```
<type>(<scope>): <description>

[optional body]

Co-authored-by: Name <email>
```

### Types
- `feat:` - New feature
- `fix:` - Bug fix
- `ui:` - UI/UX change
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Test addition
- `chore:` - Maintenance task

### Examples
```bash
feat(auth): add JWT token refresh mechanism
fix(timestamp): correct deadline calculation
ui(dashboard): redesign student interface
docs(readme): update installation guide
```

---

## 🔀 Pull Request Process

### Create PR
```bash
# After pushing feature branch
# Create pull request on GitHub
# Target: main branch
# Request code review
# Ensure CI/CD passes
```

### PR Checklist
- [ ] Code follows project standards
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] CI/CD pipeline passes
- [ ] No merge conflicts

---

## 🌳 Current Branches

### Active Features
- `feature/student-login` - Authentication flow
- `feature/ai-help-panel` - AI assistance panel
- `feature/submission-upload` - File upload functionality
- `fix/deadline-timestamp-bug` - Deadline calculation fixes
- `ui/dashboard-redesign` - Dashboard UI improvements

### Production
- `main` - Production-ready code only

---

## 📋 Daily Workflow

### For Developers
1. **Morning**: Check assigned tasks, create feature branches
2. **Development**: Work in isolated branches, commit frequently
3. **Testing**: Ensure all tests pass before PR
4. **Review**: Submit pull requests for code review
5. **Merge**: Merge approved PRs to main

### For DevOps Engineers
1. **Monitor**: Watch CI/CD pipeline status
2. **Review**: Ensure all PRs follow standards
3. **Deploy**: Merge only after successful pipeline
4. **Maintain**: Keep branches clean and organized

---

## 🛠️ Git Maintenance

### Regular Tasks
```bash
# Update main branch
git checkout main
git pull origin main

# Clean up merged branches
git branch -d feature/merged-feature
git push origin --delete feature/merged-feature

# Prune remote branches
git remote prune origin
```

### Emergency Commands
```bash
# Reset to main if needed
git reset --hard origin/main

# Stash changes temporarily
git stash save "work in progress"

# Apply stashed changes
git stash pop
```

---

## 📊 Branch Status Commands

### Check Current Branch
```bash
git branch --show-current
```

### List All Branches
```bash
git branch -a
```

### Check Branch Status
```bash
git status
git log --oneline -5
```

---

## ⚡ Quick Reference

### Git Aliases (Recommended)
```bash
# Add to ~/.gitconfig
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    pu = push
    pl = pull --rebase
    lg = log --oneline --graph --decorate
```

### Useful Commands
```bash
# See commit history
git log --oneline --graph

# Compare branches
git diff main..feature-branch

# See changed files
git diff --name-only

# Undo last commit
git reset --soft HEAD~1
```

---

**Remember**: Clean, modular, and scalable development starts with proper Git workflow!
