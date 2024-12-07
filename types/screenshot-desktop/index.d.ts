declare module 'screenshot-desktop' {
    interface ScreenshotOptions {
        screen?: string | number;
        format?: 'png' | 'jpg';
    }

    function listDisplays(): Promise<{ id: string | number; name: string }[]>;
    function capture(options?: ScreenshotOptions): Promise<Buffer>;

    const screenshot: typeof capture & { listDisplays: typeof listDisplays };
    export = screenshot;
} 