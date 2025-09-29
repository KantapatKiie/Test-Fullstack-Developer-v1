# Git Flow Branching Strategy

## Branch Structure

This project follows a comprehensive Git Flow strategy with multiple environment branches:

```
master (production)
├── release (release candidate)
│   ├── pre-prod (pre-production testing)
│   │   ├── uat (user acceptance testing)
│   │   │   └── develop (integration/development)
│   │   │       └── feature/* (feature branches)
│   │   └── hotfix/* (hotfix branches)
│   └── bugfix/* (release bugfixes)
└── hotfix/* (production hotfixes)
```

## Branch Descriptions

### 🚀 **master**
- **Purpose**: Production-ready code
- **Deployment**: Production environment
- **Source**: Merges from `release` branch
- **Protection**: Protected, requires PR approval
- **Auto-deploy**: Yes (production)

### 📦 **release**
- **Purpose**: Release candidate preparation
- **Deployment**: Release candidate environment
- **Source**: Merges from `pre-prod` branch
- **Merge to**: `master` when ready for production
- **Testing**: Final release testing, performance tests

### 🔧 **pre-prod**
- **Purpose**: Pre-production testing
- **Deployment**: Pre-production environment (production-like)
- **Source**: Merges from `uat` branch
- **Merge to**: `release` when stable
- **Testing**: System integration, load testing, final QA

### ✅ **uat**
- **Purpose**: User Acceptance Testing
- **Deployment**: UAT environment
- **Source**: Merges from `develop` branch
- **Merge to**: `pre-prod` when accepted by business users
- **Testing**: Business acceptance testing, end-to-end testing

### 🛠️ **develop**
- **Purpose**: Integration branch for features
- **Deployment**: Development environment
- **Source**: Merges from `feature/*` branches
- **Merge to**: `uat` when ready for testing
- **Testing**: Unit tests, integration tests

### 🌟 **main** (legacy)
- **Status**: Original default branch, now superseded by master
- **Purpose**: Kept for GitHub default branch compatibility
- **Note**: Consider setting master as default branch on GitHub

## Workflow

### Feature Development
```bash
# Start new feature from develop
git checkout develop
git pull origin develop
git checkout -b feature/new-awesome-feature

# Work on feature...
# Push feature branch
git push -u origin feature/new-awesome-feature

# Create PR: feature/new-awesome-feature → develop
```

### Release Process
```bash
# 1. Merge develop → uat (when features are complete)
git checkout uat
git merge develop
git push origin uat

# 2. Test in UAT environment
# 3. Merge uat → pre-prod (when UAT passes)
git checkout pre-prod  
git merge uat
git push origin pre-prod

# 4. Test in pre-prod environment
# 5. Merge pre-prod → release (when pre-prod is stable)
git checkout release
git merge pre-prod
git push origin release

# 6. Final testing in release environment
# 7. Merge release → master (when ready for production)
git checkout master
git merge release
git push origin master
```

### Hotfix Process
```bash
# Emergency fix from master
git checkout master
git checkout -b hotfix/critical-bug-fix

# Fix the issue...
# Push hotfix
git push -u origin hotfix/critical-bug-fix

# Merge to master and develop
git checkout master
git merge hotfix/critical-bug-fix
git checkout develop  
git merge hotfix/critical-bug-fix
```

## Branch Protection Rules

### Recommended GitHub Settings:

**master branch:**
- Require PR before merging
- Require status checks (CI/CD)
- Require up-to-date branches
- Require review from code owners
- Restrict pushes to specific people/teams

**release branch:**
- Require PR before merging
- Require status checks
- Require review from release managers

**pre-prod branch:**
- Require PR before merging
- Require status checks

**uat branch:**
- Require PR before merging
- Allow merge commits

**develop branch:**
- Require PR before merging
- Allow squash merging

## Environment Mapping

| Branch | Environment | Purpose | Auto-Deploy |
|--------|-------------|---------|-------------|
| master | Production | Live users | ✅ |
| release | Release Candidate | Final validation | ✅ |
| pre-prod | Pre-Production | Production simulation | ✅ |
| uat | UAT | Business acceptance | ✅ |
| develop | Development | Feature integration | ✅ |

## CI/CD Pipeline

Each branch should trigger appropriate CI/CD pipelines:

- **develop**: Run tests, deploy to dev environment
- **uat**: Run full test suite, deploy to UAT environment
- **pre-prod**: Run performance tests, deploy to pre-prod environment
- **release**: Run security scans, deploy to release environment
- **master**: Run all tests, deploy to production with blue-green deployment

## Tags and Versioning

Use semantic versioning (SemVer) for releases:
```bash
# Tag release versions on master branch
git checkout master
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## Quick Commands

```bash
# Check all branches
git branch -a

# Switch to specific branch
git checkout develop|uat|pre-prod|release|master

# Pull latest changes
git pull origin <branch-name>

# Create and push new feature branch
git checkout develop
git checkout -b feature/my-feature
git push -u origin feature/my-feature
```

---

**Repository**: [Test-Fullstack-Developer-v1](https://github.com/KantapatKiie/Test-Fullstack-Developer-v1)

**Current Branches**: develop, uat, pre-prod, release, master, main (legacy)