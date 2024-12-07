import styled from 'styled-components';

export const GameAnalysisContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  height: 100%;
  overflow-y: auto;
`;

export const AnalysisContent = styled.div`
  font-size: 1rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textPrimary};
  white-space: pre-wrap;
  padding: 1rem;
`;

export const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.colors.surface}99;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  backdrop-filter: blur(2px);
`; 