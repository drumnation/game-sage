import styled from 'styled-components';
import { DefaultTheme } from 'styled-components';

export const GameAnalysisContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  height: 100%;
  overflow-y: auto;
`;

export const AnalysisContent = styled.div<{ isEmpty?: boolean }>`
  position: relative;
  font-size: 1rem;
  line-height: 1.5;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textPrimary};
  white-space: pre-wrap;
  padding: 1.5rem;
  padding-top: 3rem;
  min-height: 100px;
  width: 100%;
  
  ${({ isEmpty, theme }: { isEmpty?: boolean; theme: DefaultTheme }) => isEmpty ? `
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: ${theme.colors.textSecondary};
  ` : `
    display: block;
    text-align: left;
  `}

  .ant-collapse {
    background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surface}22;
    border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
    border-radius: 8px;
    margin-top: 24px;
    width: 100%;

    .ant-collapse-header {
      color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textPrimary};
      font-weight: 500;
      padding: 16px 24px !important;
    }

    .ant-collapse-content {
      background: transparent;
      border-top-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
      
      .ant-collapse-content-box {
        padding: 20px 24px;
      }
    }
  }
`;

export const MemoryList = styled.ul`
  margin: 0;
  padding: 0;
  list-style-type: none;
  width: 100%;
  
  li {
    margin-bottom: 12px;
    padding: 12px 16px;
    border-radius: 6px;
    background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surface}11;
    
    &:hover {
      background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surface}22;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.surface}BB;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textPrimary};
  backdrop-filter: blur(2px);
  z-index: 10;
  transition: all 0.2s ease-in-out;
`; 