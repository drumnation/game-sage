/* eslint-disable @typescript-eslint/no-unused-vars */
declare module 'screenshot-desktop' {
    interface ScreenshotOptions {
        screen?: number;
        format?: 'jpg' | 'png';
    }

    function screenshot(options?: ScreenshotOptions): Promise<Buffer>;
    function listDisplays(): Promise<Array<{ id: number }>>;

    export = screenshot;
} 