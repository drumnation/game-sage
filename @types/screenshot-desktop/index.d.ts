declare module 'screenshot-desktop' {
    namespace screenshot {
        interface ScreenshotOptions {
            screen?: string | number;
            format?: 'png' | 'jpg';
        }

        function listDisplays(): Promise<{ id: string | number; name: string }[]>;
    }

    function screenshot(options?: screenshot.ScreenshotOptions): Promise<Buffer>;
    export = screenshot;
} 