import Jimp from 'jimp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateTestImages() {
    const fixturesDir = join(__dirname, '../src/__fixtures__/screenshots');

    // Create a test frame (gray)
    const image = new Jimp(100, 100, 0x808080FF); // Gray color with full alpha
    await image.writeAsync(join(fixturesDir, 'test-frame.png'));

    console.log('Test images generated successfully');
}

generateTestImages().catch(console.error); 