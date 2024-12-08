# Component Documentation

This directory contains documentation for all components in the Game Sage application, organized according to Atomic Design principles.

## Component Categories

### [Atoms](./atoms.md)

Basic building blocks of the application. These are the smallest possible components, such as buttons, inputs, and labels.

### [Molecules](./molecules.md)

Combinations of atoms that form more complex UI elements, such as search bars (combining input and button atoms).

### [Organisms](./organisms.md)

Complex UI components composed of molecules and/or atoms that form distinct sections of the interface.

## Documentation Structure

Each component should have its own documentation following this structure:

```markdown
# ComponentName

## Overview
Brief description of what the component does and when to use it.

## Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| prop1 | Type | Yes/No | value | Description |

## Examples
\```tsx
import { ComponentName } from '@components/ComponentName';

// Basic usage
<ComponentName prop1="value" />

// With all props
<ComponentName
  prop1="value"
  prop2={value}
  prop3={optionalValue}
/>
\```

## Styling
Description of how to style the component, including:
- Available style props
- CSS customization points
- Theme integration

## Accessibility
- ARIA roles and attributes
- Keyboard navigation
- Screen reader considerations

## Notes
Any important considerations, limitations, or best practices.
```

## Component Guidelines

1. **Naming Conventions**
   - Use PascalCase for component names
   - Use camelCase for props
   - Use descriptive, purpose-indicating names

2. **Props**
   - Document all props thoroughly
   - Include type information
   - Specify required vs optional
   - Provide default values where applicable

3. **Examples**
   - Include basic usage example
   - Show common use cases
   - Demonstrate prop combinations
   - Include error handling if applicable

4. **Testing**
   - Document test coverage requirements
   - Include example test cases
   - Specify any testing considerations

5. **Performance**
   - Document any performance considerations
   - Include optimization tips
   - Specify when to use React.memo

## Adding New Components

1. Create component following project structure
2. Add component documentation in appropriate category
3. Update category index (atoms.md, molecules.md, or organisms.md)
4. Add any necessary examples
5. Include test documentation
6. Update this README if needed

## Updating Documentation

Follow the [Documentation Guide](../guides/documentation.md) for general documentation guidelines and the [Pre-Update Checklist](../../rules/docs.md) before making changes.

```
