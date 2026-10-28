import {matchesPublication} from '../lib/filter.mjs';
export function filterPublications(){
 const panel=document.querySelector<HTMLElement>('[data-filters]');
 if(!panel)return;
 const search=document.querySelector<HTMLInputElement>('#pub-search')!;
 const year=document.querySelector<HTMLSelectElement>('#pub-year')!;
 const type=document.querySelector<HTMLSelectElement>('#pub-type')!;
 const entries=[...document.querySelectorAll<HTMLElement>('[data-publication]')];
 let composing=false;
 const update=()=>{
  if(composing)return;
  let count=0;
  entries.forEach(el=>{const matches=matchesPublication({year:el.dataset.year!,type:el.dataset.type!,search:el.dataset.search!},{year:year.value,type:type.value,query:search.value});el.hidden=!matches;if(matches)count++;});
  document.querySelectorAll<HTMLElement>('[data-year-group]').forEach(el=>el.hidden=![...el.querySelectorAll<HTMLElement>('[data-publication]')].some(p=>!p.hidden));
  document.querySelector('[data-count]')!.textContent=String(count);
  document.querySelector<HTMLElement>('[data-empty]')!.hidden=count!==0;
 };
 panel.hidden=false;
 search.addEventListener('compositionstart',()=>composing=true);
 search.addEventListener('compositionend',()=>{composing=false;update();});
 search.addEventListener('input',update);year.addEventListener('change',update);type.addEventListener('change',update);
 document.querySelector('[data-reset]')!.addEventListener('click',()=>{search.value='';year.value='';type.value='';update();search.focus();});
}
