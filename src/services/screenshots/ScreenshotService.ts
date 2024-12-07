interface ScreenshotServiceConfig {
    captureInterval?: number;
}

export class ScreenshotService {
    private readonly captureInterval: number;
    private static readonly MIN_INTERVAL = 1000;

    constructor(config: ScreenshotServiceConfig = {}) {
        const interval = config.captureInterval ?? 5000;

        if (interval < ScreenshotService.MIN_INTERVAL) {
            throw new Error('Capture interval must be at least 1000ms');
        }

        this.captureInterval = interval;
    }

    getCaptureInterval(): number {
        return this.captureInterval;
    }
} 