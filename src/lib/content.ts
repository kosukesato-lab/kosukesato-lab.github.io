import type { MarkdownInstance } from 'astro';
import type { Lang } from '../i18n/ui';
import { mode } from '../../config.mjs';
export interface Entry {
 id:string;slug:string;translationKey:string;lang:Lang;title:string;summary:string;isPlaceholder:boolean;draft:boolean;updatedAt:string;order:number;date?:string;category?:string;image:string|null;imageThumbnail?:string;imageWidth?:number;imageHeight?:number;imageAlt?:string;caption?:string;publicationIds:string[];themeIds?:string[];activityIds?:string[];
}
const researchModules=import.meta.glob<MarkdownInstance<Entry>>('../content/research/**/*.md',{eager:true});
const newsModules=import.meta.glob<MarkdownInstance<Entry>>('../content/news/**/*.md',{eager:true});
const view=(items:Record<string,MarkdownInstance<Entry>>)=>Object.values(items).filter(x=>mode==='demo'||!x.frontmatter.draft);
export const research=view(researchModules).sort((a,b)=>a.frontmatter.order-b.frontmatter.order);
export const news=view(newsModules).sort((a,b)=>(b.frontmatter.date||'').localeCompare(a.frontmatter.date||'')||a.frontmatter.order-b.frontmatter.order);
export const themesFor=(lang:Lang)=>research.filter(x=>x.frontmatter.lang===lang);
export const newsFor=(lang:Lang)=>news.filter(x=>x.frontmatter.lang===lang);
