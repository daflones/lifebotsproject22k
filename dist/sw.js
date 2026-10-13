const CACHE='liferobots-release-08c703679a657cf6';
const VERSION='0.8.0';
const SHELL=["./index.html","./manifest.webmanifest","./releases/08c703679a657cf6/admin-management-styles.css","./releases/08c703679a657cf6/admin-operations.js","./releases/08c703679a657cf6/admin-shell.js","./releases/08c703679a657cf6/api.js","./releases/08c703679a657cf6/app.js","./releases/08c703679a657cf6/arena-queue.js","./releases/08c703679a657cf6/audio-effects.js","./releases/08c703679a657cf6/audio.js","./releases/08c703679a657cf6/battle-presentation.js","./releases/08c703679a657cf6/catalog-identities.js","./releases/08c703679a657cf6/chat.js","./releases/08c703679a657cf6/combat-animation.js","./releases/08c703679a657cf6/combat-frames.js","./releases/08c703679a657cf6/combat-profiles.js","./releases/08c703679a657cf6/combat-styles.css","./config.js","./releases/08c703679a657cf6/content-admin.js","./releases/08c703679a657cf6/content.js","./releases/08c703679a657cf6/core.js","./releases/08c703679a657cf6/drag-scroll.js","./releases/08c703679a657cf6/equipment-view.js","./releases/08c703679a657cf6/expansion-styles.css","./releases/08c703679a657cf6/expansion-v7.js","./releases/08c703679a657cf6/floating-chat-styles.css","./releases/08c703679a657cf6/floating-chat.js","./releases/08c703679a657cf6/game-styles.css","./releases/08c703679a657cf6/game-ui.js","./releases/08c703679a657cf6/guild-combat.js","./releases/08c703679a657cf6/guilds.js","./releases/08c703679a657cf6/immersion-styles.css","./releases/08c703679a657cf6/login-view.js","./releases/08c703679a657cf6/media-admin.js","./releases/08c703679a657cf6/media.js","./releases/08c703679a657cf6/music-catalog.js","./releases/08c703679a657cf6/referrals.js","./releases/08c703679a657cf6/remote-combat.js","./releases/08c703679a657cf6/robot-offer.js","./releases/08c703679a657cf6/robot-picker.js","./releases/08c703679a657cf6/robot-sprite.js","./releases/08c703679a657cf6/social-admin.js","./releases/08c703679a657cf6/social-core.js","./releases/08c703679a657cf6/social-styles.css","./releases/08c703679a657cf6/social-view.js","./releases/08c703679a657cf6/story-map.js","./releases/08c703679a657cf6/story-styles.css","./releases/08c703679a657cf6/story-view.js","./releases/08c703679a657cf6/styles.css","./releases/08c703679a657cf6/trading.js","./assets/icon-192.png","./assets/icon-512.png"];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const names=await caches.keys();await Promise.all(names.filter(name=>name.startsWith('liferobots-')&&name!==CACHE).map(name=>caches.delete(name)));
 await self.clients.claim();const clients=await self.clients.matchAll({type:'window'});clients.forEach(client=>client.postMessage({type:'LIFEBOTS_READY',version:VERSION}));
})()));
async function fresh(request,fallback){
 try{const response=await fetch(request,{cache:'no-store'});if(response.ok){const cache=await caches.open(CACHE);await cache.put(request,response.clone());}return response;}
 catch(error){const cached=await caches.match(request)||(fallback?await caches.match(fallback):null);if(cached)return cached;throw error;}
}
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 // Áudio nativo pode pedir respostas parciais (206), que não entram no Cache API.
 if(request.headers?.has?.('range'))return;
 if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
 if(request.mode==='navigate'){event.respondWith(fresh(request,'./index.html'));return;}
 if(/\.(js|css|html)$/.test(url.pathname)){event.respondWith(fresh(request));return;}
 event.respondWith(caches.match(request).then(cached=>cached||fresh(request)));
});
