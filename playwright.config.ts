import { defineConfig } from '@playwright/test';
import { resolve } from 'path';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },

    projects: [
        {
            name: 'electron',
            testMatch: /.*\.e2e\.ts/,
            use: {
                browserName: 'chromium',
                viewport: { width: 1280, height: 720 },
                launchOptions: {
                    executablePath: resolve(process.cwd(), 'node_modules/.bin/electron'),
                    env: {
                        VITE_DEV_SERVER_URL: 'http://localhost:5174',
                        ELECTRON_IS_DEV: '1',
                        NODE_ENV: 'development'
                    }
                },
            },
        },
    ],
}); 