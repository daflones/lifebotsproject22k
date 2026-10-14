// Touch conserva a rolagem nativa/inércia. Mouse permite arrastar os painéis e a página.
export function installDragScroll(doc=globalThis.document){let drag=null,blockClick=false;
 function scroller(node){while(node&&node!==doc){if(node.nodeType===1&&(node.scrollHeight>node.clientHeight+3||node.scrollWidth>node.clientWidth+3)){const style=globalThis.getComputedStyle?.(node);if(!style||/(auto|scroll)/.test(style.overflow+style.overflowY+style.overflowX))return node;}node=node.parentElement;}return doc.scrollingElement;}
 const down=e=>{if(e.pointerType!=='mouse'||e.button!==0||e.target.closest?.('input,textarea,select,[contenteditable],.no-drag,[data-chat-handle]'))return;const el=scroller(e.target);if(!el)return;drag={el,x:e.clientX,y:e.clientY,left:el.scrollLeft,top:el.scrollTop,moved:false};};
 const move=e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)<7)return;drag.moved=true;drag.el.scrollLeft=drag.left-dx;drag.el.scrollTop=drag.top-dy;doc.body?.classList.add('is-drag-scrolling');e.preventDefault();};
 const up=()=>{if(drag?.moved)blockClick=Date.now()+250;drag=null;doc.body?.classList.remove('is-drag-scrolling');};
 const cancel=()=>{drag=null;blockClick=false;doc.body?.classList.remove('is-drag-scrolling');};
 const click=e=>{if(blockClick&&Date.now()<=blockClick){blockClick=false;e.preventDefault();e.stopImmediatePropagation();}};
 doc.addEventListener('pointerdown',down,{passive:true});doc.addEventListener('pointermove',move,{passive:false});doc.addEventListener('pointerup',up);doc.addEventListener('pointercancel',cancel);doc.addEventListener('click',click,true);
 return ()=>{cancel();doc.removeEventListener('pointerdown',down);doc.removeEventListener('pointermove',move);doc.removeEventListener('pointerup',up);doc.removeEventListener('pointercancel',cancel);doc.removeEventListener('click',click,true);};
}
