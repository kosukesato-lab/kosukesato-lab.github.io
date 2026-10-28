import { defineConfig } from 'astro/config';
import { origin, base } from './config.mjs';
export default defineConfig({ site: origin, base, output: 'static', trailingSlash: 'always', devToolbar: { enabled: false } });
