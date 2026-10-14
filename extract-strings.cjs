const fs=require('fs'),path=require('path');
const files=fs.readdirSync('src').filter(f=>f.endsWith('.js')&&f!=='i18n.js'&&f!=='i18n-dict.js');
const strings=new Map();
const add=(s,f)=>{s=String(s).replace(/\s+/g,' ').trim();if(plausible(s)){if(!strings.has(s))strings.set(s,new Set());strings.get(s).add(f);}};
const QUOTED=/(['"])((?:\\.|(?!\1)[^\\\n])*)\1/g;
const TAGTEXT=/>\s*([^<>`'"{}\s][^<>`"{}]*?)\s*</g;
const ATTR=/(?:aria-label|placeholder|title|alt)=(['"])((?!\1)[^"'<>]{2,200})\1/g;
const WORD=/[A-Za-zÀ-ÿ]/;
const ACCENT=/[áéíóúâêôãõçàüÁÉÍÓÚÂÊÔÃÕÇÀÜ]/;
const PT_WORD=/\b(de|da|do|das|dos|em|no|na|nos|nas|um|uma|com|sem|para|por|pelo|pela|seu|sua|seus|suas|você|não|é|são|ou|que|mais|muito|já|só|agora|aqui|após|até|este|esta|isso|ele|ela|nós|quando|onde|como|sobre|entre|cada|todos|todas|outro|outra|algum|alguma|nenhum|nenhuma|novo|nova|mesmo|mesma|grande|pequeno|pequena|melhor|pior|antes|depois|ainda|também|então|porque|pois|caso|vez|vezes|dia|dias|próximo|próxima|anterior|primeiro|primeira|último|última|receba|receber|use|usar|ganhe|ganhar|pode|precisa|deve|quer|faça|clique|toque|veja|ver|mostrar|ocultar|abrir|fechar|entrar|sair|criar|salvar|editar|remover|enviar|copiar|compartilhar|convidar|equipar|evoluir|coletar|resgatar|explorar|buscar|encontrar|começar|iniciar|continuar|voltar|avançar|confirmar|cancelar|concluir|finalizar|escolha|selecione|informe|aguarde|disponível|bloqueado|concluído|expirado|pendente|grátis|gratuito)\b/i;
function plausible(t){
 if(!t||t.length<2||t.length>400)return false;
 if(!WORD.test(t))return false;
 if(/^(https?|data|blob|file|wss?|mailto|tel):/i.test(t))return false;
 if(/[{}<>@$`\\]|=|\(|\)|\[|\]|;|^#|^\.\w|!important/i.test(t))return false;
 if(/^[Mm][0-9]/.test(t))return false;
 if(/\.(js|css|mjs|ts|png|jpe?g|webp|svg|gif|mp3|ogg|wav|ico|json|html?|woff2?|map|env|md|txt|ya?ml|sh|bat|ps1)\b/i.test(t))return false;
 if(/^\d[\d\s.,%:/-]*$/.test(t))return false;
 const words=t.split(' ').filter(Boolean);
 const allLowerCss=words.length>=2&&words.every(w=>/^[a-z][a-z0-9-]*$/.test(w));
 if(allLowerCss&&!PT_WORD.test(t)&&!ACCENT.test(t))return false;
 if(!/ /.test(t)&&!ACCENT.test(t)&&!/^[A-ZÁÉÍÓÚÂÊÔÃÕÇÀ]/.test(t))return false;
 if(/^[a-z_$][\w$]*(\.[a-z_$][\w$]*)+$/.test(t))return false;
 if(/^[a-z]+([A-Z][a-z0-9]*)+$/.test(t))return false;
 if(/^[A-Z0-9_]+$/.test(t))return false;
 if(!ACCENT.test(t)&&!PT_WORD.test(t))return false;
 return true;
}
for(const f of files){
 const code=fs.readFileSync(path.join('src',f),'utf8');
 let m;
 while(m=QUOTED.exec(code))add(m[2],f);
 while(m=TAGTEXT.exec(code))add(m[1],f);
 while(m=ATTR.exec(code))add(m[2],f);
}
const i18n=fs.readFileSync('src/i18n.js','utf8')+(fs.existsSync('src/i18n-dict.js')?fs.readFileSync('src/i18n-dict.js','utf8'):'');
const missing=[...strings.keys()].filter(s=>!i18n.includes(s)).sort((a,b)=>a.localeCompare(b,'pt'));
console.log('candidates',strings.size,'missing',missing.length);
fs.writeFileSync('missing-strings.txt',missing.join('\n'));
