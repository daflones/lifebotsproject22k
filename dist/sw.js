const CACHE='liferobots-release-469cc3bcda0a026e';
const VERSION='0.8.0';
const SHELL=["./index.html","./manifest.webmanifest","./releases/469cc3bcda0a026e/admin-management-styles.css","./releases/469cc3bcda0a026e/admin-operations.js","./releases/469cc3bcda0a026e/admin-shell.js","./releases/469cc3bcda0a026e/api.js","./releases/469cc3bcda0a026e/app.js","./releases/469cc3bcda0a026e/arena-queue.js","./releases/469cc3bcda0a026e/audio-effects.js","./releases/469cc3bcda0a026e/audio.js","./releases/469cc3bcda0a026e/battle-presentation.js","./releases/469cc3bcda0a026e/catalog-identities.js","./releases/469cc3bcda0a026e/chat.js","./releases/469cc3bcda0a026e/combat-animation.js","./releases/469cc3bcda0a026e/combat-frames.js","./releases/469cc3bcda0a026e/combat-profiles.js","./releases/469cc3bcda0a026e/combat-styles.css","./config.js","./releases/469cc3bcda0a026e/conquest-view.js","./releases/469cc3bcda0a026e/content-admin.js","./releases/469cc3bcda0a026e/content.js","./releases/469cc3bcda0a026e/core.js","./releases/469cc3bcda0a026e/drag-scroll.js","./releases/469cc3bcda0a026e/equipment-view.js","./releases/469cc3bcda0a026e/expansion-styles.css","./releases/469cc3bcda0a026e/expansion-v7.js","./releases/469cc3bcda0a026e/floating-chat-styles.css","./releases/469cc3bcda0a026e/floating-chat.js","./releases/469cc3bcda0a026e/game-styles.css","./releases/469cc3bcda0a026e/game-ui.js","./releases/469cc3bcda0a026e/guild-combat.js","./releases/469cc3bcda0a026e/guild-conquest.js","./releases/469cc3bcda0a026e/guilds.js","./releases/469cc3bcda0a026e/i18n-dict.js","./releases/469cc3bcda0a026e/i18n.js","./releases/469cc3bcda0a026e/immersion-styles.css","./releases/469cc3bcda0a026e/login-view.js","./releases/469cc3bcda0a026e/media-admin.js","./releases/469cc3bcda0a026e/media.js","./releases/469cc3bcda0a026e/music-catalog.js","./releases/469cc3bcda0a026e/referrals.js","./releases/469cc3bcda0a026e/remote-combat.js","./releases/469cc3bcda0a026e/robot-offer.js","./releases/469cc3bcda0a026e/robot-picker.js","./releases/469cc3bcda0a026e/robot-sprite.js","./releases/469cc3bcda0a026e/social-admin.js","./releases/469cc3bcda0a026e/social-core.js","./releases/469cc3bcda0a026e/social-styles.css","./releases/469cc3bcda0a026e/social-view.js","./releases/469cc3bcda0a026e/story-map.js","./releases/469cc3bcda0a026e/story-styles.css","./releases/469cc3bcda0a026e/story-view.js","./releases/469cc3bcda0a026e/styles.css","./releases/469cc3bcda0a026e/trading.js","./assets/icon-192.png","./assets/icon-512.png"];
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
