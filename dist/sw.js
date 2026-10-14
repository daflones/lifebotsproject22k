const CACHE='liferobots-release-860faea61800f5fa';
const VERSION='0.8.0';
const SHELL=["./index.html","./manifest.webmanifest","./releases/860faea61800f5fa/admin-management-styles.css","./releases/860faea61800f5fa/admin-operations.js","./releases/860faea61800f5fa/admin-shell.js","./releases/860faea61800f5fa/api.js","./releases/860faea61800f5fa/app.js","./releases/860faea61800f5fa/arena-queue.js","./releases/860faea61800f5fa/audio-effects.js","./releases/860faea61800f5fa/audio.js","./releases/860faea61800f5fa/battle-presentation.js","./releases/860faea61800f5fa/catalog-identities.js","./releases/860faea61800f5fa/chat.js","./releases/860faea61800f5fa/combat-animation.js","./releases/860faea61800f5fa/combat-frames.js","./releases/860faea61800f5fa/combat-profiles.js","./releases/860faea61800f5fa/combat-styles.css","./config.js","./releases/860faea61800f5fa/conquest-view.js","./releases/860faea61800f5fa/content-admin.js","./releases/860faea61800f5fa/content.js","./releases/860faea61800f5fa/core.js","./releases/860faea61800f5fa/drag-scroll.js","./releases/860faea61800f5fa/equipment-view.js","./releases/860faea61800f5fa/expansion-styles.css","./releases/860faea61800f5fa/expansion-v7.js","./releases/860faea61800f5fa/floating-chat-styles.css","./releases/860faea61800f5fa/floating-chat.js","./releases/860faea61800f5fa/game-styles.css","./releases/860faea61800f5fa/game-ui.js","./releases/860faea61800f5fa/guild-combat.js","./releases/860faea61800f5fa/guild-conquest.js","./releases/860faea61800f5fa/guilds.js","./releases/860faea61800f5fa/i18n-dict.js","./releases/860faea61800f5fa/i18n.js","./releases/860faea61800f5fa/immersion-styles.css","./releases/860faea61800f5fa/landing.css","./releases/860faea61800f5fa/landing.js","./releases/860faea61800f5fa/login-view.js","./releases/860faea61800f5fa/media-admin.js","./releases/860faea61800f5fa/media.js","./releases/860faea61800f5fa/music-catalog.js","./releases/860faea61800f5fa/referrals.js","./releases/860faea61800f5fa/remote-combat.js","./releases/860faea61800f5fa/robot-offer.js","./releases/860faea61800f5fa/robot-picker.js","./releases/860faea61800f5fa/robot-sprite.js","./releases/860faea61800f5fa/social-admin.js","./releases/860faea61800f5fa/social-core.js","./releases/860faea61800f5fa/social-styles.css","./releases/860faea61800f5fa/social-view.js","./releases/860faea61800f5fa/story-map.js","./releases/860faea61800f5fa/story-styles.css","./releases/860faea61800f5fa/story-view.js","./releases/860faea61800f5fa/styles.css","./releases/860faea61800f5fa/trading.js","./assets/icon-192.png","./assets/icon-512.png"];
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
