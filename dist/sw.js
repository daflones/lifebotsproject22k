const CACHE='liferobots-release-79021caf727f9196';
const VERSION='0.8.0';
const SHELL=["./index.html","./manifest.webmanifest","./releases/79021caf727f9196/admin-management-styles.css","./releases/79021caf727f9196/admin-operations.js","./releases/79021caf727f9196/admin-shell.js","./releases/79021caf727f9196/api.js","./releases/79021caf727f9196/app.js","./releases/79021caf727f9196/arena-queue.js","./releases/79021caf727f9196/audio-effects.js","./releases/79021caf727f9196/audio.js","./releases/79021caf727f9196/battle-presentation.js","./releases/79021caf727f9196/catalog-identities.js","./releases/79021caf727f9196/chat.js","./releases/79021caf727f9196/combat-animation.js","./releases/79021caf727f9196/combat-frames.js","./releases/79021caf727f9196/combat-profiles.js","./releases/79021caf727f9196/combat-styles.css","./config.js","./releases/79021caf727f9196/content-admin.js","./releases/79021caf727f9196/content.js","./releases/79021caf727f9196/core.js","./releases/79021caf727f9196/drag-scroll.js","./releases/79021caf727f9196/equipment-view.js","./releases/79021caf727f9196/expansion-styles.css","./releases/79021caf727f9196/expansion-v7.js","./releases/79021caf727f9196/floating-chat-styles.css","./releases/79021caf727f9196/floating-chat.js","./releases/79021caf727f9196/game-styles.css","./releases/79021caf727f9196/game-ui.js","./releases/79021caf727f9196/guild-combat.js","./releases/79021caf727f9196/guilds.js","./releases/79021caf727f9196/immersion-styles.css","./releases/79021caf727f9196/login-view.js","./releases/79021caf727f9196/media-admin.js","./releases/79021caf727f9196/media.js","./releases/79021caf727f9196/music-catalog.js","./releases/79021caf727f9196/referrals.js","./releases/79021caf727f9196/remote-combat.js","./releases/79021caf727f9196/robot-offer.js","./releases/79021caf727f9196/robot-picker.js","./releases/79021caf727f9196/robot-sprite.js","./releases/79021caf727f9196/social-admin.js","./releases/79021caf727f9196/social-core.js","./releases/79021caf727f9196/social-styles.css","./releases/79021caf727f9196/social-view.js","./releases/79021caf727f9196/story-map.js","./releases/79021caf727f9196/story-styles.css","./releases/79021caf727f9196/story-view.js","./releases/79021caf727f9196/styles.css","./releases/79021caf727f9196/trading.js","./assets/icon-192.png","./assets/icon-512.png"];
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
