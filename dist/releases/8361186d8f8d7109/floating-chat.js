import {socialConfig,currentId} from './social-core.js';
import {translateDom} from './i18n.js';

const KEY='liferobots-chat-window-v1';
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
export function chatWindowLayout(viewport,mode='window',position={x:1,y:1},config={}){
 const margin=10,width=Math.max(80,Number(viewport.width)||1024),height=Math.max(80,Number(viewport.height)||768),left=Number(viewport.left)||0,top=Number(viewport.top)||0;
 const availableWidth=Math.max(60,width-2*margin),availableHeight=Math.max(54,height-2*margin-Math.max(0,viewport.bottomReserve||0));
 const w=mode==='maximized'?availableWidth:Math.min(availableWidth,mode==='minimized'?220:(config.chatWindowWidth||380));
 const h=mode==='maximized'?availableHeight:Math.min(availableHeight,mode==='minimized'?54:(config.chatWindowHeight||360));
 const minX=left+margin,minY=top+margin,maxX=minX+availableWidth-w,maxY=minY+availableHeight-h;
 return {width:w,height:h,x:mode==='maximized'?minX:minX+clamp(Number(position.x)||0,0,1)*(maxX-minX),y:mode==='maximized'?minY:minY+clamp(Number(position.y)||0,0,1)*(maxY-minY),minX,maxX,minY,maxY};
}
export function chatWindowPosition(rect,x,y){return {x:rect.maxX===rect.minX?0:clamp((x-rect.minX)/(rect.maxX-rect.minX),0,1),y:rect.maxY===rect.minY?0:clamp((y-rect.minY)/(rect.maxY-rect.minY),0,1)};}

export function createFloatingChat(env){
 const doc=env.document||globalThis.document,win=env.window||globalThis.window,storage=env.storage||globalThis.localStorage,root=env.root||doc.querySelector('#chat-root');
 let preferences=null,accountKey='',drag=null,blockClickUntil=0,rendered='',lastChannel=null;const drafts=new Map();
 function load(){const nextKey=KEY+':'+currentId(env.getState());if(accountKey===nextKey&&preferences)return;accountKey=nextKey;const cfg=socialConfig(env.getState());preferences={mode:cfg.chatStartMinimized?'minimized':'closed',position:{x:1,y:1},room:'global'};
  try{const saved=JSON.parse(storage?.getItem(accountKey)||'null');if(saved&&['closed','minimized','window','maximized'].includes(saved.mode)){preferences.mode=saved.mode;if(saved.position&&Number.isFinite(saved.position.x)&&Number.isFinite(saved.position.y))preferences.position={x:clamp(saved.position.x,0,1),y:clamp(saved.position.y,0,1)};if(['global','market','guild'].includes(saved.room))preferences.room=saved.room;}}catch{}
  drafts.clear();lastChannel=null;rendered='';env.view.setRoom(preferences.room);
 }
 const save=()=>{try{storage?.setItem(accountKey,JSON.stringify(preferences));}catch{}};
 function viewport(){const v=win?.visualViewport,w=v?.width||win?.innerWidth||doc.documentElement?.clientWidth||1024,h=v?.height||win?.innerHeight||doc.documentElement?.clientHeight||768,left=v?.offsetLeft||0,top=v?.offsetTop||0,dock=doc.querySelector('.game-dock')?.getBoundingClientRect?.();
  const keyboard=v&&win?.innerHeight&&h<win.innerHeight*.75;
  const reserve=dock&&dock.top>=top&&dock.top<top+h?top+h-dock.top:keyboard?0:84;
  return {width:w,height:h,left,top,bottomReserve:reserve};
 }
 function rect(){return chatWindowLayout(viewport(),preferences.mode,preferences.position,socialConfig(env.getState()));}
 function applyPosition(){const panel=root?.querySelector?.('.chat-float');if(!panel)return;const r=rect();Object.assign(panel.style,{left:r.x+'px',top:r.y+'px',width:r.width+'px',height:r.height+'px'});}
 function focusComposer(){root?.querySelector?.('textarea')?.focus?.({preventScroll:true});}
 function refresh({focus=false,bottom=false}={}){
  if(!root)return;load();const cfg=socialConfig(env.getState()),page=env.getPage();
  root.hidden=preferences.mode==='closed'||page==='login'||page==='chat'||!cfg.chatFloatingEnabled;if(root.hidden){cancelDrag();if(preferences.mode==='closed'){root.innerHTML='';rendered='';}return;}
  const channel=env.view.getChannel(),r=rect(),mode=preferences.mode,oldLog=root.querySelector?.('.chat-messages'),active=doc.activeElement;
  const focused=active?.tagName==='TEXTAREA'&&root.contains?.(active),selection=focused?[active.selectionStart,active.selectionEnd]:null;
  const oldTop=oldLog?.scrollTop||0,stick=bottom||lastChannel!==channel||!oldLog||(oldLog.scrollHeight-oldLog.clientHeight-oldTop<30);
  const title=env.escape(env.view.roomTitle()),body=mode==='minimized'?'':env.view.chatPanel({floating:true,draft:drafts.get(channel)||''});
  const markup=`<aside class="chat-float ${mode==='minimized'?'is-minimized':''} ${mode==='maximized'?'is-maximized':''}" aria-label="Chat flutuante" data-chat-mode="${mode}" style="left:${r.x}px;top:${r.y}px;width:${r.width}px;height:${r.height}px"><header class="chat-float-header"><div class="chat-float-grip no-drag" data-chat-handle tabindex="0" role="group" aria-label="Mover chat. Use as setas do teclado ou arraste." title="Arraste para mover o chat">${env.icon('users')}<span><b>Chat <i></i></b><small>${title}</small></span><span class="chat-drag-dots" aria-hidden="true">⠿</span></div><div class="chat-float-controls">${mode==='minimized'?`<button data-a="floating-chat-open" aria-label="Abrir chat" title="Abrir chat">${env.icon('plus')}</button>`:`<button data-a="floating-chat-minimize" aria-label="Minimizar chat" title="Minimizar chat"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 16h14"/></svg></button>`}<button data-a="floating-chat-maximize" aria-label="${mode==='maximized'?'Restaurar tamanho':'Maximizar chat'}" title="${mode==='maximized'?'Restaurar tamanho':'Maximizar chat'}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${mode==='maximized'?'M8 8h12v12H8Z M4 15V4h11':'M5 9V5h4 M15 5h4v4 M19 15v4h-4 M9 19H5v-4'}"/></svg></button><button class="chat-float-close" data-a="floating-chat-close" aria-label="Fechar chat" title="Fechar chat">${env.icon('close')}</button></div></header>${body}${mode==='minimized'?'':'<div class="chat-float-footnote">Arraste pelo título · Seu hangar continua aqui</div>'}</aside>`;
  if(markup!==rendered){root.innerHTML=markup;translateDom(root);rendered=markup;lastChannel=channel;const log=root.querySelector?.('.chat-messages');if(log)log.scrollTop=stick?log.scrollHeight:oldTop;
   if(focused||focus){const input=root.querySelector?.('textarea');input?.focus?.({preventScroll:true});if(selection)input?.setSelectionRange?.(...selection);}
  }else if(focus)focusComposer();
 }
 function setMode(mode){load();cancelDrag();preferences.mode=mode;save();rendered='';refresh({focus:['window','maximized'].includes(mode),bottom:true});}
 function setRoom(room){load();env.view.setRoom(room);preferences.room=env.view.getRoom();save();refresh({bottom:true});}
 function setDraft(value){load();drafts.set(env.view.getChannel(),String(value));}
 function clearDraft(channel=env.view.getChannel()){drafts.delete(channel);rendered='';refresh({focus:true,bottom:true});}
 function beginDrag(e){const handle=e.target.closest?.('[data-chat-handle]');if(!handle||e.button!=null&&e.button!==0||e.isPrimary===false)return;load();if(preferences.mode==='maximized')return;
  const r=rect();drag={pointerId:e.pointerId,clientX:e.clientX,clientY:e.clientY,x:r.x,y:r.y,original:{...preferences.position},moved:false};root.setPointerCapture?.(e.pointerId);handle.focus?.({preventScroll:true});e.preventDefault();
 }
 function moveDrag(e){if(!drag||e.pointerId!==drag.pointerId)return;const dx=e.clientX-drag.clientX,dy=e.clientY-drag.clientY;if(!drag.moved&&Math.hypot(dx,dy)<5)return;
  drag.moved=true;preferences.position=chatWindowPosition(rect(),drag.x+dx,drag.y+dy);root.classList.add('is-chat-dragging');applyPosition();e.preventDefault();
 }
 function releaseCapture(id){if(root?.hasPointerCapture?.(id))root.releasePointerCapture(id);}
 function endDrag(e){if(!drag||e.pointerId!==drag.pointerId)return;const d=drag;drag=null;if(d.moved){save();blockClickUntil=Date.now()+300;}root.classList.remove('is-chat-dragging');releaseCapture(d.pointerId);rendered='';}
 function cancelDrag(){if(!drag)return;const d=drag;drag=null;preferences.position=d.original;root.classList.remove('is-chat-dragging');releaseCapture(d.pointerId);applyPosition();}
 function blockClick(e){if(Date.now()<blockClickUntil){blockClickUntil=0;e.preventDefault();e.stopImmediatePropagation();}}
 function moveWithKeyboard(e){if(!e.target.closest?.('[data-chat-handle]'))return;load();if(preferences.mode==='maximized')return;const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(!delta)return;const r=rect(),step=e.shiftKey?30:10;preferences.position=chatWindowPosition(r,r.x+delta[0]*step,r.y+delta[1]*step);save();applyPosition();rendered='';e.preventDefault();}
 function resize(){if(!preferences)return;cancelDrag();applyPosition();}
 if(root){root.addEventListener?.('pointerdown',beginDrag);root.addEventListener?.('pointermove',moveDrag);root.addEventListener?.('pointerup',endDrag);root.addEventListener?.('pointercancel',cancelDrag);root.addEventListener?.('lostpointercapture',cancelDrag);root.addEventListener?.('click',blockClick,true);root.addEventListener?.('keydown',moveWithKeyboard);}
 win?.addEventListener?.('resize',resize);win?.visualViewport?.addEventListener?.('resize',resize);win?.visualViewport?.addEventListener?.('scroll',resize);win?.addEventListener?.('blur',cancelDrag);
 load();
 return {refresh,setRoom,setDraft,clearDraft,open:()=>setMode('window'),close:()=>setMode('closed'),minimize:()=>setMode('minimized'),maximize:()=>{load();setMode(preferences.mode==='maximized'?'window':'maximized');},dispose:()=>{cancelDrag();for(const [name,fn] of [['pointerdown',beginDrag],['pointermove',moveDrag],['pointerup',endDrag],['pointercancel',cancelDrag],['lostpointercapture',cancelDrag],['keydown',moveWithKeyboard]])root?.removeEventListener?.(name,fn);root?.removeEventListener?.('click',blockClick,true);win?.removeEventListener?.('resize',resize);win?.visualViewport?.removeEventListener?.('resize',resize);win?.visualViewport?.removeEventListener?.('scroll',resize);win?.removeEventListener?.('blur',cancelDrag);},get mode(){load();return preferences.mode;},get position(){load();return {...preferences.position};}};
}
