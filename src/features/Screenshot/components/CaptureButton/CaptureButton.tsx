import React from 'react';
import { Button } from '@atoms';
import type { CaptureButtonProps } from './CaptureButton.types';

export const CaptureButton: React.FC<CaptureButtonProps> = ({
    isCapturing,
    children = 'Capture',
    type = 'primary',
    ...props
}) => {
    return (
        <Button
            {...props}
            type={type}
            loading={isCapturing}
        >
            {isCapturing ? 'Capturing...' : children}
        </Button>
    );
}; 