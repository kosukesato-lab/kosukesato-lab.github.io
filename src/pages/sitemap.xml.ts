import {research,news} from '../lib/content';
import {pageKeys,languages} from '../i18n/ui';
import {mode,absolute} from '../../config.mjs';
import {site} from '../lib/data';
export function GET(){
 const routes=mode==='production'?[{path:'',updatedAt:site.updatedAt},...languages.flatMap(lang=>pageKeys.map(k=>({path:`${lang}/${k==='home'?'':k}`,updatedAt:site.updatedAt}))),...research.map(r=>({path:`${r.frontmatter.lang}/research/${r.frontmatter.slug}`,updatedAt:r.frontmatter.updatedAt})),...news.map(n=>({path:`${n.frontmatter.lang}/news/${n.frontmatter.slug}`,updatedAt:n.frontmatter.updatedAt}))]:[];
 return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(r=>`<url><loc>${absolute(r.path).replace(/&/g,'&amp;')}</loc><lastmod>${r.updatedAt}</lastmod></url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml'}});
}
