const CACHE='liferobots-release-ef0f76d0a97258a3';
const VERSION='0.8.0';
const SHELL=["./index.html","./manifest.webmanifest","./releases/ef0f76d0a97258a3/admin-management-styles.css","./releases/ef0f76d0a97258a3/admin-operations.js","./releases/ef0f76d0a97258a3/admin-shell.js","./releases/ef0f76d0a97258a3/api.js","./releases/ef0f76d0a97258a3/app.js","./releases/ef0f76d0a97258a3/arena-queue.js","./releases/ef0f76d0a97258a3/audio-effects.js","./releases/ef0f76d0a97258a3/audio.js","./releases/ef0f76d0a97258a3/battle-presentation.js","./releases/ef0f76d0a97258a3/catalog-identities.js","./releases/ef0f76d0a97258a3/chat.js","./releases/ef0f76d0a97258a3/combat-animation.js","./releases/ef0f76d0a97258a3/combat-frames.js","./releases/ef0f76d0a97258a3/combat-profiles.js","./releases/ef0f76d0a97258a3/combat-styles.css","./config.js","./releases/ef0f76d0a97258a3/conquest-view.js","./releases/ef0f76d0a97258a3/content-admin.js","./releases/ef0f76d0a97258a3/content.js","./releases/ef0f76d0a97258a3/core.js","./releases/ef0f76d0a97258a3/drag-scroll.js","./releases/ef0f76d0a97258a3/equipment-view.js","./releases/ef0f76d0a97258a3/expansion-styles.css","./releases/ef0f76d0a97258a3/expansion-v7.js","./releases/ef0f76d0a97258a3/floating-chat-styles.css","./releases/ef0f76d0a97258a3/floating-chat.js","./releases/ef0f76d0a97258a3/game-styles.css","./releases/ef0f76d0a97258a3/game-ui.js","./releases/ef0f76d0a97258a3/guild-combat.js","./releases/ef0f76d0a97258a3/guild-conquest.js","./releases/ef0f76d0a97258a3/guilds.js","./releases/ef0f76d0a97258a3/i18n-dict.js","./releases/ef0f76d0a97258a3/i18n.js","./releases/ef0f76d0a97258a3/immersion-styles.css","./releases/ef0f76d0a97258a3/landing.css","./releases/ef0f76d0a97258a3/landing.js","./releases/ef0f76d0a97258a3/login-view.js","./releases/ef0f76d0a97258a3/media-admin.js","./releases/ef0f76d0a97258a3/media.js","./releases/ef0f76d0a97258a3/music-catalog.js","./releases/ef0f76d0a97258a3/referrals.js","./releases/ef0f76d0a97258a3/remote-combat.js","./releases/ef0f76d0a97258a3/robot-offer.js","./releases/ef0f76d0a97258a3/robot-picker.js","./releases/ef0f76d0a97258a3/robot-sprite.js","./releases/ef0f76d0a97258a3/social-admin.js","./releases/ef0f76d0a97258a3/social-core.js","./releases/ef0f76d0a97258a3/social-styles.css","./releases/ef0f76d0a97258a3/social-view.js","./releases/ef0f76d0a97258a3/story-map.js","./releases/ef0f76d0a97258a3/story-styles.css","./releases/ef0f76d0a97258a3/story-view.js","./releases/ef0f76d0a97258a3/styles.css","./releases/ef0f76d0a97258a3/trading.js","./assets/icon-192.png","./assets/icon-512.png"];
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
