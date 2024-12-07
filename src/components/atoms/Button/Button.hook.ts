import { useCallback, type MouseEvent } from 'react';
import type { ButtonProps } from './Button.types';

export const useButton = (props: ButtonProps) => {
    const handleClick = useCallback(
        (event: MouseEvent<HTMLElement>) => {
            props.onClick?.(event);
        },
        [props.onClick]
    );

    return { handleClick };
}; 