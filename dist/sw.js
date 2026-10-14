const CACHE='liferobots-release-8361186d8f8d7109';
const VERSION='0.8.0';
const SHELL=["./index.html","./manifest.webmanifest","./releases/8361186d8f8d7109/admin-management-styles.css","./releases/8361186d8f8d7109/admin-operations.js","./releases/8361186d8f8d7109/admin-shell.js","./releases/8361186d8f8d7109/api.js","./releases/8361186d8f8d7109/app.js","./releases/8361186d8f8d7109/arena-queue.js","./releases/8361186d8f8d7109/audio-effects.js","./releases/8361186d8f8d7109/audio.js","./releases/8361186d8f8d7109/battle-presentation.js","./releases/8361186d8f8d7109/catalog-identities.js","./releases/8361186d8f8d7109/chat.js","./releases/8361186d8f8d7109/combat-animation.js","./releases/8361186d8f8d7109/combat-frames.js","./releases/8361186d8f8d7109/combat-profiles.js","./releases/8361186d8f8d7109/combat-styles.css","./config.js","./releases/8361186d8f8d7109/conquest-view.js","./releases/8361186d8f8d7109/content-admin.js","./releases/8361186d8f8d7109/content.js","./releases/8361186d8f8d7109/core.js","./releases/8361186d8f8d7109/drag-scroll.js","./releases/8361186d8f8d7109/equipment-view.js","./releases/8361186d8f8d7109/expansion-styles.css","./releases/8361186d8f8d7109/expansion-v7.js","./releases/8361186d8f8d7109/floating-chat-styles.css","./releases/8361186d8f8d7109/floating-chat.js","./releases/8361186d8f8d7109/game-styles.css","./releases/8361186d8f8d7109/game-ui.js","./releases/8361186d8f8d7109/guild-combat.js","./releases/8361186d8f8d7109/guild-conquest.js","./releases/8361186d8f8d7109/guilds.js","./releases/8361186d8f8d7109/i18n-dict.js","./releases/8361186d8f8d7109/i18n.js","./releases/8361186d8f8d7109/immersion-styles.css","./releases/8361186d8f8d7109/login-view.js","./releases/8361186d8f8d7109/media-admin.js","./releases/8361186d8f8d7109/media.js","./releases/8361186d8f8d7109/music-catalog.js","./releases/8361186d8f8d7109/referrals.js","./releases/8361186d8f8d7109/remote-combat.js","./releases/8361186d8f8d7109/robot-offer.js","./releases/8361186d8f8d7109/robot-picker.js","./releases/8361186d8f8d7109/robot-sprite.js","./releases/8361186d8f8d7109/social-admin.js","./releases/8361186d8f8d7109/social-core.js","./releases/8361186d8f8d7109/social-styles.css","./releases/8361186d8f8d7109/social-view.js","./releases/8361186d8f8d7109/story-map.js","./releases/8361186d8f8d7109/story-styles.css","./releases/8361186d8f8d7109/story-view.js","./releases/8361186d8f8d7109/styles.css","./releases/8361186d8f8d7109/trading.js","./assets/icon-192.png","./assets/icon-512.png"];
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
