const CACHE='liferobots-release-edc575be747263a6';
const VERSION='0.8.0';
const SHELL=["./index.html","./manifest.webmanifest","./releases/edc575be747263a6/admin-management-styles.css","./releases/edc575be747263a6/admin-operations.js","./releases/edc575be747263a6/admin-shell.js","./releases/edc575be747263a6/api.js","./releases/edc575be747263a6/app.js","./releases/edc575be747263a6/arena-queue.js","./releases/edc575be747263a6/audio-effects.js","./releases/edc575be747263a6/audio.js","./releases/edc575be747263a6/battle-presentation.js","./releases/edc575be747263a6/catalog-identities.js","./releases/edc575be747263a6/chat.js","./releases/edc575be747263a6/combat-animation.js","./releases/edc575be747263a6/combat-frames.js","./releases/edc575be747263a6/combat-profiles.js","./releases/edc575be747263a6/combat-styles.css","./config.js","./releases/edc575be747263a6/conquest-view.js","./releases/edc575be747263a6/content-admin.js","./releases/edc575be747263a6/content.js","./releases/edc575be747263a6/core.js","./releases/edc575be747263a6/drag-scroll.js","./releases/edc575be747263a6/equipment-view.js","./releases/edc575be747263a6/expansion-styles.css","./releases/edc575be747263a6/expansion-v7.js","./releases/edc575be747263a6/floating-chat-styles.css","./releases/edc575be747263a6/floating-chat.js","./releases/edc575be747263a6/game-styles.css","./releases/edc575be747263a6/game-ui.js","./releases/edc575be747263a6/guild-combat.js","./releases/edc575be747263a6/guild-conquest.js","./releases/edc575be747263a6/guilds.js","./releases/edc575be747263a6/i18n-dict.js","./releases/edc575be747263a6/i18n.js","./releases/edc575be747263a6/immersion-styles.css","./releases/edc575be747263a6/landing.css","./releases/edc575be747263a6/landing.js","./releases/edc575be747263a6/login-view.js","./releases/edc575be747263a6/media-admin.js","./releases/edc575be747263a6/media.js","./releases/edc575be747263a6/music-catalog.js","./releases/edc575be747263a6/referrals.js","./releases/edc575be747263a6/remote-combat.js","./releases/edc575be747263a6/robot-offer.js","./releases/edc575be747263a6/robot-picker.js","./releases/edc575be747263a6/robot-sprite.js","./releases/edc575be747263a6/social-admin.js","./releases/edc575be747263a6/social-core.js","./releases/edc575be747263a6/social-styles.css","./releases/edc575be747263a6/social-view.js","./releases/edc575be747263a6/story-map.js","./releases/edc575be747263a6/story-styles.css","./releases/edc575be747263a6/story-view.js","./releases/edc575be747263a6/styles.css","./releases/edc575be747263a6/trading.js","./assets/icon-192.png","./assets/icon-512.png"];
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
