import { execSync } from 'child_process';
import os from 'os';
import process from 'process';

if (os.platform() === 'win32') {
    console.log('Installing Windows build tools...');
    try {
        execSync('npm install --global --production windows-build-tools', {
            stdio: 'inherit'
        });
    } catch (error) {
        console.error('Failed to install Windows build tools:', error);
        process.exit(1);
    }
} 