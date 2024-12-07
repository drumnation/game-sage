import styled from 'styled-components';

export const HotkeyInputContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

export const HotkeyInput = styled.div`
    width: 100%;
`;

export const HotkeyButtonGroup = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 8px;
    
    .ant-btn {
        width: 100%;
        justify-content: center;
    }
`; 