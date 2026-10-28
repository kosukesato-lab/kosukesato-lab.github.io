import fs from 'node:fs';
import path from 'node:path';
import {load} from 'cheerio';
import {origin,basePath,mode} from '../config.mjs';
const root=path.resolve('dist');const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const target=path.join(dir,entry.name);if(entry.isDirectory())walk(target);else if(target.endsWith('.html'))files.push(target);}}
walk(root);const errors=[];const docs=new Map();
const get=file=>{if(!docs.has(file))docs.set(file,load(fs.readFileSync(file,'utf8')));return docs.get(file);};
for(const file of files){
 const rel=path.relative(root,file).replaceAll('\\','/');const route=rel==='index.html'?'':rel.replace(/index\.html$/,'');const pageUrl=new URL(`${basePath}/${route}`,origin);
 const $=get(file);
 if($('h1').length!==1)errors.push(`${rel}: requires exactly one H1`);
 if(!$('title').text()||!$('meta[name=description]').attr('content'))errors.push(`${rel}: missing SEO title/description`);
 if(mode==='demo'&&!$('meta[name=robots]').attr('content')?.includes('noindex'))errors.push(`${rel}: demo must be noindex`);
 $('a[href],link[href],img[src],script[src],source[src]').each((_,el)=>{
  const attr=el.tagName==='a'||el.tagName==='link'?'href':'src';const href=$(el).attr(attr);if(!href||/^(mailto:|tel:|data:)/.test(href))return;
  const url=new URL(href,pageUrl);if(url.origin!==new URL(origin).origin)return;
  if(basePath&&!url.pathname.startsWith(basePath+'/')){errors.push(`${rel}: link escapes base: ${href}`);return;}
  let pathname=decodeURIComponent(url.pathname.slice(basePath.length));let target=path.join(root,pathname);
  if(!path.extname(target))target=path.join(target,'index.html');else if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
  if(!fs.existsSync(target)){errors.push(`${rel}: missing ${href}`);return;}
  if(url.hash&&target.endsWith('.html')){const dest=get(target);const id=decodeURIComponent(url.hash.slice(1));if(!dest('[id]').toArray().some(e=>dest(e).attr('id')===id))errors.push(`${rel}: missing anchor ${href}`);}
 });
}
if(!fs.existsSync(path.join(root,'index.html')))errors.push('dist/index.html missing');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`Internal links, anchors, assets and H1/SEO checks passed: ${files.length} HTML pages (base=${basePath||'/'}).`);
