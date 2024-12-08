import React, { useEffect, useRef } from 'react';
import { Typography } from 'antd';
import styled from 'styled-components';

const { Text } = Typography;

const TimerContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const TimerSection = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 8px;
`;

interface CountdownTimerProps {
    interval: number; // in seconds
    isActive: boolean;
    totalCount?: number;
    lastCaptureTime?: number; // timestamp of last capture
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
    interval,
    isActive,
    totalCount = 0,
    lastCaptureTime = Date.now()
}) => {
    const displayRef = useRef<HTMLSpanElement>(null);
    const timerRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        const updateDisplay = () => {
            if (!displayRef.current || !isActive) return;

            const elapsedTime = Math.floor((Date.now() - lastCaptureTime) / 1000);
            const timeLeft = Math.max(0, interval - elapsedTime);

            if (displayRef.current) {
                displayRef.current.textContent = `${timeLeft}s`;
            }
        };

        if (isActive) {
            // Initial update
            updateDisplay();

            // Update every second
            timerRef.current = setInterval(updateDisplay, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [interval, isActive, lastCaptureTime]);

    return (
        <TimerContainer>
            <TimerSection>
                <Text type="secondary">Next capture in:</Text>
                <Text strong><span ref={displayRef}>{interval}s</span></Text>
            </TimerSection>
            <TimerSection>
                <Text type="secondary">Total captures:</Text>
                <Text strong>{totalCount}</Text>
            </TimerSection>
        </TimerContainer>
    );
}; 