// Blobs ficam fora do progresso JSON. Referências são pequenas e persistentes.
const cache=new Map();let scope='demo',dbPromise=null,remote=null;
export const mediaReference=v=>typeof v==='string'&&/^media:[a-zA-Z0-9-]{1,80}$/.test(v);
export function validMediaSource(v){if(!v)return true;if(mediaReference(v))return true;try{return new URL(v).protocol==='https:';}catch{return false;}}
export const mediaUrl=ref=>mediaReference(ref)?cache.get(ref)?.url||'':validMediaSource(ref)?ref:'';
export const mediaItems=kind=>[...cache.values()].filter(x=>!kind||x.kind===kind).sort((a,b)=>b.createdAt-a.createdAt);
function database(){if(!globalThis.indexedDB)throw new Error('Este navegador não permite guardar arquivos.');return dbPromise ||= new Promise((resolve,reject)=>{const req=indexedDB.open('lifebots-media-v1',1);req.onupgradeneeded=()=>req.result.createObjectStore('files',{keyPath:'key'});req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function transact(mode,run){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('files',mode),req=run(tx.objectStore('files'));tx.oncomplete=()=>resolve(req?.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Não foi possível salvar o arquivo.'));});}
export function clearMedia(){for(const r of cache.values())if(r.blob)URL.revokeObjectURL(r.url);cache.clear();}
export function primePublicMedia(records){for(const r of records||[])if(mediaReference(r.ref)&&validMediaSource(r.url))cache.set(r.ref,{...r,createdAt:0});}
export async function loadMedia(owner='demo',adapter=null){clearMedia();scope=owner;remote=adapter;const records=remote?await remote.list():await transact('readonly',s=>s.getAll());for(const r of records){if(!remote&&r.scope!==scope)continue;cache.set(r.ref,{...r,url:r.blob?URL.createObjectURL(r.blob):r.url});}return mediaItems();}
export async function validateMedia(file){
 if(!file||!file.size)throw new Error('Escolha um arquivo válido.');
 const kind=file.type.startsWith('image/')?'image':file.type.startsWith('audio/')?'audio':null;
 const allowed=['image/png','image/jpeg','image/webp','audio/mpeg','audio/ogg','audio/wav','audio/x-wav'];
 if(!kind||!allowed.includes(file.type))throw new Error('Use PNG, JPG, WebP, MP3, OGG ou WAV.');
 if(file.size>(kind==='image'?10:24)*1024*1024)throw new Error(kind==='image'?'A imagem deve ter até 10 MB.':'O áudio deve ter até 24 MB.');
 const h=new Uint8Array(await file.slice(0,16).arrayBuffer()),ascii=(a,b)=>String.fromCharCode(...h.slice(a,b));
 const magic=file.type==='image/png'?h[0]===137&&ascii(1,4)==='PNG':file.type==='image/jpeg'?h[0]===255&&h[1]===216:file.type==='image/webp'?ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP':file.type==='audio/ogg'?ascii(0,4)==='OggS':file.type.includes('wav')?ascii(0,4)==='RIFF'&&ascii(8,12)==='WAVE':ascii(0,3)==='ID3'||h[0]===255&&(h[1]&224)===224;
 if(!magic)throw new Error('O conteúdo do arquivo não corresponde ao formato informado.');
 let dimensions={};if(kind==='image'&&globalThis.createImageBitmap){const b=await createImageBitmap(file);dimensions={width:b.width,height:b.height};b.close();if(dimensions.width>8192||dimensions.height>8192)throw new Error('Reduza a imagem para no máximo 8192 pixels por lado.');}
 if(kind==='audio'&&globalThis.Audio){const url=URL.createObjectURL(file);try{await new Promise((resolve,reject)=>{const a=new Audio();const timer=setTimeout(()=>{a.src='';reject(new Error('O áudio não pôde ser lido.'));},12000);a.onloadedmetadata=()=>{clearTimeout(timer);a.src='';resolve();};a.onerror=()=>{clearTimeout(timer);a.src='';reject(new Error('O áudio não pôde ser lido.'));};a.src=url;});}finally{URL.revokeObjectURL(url);}}
 return {kind,mime:file.type,size:file.size,...dimensions};
}
export async function uploadMedia(file){const details=await validateMedia(file),id=crypto.randomUUID(),ref='media:'+id,record={...details,id,ref,scope,name:file.name.slice(0,120),createdAt:Date.now()};if(remote){const saved=await remote.upload(file,record);cache.set(ref,{...record,...saved});}else{await transact('readwrite',s=>s.put({...record,key:scope+':'+id,blob:file}));cache.set(ref,{...record,blob:file,url:URL.createObjectURL(file)});}return cache.get(ref);}
export function mediaUsed(state,ref){const visit=value=>value===ref||!!value&&typeof value==='object'&&Object.values(value).some(visit);return visit(state);}
export async function deleteMedia(ref,state){const record=cache.get(ref);if(!record)return;if(mediaUsed(state,ref))throw new Error('Este arquivo está em uso. Troque a imagem ou o som antes de remover.');if(remote)await remote.remove(record);else await transact('readwrite',s=>s.delete(scope+':'+record.id));if(record.blob)URL.revokeObjectURL(record.url);cache.delete(ref);}
