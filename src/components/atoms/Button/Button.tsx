import { type FC } from 'react';
import type { ButtonProps } from './Button.types';
import { StyledButton } from './Button.styles';
import { useButton } from './Button.hook';

/**
 * A reusable button component that wraps Ant Design's Button with our custom styling.
 * 
 * @component
 * @example
 * ```tsx
 * <Button type="primary" onClick={() => console.log('clicked')}>
 *   Click me
 * </Button>
 * ```
 */
export const Button: FC<ButtonProps> = (props) => {
    const { handleClick } = useButton(props);

    return (
        <StyledButton {...props} onClick={handleClick} />
    );
}; 