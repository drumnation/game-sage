import React from 'react';
import { Alert } from 'antd';

interface ErrorDisplayProps {
    error: Error;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
    return (
        <Alert
            message="Error"
            description={error.message}
            type="error"
            showIcon
            closable
        />
    );
}; 