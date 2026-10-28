import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
for(const base of ['', '/lab-test/', '//lab-test//'])test(`URL helpers: ${base||'root'}`,()=>{
 const result=spawnSync(process.execPath,['--input-type=module','-e',`import {pathFor,absolute} from './config.mjs'; console.log(JSON.stringify([pathFor('/ja/news/example/'),pathFor('assets/a.png'),pathFor('mailto:a@example.invalid'),pathFor('#main'),absolute('en/research/theme-01')]));`],{encoding:'utf8',env:{...process.env,BASE_PATH:base,SITE_ORIGIN:'https://fixture.invalid'}});
 assert.equal(result.status,0,result.stderr);const prefix=base?'/lab-test':'';assert.deepEqual(JSON.parse(result.stdout),[`${prefix}/ja/news/example/`,`${prefix}/assets/a.png`,'mailto:a@example.invalid','#main',`https://fixture.invalid${prefix}/en/research/theme-01/`]);
});
