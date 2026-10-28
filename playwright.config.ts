import {defineConfig} from '@playwright/test';
const base=(process.env.BASE_PATH||'').replace(/\/$/,'');
const port=Number(process.env.PREVIEW_PORT||4325);
export default defineConfig({testDir:'./tests/browser',workers:2,fullyParallel:true,reporter:'list',use:{baseURL:`http://127.0.0.1:${port}${base}/`,browserName:'chromium',headless:true},webServer:{command:`npm run preview -- --port ${port} --ignore-lock`,url:`http://127.0.0.1:${port}${base}/`,reuseExistingServer:false,timeout:30000}});
