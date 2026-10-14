const CACHE='liferobots-release-f63d545c7b837c3b';
const VERSION='0.8.0';
const SHELL=["./index.html","./manifest.webmanifest","./releases/f63d545c7b837c3b/admin-management-styles.css","./releases/f63d545c7b837c3b/admin-operations.js","./releases/f63d545c7b837c3b/admin-shell.js","./releases/f63d545c7b837c3b/api.js","./releases/f63d545c7b837c3b/app.js","./releases/f63d545c7b837c3b/arena-queue.js","./releases/f63d545c7b837c3b/audio-effects.js","./releases/f63d545c7b837c3b/audio.js","./releases/f63d545c7b837c3b/battle-presentation.js","./releases/f63d545c7b837c3b/catalog-identities.js","./releases/f63d545c7b837c3b/chat.js","./releases/f63d545c7b837c3b/combat-animation.js","./releases/f63d545c7b837c3b/combat-frames.js","./releases/f63d545c7b837c3b/combat-profiles.js","./releases/f63d545c7b837c3b/combat-styles.css","./config.js","./releases/f63d545c7b837c3b/conquest-view.js","./releases/f63d545c7b837c3b/content-admin.js","./releases/f63d545c7b837c3b/content.js","./releases/f63d545c7b837c3b/core.js","./releases/f63d545c7b837c3b/drag-scroll.js","./releases/f63d545c7b837c3b/equipment-view.js","./releases/f63d545c7b837c3b/expansion-styles.css","./releases/f63d545c7b837c3b/expansion-v7.js","./releases/f63d545c7b837c3b/floating-chat-styles.css","./releases/f63d545c7b837c3b/floating-chat.js","./releases/f63d545c7b837c3b/game-styles.css","./releases/f63d545c7b837c3b/game-ui.js","./releases/f63d545c7b837c3b/guild-combat.js","./releases/f63d545c7b837c3b/guild-conquest.js","./releases/f63d545c7b837c3b/guilds.js","./releases/f63d545c7b837c3b/i18n-dict.js","./releases/f63d545c7b837c3b/i18n.js","./releases/f63d545c7b837c3b/immersion-styles.css","./releases/f63d545c7b837c3b/landing.css","./releases/f63d545c7b837c3b/landing.js","./releases/f63d545c7b837c3b/login-view.js","./releases/f63d545c7b837c3b/media-admin.js","./releases/f63d545c7b837c3b/media.js","./releases/f63d545c7b837c3b/music-catalog.js","./releases/f63d545c7b837c3b/referrals.js","./releases/f63d545c7b837c3b/remote-combat.js","./releases/f63d545c7b837c3b/robot-offer.js","./releases/f63d545c7b837c3b/robot-picker.js","./releases/f63d545c7b837c3b/robot-sprite.js","./releases/f63d545c7b837c3b/social-admin.js","./releases/f63d545c7b837c3b/social-core.js","./releases/f63d545c7b837c3b/social-styles.css","./releases/f63d545c7b837c3b/social-view.js","./releases/f63d545c7b837c3b/story-map.js","./releases/f63d545c7b837c3b/story-styles.css","./releases/f63d545c7b837c3b/story-view.js","./releases/f63d545c7b837c3b/styles.css","./releases/f63d545c7b837c3b/trading.js","./assets/icon-192.png","./assets/icon-512.png"];
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
