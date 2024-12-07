# Update Documentation

- Do an inventory of what has been changed in this commit
- Assess whether this constitutes a major, minor, or patch change
- Bump the version in the package.json ${major|minor|patch} using the scripts
  - "version:major": "pnpm version major -m 'chore(release): bump version to %s'",
  - "version:minor": "pnpm version minor -m 'chore(release): bump version to %s'",
  - "version:patch": "pnpm version patch -m 'chore(release): bump version to %s'",
- Update the Changelog to reflect any changes made
- Update the main ReadMe.md to reflect any project wide changes that need to be documented
- If any new components were added make sure to include a readme for that component in that folder
- If any components were updated and already have a readme in the folder, make sure to update the readme to reflect the new changes
- Be very careful, but if any important paths have been added or updated, check the .cursorrules file and update that to reflect the new paths
- Commit the changes
