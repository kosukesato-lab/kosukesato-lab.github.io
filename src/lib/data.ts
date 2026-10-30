import siteData from '../data/site.json';
import people from '../data/profiles.json';
import memberData from '../data/members.json';
import publicationData from '../data/publications.json';
import activityData from '../data/activities.json';
import { mode } from '../../config.mjs';
import { visibleRecords } from './visibility.mjs';
export const site=siteData;
export const visible=<T extends {draft:boolean}>(items:T[]):T[]=>visibleRecords(items,mode);
export interface ExternalProfile {label:{ja:string;en:string};url:string;}
export const profiles=visible(people.map(p=>({...p,externalProfiles:p.externalProfiles as ExternalProfile[]})));
type Member=Omit<typeof memberData[number],'themeIds'|'url'|'graduationYear'> & {themeIds:string[];url:string|null;graduationYear:number|null};
export const members=visible<Member>(memberData);
export const publications=visible(publicationData).sort((a,b)=>b.year-a.year||a.order-b.order);
interface Activity {isPlaceholder:boolean;draft:boolean;updatedAt:string;id:string;type:string;date:string;title:{ja:string;en:string};media:{ja:string;en:string};recipient:{ja:string;en:string};organization:{ja:string;en:string};research:{ja:string;en:string};url:string|null;}
export const activities=visible<Activity>(activityData).sort((a,b)=>b.date.localeCompare(a.date));
export const featured=publications.filter(x=>x.featured).sort((a,b)=>a.featuredOrder-b.featuredOrder).slice(0,3);
export type Publication=typeof publicationData[number];
