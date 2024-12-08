# Documentation Guide

This guide explains how to maintain and update documentation in the Game Sage project.

## Documentation Types

1. **Code Documentation**
   - Component documentation
   - API documentation
   - Type definitions
   - Function documentation

2. **User Documentation**
   - Installation guides
   - Usage guides
   - Troubleshooting guides
   - FAQ

3. **Development Documentation**
   - Architecture overview
   - Development setup
   - Contributing guidelines
   - Testing guidelines

## Documentation Standards

### Code Documentation

1. **Components**

   ```typescript
   /**
    * Component description
    * @component ComponentName
    * @example
    * ```tsx
    * <ComponentName prop1="value" prop2={value} />
    * ```
    */
   ```

2. **Functions**

   ```typescript
   /**
    * Function description
    * @param {ParamType} paramName - Parameter description
    * @returns {ReturnType} Description of return value
    * @throws {ErrorType} Description of when errors are thrown
    */
   ```

3. **Types**

   ```typescript
   /**
    * Interface/Type description
    * @property {PropertyType} propertyName - Property description
    */
   ```

### Markdown Files

1. **Structure**
   - Clear headings (H1 for title, H2 for sections, H3 for subsections)
   - Table of contents for files longer than 100 lines
   - Code examples in appropriate language blocks
   - Links to related documentation

2. **Content**
   - Concise and clear language
   - Step-by-step instructions where appropriate
   - Examples for complex concepts
   - Version information where relevant

## Documentation Process

### Adding New Documentation

1. Identify the appropriate location in the docs structure
2. Create new file with proper extension (.md for markdown)
3. Follow the template for the type of documentation
4. Add links from relevant existing documentation
5. Update table of contents if necessary

### Updating Existing Documentation

1. Review the [Pre-Update Checklist](../../rules/docs.md#pre-update-checklist)
2. Make necessary updates following style guidelines
3. Update version information if applicable
4. Update related documentation if necessary
5. Follow the [Post-Update Checklist](../../rules/docs.md#post-update-checklist)

### Documentation Review

Before submitting documentation changes:

1. Verify technical accuracy
2. Check for broken links
3. Ensure code examples work
4. Validate markdown formatting
5. Spell check content

## Templates

### Component Documentation Template

```markdown
# ComponentName

## Overview
Brief description of the component's purpose and functionality.

## Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| prop1 | PropType | Yes | - | Description |
| prop2 | PropType | No | defaultValue | Description |

## Usage Examples
\```tsx
import { ComponentName } from '@components/ComponentName';

function Example() {
  return <ComponentName prop1="value" />;
}
\```

## Notes
Any important notes about usage, limitations, or considerations.
```

### API Documentation Template

```markdown
# API Name

## Overview
Description of the API's purpose and functionality.

## Methods
### methodName
\```typescript
function methodName(param1: Type, param2: Type): ReturnType
\```

#### Parameters
- `param1` (Type): Description
- `param2` (Type): Description

#### Returns
Description of return value

#### Example
\```typescript
const result = await methodName(value1, value2);
\```
```

## Best Practices

1. **Keep Documentation Close to Code**
   - Component documentation in component directories
   - API documentation near implementation
   - Type documentation with type definitions

2. **Update Documentation with Code Changes**
   - Document new features as they're added
   - Update docs when making breaking changes
   - Remove documentation for deprecated features

3. **Use Clear Language**
   - Write in present tense
   - Use active voice
   - Be concise but complete
   - Include examples for clarity

4. **Maintain Consistency**
   - Follow established templates
   - Use consistent terminology
   - Maintain consistent formatting
   - Use standard markdown features

## Tools and Resources

1. **Markdown Linting**
   - Use markdownlint for consistency
   - Follow .markdownlint.json rules

2. **Documentation Generation**
   - TypeDoc for API documentation
   - Storybook for component documentation

3. **Version Control**
   - Include documentation in pull requests
   - Review documentation changes
   - Keep documentation in sync with code

## Need Help?

If you have questions about documentation:

1. Check existing documentation templates
2. Review the style guide
3. Ask for review from team members
4. Open an issue with the "documentation" label

```
