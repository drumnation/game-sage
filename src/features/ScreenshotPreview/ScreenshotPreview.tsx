import React from 'react';
import { Button, Slider } from 'antd';
import {
    PlayCircleOutlined,
    PauseCircleOutlined,
    LeftOutlined,
    RightOutlined,
    FullscreenOutlined,
    ZoomInOutlined,
    CameraOutlined,
} from '@ant-design/icons';
import type { ScreenshotPreviewProps } from './ScreenshotPreview.types';
import { useScreenshotPreview } from './ScreenshotPreview.hook';
import {
    PreviewContainer,
    MainPreview,
    TimelineSection,
    Controls,
    EmptyState,
} from './ScreenshotPreview.styles';

export const ScreenshotPreview: React.FC<ScreenshotPreviewProps> = ({
    screenshot,
    screenshots,
    currentIndex,
    isPlaying,
    onPrevious,
    onNext,
    onPlayPause,
    onSliderChange,
}) => {
    const { state, toggleFullscreen, handleZoom } = useScreenshotPreview();

    if (!screenshot) {
        return (
            <EmptyState>
                <CameraOutlined className="icon" />
                <div className="message">No screenshots captured yet</div>
                <div className="subtitle">Start capturing to see your screenshots here</div>
            </EmptyState>
        );
    }

    return (
        <PreviewContainer>
            <MainPreview>
                <img
                    src={screenshot.imageData}
                    alt={`Screenshot ${currentIndex + 1}`}
                    style={{
                        transform: `scale(${state.zoomLevel})`,
                        transition: 'transform 0.2s ease-in-out',
                    }}
                />
            </MainPreview>
            <TimelineSection>
                <Controls>
                    <div className="buttons">
                        <Button
                            icon={<LeftOutlined />}
                            onClick={onPrevious}
                            disabled={currentIndex === 0}
                        />
                        <Button
                            icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                            onClick={onPlayPause}
                        />
                        <Button
                            icon={<RightOutlined />}
                            onClick={onNext}
                            disabled={currentIndex === screenshots.length - 1}
                        />
                        <Button
                            icon={<FullscreenOutlined />}
                            onClick={toggleFullscreen}
                        />
                        <Button
                            icon={<ZoomInOutlined />}
                            onClick={() => handleZoom(state.zoomLevel === 1 ? 1.5 : 1)}
                        />
                    </div>
                    <div className="timestamp">
                        {currentIndex + 1} / {screenshots.length}
                    </div>
                </Controls>
                <Slider
                    min={0}
                    max={screenshots.length - 1}
                    value={currentIndex}
                    onChange={onSliderChange}
                />
            </TimelineSection>
        </PreviewContainer>
    );
}; 