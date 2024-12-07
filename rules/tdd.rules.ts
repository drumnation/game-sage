export const TDDRules = {
  /**
   * Core TDD Cycle
   */
  tddCycle: {
    description: 'The fundamental Red-Green-Refactor cycle',
    steps: [
      {
        phase: 'RED',
        description: 'Write a failing test that defines the desired behavior',
        rules: [
          'Write the minimal test needed to define the behavior',
          'Only write the test, no implementation',
          'The test MUST fail (if it passes, your test might be wrong)',
          'Test should clearly describe the expected behavior'
        ],
        example: `describe('Screenshot Analysis', () => {
  it('provides tactical advice for early game phase', () => {
    const analyzer = new GameAnalyzer();
    const result = analyzer.analyzeTactical({
      phase: 'early',
      champion: 'Ahri'
    });
    
    expect(result).toMatchObject({
      advice: expect.any(String),
      priority: expect.any(Number),
      timing: 'early-game'
    });
  });
});`
      },
      {
        phase: 'GREEN',
        description: 'Write the minimal code to make the test pass',
        rules: [
          'Write the simplest possible implementation',
          "It's okay to \"cheat\" - return hardcoded values if needed",
          'Focus on making the test pass quickly',
          "Don't worry about elegance yet"
        ],
        example: `class GameAnalyzer {
  analyzeTactical() {
    // Minimal implementation to pass the test
    return {
      advice: "Farm safely and wait for level 6",
      priority: 1,
      timing: 'early-game'
    };
  }
}`
      },
      {
        phase: 'REFACTOR',
        description: 'Improve the code while keeping tests green',
        rules: [
          'Clean up any shortcuts taken in the GREEN phase',
          'Extract common patterns',
          'Improve names and structure',
          'Tests must stay green throughout'
        ]
      }
    ]
  },

  /**
   * Starting New Features
   */
  featureStart: {
    description: 'How to begin implementing a new feature with TDD',
    steps: [
      {
        phase: 'Interface First',
        description: 'Design the API through tests before implementation',
        example: `it('captures screenshot on specified interval', () => {
  const capture = new ScreenshotCapture({
    interval: 5000,
    quality: 'high'
  });
  
  capture.start();
  expect(capture.isRunning()).toBe(true);
  expect(capture.getConfig().interval).toBe(5000);
});`
      },
      {
        phase: 'Edge Cases',
        description: 'Write tests for boundary conditions before happy path',
        example: `it('throws when interval is too low', () => {
  expect(() => {
    new ScreenshotCapture({ interval: 100 });
  }).toThrow('Interval must be at least 1000ms');
});`
      }
    ]
  },

  /**
   * Test Size Guidelines
   */
  testSize: {
    description: 'Keep tests small and focused',
    rules: [
      'Each test should verify one specific behavior',
      'If test setup is complex, you might be testing too much',
      'Split large tests into smaller, focused tests'
    ],
    example: `// BAD: Testing too much in one test
it('handles full screenshot workflow', async () => {
  const capture = new ScreenshotCapture();
  await capture.start();
  const screenshot = await capture.take();
  const analysis = await analyzer.analyze(screenshot);
  await capture.stop();
  expect(analysis).toBeDefined();
});

// GOOD: Split into focused tests
it('starts capture session', async () => {
  const capture = new ScreenshotCapture();
  await capture.start();
  expect(capture.isRunning()).toBe(true);
});

it('captures screenshots when running', async () => {
  const capture = new ScreenshotCapture();
  await capture.start();
  const screenshot = await capture.take();
  expect(screenshot).toBeInstanceOf(Buffer);
});`
  },

  /**
   * GameSage-Specific TDD Patterns
   */
  gameSagePatterns: {
    screenshotFeatures: {
      description: 'TDD patterns for screenshot-related features',
      example: `// 1. Start with capture configuration
it('configures screenshot quality', () => {
  const config = new CaptureConfig({ quality: 'high' });
  expect(config.getQualitySettings()).toMatchObject({
    compression: 'lossless',
    format: 'png'
  });
});

// 2. Add capture capability
it('captures screen content', async () => {
  const capture = new ScreenshotCapture(config);
  const screenshot = await capture.take();
  expect(screenshot).toBeInstanceOf(Buffer);
});

// 3. Add analysis integration
it('analyzes captured content', async () => {
  const analyzer = new GameAnalyzer(capture);
  const analysis = await analyzer.analyze();
  expect(analysis.gameState).toBeDefined();
});`
    },

    aiFeatures: {
      description: 'TDD patterns for AI-related features',
      steps: [
        'Start with prompt generation tests',
        'Add response parsing tests',
        'Test error handling',
        'Add rate limiting tests'
      ]
    }
  },

  /**
   * Warning Signs
   */
  warnings: {
    description: 'Red flags in your TDD process',
    signs: [
      'Writing multiple tests before implementation',
      'Writing more implementation than needed for current test',
      'Skipping the refactor phase',
      'Tests passing without assertions',
      'Complex test setup code'
    ]
  },

  /**
   * Refactoring Guidelines
   */
  refactoring: {
    description: 'How to approach the refactor phase',
    steps: [
      'Run tests frequently during refactoring',
      'Make small, incremental changes',
      'Extract common setup code only after seeing duplication',
      'Improve naming based on new understanding'
    ],
    example: `// Before refactoring
const result = analyzer.analyze(screenshot);

// After refactoring
const gameState = await analyzer.detectGameState(screenshot);
const analysis = await analyzer.provideTacticalAdvice(gameState);`
  }
};