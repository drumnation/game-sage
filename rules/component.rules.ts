export const ComponentCreationRules = {
    /**
     * Core Creation Cycle
     */
    coreCycle: {
        description: 'The fundamental component creation process',
        phases: [
            {
                name: 'PLANNING',
                description: 'Define component purpose and structure',
                rules: [
                    'Define clear component purpose and boundaries',
                    'Plan component hierarchy following atomic design principles',
                    'Identify required props, state, and events',
                    'Consider performance implications (memoization, lazy loading)',
                    'Plan error handling and loading states'
                ],
                folderStructure: `
  components/
  └── ComponentName/
      ├── components/               # Subcomponent folder
      │   └── SubComponent/        # Follow same structure
      ├── ComponentName.tsx        # Main component
      ├── ComponentName.types.ts   # Type definitions
      ├── ComponentName.styles.ts  # Styling
      ├── ComponentName.hook.ts    # Custom hooks
      ├── ComponentName.logic.ts   # Helper functions
      ├── index.ts                 # Exports
      └── README.md                # Documentation`,
                pitfalls: [
                    'Skipping planning phase',
                    'Unclear component boundaries',
                    'Deep component hierarchies (>3 levels)',
                    'Missing error handling plans'
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
                description: 'Implement styling system',
                rules: [
                    'Create ComponentName.styles.ts for styling logic',
                    'Use consistent styling methodology',
                    'Implement theme-aware styling',
                    'Consider responsive design',
                    'Include accessibility considerations'
                ],
                example: `
  // ComponentName.styles.ts
  export const styleConstants = {
    spacing: {
      small: '0.5rem',
      medium: '1rem'
    },
    breakpoints: {
      mobile: '320px',
      tablet: '768px'
    }
  };
  
  export const StyledComponent = /* styling implementation */
  `,
                pitfalls: [
                    'Inline styles',
                    'Inconsistent styling patterns',
                    'Poor responsive design',
                    'Inaccessible styles'
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
     * Best Practices
     */
    bestPractices: {
        organization: [
            'Follow atomic design principles',
            'Keep component hierarchy shallow',
            'Use consistent file naming',
            'Implement proper error boundaries',
            'Extract reusable logic to hooks',
            'Maintain comprehensive documentation'
        ],
        naming: {
            folders: 'PascalCase for component folders',
            files: 'ComponentName.{type}.ts format',
            exports: 'Named exports in index.ts'
        },
        documentation: {
            readme: [
                'Component purpose',
                'Usage examples',
                'Props documentation',
                'Dependencies list'
            ],
            code: [
                'JSDoc for public interfaces',
                'Inline comments for complex logic',
                'Type documentation',
                'Example usage'
            ]
        }
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
            'Poor error handling',
            'Missing documentation',
            'Prop drilling'
        ]
    }
};