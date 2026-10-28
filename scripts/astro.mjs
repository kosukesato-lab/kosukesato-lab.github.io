import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const entry=fileURLToPath(new URL('./bin/astro.mjs',import.meta.resolve('astro/package.json')));
const result=spawnSync(process.execPath,[entry,...process.argv.slice(2)],{stdio:'inherit',env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1'}});
process.exit(result.status??1);
