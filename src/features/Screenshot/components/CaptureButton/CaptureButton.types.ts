import type { ButtonProps } from '@atoms/Button';

export interface CaptureButtonProps extends Omit<ButtonProps, 'loading'> {
    isCapturing?: boolean;
} 