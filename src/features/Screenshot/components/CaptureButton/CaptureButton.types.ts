import type { ButtonProps } from '@atoms';

export interface CaptureButtonProps extends Omit<ButtonProps, 'loading'> {
    isCapturing?: boolean;
} 