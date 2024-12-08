# Documentation Update Guidelines

## Pre-Update Checklist

1. Code Changes Review
   - [ ] Review all modified files in the commit
   - [ ] List all new features, bug fixes, and breaking changes
   - [ ] Document any API changes or deprecations
   - [ ] Note any dependency updates

2. Version Assessment
   - [ ] Determine version bump type based on changes:
     - MAJOR: Breaking changes
     - MINOR: New features (backwards compatible)
     - PATCH: Bug fixes and minor changes
   - [ ] Run appropriate version script:     ```bash
     pnpm version:major  # Breaking changes
     pnpm version:minor  # New features
     pnpm version:patch  # Bug fixes```

## Documentation Updates

1. Changelog Updates
   - [ ] Add new version section if needed
   - [ ] Document all changes under appropriate categories:
     - Added (new features)
     - Changed (changes in existing functionality)
     - Deprecated (soon-to-be removed features)
     - Removed (removed features)
     - Fixed (bug fixes)
     - Security (security fixes)

2. README.md Updates
   - [ ] Update feature list if needed
   - [ ] Update installation instructions if changed
   - [ ] Update usage examples if needed
   - [ ] Update API documentation if changed
   - [ ] Update troubleshooting guide if needed

3. Component Documentation
   - [ ] Create README.md for new components with:
     - Component description
     - Props documentation
     - Usage examples
     - Dependencies
     - Known limitations
   - [ ] Update existing component README.md files if changed
   - [ ] Update component API documentation
   - [ ] Update component screenshots/demos if needed

4. Project Structure Documentation
   - [ ] Review .cursorrules file for accuracy
   - [ ] Update path aliases if changed
   - [ ] Update project structure diagram if needed
   - [ ] Update build/deployment documentation if needed

5. API Documentation
   - [ ] Update API endpoints documentation
   - [ ] Update request/response examples
   - [ ] Update error codes and messages
   - [ ] Update authentication documentation

## Post-Update Checklist

1. Final Review
   - [ ] Verify all documentation is accurate
   - [ ] Check for broken links
   - [ ] Ensure code examples are up to date
   - [ ] Verify formatting is consistent

2. Commit Changes
   - [ ] Use semantic commit message
   - [ ] Include documentation changes in same commit
   - [ ] Push changes to repository

## Documentation Style Guide

- Use clear, concise language
- Include code examples where appropriate
- Use proper markdown formatting
- Keep documentation close to related code
- Update both technical and user-facing documentation
- Include version numbers where relevant
- Document breaking changes prominently

## Maintenance Notes

- Review documentation completeness quarterly
- Archive outdated documentation
- Keep a running list of needed documentation improvements
- Consider user feedback for documentation updates
