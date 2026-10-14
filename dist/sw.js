const CACHE='liferobots-release-cf4926fffe325519';
const VERSION='0.8.0';
const SHELL=["./index.html","./manifest.webmanifest","./releases/cf4926fffe325519/admin-management-styles.css","./releases/cf4926fffe325519/admin-operations.js","./releases/cf4926fffe325519/admin-shell.js","./releases/cf4926fffe325519/api.js","./releases/cf4926fffe325519/app.js","./releases/cf4926fffe325519/arena-queue.js","./releases/cf4926fffe325519/audio-effects.js","./releases/cf4926fffe325519/audio.js","./releases/cf4926fffe325519/battle-presentation.js","./releases/cf4926fffe325519/catalog-identities.js","./releases/cf4926fffe325519/chat.js","./releases/cf4926fffe325519/combat-animation.js","./releases/cf4926fffe325519/combat-frames.js","./releases/cf4926fffe325519/combat-profiles.js","./releases/cf4926fffe325519/combat-styles.css","./config.js","./releases/cf4926fffe325519/conquest-view.js","./releases/cf4926fffe325519/content-admin.js","./releases/cf4926fffe325519/content.js","./releases/cf4926fffe325519/core.js","./releases/cf4926fffe325519/drag-scroll.js","./releases/cf4926fffe325519/equipment-view.js","./releases/cf4926fffe325519/expansion-styles.css","./releases/cf4926fffe325519/expansion-v7.js","./releases/cf4926fffe325519/floating-chat-styles.css","./releases/cf4926fffe325519/floating-chat.js","./releases/cf4926fffe325519/game-styles.css","./releases/cf4926fffe325519/game-ui.js","./releases/cf4926fffe325519/guild-combat.js","./releases/cf4926fffe325519/guild-conquest.js","./releases/cf4926fffe325519/guilds.js","./releases/cf4926fffe325519/i18n-dict.js","./releases/cf4926fffe325519/i18n.js","./releases/cf4926fffe325519/immersion-styles.css","./releases/cf4926fffe325519/landing.css","./releases/cf4926fffe325519/landing.js","./releases/cf4926fffe325519/login-view.js","./releases/cf4926fffe325519/media-admin.js","./releases/cf4926fffe325519/media.js","./releases/cf4926fffe325519/music-catalog.js","./releases/cf4926fffe325519/referrals.js","./releases/cf4926fffe325519/remote-combat.js","./releases/cf4926fffe325519/robot-offer.js","./releases/cf4926fffe325519/robot-picker.js","./releases/cf4926fffe325519/robot-sprite.js","./releases/cf4926fffe325519/social-admin.js","./releases/cf4926fffe325519/social-core.js","./releases/cf4926fffe325519/social-styles.css","./releases/cf4926fffe325519/social-view.js","./releases/cf4926fffe325519/story-map.js","./releases/cf4926fffe325519/story-styles.css","./releases/cf4926fffe325519/story-view.js","./releases/cf4926fffe325519/styles.css","./releases/cf4926fffe325519/trading.js","./assets/icon-192.png","./assets/icon-512.png"];
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
