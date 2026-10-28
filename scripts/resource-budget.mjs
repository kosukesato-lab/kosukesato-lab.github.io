import fs from 'node:fs';
import path from 'node:path';
import {gzipSync} from 'node:zlib';
import {load} from 'cheerio';
import {basePath} from '../config.mjs';
const root=path.resolve('dist'),results=[];
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const htmlFile of files(root).filter(p=>p.endsWith('.html'))){
 const html=fs.readFileSync(htmlFile),$=load(html);const urls=new Set();let javascriptGzip=0;
 $('script[src],link[rel=stylesheet][href],img[src]').each((_,el)=>{const url=$(el).attr('src')||$(el).attr('href');if(url?.startsWith('/'))urls.add(url);});
 $('script:not([src])').each((_,el)=>javascriptGzip+=gzipSync($(el).text()).length);
 let transfer=gzipSync(html).length;
 for(const url of urls){const file=path.join(root,decodeURIComponent(url.slice(basePath.length)));if(!fs.existsSync(file))throw new Error(`Missing asset ${url}`);const bytes=fs.readFileSync(file);const text=/\.(js|css|svg)$/.test(file);transfer+=text?gzipSync(bytes).length:bytes.length;if(file.endsWith('.js'))javascriptGzip+=gzipSync(bytes).length;}
 results.push({page:path.relative(root,htmlFile).replaceAll('\\','/'),javascriptGzipBytes:javascriptGzip,estimatedCompressedTransferBytes:transfer});
}
const summary={method:'HTML + unique directly referenced CSS/JS/images; text gzip; includes lazy images; excludes HTTP headers and cache. No external font or embedded service.',maxJavascriptGzipBytes:Math.max(...results.map(r=>r.javascriptGzipBytes)),maxEstimatedTransferBytes:Math.max(...results.map(r=>r.estimatedCompressedTransferBytes)),pages:results};
fs.writeFileSync('docs/resource-budget.json',JSON.stringify(summary,null,2)+'\n');
if(summary.maxJavascriptGzipBytes>100*1024||summary.maxEstimatedTransferBytes>1.5*1024*1024)throw new Error('Resource budget exceeded');
console.log(`Resource budget passed: max JS gzip ${summary.maxJavascriptGzipBytes} bytes; max estimated page transfer ${summary.maxEstimatedTransferBytes} bytes.`);
