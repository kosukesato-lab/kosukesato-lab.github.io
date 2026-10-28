export const mode = process.env.CONTENT_MODE || 'production';
if (!['demo', 'production'].includes(mode)) throw new Error('CONTENT_MODE must be demo or production');
export const origin = process.env.SITE_ORIGIN || 'https://kosukesato-lab.github.io';
const siteURL = new URL(origin);
if (!['http:', 'https:'].includes(siteURL.protocol) || siteURL.pathname !== '/' || siteURL.search || siteURL.hash || siteURL.username) throw new Error('SITE_ORIGIN must be an http(s) origin without a path');
export const base = '/' + (process.env.BASE_PATH || '').split('/').filter(Boolean).join('/');
if (!/^\/(?:[a-zA-Z0-9._-]+(?:\/[a-zA-Z0-9._-]+)*)?$/.test(base) || base.split('/').some(p => p === '.' || p === '..')) throw new Error('Invalid BASE_PATH');
export const basePath = base === '/' ? '' : base;
export function pathFor(path = '') {
  if (/^(?:https?:|mailto:|tel:|#)/.test(path)) return path;
  const clean = path.replace(/^\/+|\/+$/g, '');
  return `${basePath}/${clean}${clean && !/\.[a-z0-9]+$/i.test(clean) ? '/' : ''}`;
}
export function absolute(path = '') { return new URL(pathFor(path), origin).href; }
