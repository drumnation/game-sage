import styled from 'styled-components';

export const PreviewContainer = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
`;

export const PreviewImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: contain;
`;

export const PreviewInfo = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 8px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: 12px;
`; 