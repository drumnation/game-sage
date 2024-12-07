# Debug Project Typescript Errors

- There are failing typescript errors in the project
- Recursively run `tsc --noEmit` to find typescript errors in the project
- Do this until errors are fixed.
- Be intensely aware of what code already exists, do your research, and make sure you do not duplicate already existing code.
- Be extremely careful not to remove working code in your quest to solve typescript errors. The codebase is complex and much is already working.
- If your changes produce new errors, pay close attention to what you did, and opt to roll back to the previously working state before trying again rather than continously spin out new code.
