import { ReactNode } from 'react';

/**
 * Props for the Card component
 */
export interface CardProps {
    /** The content to be rendered inside the card */
    children: ReactNode;
    /** Optional content to be rendered at the top of the card */
    cover?: ReactNode;
    /** Optional click handler for the card */
    onClick?: () => void;
    /** Optional class name for additional styling */
    className?: string;
} 