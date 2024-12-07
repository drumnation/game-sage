import React from 'react';
import styled from 'styled-components';
import type { ScreenshotPreviewProps } from './Screenshot.types';

const PreviewContainer = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
`;

const PreviewImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: contain;
`;

const PreviewInfo = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 8px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: 12px;
`;

export const ScreenshotPreview: React.FC<ScreenshotPreviewProps> = ({ screenshot }) => {
    const { imageData, metadata } = screenshot;

    return (
        <PreviewContainer>
            <PreviewImage src={imageData} alt="Screenshot preview" />
            <PreviewInfo>
                <div>Time: {new Date(metadata.timestamp).toLocaleString()}</div>
                <div>Size: {metadata.width}x{metadata.height}</div>
                <div>Display: {metadata.displayId}</div>
            </PreviewInfo>
        </PreviewContainer>
    );
}; 