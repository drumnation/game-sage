export const AtomicComponentRules = {
    /**
     * Project Structure
     */
    structure: {
        description: 'Base project structure following atomic design',
        layout: `
      src/
        components/
          atoms/              # UI primitives
          molecules/          # Compositions of atoms
          organisms/          # Complex components
        features/            # Feature-specific components
        pages/              # Page compositions
        shared/             # Shared utilities
        styles/             # Design system and theme`,
    },

    /**
     * Core Creation Cycle
     */
    coreCycle: {
        description: 'Unified process combining atomic design principles with component creation',
        phases: [
            {
                name: 'PLANNING',
                description: 'Define component purpose and structure',
                rules: [
                    'Define clear component purpose and boundaries',
                    'Determine atomic level (atom/molecule/organism)',
                    'Plan component hierarchy following atomic design',
                    'Identify required props, state, and events',
                    'Consider performance implications',
                    'Plan error handling and loading states'
                ],
                atomicRules: {
                    atoms: [
                        'Must be UI primitives with no business logic',
                        'Must be completely domain-agnostic',
                        'Should wrap third-party components or HTML elements',
                        'Must be highly reusable across any project'
                    ],
                    molecules: [
                        'Must be compositions of atoms only',
                        'Should remain relatively domain-agnostic',
                        'Can have specific purposes while staying generic'
                    ],
                    organisms: [
                        'Can compose atoms and molecules',
                        'Can include minimal business logic if generic',
                        'Must maintain reasonable reusability'
                    ]
                },
                folderStructure: `
  ComponentName/
    ├── components/               # Subcomponent folder
    │   └── SubComponent/        # Follow same structure
    ├── ComponentName.tsx        # Main component
    ├── ComponentName.types.ts   # Type definitions
    ├── ComponentName.styles.ts  # Styling
    ├── ComponentName.hook.ts    # Custom hooks
    ├── ComponentName.logic.ts   # Helper functions
    ├── ComponentName.test.tsx   # Tests
    ├── ComponentName.stories.tsx# Storybook
    ├── index.ts                # Exports
    └── README.md               # Documentation`,
                pitfalls: [
                    'Skipping planning phase',
                    'Unclear component boundaries',
                    'Deep component hierarchies (>3 levels)',
                    'Missing error handling plans',
                    'Incorrect atomic classification'
                ]
            },
            {
                name: 'TYPES',
                description: 'Define comprehensive type system',
                rules: [
                    'Create ComponentName.types.ts with all definitions',
                    'Define prop interfaces with JSDoc documentation',
                    'Include state and event handler types',
                    'Define utility types and constants',
                    'Export all types through index.ts'
                ],
                example: `
  // ComponentName.types.ts
  /**
   * Props interface for ComponentName
   */
  export interface ComponentNameProps {
    /** Required props with descriptions */
    requiredProp: PropType;
    
    /** Optional props with defaults */
    optionalProp?: PropType;
    
    /** Event handlers */
    onEvent?: (event: EventType) => void;
  }
  
  /** State management types */
  export interface ComponentState {
    loading: boolean;
    error: Error | null;
    data: DataType;
  }
  
  /** Event handler types */
  export type EventHandlers = {
    handleChange: (value: string) => void;
    handleSubmit: () => Promise<void>;
  };`,
                pitfalls: [
                    'Insufficient type coverage',
                    'Missing JSDoc documentation',
                    'Using any/unknown types unnecessarily',
                    'Unclear type naming'
                ]
            },
            {
                name: 'STYLES',
                description: 'Implement styling system using design system theme',
                rules: [
                    'Create ComponentName.styles.ts for styling logic',
                    'Use theme tokens for all values',
                    'Implement responsive design',
                    'Ensure accessibility',
                    'Follow design system patterns'
                ],
                example: `
  // ComponentName.styles.ts
  import styled from 'styled-components';
  import type { ComponentProps } from './ComponentName.types';
  
  export const StyledComponent = styled.div<ComponentProps>\`
    // Use theme spacing
    padding: \${({ theme }) => theme.spacing.md};
    
    // Use theme colors
    background-color: \${({ theme }) => theme.colors.surface};
    color: \${({ theme }) => theme.colors.textPrimary};
    
    // Use theme border radius
    border-radius: \${({ theme }) => theme.borderRadius};
    
    // Responsive design using theme values
    @media (max-width: 768px) {
      padding: \${({ theme }) => theme.spacing.sm};
    }
    
    // Variants using theme colors
    \${({ variant }) => variant === 'primary' && \`
      background-color: \${({ theme }) => theme.colors.primary};
      color: \${({ theme }) => theme.colors.background};
    \`}
  \`;`,
                pitfalls: [
                    'Hard-coded values',
                    'Inconsistent theme usage',
                    'Poor responsive design',
                    'Inaccessible styles',
                    'Not using theme tokens'
                ]
            },
            {
                name: 'LOGIC',
                description: 'Implement business logic and hooks',
                rules: [
                    'Create ComponentName.hook.ts for state management',
                    'Create ComponentName.logic.ts for pure functions',
                    'Implement error handling',
                    'Add performance optimizations',
                    'Include data fetching logic'
                ],
                example: `
  // ComponentName.hook.ts
  export const useComponentName = (props: ComponentProps) => {
    const [state, setState] = useState<ComponentState>({
      loading: false,
      error: null,
      data: null
    });
  
    const handleEvent = useCallback(() => {
      // Event handling logic
    }, []);
  
    return { state, handleEvent };
  };
  
  // ComponentName.logic.ts
  export const validateInput = (input: InputType): boolean => {
    // Validation logic
  };`,
                pitfalls: [
                    'Mixed concerns between files',
                    'Complex useEffect dependencies',
                    'Missing error handling',
                    'Poor performance optimization'
                ]
            },
            {
                name: 'COMPONENT',
                description: 'Implement main component and subcomponents',
                rules: [
                    'Create ComponentName.tsx with clean JSX',
                    'Organize subcomponents in components/ folder',
                    'Implement proper prop validation',
                    'Add error boundaries and loading states',
                    'Ensure accessibility features'
                ],
                example: `
  // ComponentName.tsx
  import { useComponentName } from './ComponentName.hook';
  import { StyledComponent } from './ComponentName.styles';
  import type { ComponentProps } from './ComponentName.types';
  
  export function ComponentName(props: ComponentProps) {
    const { state, handleEvent } = useComponentName(props);
  
    if (state.loading) return <LoadingState />;
    if (state.error) return <ErrorBoundary error={state.error} />;
  
    return (
      <StyledComponent>
        {/* Component JSX */}
      </StyledComponent>
    );
  }`,
                pitfalls: [
                    'Mixed logic and presentation',
                    'Missing error/loading states',
                    'Poor accessibility',
                    'Inconsistent naming'
                ]
            }
        ]
    },

    /**
     * Design System Integration
     */
    designSystem: {
        description: 'Guidelines for using the design system theme',
        location: 'src/styles/theme.ts',
        usage: {
            setup: [
                'Import theme types from styled-components',
                'Ensure DefaultTheme interface extends Theme',
                'Use theme properties instead of hard-coded values'
            ],
            rules: [
                'Always use theme tokens instead of raw values',
                'Access theme through styled-components props',
                'Use semantic color names from theme',
                'Follow spacing scale from theme',
                'Maintain consistent border radius usage'
            ],
            themeTokens: {
                colors: [
                    'background: Base background color',
                    'primary: Primary brand color',
                    'text: Default text color',
                    'textPrimary: Primary text color',
                    'textSecondary: Secondary text color',
                    'surface: Surface background color'
                ],
                spacing: [
                    'sm: Small spacing (0.5rem)',
                    'md: Medium spacing (1rem)',
                    'lg: Large spacing (1.5rem)'
                ],
                borderRadius: 'Default border radius (4px)'
            }
        },
        pitfalls: [
            'Using hard-coded values instead of theme tokens',
            'Inconsistent spacing usage',
            'Mixed color naming conventions',
            'Overriding theme values unnecessarily',
            'Not using semantic color names'
        ]
    },

    /**
     * Testing Requirements
     */
    testing: {
        atoms: {
            required: [
                'Unit tests for all props/variants',
                'Accessibility tests',
                'Snapshot tests',
                'Event handler tests',
                'Style variation tests',
                'Theme compliance tests'
            ]
        },
        molecules: {
            required: [
                'Integration tests for atom combinations',
                'User interaction tests',
                'State management tests',
                'Error handling tests'
            ]
        },
        organisms: {
            required: [
                'Complex integration tests',
                'Performance tests',
                'Error boundary tests',
                'Loading state tests'
            ]
        }
    },

    /**
     * Documentation Requirements
     */
    documentation: {
        readme: [
            'Component purpose and description',
            'Usage examples with code',
            'Props documentation',
            'Theme usage documentation',
            'Accessibility considerations',
            'Performance considerations',
            'Dependencies list'
        ],
        storybook: [
            'Basic usage story',
            'All variants',
            'Theme variations',
            'Interactive examples',
            'Edge cases',
            'Loading states',
            'Error states'
        ],
        code: [
            'JSDoc for all exports',
            'Inline comments for complex logic',
            'Type documentation',
            'Props interface documentation'
        ]
    },

    /**
     * Import/Export Guidelines
     */
    imports: {
        rules: [
            'Use path aliases for all imports',
            'Group imports by type',
            'Atoms can only import from shared',
            'Molecules can only import atoms',
            'Organisms can import atoms and molecules',
            'Features can import from any level'
        ],
        example: `
  import { FC, memo, useCallback } from 'react';
  import { Button } from '@atoms/Button';
  import { FormField } from '@molecules/FormField';
  import { useForm } from '@hooks/useForm';
  import { theme } from '@styles/theme';`
    },

    /**
     * Warning Signs
     */
    warnings: {
        description: 'Red flags in component development',
        signs: [
            'Component files over 300 lines',
            'Deep component hierarchies',
            'Mixed concerns in files',
            'Missing type definitions',
            'Inline styles',
            'Hard-coded values instead of theme tokens',
            'Poor error handling',
            'Missing documentation',
            'Prop drilling',
            'Business logic in atoms',
            'Incorrect atomic classification'
        ]
    }
};