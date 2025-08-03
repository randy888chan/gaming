# Documentation Versioning Policy

## 1. Versioning Scheme
- Follows Semantic Versioning: `MAJOR.MINOR.PATCH`
- **MAJOR**: Breaking changes to documentation structure or content
- **MINOR**: New features or significant updates to existing content
- **PATCH**: Typo fixes, formatting improvements, minor corrections

## 2. Change Management
- All documentation changes require a PR
- PRs must include:
  - Updated version in document header
  - Summary of changes
  - Impact analysis
- Documentation changes are reviewed by at least 2 team members

## 3. Release Notes
- Maintain `CHANGELOG.md` in docs directory
- Each release note includes:
  - Version number
  - Release date
  - Change categories (Added, Changed, Deprecated, Removed, Fixed)
  - Links to related documents

## 4. Backward Compatibility
- Major version changes may break existing links
- Maintain redirects for deprecated URLs
- Provide 3-month deprecation notice for removed documents
- Archive old versions in `/docs/archive/vX.Y/`

## 5. Version Tagging
```bash
# Create version tag
git tag docs/v1.2.0 -m "Documentation update: Add security policy"
git push origin docs/v1.2.0
```

## 6. Audit Process
- Quarterly documentation audits
- Verify all links and references
- Update version numbers for stale documents
- Remove deprecated content according to schedule

> **Example Document Header:**
> ```
> # Document Title
> **Version:** 1.2.0 | **Last Updated:** 2025-08-03