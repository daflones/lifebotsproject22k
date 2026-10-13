const CACHE='liferobots-release-c30d592197b8c993';
const VERSION='0.8.0';
const SHELL=["./index.html","./manifest.webmanifest","./releases/c30d592197b8c993/admin-management-styles.css","./releases/c30d592197b8c993/admin-operations.js","./releases/c30d592197b8c993/admin-shell.js","./releases/c30d592197b8c993/api.js","./releases/c30d592197b8c993/app.js","./releases/c30d592197b8c993/arena-queue.js","./releases/c30d592197b8c993/audio-effects.js","./releases/c30d592197b8c993/audio.js","./releases/c30d592197b8c993/battle-presentation.js","./releases/c30d592197b8c993/catalog-identities.js","./releases/c30d592197b8c993/chat.js","./releases/c30d592197b8c993/combat-animation.js","./releases/c30d592197b8c993/combat-frames.js","./releases/c30d592197b8c993/combat-profiles.js","./releases/c30d592197b8c993/combat-styles.css","./config.js","./releases/c30d592197b8c993/content-admin.js","./releases/c30d592197b8c993/content.js","./releases/c30d592197b8c993/core.js","./releases/c30d592197b8c993/drag-scroll.js","./releases/c30d592197b8c993/equipment-view.js","./releases/c30d592197b8c993/expansion-styles.css","./releases/c30d592197b8c993/expansion-v7.js","./releases/c30d592197b8c993/floating-chat-styles.css","./releases/c30d592197b8c993/floating-chat.js","./releases/c30d592197b8c993/game-styles.css","./releases/c30d592197b8c993/game-ui.js","./releases/c30d592197b8c993/guild-combat.js","./releases/c30d592197b8c993/guilds.js","./releases/c30d592197b8c993/immersion-styles.css","./releases/c30d592197b8c993/login-view.js","./releases/c30d592197b8c993/media-admin.js","./releases/c30d592197b8c993/media.js","./releases/c30d592197b8c993/music-catalog.js","./releases/c30d592197b8c993/referrals.js","./releases/c30d592197b8c993/remote-combat.js","./releases/c30d592197b8c993/robot-offer.js","./releases/c30d592197b8c993/robot-picker.js","./releases/c30d592197b8c993/robot-sprite.js","./releases/c30d592197b8c993/social-admin.js","./releases/c30d592197b8c993/social-core.js","./releases/c30d592197b8c993/social-styles.css","./releases/c30d592197b8c993/social-view.js","./releases/c30d592197b8c993/story-map.js","./releases/c30d592197b8c993/story-styles.css","./releases/c30d592197b8c993/story-view.js","./releases/c30d592197b8c993/styles.css","./releases/c30d592197b8c993/trading.js","./assets/icon-192.png","./assets/icon-512.png"];
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
