import React from 'react';
import styled from 'styled-components';

const LogoContainer = styled.div`
  padding: 1.5rem 1rem;
  text-align: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: sticky;
  top: 0;
  background: ${({ theme }) => theme.colors.background};
  z-index: 10;
`;

const LogoText = styled.h1`
  font-family: 'Press Start 2P', monospace;
  font-size: 40px;
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  text-transform: uppercase;
  text-shadow: none;
  line-height: 1;
  font-weight: normal;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: unset;
`;

export const Logo: React.FC = () => {
    return (
        <LogoContainer>
            <LogoText>Game Sage</LogoText>
        </LogoContainer>
    );
}; 