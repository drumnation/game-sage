import styled from 'styled-components';

export const PanelContainer = styled.div.attrs({ className: 'PanelContainer' })`
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background};

  :fullscreen {
    background: ${({ theme }) => theme.colors.background};
    display: flex;
    flex-direction: column;
  }
`;

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  
  /* Screenshot preview takes up 60% of the height */
  & > *:first-child {
    flex: 0.6;
    min-height: 0;
  }
  
  /* Analysis panel takes up 40% of the height */
  & > *:last-child {
    flex: 0.4;
    min-height: 0;
  }
`; 