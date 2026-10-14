const CACHE='liferobots-release-4f792e78e507a160';
const VERSION='0.8.0';
const SHELL=["./index.html","./manifest.webmanifest","./releases/4f792e78e507a160/admin-management-styles.css","./releases/4f792e78e507a160/admin-operations.js","./releases/4f792e78e507a160/admin-shell.js","./releases/4f792e78e507a160/api.js","./releases/4f792e78e507a160/app.js","./releases/4f792e78e507a160/arena-queue.js","./releases/4f792e78e507a160/audio-effects.js","./releases/4f792e78e507a160/audio.js","./releases/4f792e78e507a160/battle-presentation.js","./releases/4f792e78e507a160/catalog-identities.js","./releases/4f792e78e507a160/chat.js","./releases/4f792e78e507a160/combat-animation.js","./releases/4f792e78e507a160/combat-frames.js","./releases/4f792e78e507a160/combat-profiles.js","./releases/4f792e78e507a160/combat-styles.css","./config.js","./releases/4f792e78e507a160/conquest-view.js","./releases/4f792e78e507a160/content-admin.js","./releases/4f792e78e507a160/content.js","./releases/4f792e78e507a160/core.js","./releases/4f792e78e507a160/drag-scroll.js","./releases/4f792e78e507a160/equipment-view.js","./releases/4f792e78e507a160/expansion-styles.css","./releases/4f792e78e507a160/expansion-v7.js","./releases/4f792e78e507a160/floating-chat-styles.css","./releases/4f792e78e507a160/floating-chat.js","./releases/4f792e78e507a160/game-styles.css","./releases/4f792e78e507a160/game-ui.js","./releases/4f792e78e507a160/guild-combat.js","./releases/4f792e78e507a160/guild-conquest.js","./releases/4f792e78e507a160/guilds.js","./releases/4f792e78e507a160/i18n-dict.js","./releases/4f792e78e507a160/i18n.js","./releases/4f792e78e507a160/immersion-styles.css","./releases/4f792e78e507a160/login-view.js","./releases/4f792e78e507a160/media-admin.js","./releases/4f792e78e507a160/media.js","./releases/4f792e78e507a160/music-catalog.js","./releases/4f792e78e507a160/referrals.js","./releases/4f792e78e507a160/remote-combat.js","./releases/4f792e78e507a160/robot-offer.js","./releases/4f792e78e507a160/robot-picker.js","./releases/4f792e78e507a160/robot-sprite.js","./releases/4f792e78e507a160/social-admin.js","./releases/4f792e78e507a160/social-core.js","./releases/4f792e78e507a160/social-styles.css","./releases/4f792e78e507a160/social-view.js","./releases/4f792e78e507a160/story-map.js","./releases/4f792e78e507a160/story-styles.css","./releases/4f792e78e507a160/story-view.js","./releases/4f792e78e507a160/styles.css","./releases/4f792e78e507a160/trading.js","./assets/icon-192.png","./assets/icon-512.png"];
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
