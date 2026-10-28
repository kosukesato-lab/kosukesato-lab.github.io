import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import matter from 'gray-matter';
import {mode,origin} from '../config.mjs';
export function readDataset(root=process.cwd()){
 const rows=[];
 for(const name of ['site','profiles','members','publications','activities']){
  const file=`src/data/${name}.json`,data=JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
  for(const item of Array.isArray(data)?data:[data])rows.push({file,kind:name,data:item});
 }
 for(const kind of ['research','news']){
  const base=path.join(root,'src/content',kind);
  const walk=dir=>{for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory())walk(file);else if(file.endsWith('.md')){const {data,content}=matter(fs.readFileSync(file,'utf8'));rows.push({file:path.relative(root,file).replaceAll('\\','/'),kind,data,body:content});}}};walk(base);
 }
 return rows;
}
const validDate=(value)=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
const validMonth=value=>typeof value==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(value);
const placeholder=/\[(?:[^\]]*(?:pending|placeholder|サンプル|を入力|氏名|誌名|著者|職位|学年|媒体名|受賞者|授与団体|対象研究|Title|Official|Name|Position|Journal|Media|Recipient|Awarding|Related research|Laboratory research philosophy)[^\]]*)\]/i;
export function validateDataset(rows,{contentMode='demo',siteOrigin='http://localhost:4321',assetExists=()=>true}={}){
 const errors=[];const fail=(row,key,message)=>errors.push(`${row.file} :: ${row.data.id||'site'}.${key}: ${message}`);
 const active=row=>contentMode==='demo'||!row.data.draft;
 const ids=new Map();const translations=new Set();
 for(const row of rows){
  const d=row.data,key=['research','news'].includes(row.kind)?`${row.kind}:${d.lang}:${d.id}`:`${row.kind}:${d.id||'site'}`;
  if(ids.has(key))fail(row,'id',`duplicate ID ${d.id}`);ids.set(key,row);
  if(typeof d.draft!=='boolean'||typeof d.isPlaceholder!=='boolean')fail(row,'metadata','draft and isPlaceholder must be booleans');
  if(!validDate(d.updatedAt))fail(row,'updatedAt','invalid ISO date');
  if(!active(row))continue;
  if(contentMode==='production'&&d.isPlaceholder)fail(row,'isPlaceholder','unresolved placeholder; complete or mark draft');
  const scan=(value,key)=>{
   if(typeof value==='string'){
    if(contentMode==='production'&&placeholder.test(value))fail(row,key,'placeholder text remains');
    if(/(?:^|\.)(?:url|mapUrl|admissionsUrl)$/i.test(key)&&!/^https?:\/\//.test(value))fail(row,key,'external URL must use https:// or http://');
    if(/^https?:/i.test(value)){try{const url=new URL(value);if(!['https:','http:'].includes(url.protocol)||url.username||url.password)throw new Error();}catch{fail(row,key,'invalid external URL');}}
    if(/(?:^|\.)(?:image|imageThumbnail|photo|pdf)$/.test(key)&&value&&!assetExists(value))fail(row,key,`missing public asset: ${value}`);
   }else if(Array.isArray(value)){value.forEach((x,i)=>scan(x,`${key}.${i}`));}else if(value&&typeof value==='object'){
    if('ja'in value||'en'in value)for(const lang of ['ja','en'])if(!value[lang]||(typeof value[lang]==='string'&&!value[lang].trim()))fail(row,`${key}.${lang}`,'required translation missing');
    Object.entries(value).forEach(([k,v])=>scan(v,key?`${key}.${k}`:k));
   }
  };scan(d,'');if(row.body)scan(row.body,'body');
  const required={site:['name','institution','department','headline','overview','philosophy','address','faq','fiscalYear','environment'],profiles:['id','name','role','degree','affiliation','introduction','career','education','keywords','awards','societies','service'],members:['id','name','group','role','status','order','themeIds'],publications:['id','title','authors','journal','year','type','status','order','themeIds','featured'],activities:['id','type','date','title','media','recipient','organization','research'],research:['id','slug','translationKey','lang','title','summary','order','publicationIds','caption'],news:['id','slug','translationKey','lang','title','summary','date','category','order','publicationIds','themeIds','activityIds']}[row.kind]||[];
  for(const k of required)if(d[k]===undefined||d[k]===null||d[k]==='')fail(row,k,'required field missing');
  if(d.id&&!/^[a-z0-9-]+$/.test(d.id))fail(row,'id','must be lowercase ASCII slug');
  if(['research','news'].includes(row.kind)){
   if(!['ja','en'].includes(d.lang))fail(row,'lang','must be ja or en');
   if(!/^[a-z0-9-]+$/.test(d.slug||''))fail(row,'slug','invalid slug');
   const translation=`${row.kind}:${d.lang}:${d.translationKey}`;
   if(translations.has(translation))fail(row,'translationKey','duplicate translation key');translations.add(translation);
   if(!row.body?.trim())fail(row,'body','Markdown body is required');
  }
  if(d.date&&!validDate(d.date))fail(row,'date','invalid ISO date');
  if(row.kind==='publications'){
   if(!Number.isInteger(d.year)||d.year<1800||d.year>2200)fail(row,'year','invalid year');
   if(!['article','review','book','patent'].includes(d.type))fail(row,'type','invalid publication type');
   if(!['published','in-press','preprint','patent-application'].includes(d.status))fail(row,'status','invalid publication status');
   if(!Array.isArray(d.authors)||!d.authors.length)fail(row,'authors','authors must be a nonempty array');
   else d.authors.forEach((a,i)=>{if(!a.name||typeof a.corresponding!=='boolean'||typeof a.equalContribution!=='boolean')fail(row,`authors.${i}`,'name and author flags required');});
   if(d.doi&&!/^10\.\d{4,9}\/\S+$/.test(d.doi))fail(row,'doi','invalid DOI');
   if(d.status==='preprint'&&d.type==='patent')fail(row,'status','patent cannot be a preprint');
  }
  if(row.kind==='members'){
   if(!['faculty','staff','doctoral','masters','undergraduate','alumni'].includes(d.group))fail(row,'group','invalid member group');
   if(!['active','alumni'].includes(d.status))fail(row,'status','invalid membership status');
   if(d.group==='alumni'&&(!Number.isInteger(d.graduationYear)||d.status!=='alumni'))fail(row,'graduationYear','alumni require graduationYear and alumni status');
  }
  if(row.kind==='news'&&!['publication','award','event','lab'].includes(d.category))fail(row,'category','invalid news category');
  if(row.kind==='activities'&&!['press','award'].includes(d.type))fail(row,'type','invalid activity type');
  if('order'in d&&!Number.isFinite(d.order))fail(row,'order','order must be a number');
  if(row.kind==='profiles')for(const k of ['career','education'])for(const h of d[k]||[]){if(!validMonth(h.start)||(h.end&&!validMonth(h.end))||(h.end&&h.end<h.start))fail(row,k,'invalid career/education date range');}
 }
 const find=(kind,id,lang)=>rows.find(r=>r.kind===kind&&r.data.id===id&&(!lang||r.data.lang===lang));
 for(const row of rows.filter(active)){
  const d=row.data;
  const ref=(kind,id,key)=>{
   const targets=['research','news'].includes(kind)?['ja','en'].map(lang=>find(kind,id,lang)):[find(kind,id)];
   for(const target of targets)if(!target||!active(target))fail(row,key,`missing or draft ${kind} reference: ${id}`);
  };
  for(const id of d.publicationIds||[])ref('publications',id,'publicationIds');
  for(const id of d.themeIds||[])ref('research',id,'themeIds');
  for(const id of d.activityIds||[])ref('activities',id,'activityIds');
  for(const a of d.authors||[])if(a.memberId)ref('members',a.memberId,'authors.memberId');
 }
 const site=rows.find(r=>r.kind==='site');
 if(site?.data.draft)fail(site,'draft','site settings cannot be draft');
 if(contentMode==='production'&&(!siteOrigin.startsWith('https://')||/localhost|127\.0\.0\.1|<|>/.test(siteOrigin)))errors.push('SITE_ORIGIN: production requires a confirmed HTTPS public origin');
 return errors;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const errors=validateDataset(readDataset(),{contentMode:mode,siteOrigin:origin,assetExists:p=>fs.existsSync(path.join('public',p))});
 if(errors.length){console.error(`Content validation failed (${errors.length}):\n${errors.join('\n')}`);process.exitCode=1;}else console.log(`Content validation passed (${mode}).`);
}
