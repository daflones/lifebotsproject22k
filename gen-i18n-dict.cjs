/* Gera src/i18n-dict.js traduzindo missing-strings.txt via endpoint público. Uso: node gen-i18n-dict.cjs */
const fs=require('fs');
const strings=fs.readFileSync('missing-strings.txt','utf8').split('\n').map(s=>s.trim()).filter(Boolean);
const LANGS=['en','es','ru','ja'];
const OUT='i18n-dict.json';
let done={};
try{done=JSON.parse(fs.readFileSync(OUT,'utf8'));}catch{}
async function batch(lang,items,attempt=0){
 const qs=items.map(s=>'q='+encodeURIComponent(s)).join('&');
 const url='https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=pt&tl='+lang+'&'+qs;
 try{
  const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'},signal:AbortSignal.timeout(20000)});
  if(!r.ok)throw new Error('HTTP '+r.status);
  const j=await r.json();
  if(!Array.isArray(j)||j.length!==items.length)throw new Error('shape');
  return j.map(x=>Array.isArray(x)?x.join(''):String(x));
 }catch(e){
  if(attempt<4){await new Promise(r=>setTimeout(r,1500*(attempt+1)));return batch(lang,items,attempt+1);}
  if(items.length>1){const mid=Math.ceil(items.length/2);const a=await batch(lang,items.slice(0,mid));const b=await batch(lang,items.slice(mid));return [...a,...b];}
  console.log('FAIL',lang,JSON.stringify(items[0]),e.message);return [items[0]];
 }
}
(async()=>{
 const CH=25;
 for(const lang of LANGS){
  for(let i=0;i<strings.length;i+=CH){
   const items=strings.slice(i,i+CH);
   const pending=items.filter(s=>!(done[s]&&done[s][lang]));
   if(!pending.length)continue;
   const tr=await batch(lang,pending);
   pending.forEach((s,k)=>{done[s]=done[s]||{};done[s][lang]=tr[k];});
   process.stdout.write(lang+' '+i+'/'+strings.length+'\r');
   if(i%125===0)fs.writeFileSync(OUT,JSON.stringify(done));
  }
  console.log(lang,'done');
 }
 fs.writeFileSync(OUT,JSON.stringify(done));
 let bad=0;const rows=[];
 for(const s of strings){
  const t=done[s]||{};
  const row=[s,t.en||s,t.es||s,t.ru||s,t.ja||s];
  if(row.slice(1).some(v=>!v||v===s))bad++;
  rows.push(row);
 }
 const esc=s=>JSON.stringify(s);
 const body='/* Gerado por gen-i18n-dict.cjs — traduções automáticas do catálogo PT. Revisões manuais vencem por estarem antes no TABLE. */\nexport const EXTRA_TABLE=[\n'+rows.map(r=>'['+r.map(esc).join(',')+'],').join('\n')+'\n];\n';
 fs.writeFileSync('src/i18n-dict.js',body);
 console.log('rows',rows.length,'fallbacks',bad);
})();
