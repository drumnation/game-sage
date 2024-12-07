import styled from 'styled-components';
import { Input } from 'antd';

export const SettingsContainer = styled.div`
    padding: 24px;
    background-color: ${({ theme }) => theme.colors.background};
    border-radius: ${({ theme }) => theme.borderRadius};
    border: 1px solid ${({ theme }) => theme.colors.border};

    h4 {
        margin: 24px 0 8px;
        font-size: 16px;
        font-weight: 500;
        color: ${({ theme }) => theme.colors.textPrimary};
    }

    .instruction-help {
        margin: 0 0 16px;
        font-size: 14px;
        color: ${({ theme }) => theme.colors.textSecondary};
    }

    .ant-form-item-extra {
        font-size: 12px;
        color: ${({ theme }) => theme.colors.textSecondary};
        margin-top: 4px;
    }

    .ant-list {
        background-color: ${({ theme }) => theme.colors.surface};
        border-radius: ${({ theme }) => theme.borderRadius};
        margin-top: 8px;
    }

    .ant-list-empty-text {
        padding: 16px;
        color: ${({ theme }) => theme.colors.textSecondary};
    }

    .ant-list-item {
        padding: 8px 16px;
        transition: background-color 0.2s ease;

        &:hover {
            background-color: ${({ theme }) => theme.colors.hover};
        }
    }

    .ant-form-item-tooltip {
        color: ${({ theme }) => theme.colors.textSecondary};
    }
`;

export const InstructionInput = styled(Input)`
    &.ant-input {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        font-size: 14px;

        &::placeholder {
            color: ${({ theme }) => theme.colors.textSecondary};
        }
    }
`; 