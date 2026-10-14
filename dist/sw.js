const CACHE='liferobots-release-2edae5cc4f61d0d2';
const VERSION='0.8.0';
const SHELL=["./index.html","./manifest.webmanifest","./releases/2edae5cc4f61d0d2/admin-management-styles.css","./releases/2edae5cc4f61d0d2/admin-operations.js","./releases/2edae5cc4f61d0d2/admin-shell.js","./releases/2edae5cc4f61d0d2/api.js","./releases/2edae5cc4f61d0d2/app.js","./releases/2edae5cc4f61d0d2/arena-queue.js","./releases/2edae5cc4f61d0d2/audio-effects.js","./releases/2edae5cc4f61d0d2/audio.js","./releases/2edae5cc4f61d0d2/battle-presentation.js","./releases/2edae5cc4f61d0d2/catalog-identities.js","./releases/2edae5cc4f61d0d2/chat.js","./releases/2edae5cc4f61d0d2/combat-animation.js","./releases/2edae5cc4f61d0d2/combat-frames.js","./releases/2edae5cc4f61d0d2/combat-profiles.js","./releases/2edae5cc4f61d0d2/combat-styles.css","./config.js","./releases/2edae5cc4f61d0d2/content-admin.js","./releases/2edae5cc4f61d0d2/content.js","./releases/2edae5cc4f61d0d2/core.js","./releases/2edae5cc4f61d0d2/drag-scroll.js","./releases/2edae5cc4f61d0d2/equipment-view.js","./releases/2edae5cc4f61d0d2/expansion-styles.css","./releases/2edae5cc4f61d0d2/expansion-v7.js","./releases/2edae5cc4f61d0d2/floating-chat-styles.css","./releases/2edae5cc4f61d0d2/floating-chat.js","./releases/2edae5cc4f61d0d2/game-styles.css","./releases/2edae5cc4f61d0d2/game-ui.js","./releases/2edae5cc4f61d0d2/guild-combat.js","./releases/2edae5cc4f61d0d2/guilds.js","./releases/2edae5cc4f61d0d2/i18n.js","./releases/2edae5cc4f61d0d2/immersion-styles.css","./releases/2edae5cc4f61d0d2/login-view.js","./releases/2edae5cc4f61d0d2/media-admin.js","./releases/2edae5cc4f61d0d2/media.js","./releases/2edae5cc4f61d0d2/music-catalog.js","./releases/2edae5cc4f61d0d2/referrals.js","./releases/2edae5cc4f61d0d2/remote-combat.js","./releases/2edae5cc4f61d0d2/robot-offer.js","./releases/2edae5cc4f61d0d2/robot-picker.js","./releases/2edae5cc4f61d0d2/robot-sprite.js","./releases/2edae5cc4f61d0d2/social-admin.js","./releases/2edae5cc4f61d0d2/social-core.js","./releases/2edae5cc4f61d0d2/social-styles.css","./releases/2edae5cc4f61d0d2/social-view.js","./releases/2edae5cc4f61d0d2/story-map.js","./releases/2edae5cc4f61d0d2/story-styles.css","./releases/2edae5cc4f61d0d2/story-view.js","./releases/2edae5cc4f61d0d2/styles.css","./releases/2edae5cc4f61d0d2/trading.js","./assets/icon-192.png","./assets/icon-512.png"];
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
