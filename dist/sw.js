const CACHE='liferobots-release-588e2f5a58143f13';
const VERSION='0.8.0';
const SHELL=["./index.html","./manifest.webmanifest","./releases/588e2f5a58143f13/admin-management-styles.css","./releases/588e2f5a58143f13/admin-operations.js","./releases/588e2f5a58143f13/admin-shell.js","./releases/588e2f5a58143f13/api.js","./releases/588e2f5a58143f13/app.js","./releases/588e2f5a58143f13/arena-queue.js","./releases/588e2f5a58143f13/audio-effects.js","./releases/588e2f5a58143f13/audio.js","./releases/588e2f5a58143f13/battle-presentation.js","./releases/588e2f5a58143f13/catalog-identities.js","./releases/588e2f5a58143f13/chat.js","./releases/588e2f5a58143f13/combat-animation.js","./releases/588e2f5a58143f13/combat-frames.js","./releases/588e2f5a58143f13/combat-profiles.js","./releases/588e2f5a58143f13/combat-styles.css","./config.js","./releases/588e2f5a58143f13/content-admin.js","./releases/588e2f5a58143f13/content.js","./releases/588e2f5a58143f13/core.js","./releases/588e2f5a58143f13/drag-scroll.js","./releases/588e2f5a58143f13/equipment-view.js","./releases/588e2f5a58143f13/expansion-styles.css","./releases/588e2f5a58143f13/expansion-v7.js","./releases/588e2f5a58143f13/floating-chat-styles.css","./releases/588e2f5a58143f13/floating-chat.js","./releases/588e2f5a58143f13/game-styles.css","./releases/588e2f5a58143f13/game-ui.js","./releases/588e2f5a58143f13/guild-combat.js","./releases/588e2f5a58143f13/guilds.js","./releases/588e2f5a58143f13/immersion-styles.css","./releases/588e2f5a58143f13/login-view.js","./releases/588e2f5a58143f13/media-admin.js","./releases/588e2f5a58143f13/media.js","./releases/588e2f5a58143f13/music-catalog.js","./releases/588e2f5a58143f13/referrals.js","./releases/588e2f5a58143f13/remote-combat.js","./releases/588e2f5a58143f13/robot-offer.js","./releases/588e2f5a58143f13/robot-picker.js","./releases/588e2f5a58143f13/robot-sprite.js","./releases/588e2f5a58143f13/social-admin.js","./releases/588e2f5a58143f13/social-core.js","./releases/588e2f5a58143f13/social-styles.css","./releases/588e2f5a58143f13/social-view.js","./releases/588e2f5a58143f13/story-map.js","./releases/588e2f5a58143f13/story-styles.css","./releases/588e2f5a58143f13/story-view.js","./releases/588e2f5a58143f13/styles.css","./releases/588e2f5a58143f13/trading.js","./assets/icon-192.png","./assets/icon-512.png"];
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
