import React from 'react';
import { Button } from 'antd';
import { CameraOutlined } from '@ant-design/icons';

interface ControlButtonProps {
    onClick: () => void;
    loading?: boolean;
}

export const ControlButton: React.FC<ControlButtonProps> = ({ onClick, loading }) => {
    return (
        <Button
            type="primary"
            icon={<CameraOutlined />}
            onClick={onClick}
            loading={loading}
        >
            {loading ? 'Capturing...' : 'Capture Screenshot'}
        </Button>
    );
}; 