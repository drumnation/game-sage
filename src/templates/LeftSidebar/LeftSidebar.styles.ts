import styled from 'styled-components';

export const LeftSidebarContainer = styled.aside`
    width: 300px;
    height: 100vh;
    background-color: ${({ theme }) => theme.colors.surface};
    border-right: 1px solid ${({ theme }) => theme.colors.border};
    display: flex;
    flex-direction: column;

    .ant-tabs {
        flex: 1;
        display: flex;
        flex-direction: column;
        
        .ant-tabs-nav {
            margin: 0;
            padding: ${({ theme }) => theme.spacing.md};
            background-color: ${({ theme }) => theme.colors.background};
            border-bottom: 1px solid ${({ theme }) => theme.colors.border};
        }

        .ant-tabs-content-holder {
            flex: 1;
            overflow-y: auto;
        }

        .ant-tabs-content {
            height: 100%;
        }

        .ant-tabs-tabpane {
            padding: ${({ theme }) => theme.spacing.md};
            height: 100%;
        }
    }
`; 