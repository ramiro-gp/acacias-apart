import { existsSync } from 'node:fs';
import path from 'node:path';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH && existsSync('artifacts/browsers')) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = path.resolve('artifacts/browsers');
}
export const { chromium, firefox, webkit } = await import('playwright');
