import React, { useEffect } from 'react';
import { Button, List, Card, message } from 'antd';
import type { ScreenshotProps } from './Screenshot.types';

export const Screenshot: React.FC<ScreenshotProps> = ({
    screenshots,
    selectedId,
    onCapture,
    onSelect,
    onError
}) => {
    useEffect(() => {
        if (onError) {
            message.error('Failed to capture screenshot');
        }
    }, [onError]);

    return (
        <div>
            <Button onClick={onCapture}>
                Capture Screenshot
            </Button>

            <List
                grid={{ gutter: 16, column: 3 }}
                dataSource={screenshots}
                renderItem={screenshot => (
                    <List.Item>
                        <Card
                            hoverable
                            cover={<img alt="screenshot" src={screenshot.imageData} />}
                            onClick={() => onSelect(screenshot.id)}
                            style={{
                                borderColor: selectedId === screenshot.id ? '#1890ff' : undefined,
                                borderWidth: selectedId === screenshot.id ? 2 : 1
                            }}
                        >
                            <Card.Meta
                                title={new Date(screenshot.metadata.timestamp).toLocaleString()}
                                description={`${screenshot.metadata.width}x${screenshot.metadata.height}`}
                            />
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default Screenshot; 