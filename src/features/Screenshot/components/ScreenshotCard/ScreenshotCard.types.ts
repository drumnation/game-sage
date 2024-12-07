/**
 * Props for the ScreenshotCard component
 */
export interface ScreenshotCardProps {
    /** The URL of the screenshot image */
    imageUrl: string;
    /** Timestamp when the screenshot was taken */
    timestamp: number;
    /** Whether the card is currently selected */
    isSelected?: boolean;
    /** Optional click handler */
    onClick?: () => void;
} 