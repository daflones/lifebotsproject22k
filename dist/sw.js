const CACHE='liferobots-release-5fb38ca2a90f1e5b';
const VERSION='0.8.0';
const SHELL=["./index.html","./manifest.webmanifest","./releases/5fb38ca2a90f1e5b/admin-management-styles.css","./releases/5fb38ca2a90f1e5b/admin-operations.js","./releases/5fb38ca2a90f1e5b/admin-shell.js","./releases/5fb38ca2a90f1e5b/api.js","./releases/5fb38ca2a90f1e5b/app.js","./releases/5fb38ca2a90f1e5b/arena-queue.js","./releases/5fb38ca2a90f1e5b/audio-effects.js","./releases/5fb38ca2a90f1e5b/audio.js","./releases/5fb38ca2a90f1e5b/battle-presentation.js","./releases/5fb38ca2a90f1e5b/catalog-identities.js","./releases/5fb38ca2a90f1e5b/chat.js","./releases/5fb38ca2a90f1e5b/combat-animation.js","./releases/5fb38ca2a90f1e5b/combat-frames.js","./releases/5fb38ca2a90f1e5b/combat-profiles.js","./releases/5fb38ca2a90f1e5b/combat-styles.css","./config.js","./releases/5fb38ca2a90f1e5b/content-admin.js","./releases/5fb38ca2a90f1e5b/content.js","./releases/5fb38ca2a90f1e5b/core.js","./releases/5fb38ca2a90f1e5b/drag-scroll.js","./releases/5fb38ca2a90f1e5b/equipment-view.js","./releases/5fb38ca2a90f1e5b/expansion-styles.css","./releases/5fb38ca2a90f1e5b/expansion-v7.js","./releases/5fb38ca2a90f1e5b/floating-chat-styles.css","./releases/5fb38ca2a90f1e5b/floating-chat.js","./releases/5fb38ca2a90f1e5b/game-styles.css","./releases/5fb38ca2a90f1e5b/game-ui.js","./releases/5fb38ca2a90f1e5b/guild-combat.js","./releases/5fb38ca2a90f1e5b/guilds.js","./releases/5fb38ca2a90f1e5b/immersion-styles.css","./releases/5fb38ca2a90f1e5b/login-view.js","./releases/5fb38ca2a90f1e5b/media-admin.js","./releases/5fb38ca2a90f1e5b/media.js","./releases/5fb38ca2a90f1e5b/music-catalog.js","./releases/5fb38ca2a90f1e5b/referrals.js","./releases/5fb38ca2a90f1e5b/remote-combat.js","./releases/5fb38ca2a90f1e5b/robot-offer.js","./releases/5fb38ca2a90f1e5b/robot-picker.js","./releases/5fb38ca2a90f1e5b/robot-sprite.js","./releases/5fb38ca2a90f1e5b/social-admin.js","./releases/5fb38ca2a90f1e5b/social-core.js","./releases/5fb38ca2a90f1e5b/social-styles.css","./releases/5fb38ca2a90f1e5b/social-view.js","./releases/5fb38ca2a90f1e5b/story-map.js","./releases/5fb38ca2a90f1e5b/story-styles.css","./releases/5fb38ca2a90f1e5b/story-view.js","./releases/5fb38ca2a90f1e5b/styles.css","./releases/5fb38ca2a90f1e5b/trading.js","./assets/icon-192.png","./assets/icon-512.png"];
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
