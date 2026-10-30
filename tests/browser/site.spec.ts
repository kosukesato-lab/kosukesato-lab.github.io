import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import publications from '../../src/data/publications.json' with {type:'json'};
import {mode} from '../../config.mjs';
import {visibleRecords} from '../../src/lib/visibility.mjs';
const shots='docs/screenshots';
const visiblePublications=visibleRecords(publications,mode);
const total=String(visiblePublications.length);
const matching=String(visiblePublications.filter(p=>p.year===2026&&p.type==='article'&&`${p.title} ${p.authors.map(a=>a.name).join(' ')} ${p.journal}`.toLowerCase().includes('sato')).length);
test('publication AND filters, reset, no results and IME',async({page})=>{
 await page.goto('ja/publications/');await expect(page.locator('[data-count]')).toHaveText(total);
 await page.locator('#pub-search').fill('SATO');await page.locator('#pub-year').selectOption('2026');await page.locator('#pub-type').selectOption('article');await expect(page.locator('[data-count]')).toHaveText(matching);
 await page.locator('#pub-search').fill('zzzz-no-result');await expect(page.locator('[data-count]')).toHaveText('0');await expect(page.locator('[data-empty]')).toBeVisible();
 await page.locator('[data-reset]').click();await expect(page.locator('[data-count]')).toHaveText(total);await expect(page.locator('#pub-search')).toBeFocused();
 await page.locator('#pub-search').dispatchEvent('compositionstart');await page.locator('#pub-search').fill('no-match');await expect(page.locator('[data-count]')).toHaveText(total);await page.locator('#pub-search').dispatchEvent('compositionend');await expect(page.locator('[data-count]')).toHaveText('0');
});
test('language switch preserves page and deep reload works',async({page})=>{
 for(const route of ['ja/','ja/profile/','ja/research/theme-02/','ja/news/laboratory-opening/']){
  await page.goto(route);await page.locator('.desktop-aux .language-link').click();await expect(page).toHaveURL(new RegExp(route.replace('ja/','en/')+'$'));await expect(page.locator('html')).toHaveAttribute('lang','en');await page.reload();await expect(page.locator('h1')).toBeVisible();
 }
});
test('mobile menu and FAQ keyboard interactions',async({page})=>{
 await page.setViewportSize({width:375,height:812});await page.goto('ja/join/');const menu=page.locator('.menu-toggle');await expect(menu).toHaveAttribute('aria-expanded','false');await menu.focus();await page.keyboard.press('Enter');await expect(menu).toHaveAttribute('aria-expanded','true');await page.keyboard.press('Tab');await page.keyboard.press('Escape');await expect(menu).toHaveAttribute('aria-expanded','false');await expect(menu).toBeFocused();
 const faq=page.locator('summary').first();await faq.focus();await page.keyboard.press('Enter');await expect(page.locator('details').first()).toHaveAttribute('open','');
});
test('JavaScript disabled still exposes all publications and navigation',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:812}});const page=await context.newPage();await page.goto(test.info().project.use.baseURL+'ja/publications/');await expect(page.locator('[data-publication]')).toHaveCount(visiblePublications.length);await expect(page.locator('#main-nav')).toBeVisible();await page.locator('#main-nav a').filter({hasText:'研究紹介'}).first().click();await expect(page.locator('h1')).toHaveText('研究紹介');await context.close();
});
test('404 base-aware home links and indexing mode',async({page})=>{
 await page.goto('ja/');await expect(page.locator('meta[name=robots]')).toHaveAttribute('content',mode==='demo'?'noindex, follow':'index, follow');
 await page.goto('unknown/deep/location/');await expect(page.locator('h1')).toContainText('ページが見つかりません');await page.locator('main a').filter({hasText:'日本語ホーム'}).click();await expect(page).toHaveURL(/\/ja\/$/);
});
for(const width of [320,375,768,1280,1440])test(`responsive layout ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 for(const route of ['ja/','ja/research/theme-01/','ja/publications/','ja/join/','en/','en/members/','ja/contact/']){
  await page.goto(route);await expect(page.locator('h1')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),route).toBeTruthy();
  if([375,1440].includes(width)&&['ja/','ja/research/theme-01/','ja/publications/','ja/join/'].includes(route)){
   fs.mkdirSync(shots,{recursive:true});await page.screenshot({path:path.join(shots,`${route.replaceAll('/','-')||'root'}${width}.png`),fullPage:true});
  }
 }
 expect(errors).toEqual([]);
});
test('200 percent text remains usable',async({page})=>{await page.setViewportSize({width:1280,height:900});await page.goto('ja/');await page.addStyleTag({content:'body{font-size:200%}'});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();await expect(page.getByRole('link',{name:'研究内容を見る'})).toBeVisible();});
