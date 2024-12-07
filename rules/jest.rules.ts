// jest.rules.ts

export const TestingRules = {
  /**
   * GameSage Core Testing Areas
   */
  gameSagePriorities: {
    screenshotSystem: {
      description: 'Core screenshot capture and analysis pipeline',
      whatToTest: [
        'Capture timing and intervals',
        'Memory management during continuous capture',
        'Scene change detection accuracy',
        'Processing pipeline performance'
      ],
      example: `
          describe('Screenshot Capture System', () => {
            it('manages memory during continuous capture', async () => {
              const capture = new CaptureSystem({ interval: 5000 });
              await capture.startSession();
              
              const memoryUsage = await capture.getResourceStats();
              expect(memoryUsage.isWithinLimits()).toBe(true);
            });
          });
        `
    },

    aiIntegration: {
      description: 'OpenAI integration and analysis',
      whatToTest: [
        'Prompt generation accuracy',
        'Response parsing and error handling',
        'Rate limiting behavior',
        'Mode-specific analysis (tactical, commentary, etc.)'
      ],
      avoidTesting: [
        'Specific OpenAI response content',
        'UI rendering of responses',
        'Third-party API implementation details'
      ]
    },

    gameProfiles: {
      description: 'Game profile management and switching',
      focusAreas: [
        'Profile loading and validation',
        'Game detection accuracy',
        'Settings persistence',
        'Profile switching behavior'
      ]
    }
  },

  /**
   * Core Testing Philosophy
   */
  corePrinciples: {
    failFirst: {
      description: 'Always make tests fail before making them pass',
      rules: [
        'Verify assertions work by making them fail first',
        'Change test input to ensure edge cases are actually being tested',
        'Never trust a test that passes on the first try'
      ]
    },

    testStructure: {
      description: 'Use AAA (Arrange-Act-Assert) pattern',
      structure: {
        arrange: 'Set up test data and conditions',
        act: 'Execute the code under test',
        assert: 'Verify the results'
      },
      gameSageExample: `
          describe('Tactical Mode Analysis', () => {
            it('provides relevant game advice', async () => {
              // Arrange
              const analyzer = new GameAnalyzer({
                mode: 'tactical',
                game: 'leagueOfLegends'
              });
              const gameState = createTestGameState({
                phase: 'early',
                playerState: 'alive'
              });
  
              // Act
              const analysis = await analyzer.analyze(gameState);
  
              // Assert
              expect(analysis).toMatchObject({
                recommendation: expect.any(String),
                confidence: expect.any(Number),
                context: expect.stringContaining('early game')
              });
            });
          });
        `
    }
  },

  /**
   * GameSage-Specific Testing Patterns
   */
  patterns: {
    stateTesting: {
      description: 'Testing GameSage state transitions',
      example: `
          describe('Mode Switching', () => {
            it('preserves analysis context during mode transitions', () => {
              const session = createGameSession();
              session.setMode('tactical');
              session.analyze(testScreenshot);
              
              session.setMode('commentary');
              
              expect(session.getAnalysisContext()).toBeDefined();
              expect(session.getMode()).toBe('commentary');
            });
          });
        `
    },

    performanceTesting: {
      description: 'Testing GameSage performance constraints',
      example: `
          it('processes screenshots within performance budget', async () => {
            const pipeline = createAnalysisPipeline();
            const startTime = performance.now();
            
            await pipeline.process(testScreenshot);
            
            const duration = performance.now() - startTime;
            expect(duration).toBeLessThan(maxProcessingTime);
          });
        `
    }
  },

  /**
   * Guidelines for GameSage
   */
  mocking: {
    rules: [
      {
        rule: 'Mock only at system boundaries',
        explanation: 'Only mock external services you cannot control',
        example: 'OpenAI API, filesystem operations'
      },
      {
        rule: 'Never mock business logic',
        explanation: 'If you need to mock business logic, your code needs restructuring',
        example: 'Don\'t mock game state analysis, mock only the API call to OpenAI'
      },
      {
        rule: 'Use test doubles over mocks when possible',
        explanation: 'Create simplified but real implementations for testing',
        example: `
        // Instead of mocking all of OpenAI:
        class TestAnalyzer implements GameAnalyzer {
          async analyze(screenshot: Buffer): Promise<Analysis> {
            return {
              recommendation: "Test recommendation",
              confidence: 0.8
            };
          }
        }
      `
      }
    ],

    designGuidelines: {
      description: 'How to design code that needs less mocking',
      principles: [
        'Use dependency injection',
        'Create clear interfaces between systems',
        'Keep business logic independent of external services',
        'Design for testability from the start'
      ],
      example: `
      // GOOD: Easily testable design
      interface ScreenshotAnalyzer {
        analyze(screenshot: Buffer): Promise<Analysis>;
      }

      class GameAdviser {
        constructor(private analyzer: ScreenshotAnalyzer) {}
        
        async getAdvice(screenshot: Buffer): Promise<Advice> {
          const analysis = await this.analyzer.analyze(screenshot);
          return this.processAnalysis(analysis);
        }
      }

      // In tests:
      const testAnalyzer = new TestAnalyzer(); // No mocking needed
      const adviser = new GameAdviser(testAnalyzer);
    `
    }
  },

  /**
   * Test Data Management
   */
  testData: {
    screenshotFixtures: {
      location: '__fixtures__/screenshots/',
      naming: '[game]-[scenario]-[timestamp].png',
      usage: 'Use real screenshots for integration tests'
    },
    gameProfiles: {
      location: '__fixtures__/profiles/',
      format: 'JSON with standard game profile structure'
    }
  },

  /**
 * Warning About Over-Mocking
 * This section intentionally placed first to emphasize its importance
 */
  mockingWarning: {
    title: "The Mock Trap: When Tests Stop Testing Reality",
    description: "Excessive mocking creates tests that validate your mocks, not your code.",

    warning: `
      If you find yourself writing more than 2-3 mocks for a test:
      1. STOP
      2. Your test is probably not testing real behavior
      3. You're likely testing implementation details
      4. Your code might be too coupled
    `,

    symptoms: [
      'Setting up more mock functions than actual test code',
      'Mocking internal methods rather than external dependencies',
      'Tests that pass but system fails in production',
      'Tests that break on minor refactoring',
      'Complex mock setup that mirrors entire subsystems'
    ],

    solutions: {
      redesign: [
        'Break down the system into smaller, testable units',
        'Use dependency injection instead of mocking internals',
        'Create clear boundaries between systems',
        'Test outcomes rather than implementations'
      ],
      example: `
        // BAD: Over-mocked test
        it('analyzes game state', async () => {
          const mockScreenshot = jest.fn();
          const mockOpenAI = jest.fn();
          const mockStateManager = jest.fn();
          const mockImageProcessor = jest.fn();
          const mockProfileLoader = jest.fn();
          // ... more mocks
          
          expect(mockOpenAI).toHaveBeenCalledWith(...);
          expect(mockImageProcessor).toHaveBeenCalledWith(...);
        });

        // GOOD: Testing actual behavior
        it('provides relevant game advice', async () => {
          const analyzer = new GameAnalyzer({
            mode: 'tactical',
            game: 'leagueOfLegends'
          });
          
          const advice = await analyzer.analyze(testScreenshot);
          
          expect(advice).toHaveProperty('recommendation');
          expect(advice.confidence).toBeGreaterThan(0);
        });
      `
    },

    acceptableMocks: [
      'External APIs (OpenAI)',
      'File system operations',
      'Database connections',
      'Time-based operations (using Jest timers)'
    ],

    redFlags: [
      'Mocking utility functions',
      'Mocking business logic',
      'Mocking more than one layer deep',
      'Tests that require mock setup helper functions'
    ]
  },
};