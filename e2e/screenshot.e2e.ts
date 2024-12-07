import { test, expect } from '@playwright/test';
import { ElectronApplication } from '@playwright/test';
import { _electron as electron } from '@playwright/test';

let electronApp: ElectronApplication;

test.describe('Screenshot Feature', () => {
    test.beforeAll(async () => {
        // Launch Electron app
        electronApp = await electron.launch({
            args: ['.'],
            env: {
                ...process.env,
                ELECTRON_IS_DEV: '1',
            }
        });
    });

    test.afterAll(async () => {
        await electronApp.close();
    });

    test('complete hotkey workflow', async () => {
        // Get the first window
        const window = await electronApp.firstWindow();

        // Wait for app to be ready
        await window.waitForTimeout(2000); // Give app time to initialize

        // Debug: Print title to make sure we're on the right window
        console.log('Window title:', await window.title());

        // First click the Capture Mode switch to enable hotkey mode
        const captureSwitch = window.getByLabel('Capture Mode');
        await expect(captureSwitch).toBeVisible({ timeout: 5000 });
        await captureSwitch.click();
        console.log('Enabled hotkey mode');

        // Wait for hotkey settings to appear
        await window.waitForTimeout(500);

        // Click Record Hotkey button
        const recordButton = window.getByRole('button', { name: /Record Hotkey/i });
        await expect(recordButton).toBeVisible({ timeout: 5000 });
        await recordButton.click();
        console.log('Clicked record button');

        // Press new hotkey combination
        await window.keyboard.press('Control+Shift+A');
        console.log('Pressed new hotkey');

        // Wait a moment for the hotkey to register
        await window.waitForTimeout(1000);

        // Reset to default
        const resetButton = window.getByRole('button', { name: /Reset to Default/i });
        await resetButton.click();
        console.log('Clicked reset button');

        // Wait a moment for the reset to take effect
        await window.waitForTimeout(1000);

        // Test the hotkey functionality
        // First verify empty state
        const emptyPreview = window.getByText('No screenshots captured yet');
        await expect(emptyPreview).toBeVisible({ timeout: 5000 });
        console.log('Empty preview visible');

        // Press the default hotkey
        await window.keyboard.press('Shift+C');
        console.log('Pressed default hotkey');

        // Wait for toast
        const toast = window.getByText('Screenshot captured!');
        await expect(toast).toBeVisible({ timeout: 10000 });
        console.log('Toast appeared');

        // Verify screenshot appears
        const screenshotPreview = window.locator('img[alt="Screenshot preview"]');
        await expect(screenshotPreview).toBeVisible({ timeout: 10000 });
        console.log('Screenshot preview visible');

        // Verify empty state is gone
        await expect(emptyPreview).not.toBeVisible();
        console.log('Empty preview gone');
    });
}); 