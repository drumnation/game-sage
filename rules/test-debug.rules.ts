// testDebugRules.ts

export const TestDebugRules = {
    /**
     * Initial Triage
     */
    startHere: {
        description: 'First steps when encountering a failing test',
        steps: [
            {
                check: 'Is the test failing consistently?',
                if: {
                    yes: 'Move to synchronization checks',
                    no: 'Move to race condition checks'
                }
            },
            {
                check: 'Does the test fail in isolation (with .only)?',
                if: {
                    yes: 'Move to test structure checks',
                    no: 'Move to test interference checks'
                }
            }
        ]
    },

    /**
     * Common Failure Patterns
     */
    debugPatterns: {
        asyncIssues: {
            symptoms: [
                'Test passes sometimes',
                'Timeout errors',
                'Promise-related errors'
            ],
            checkList: [
                'Missing await keywords',
                'Missing returned promises',
                'Race conditions in setup',
                'Incorrect async cleanup'
            ],
            example: `
        // Check for missing awaits
        it('should process async operation', async () => {
          const result = asyncOperation(); // Missing await!
          expect(result).toBeDefined(); // Will fail unpredictably
        });
      `
        },

        stateInterference: {
            symptoms: [
                'Test fails only when run with other tests',
                'Different results in CI vs local',
                'Order-dependent failures'
            ],
            checkList: [
                'Shared state between tests',
                'Incomplete cleanup',
                'Global state modifications'
            ],
            solution: `
        // Add proper cleanup
        afterEach(() => {
          jest.clearAllMocks();
          return db.cleanup(); // Don't forget to await in the runner
        });
      `
        },

        mockingIssues: {
            symptoms: [
                'Unexpected function calls',
                'Wrong mock return values',
                'Type mismatches in mocks'
            ],
            checkList: [
                'Mock reset between tests',
                'Mock implementation correctness',
                'Mock return type accuracy'
            ]
        }
    },

    /**
     * Recursive Debug Steps
     */
    recursiveChecks: {
        order: [
            {
                level: 1,
                focus: 'Test Structure',
                checks: [
                    'AAA pattern followed?',
                    'Async handling correct?',
                    'Proper isolation?'
                ]
            },
            {
                level: 2,
                focus: 'Test Data',
                checks: [
                    'Input data valid?',
                    'Expected values correct?',
                    'Edge cases handled?'
                ]
            },
            {
                level: 3,
                focus: 'Mocking',
                checks: [
                    'Mocks behaving correctly?',
                    'Mock reset properly?',
                    'Mock types correct?'
                ]
            },
            {
                level: 4,
                focus: 'Infrastructure',
                checks: [
                    'Environment variables set?',
                    'File system permissions?',
                    'Network access?'
                ]
            }
        ]
    },

    /**
     * GameSage-Specific Debug Checks
     */
    gameSageChecks: {
        screenshotCapture: {
            checks: [
                'Screenshot buffer valid?',
                'Capture timing correct?',
                'Memory cleanup working?'
            ],
            example: `
        // Debug screenshot capture
        it('captures screenshot', async () => {
          const capture = new ScreenshotCapture();
          
          // Add debug points
          capture.on('beforeCapture', (config) => console.log('Config:', config));
          capture.on('afterCapture', (buffer) => console.log('Buffer size:', buffer.length));
          
          const result = await capture.take();
          expect(result).toBeDefined();
        });
      `
        },

        aiAnalysis: {
            checks: [
                'API key configured?',
                'Rate limits respected?',
                'Response parsing correct?'
            ]
        }
    },

    /**
     * Debug Utilities
     */
    debugTools: {
        recommended: [
            {
                name: 'jest.setTimeout',
                usage: 'Increase timeout for slow tests',
                example: 'jest.setTimeout(30000);'
            },
            {
                name: 'test.only',
                usage: 'Run single test in isolation',
                example: "it.only('should work', ...)"
            },
            {
                name: 'console.dir',
                usage: 'Deep object inspection',
                example: 'console.dir(result, { depth: null });'
            }
        ]
    }
};

/* COMMAND:
- Start a new terminal instance and run 'pnpm test'
- Recursively check for test failures and attempt to fix them.
*/
