const CACHE='liferobots-release-7b827a756c80010c';
const VERSION='0.8.0';
const SHELL=["./index.html","./manifest.webmanifest","./releases/7b827a756c80010c/admin-management-styles.css","./releases/7b827a756c80010c/admin-operations.js","./releases/7b827a756c80010c/admin-shell.js","./releases/7b827a756c80010c/api.js","./releases/7b827a756c80010c/app.js","./releases/7b827a756c80010c/arena-queue.js","./releases/7b827a756c80010c/audio-effects.js","./releases/7b827a756c80010c/audio.js","./releases/7b827a756c80010c/battle-presentation.js","./releases/7b827a756c80010c/catalog-identities.js","./releases/7b827a756c80010c/chat.js","./releases/7b827a756c80010c/combat-animation.js","./releases/7b827a756c80010c/combat-frames.js","./releases/7b827a756c80010c/combat-profiles.js","./releases/7b827a756c80010c/combat-styles.css","./config.js","./releases/7b827a756c80010c/content-admin.js","./releases/7b827a756c80010c/content.js","./releases/7b827a756c80010c/core.js","./releases/7b827a756c80010c/drag-scroll.js","./releases/7b827a756c80010c/equipment-view.js","./releases/7b827a756c80010c/expansion-styles.css","./releases/7b827a756c80010c/expansion-v7.js","./releases/7b827a756c80010c/floating-chat-styles.css","./releases/7b827a756c80010c/floating-chat.js","./releases/7b827a756c80010c/game-styles.css","./releases/7b827a756c80010c/game-ui.js","./releases/7b827a756c80010c/guild-combat.js","./releases/7b827a756c80010c/guilds.js","./releases/7b827a756c80010c/immersion-styles.css","./releases/7b827a756c80010c/login-view.js","./releases/7b827a756c80010c/media-admin.js","./releases/7b827a756c80010c/media.js","./releases/7b827a756c80010c/music-catalog.js","./releases/7b827a756c80010c/referrals.js","./releases/7b827a756c80010c/remote-combat.js","./releases/7b827a756c80010c/robot-offer.js","./releases/7b827a756c80010c/robot-picker.js","./releases/7b827a756c80010c/robot-sprite.js","./releases/7b827a756c80010c/social-admin.js","./releases/7b827a756c80010c/social-core.js","./releases/7b827a756c80010c/social-styles.css","./releases/7b827a756c80010c/social-view.js","./releases/7b827a756c80010c/story-map.js","./releases/7b827a756c80010c/story-styles.css","./releases/7b827a756c80010c/story-view.js","./releases/7b827a756c80010c/styles.css","./releases/7b827a756c80010c/trading.js","./assets/icon-192.png","./assets/icon-512.png"];
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
