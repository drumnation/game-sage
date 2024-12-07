export const ProjectStructure = {
    /**
     * Overall Project Structure
     */
    structure: `
  src/
    atoms/                    # Shareable atomic components
      Button/
        Button.tsx
        Button.types.ts
        Button.styles.ts
        Button.utils.ts
        Button.test.tsx
        index.ts
      Input/
      Typography/
      ...
  
    molecules/               # Shareable molecular components
      FormField/
      SearchBar/
      ...
  
    organisms/              # Shareable organism components
      DataTable/
      Form/
      ...
  
    features/              # Non-shareable, feature-specific components
      UserManagement/
        components/        # Feature-specific components
          UserList/
          UserForm/
          UserDetails/
        hooks/            # Feature-specific hooks
        context/          # Feature-specific context
        utils/            # Feature-specific utilities
        types/           # Feature-specific types
        
      Analytics/
        components/
          AnalyticsChart/
          MetricsPanel/
        hooks/
        utils/
        types/
  
    pages/                # Page components that compose features
      Dashboard/
      Settings/
      ...
  
    shared/              # Shared utilities and hooks
      hooks/
      utils/
      context/
      types/`,

    /**
     * Guidelines for Component Placement
     */
    placementRules: {
        atomic: {
            description: 'Rules for atomic component placement',
            rules: [
                'Place all reusable, UI-primitive components in atoms/',
                'These should be completely domain-agnostic',
                'Focus on wrapping third-party components here',
                'Should be highly reusable across projects'
            ]
        },
        molecular: {
            description: 'Rules for molecular component placement',
            rules: [
                'Place reusable combinations of atoms in molecules/',
                'Should remain relatively domain-agnostic',
                'Can have more specific purposes but still be generically useful',
                'Should be shareable across similar projects'
            ]
        },
        organism: {
            description: 'Rules for organism component placement',
            rules: [
                'Place larger, shareable composite components in organisms/',
                'Can be more specialized but still generically useful',
                'Should be composable with different atom/molecule combinations',
                'May contain business logic but should remain generically applicable'
            ]
        },
        feature: {
            description: 'Rules for feature-specific component placement',
            rules: [
                'Place domain-specific components in features/{featureName}/components/',
                'Can use atomic components but have specific business logic',
                'Should be organized by feature domain',
                'Not intended for reuse outside the feature',
                'Can contain feature-specific implementations of shared patterns'
            ]
        }
    },

    /**
     * Component Classification Guidelines
     */
    classificationGuidelines: {
        shareable: {
            characteristics: [
                'No feature-specific logic',
                'Generic naming and props',
                'High reusability',
                'Clear, generic interfaces',
                'Comprehensive documentation',
                'Extensive testing'
            ],
            examples: [
                'Button components',
                'Form inputs',
                'Data display components',
                'Layout components'
            ]
        },
        featureSpecific: {
            characteristics: [
                'Contains business logic',
                'Feature-specific naming',
                'Limited reusability',
                'Domain-specific interfaces',
                'Integration with feature state',
                'Feature-specific validation'
            ],
            examples: [
                'UserProfileCard',
                'TransactionHistory',
                'AnalyticsChart',
                'SettingsPanel'
            ]
        }
    },

    /**
     * Import/Export Guidelines
     */
    importGuidelines: {
        rules: [
            'Always import atomic components from root level',
            'Feature components should only be imported within their feature',
            'Page components can import from multiple features',
            'Avoid circular dependencies between features'
        ],
        examples: {
            good: `
  // Good - importing atomic components
  import { Button } from '@/atoms';
  import { FormField } from '@/molecules';
  
  // Good - importing feature components
  import { UserList } from '@/features/UserManagement/components';`,
            bad: `
  // Bad - importing feature components across features
  import { UserList } from '@/features/UserManagement/components';
  import { AnalyticsChart } from '@/features/Analytics/components';`
        }
    }
};