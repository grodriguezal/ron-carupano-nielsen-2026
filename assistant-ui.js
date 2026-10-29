import {answerQuestion,parseQuestion} from './assistant-core.js?v=20261029-v2';
import {ASSISTANT_WORKER_URL} from './assistant-config.js?v=20261029-v1';

const samples=[
 '¿Cómo estamos frente a Santa Teresa en Caracas?',
 '¿Dónde cayó más la distribución ponderada?',
 '¿Cuáles son nuestras oportunidades comerciales?',
 '¿Quién lidera Super Premium en Venezuela?'
];
const trigger=document.createElement('button');
trigger.id='assistantOpen';
trigger.className='assistant-launch';
trigger.type='button';
trigger.textContent='✦ Preguntar a Nielsen';
trigger.setAttribute('aria-controls','assistantDrawer');
trigger.setAttribute('aria-expanded','false');
const target=document.querySelector('.top-actions');
if(target)target.prepend(trigger);
const overlay=document.createElement('div');
overlay.className='assistant-backdrop';
overlay.hidden=true;
document.body.appendChild(overlay);
const panel=document.createElement('aside');
panel.id='assistantDrawer';
panel.className='assistant-drawer';
panel.hidden=true;
panel.setAttribute('role','dialog');
panel.setAttribute('aria-modal','true');
panel.setAttribute('aria-labelledby','assistantTitle');
panel.innerHTML=
 '<header class="assistant-header"><div><p>CARÚPANO MARKET INTELLIGENCE</p><h2 id="assistantTitle">✦ Pregunta a Nielsen</h2><span id="assistantMode">Consultas gratuitas basadas en datos</span></div><button id="assistantClose" type="button" aria-label="Cerrar asistente">×</button></header>'+
 '<div id="assistantConversation" class="assistant-conversation" role="log" aria-live="polite"><div class="assistant-intro"><strong>Explora los datos sin navegar por 13 secciones.</strong><p>Pregunta por marcas, mercados, distribución y oportunidades. Las cifras se calculan localmente, sin enviarlas a la IA.</p></div><div id="assistantSuggestions" class="assistant-suggestions"></div></div>'+
 '<form id="assistantForm" class="assistant-form"><label for="assistantQuestion" class="assistant-label">TU PREGUNTA</label><div class="assistant-input-row"><textarea id="assistantQuestion" rows="2" maxlength="350" placeholder="Ej. Compara nuestra distribución con Cacique en Caracas" required></textarea><button id="assistantSend" type="submit">Enviar</button></div><p class="assistant-fineprint">NielsenIQ · 2025 completo vs. ene–sep 2026. Son ventanas de duración distinta. Los cortes pueden solaparse.</p></form>';
document.body.appendChild(panel);
const $=id=>document.getElementById(id);
const log=$('assistantConversation'),input=$('assistantQuestion'),send=$('assistantSend');
let cache=null, previous={}, lastFocus=null, busy=false;
function el(tag,cls,text){
 const e=document.createElement(tag);
 if(cls)e.className=cls;
 if(text!=null)e.textContent=text;
 return e;
}
function scrollBottom(){log.scrollTop=log.scrollHeight;}
function bubble(role,title,body){
 const box=el('div','assistant-message '+role);
 if(title)box.append(el('strong','assistant-message-title',title));
 if(body)box.append(el('p','',body));
 log.append(box);scrollBottom();return box;
}
function showSuggestions(){
 const target=$('assistantSuggestions');
 for(const q of samples){
  const button=el('button','assistant-suggestion',q);
  button.type='button';
  button.addEventListener('click',()=>ask(q));
  target.append(button);
 }
}
function open(){
 lastFocus=document.activeElement;
 overlay.hidden=false; panel.hidden=false; trigger.setAttribute('aria-expanded','true');
 document.body.classList.add('assistant-no-scroll');
 input.focus();
}
function close(){
 overlay.hidden=true; panel.hidden=true; trigger.setAttribute('aria-expanded','false');
 document.body.classList.remove('assistant-no-scroll');
 (lastFocus||trigger).focus();
}
trigger.addEventListener('click',open);
$('assistantClose').addEventListener('click',close);
overlay.addEventListener('click',close);
document.addEventListener('keydown',e=>{
 if(panel.hidden)return;
 if(e.key==='Escape'){e.preventDefault();close();}
 if(e.key==='Tab'){
  const focusable=Array.from(panel.querySelectorAll('button:not([disabled]), textarea:not([disabled]), a[href]'));
  const first=focusable[0],last=focusable[focusable.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 }
});
showSuggestions();
function setMode(){
 $('assistantMode').textContent=ASSISTANT_WORKER_URL?'IA para interpretar · cifras verificadas localmente':'Modo local gratuito · cifras verificadas';
}
setMode();
async function loadData(){
 if(cache)return cache;
 const [rows,portfolio,meta]=await Promise.all([
  fetch('data/market-brand.json').then(r=>{if(!r.ok)throw new Error('datos de marcas');return r.json();}),
  fetch('data/portfolio.json').then(r=>{if(!r.ok)throw new Error('datos de segmentos');return r.json();}),
  fetch('data/metadata.json').then(r=>{if(!r.ok)throw new Error('metadatos');return r.json();})
 ]);
 if(!Array.isArray(rows)||!Array.isArray(portfolio)||!Array.isArray(meta.markets))throw Error('Formato de datos incorrecto');
 cache={rows,portfolio,meta};return cache;
}
async function aiPlan(question,meta){
 if(!ASSISTANT_WORKER_URL)return null;
 const url=new URL(ASSISTANT_WORKER_URL);
 if(url.protocol!=='https:')throw new Error('Configuración insegura');
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),9000);
 try{
  const res=await fetch(url.toString(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,markets:meta.markets,brands:meta.brands,previous}),signal:controller.signal});
  if(!res.ok)throw new Error('Servicio no disponible');
  const data=await res.json();
  return data.plan||null;
 }finally{clearTimeout(timeout);}
}
function drawAnswer(a,mode){
 const box=el('article','assistant-message assistant-answer');
 box.append(el('strong','assistant-message-title',a.title));
 for(const paragraph of a.body){
  box.append(el('p','assistant-answer-line',paragraph));
 }
 box.append(el('small','assistant-source',a.source));
 const footer=el('div','assistant-answer-footer');
 const link=el('a','assistant-source-link','Abrir gráfico relacionado ↗');
 link.href=a.link;
 link.addEventListener('click',close);
 footer.append(link,el('span','assistant-mode-label',mode));
 box.append(footer);log.append(box);scrollBottom();
}
async function ask(raw){
 const question=String(raw||'').trim();
 if(!question||busy)return;
 busy=true;send.disabled=true;input.value='';
 const suggestionBox=$('assistantSuggestions');
 if(suggestionBox)suggestionBox.hidden=true;
 bubble('user',null,question);
 const loading=bubble('assistant-loading',null,'Consultando datos…');
 try{
  const {rows,portfolio,meta}=await loadData();
  let plan=null,mode='Análisis local · sin costes de API';
  if(ASSISTANT_WORKER_URL){
   try{plan=await aiPlan(question,meta);if(plan)mode='IA para interpretar · cálculo local';}
   catch{mode='IA no disponible · análisis local';}
  }
  const answer=answerQuestion(rows,portfolio,meta,question,plan,previous);
  previous=answer.plan;
  loading.remove();
  drawAnswer(answer,mode);
 }catch(e){
  loading.remove();
  bubble('assistant-error','No pude cargar las cifras','No hay conexión con los archivos del dashboard. Actualiza la página y prueba de nuevo. No se han inventado resultados.');
 }finally{busy=false;send.disabled=false;input.focus();}
}
$('assistantForm').addEventListener('submit',e=>{e.preventDefault();ask(input.value);});
input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask(input.value);}});
