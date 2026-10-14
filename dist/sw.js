const CACHE='liferobots-release-1ce730f7ad2f094c';
const VERSION='0.8.0';
const SHELL=["./index.html","./manifest.webmanifest","./releases/1ce730f7ad2f094c/admin-management-styles.css","./releases/1ce730f7ad2f094c/admin-operations.js","./releases/1ce730f7ad2f094c/admin-shell.js","./releases/1ce730f7ad2f094c/api.js","./releases/1ce730f7ad2f094c/app.js","./releases/1ce730f7ad2f094c/arena-queue.js","./releases/1ce730f7ad2f094c/audio-effects.js","./releases/1ce730f7ad2f094c/audio.js","./releases/1ce730f7ad2f094c/battle-presentation.js","./releases/1ce730f7ad2f094c/catalog-identities.js","./releases/1ce730f7ad2f094c/chat.js","./releases/1ce730f7ad2f094c/combat-animation.js","./releases/1ce730f7ad2f094c/combat-frames.js","./releases/1ce730f7ad2f094c/combat-profiles.js","./releases/1ce730f7ad2f094c/combat-styles.css","./config.js","./releases/1ce730f7ad2f094c/conquest-view.js","./releases/1ce730f7ad2f094c/content-admin.js","./releases/1ce730f7ad2f094c/content.js","./releases/1ce730f7ad2f094c/core.js","./releases/1ce730f7ad2f094c/drag-scroll.js","./releases/1ce730f7ad2f094c/equipment-view.js","./releases/1ce730f7ad2f094c/expansion-styles.css","./releases/1ce730f7ad2f094c/expansion-v7.js","./releases/1ce730f7ad2f094c/floating-chat-styles.css","./releases/1ce730f7ad2f094c/floating-chat.js","./releases/1ce730f7ad2f094c/game-styles.css","./releases/1ce730f7ad2f094c/game-ui.js","./releases/1ce730f7ad2f094c/guild-combat.js","./releases/1ce730f7ad2f094c/guild-conquest.js","./releases/1ce730f7ad2f094c/guilds.js","./releases/1ce730f7ad2f094c/i18n-dict.js","./releases/1ce730f7ad2f094c/i18n.js","./releases/1ce730f7ad2f094c/immersion-styles.css","./releases/1ce730f7ad2f094c/landing.css","./releases/1ce730f7ad2f094c/landing.js","./releases/1ce730f7ad2f094c/login-view.js","./releases/1ce730f7ad2f094c/media-admin.js","./releases/1ce730f7ad2f094c/media.js","./releases/1ce730f7ad2f094c/music-catalog.js","./releases/1ce730f7ad2f094c/referrals.js","./releases/1ce730f7ad2f094c/remote-combat.js","./releases/1ce730f7ad2f094c/robot-offer.js","./releases/1ce730f7ad2f094c/robot-picker.js","./releases/1ce730f7ad2f094c/robot-sprite.js","./releases/1ce730f7ad2f094c/social-admin.js","./releases/1ce730f7ad2f094c/social-core.js","./releases/1ce730f7ad2f094c/social-styles.css","./releases/1ce730f7ad2f094c/social-view.js","./releases/1ce730f7ad2f094c/story-map.js","./releases/1ce730f7ad2f094c/story-styles.css","./releases/1ce730f7ad2f094c/story-view.js","./releases/1ce730f7ad2f094c/styles.css","./releases/1ce730f7ad2f094c/trading.js","./assets/icon-192.png","./assets/icon-512.png"];
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
