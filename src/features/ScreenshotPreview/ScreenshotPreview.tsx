import React from 'react';
import { Button, Slider, Typography } from 'antd';
import {
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
    BottomText,
} from './ScreenshotPreview.styles';

const { Text } = Typography;

export const ScreenshotPreview: React.FC<ScreenshotPreviewProps> = ({
    screenshot,
    screenshots,
    currentIndex,
    onPrevious,
    onNext,
    onSliderChange,
}) => {
    const { state, handleZoom } = useScreenshotPreview();
    const previewRef = React.useRef<HTMLDivElement>(null);

    const toggleFullscreen = React.useCallback(() => {
        // Find the PanelContainer
        let targetElement = previewRef.current?.closest('.PanelContainer');

        if (!targetElement) {
            // Fallback to parent with class name
            let currentElement = previewRef.current?.parentElement;
            while (currentElement && !currentElement.classList.contains('PanelContainer')) {
                currentElement = currentElement.parentElement;
            }
            if (!currentElement) {
                console.warn('Could not find PanelContainer for fullscreen');
                return;
            }
            targetElement = currentElement;
        }

        if (!document.fullscreenElement) {
            targetElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen().catch(err => {
                console.error(`Error attempting to exit fullscreen: ${err.message}`);
            });
        }
    }, []);

    return (
        <PreviewContainer ref={previewRef}>
            <MainPreview>
                {!screenshot ? (
                    <>
                        <EmptyState>
                            <CameraOutlined className="icon" />
                            <div className="message">No screenshots captured yet</div>
                        </EmptyState>
                        <BottomText>
                            Take a screenshot to get AI analysis of your gameplay
                        </BottomText>
                    </>
                ) : (
                    <img
                        src={screenshot.imageData}
                        alt={`Screenshot ${currentIndex + 1}`}
                        style={{
                            transform: `scale(${state.zoomLevel})`,
                            transition: 'transform 0.2s ease-in-out',
                        }}
                    />
                )}
            </MainPreview>
            {screenshot && (
                <TimelineSection>
                    <Controls style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <div style={{ flex: '0 0 auto' }}>
                            <Text strong>
                                {currentIndex === 0 ? 'Current' : currentIndex + 1}
                            </Text>
                            <Text> ({screenshots.length} total)</Text>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <Button
                                type="text"
                                icon={<LeftOutlined />}
                                onClick={onPrevious}
                                disabled={currentIndex === 0}
                            />
                            <Button
                                type="text"
                                icon={<RightOutlined />}
                                onClick={onNext}
                                disabled={currentIndex === screenshots.length - 1}
                            />
                            <Button
                                type="text"
                                icon={<FullscreenOutlined />}
                                onClick={toggleFullscreen}
                            />
                            <Button
                                type="text"
                                icon={<ZoomInOutlined />}
                                onClick={() => handleZoom(state.zoomLevel === 1 ? 1.5 : 1)}
                            />
                        </div>
                        <div style={{ flex: '0 0 auto' }}>
                            <Text strong>
                                {new Date(screenshot?.metadata.timestamp || 0).toLocaleTimeString()}
                            </Text>
                        </div>
                    </Controls>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 16px',
                        width: '100%'
                    }}>
                        <Slider
                            min={0}
                            max={screenshots.length - 1}
                            value={currentIndex}
                            onChange={onSliderChange}
                            style={{
                                flex: 1,
                                margin: '8px 0',
                                cursor: 'pointer'
                            }}
                        />
                    </div>
                </TimelineSection>
            )}
        </PreviewContainer>
    );
}; 