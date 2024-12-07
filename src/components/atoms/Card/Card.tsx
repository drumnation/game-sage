import React from 'react';
import type { CardProps } from './Card.types';
import { StyledCard } from './Card.styles';

/**
 * Card atom component
 * A basic container component that provides a bordered, elevated surface
 * 
 * @example
 * ```tsx
 * <Card>
 *   <h1>Card Title</h1>
 *   <p>Card content</p>
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = ({
    children,
    cover,
    onClick,
    className
}) => {
    return (
        <StyledCard
            onClick={onClick}
            cover={cover}
            className={className}
        >
            {children}
        </StyledCard>
    );
}; 