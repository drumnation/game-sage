# Debug Project and Fix Tests and Lint Errors

- There are failing tests and typescript errors in the project
- Alternate recursively between
  - `tsc --noEmit` to find typescript errors in the project
  - `pnpm test` to run the test suite
- Do this until all tests pass and errors are fixed.
- Be intensely aware of what code already exists, do you research, and make sure you do not duplicate already existing code.
- Be extremely careful not to remove working code in your quest to solve tests or typescript errors. The codebase is complex and much is already working.
- If your changes produce new errors or failing tests, pay close attention to what you did, and opt to roll back to the previously working state before trying again rather than continously spin out new code.
