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
    /** Whether this frame represents a scene change */
    isSceneChange?: boolean;
    /** The calculated scene change score (0-1) */
    sceneChangeScore?: number;
    /** Optional click handler */
    onClick?: () => void;
} 