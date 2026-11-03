'use strict';
const switches=[...document.querySelectorAll('[data-skill]')];
switches.forEach(button=>button.addEventListener('click',()=>{switches.forEach(b=>{const selected=b===button;b.classList.toggle('is-active',selected);b.setAttribute('aria-pressed',String(selected));document.getElementById('skill-panel-'+b.dataset.skill).hidden=!selected;});}));
const filters=[...document.querySelectorAll('.work__item')];
const carousel=document.querySelector('.work-carousel'),viewport=document.querySelector('.work-viewport'),track=document.querySelector('.work-track'),group=document.querySelector('.work-group');
const originalCards=[...group.querySelectorAll('.work__card')];
const pauseButton=document.getElementById('work-toggle');
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let manualPaused=false,hovered=false,focused=false,visible=false,loopWidth=0,position=0,previousTime=0,frame=0,selectedFilter='all',matchingCount=0;
function inertClone(node){const copy=node.cloneNode(true);copy.setAttribute('aria-hidden','true');copy.setAttribute('inert','');copy.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));copy.querySelectorAll('a,button').forEach(e=>e.tabIndex=-1);return copy;}
function syncPause(){const stopped=manualPaused||reduceMotion.matches;pauseButton.textContent=reduceMotion.matches?'Motion reduced':(stopped?'Resume motion':'Pause motion');pauseButton.setAttribute('aria-pressed',String(stopped));pauseButton.disabled=matchingCount<2||reduceMotion.matches;}
function rebuild(){
 track.querySelectorAll(':scope > .work-group').forEach(e=>{if(e!==group)e.remove();});
 const matching=originalCards.filter(card=>selectedFilter==='all'||card.matches(selectedFilter));matchingCount=matching.length;
 group.replaceChildren(...matching);originalCards.forEach(card=>card.hidden=false);
 if(matchingCount>1&&!reduceMotion.matches){
  // Make the repeat wider than the viewport so short categories loop seamlessly.
  let cycles=0;
  while(group.scrollWidth<viewport.clientWidth+300&&cycles++<8)matching.forEach(card=>group.append(inertClone(card)));
  track.append(inertClone(group));
 }
 loopWidth=matchingCount>1&&!reduceMotion.matches?group.getBoundingClientRect().width:0;
 position=0;viewport.scrollLeft=0;previousTime=0;carousel.classList.toggle('is-single',matchingCount===1);
 document.getElementById('work-prev').disabled=matchingCount<2;document.getElementById('work-next').disabled=matchingCount<2;
 syncPause();
 const label=filters.find(b=>b.dataset.filter===selectedFilter)?.textContent.trim()||'All';
 document.getElementById('work-status').textContent=`${matchingCount} ${matchingCount===1?'project':'projects'} · ${label}`;
}
filters.forEach(button=>button.addEventListener('click',()=>{selectedFilter=button.dataset.filter;filters.forEach(b=>{b.classList.toggle('active-work',b===button);b.setAttribute('aria-pressed',String(b===button));});rebuild();}));
function animate(now){const delta=previousTime?Math.min(now-previousTime,40):0;previousTime=now;
 if(loopWidth&&visible&&!manualPaused&&!hovered&&!focused&&!reduceMotion.matches&&!document.hidden){position=(position+delta*.022)%loopWidth;viewport.scrollLeft=position;}
 else position=viewport.scrollLeft;
 frame=requestAnimationFrame(animate);
}
pauseButton.addEventListener('click',()=>{manualPaused=!(manualPaused||reduceMotion.matches);if(reduceMotion.matches&&!manualPaused){pauseButton.textContent='Motion reduced';return;}syncPause();});
viewport.addEventListener('pointerenter',()=>hovered=true);viewport.addEventListener('pointerleave',()=>hovered=false);
viewport.addEventListener('focusin',()=>focused=true);viewport.addEventListener('focusout',e=>focused=viewport.contains(e.relatedTarget));
viewport.addEventListener('pointerdown',()=>{manualPaused=true;syncPause();});
viewport.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){manualPaused=true;syncPause();}});
viewport.addEventListener('scroll',()=>{if(manualPaused||hovered||focused)position=viewport.scrollLeft;},{passive:true});
function step(direction){manualPaused=true;syncPause();const amount=(originalCards[0]?.getBoundingClientRect().width||282)+18;let target=viewport.scrollLeft+direction*amount;if(loopWidth)target=(target+loopWidth)%loopWidth;viewport.scrollTo({left:target,behavior:reduceMotion.matches?'instant':'smooth'});}
document.getElementById('work-prev').addEventListener('click',()=>step(-1));document.getElementById('work-next').addEventListener('click',()=>step(1));
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{threshold:.05}).observe(carousel);
reduceMotion.addEventListener('change',rebuild);
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(rebuild,150);});
rebuild();frame=requestAnimationFrame(animate);
