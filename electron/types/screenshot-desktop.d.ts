declare module 'screenshot-desktop' {
    interface CaptureOptions {
        screen?: string | number;
        format?: 'png' | 'jpg';
    }

    function capture(options?: CaptureOptions): Promise<Buffer>;
    function listDisplays(): Promise<{ id: string | number; name: string }[]>;

    export default capture;
    export { listDisplays, CaptureOptions };
} 