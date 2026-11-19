'use strict';
const CACHE_NAME = 'athkary-pwa-v1-20261119';
const ROOT = self.registration.scope;
const CORE = [
  './','./index.html','./styles-v3.css','./app-v3.js','./pwa-install.js',
  './data/hisn.json','./data/jawami.json',
  './manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png',
  './icons/icon-180.png','./icons/favicon.svg'
].map(p=>new URL(p,ROOT).toString());
self.addEventListener('install', event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    // Core texts MUST be cached to ensure a genuinely useful offline experience.
    await cache.addAll(CORE);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('athkary-pwa-')&&k!==CACHE_NAME).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin||!url.pathname.startsWith(new URL(ROOT).pathname))return;
  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const response=await fetch(request);
        if(response.ok){const cache=await caches.open(CACHE_NAME);await cache.put(new URL('./index.html',ROOT),response.clone());}
        return response;
      }catch{
        return (await caches.match(new URL('./index.html',ROOT))) || Response.error();
      }
    })());
    return;
  }
  event.respondWith((async()=>{
    const cached=await caches.match(request,{ignoreSearch:true});
    if(cached)return cached;
    const response=await fetch(request);
    if(response.ok){const cache=await caches.open(CACHE_NAME);cache.put(request,response.clone());}
    return response;
  })());
});