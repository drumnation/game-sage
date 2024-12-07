import styled from 'styled-components';
import { Card } from 'antd';

export const ScreenshotContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  height: 100%;
`;

export const ControlsContainer = styled(Card)`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const PreviewContainer = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    border: 1px solid ${({ theme }) => theme.colors.secondary};
  }
`;

export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem;
  overflow-y: auto;
  flex: 1;
`;

export const ScreenshotCard = styled(Card) <{ $isSelected?: boolean }>`
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 2px solid ${({ theme, $isSelected }) =>
        $isSelected ? theme.colors.primary : 'transparent'};

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 4px;
  }

  .ant-card-meta-title {
    font-size: 0.9rem;
    margin-bottom: 0;
  }

  .ant-card-meta-description {
    font-size: 0.8rem;
  }
`;

export const MetadataContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.secondary};
`;

export const ConfigSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`; 