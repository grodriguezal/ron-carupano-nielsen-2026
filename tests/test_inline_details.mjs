import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const app=read('app.js'),strategic=read('strategic-intelligence.js'),regional=read('regional-intelligence.js'),advanced=read('advanced-intelligence.js');
assert.ok(strategic.includes('data-inline-market'));
assert.ok(regional.includes('data-inline-market'));
assert.ok(advanced.includes('data-mi-segment'));
for(const old of ['data-inspect-market','data-regional-rivals','data-region-market']){
 assert.ok(!app.includes(old),'Jump-based handler still present: '+old);
}
const buttons=[];
const removed=[];
const rows=[];
const doc={
 getElementById:()=>null,
 querySelectorAll(selector){
  if(selector.includes('[data-inline-market]') || selector.includes('[data-mi-segment]'))return buttons;
  if(selector.includes('tr.inline-detail-row'))return rows;
  return [];
 }
};
const program=app.replace(/^(?:import[^\n]*\n)+/,'').replace(/main\(\);\s*$/,'')+';globalThis.__testAPI={state,marketInlineHTML,segmentInlineHTML,bindInlineDetails};';
const sandbox={document:doc,console};
vm.runInNewContext(program,sandbox,{filename:'inline-views.js'});
const api=sandbox.__testAPI;
api.state.rows=JSON.parse(read('data/market-brand.json'));
api.state.portfolio=JSON.parse(read('data/portfolio.json'));
api.state.market='Total Venezuela1';
for(const market of ['Capital Autoservicio1*','Total Licorerias1*','Andes+Occidente Tradicional1*']){
 const html=api.marketInlineHTML(market);
 assert.ok(html.includes('DETALLE DESPLEGADO EN ESTA TABLA'));
 assert.ok(html.includes('Cinco competidores con mayor participación'));
 assert.ok(html.includes('colspan="6"'));
 assert.ok(html.includes('Cómo interpretar'));
}
const segment=api.segmentInlineHTML('SUPER PREMIUM');
assert.ok(segment.includes('COMPARACIÓN EN ESTA MISMA TABLA'));
assert.ok(segment.includes('14,67'));
assert.ok(segment.includes('colspan="7"'));
const row={
 insertAdjacentHTML(_position,html){
  rows.push({html,remove(){removed.push(html);rows.splice(rows.indexOf(this),1)}});
 }
};
function makeButton(dataset){
 const attrs={'aria-expanded':'false'};
 return {
  dataset,textContent:'Ver detalle aquí ▾',addEventListener(_,callback){this.onclick=callback},
  closest(tag){return tag==='tr'?row:null},
  getAttribute(name){return attrs[name]},
  setAttribute(name,value){attrs[name]=value}
 };
}
const button=makeButton({inlineMarket:'Capital Autoservicio1*'});
buttons.push(button);
api.bindInlineDetails();
assert.equal(typeof button.onclick,'function');
button.onclick();
assert.equal(button.getAttribute('aria-expanded'),'true');
assert.equal(button.textContent,'Ocultar detalle ▴');
assert.equal(rows.length,1);
assert.ok(rows[0].html.includes('Capital'));
button.onclick();
assert.equal(button.getAttribute('aria-expanded'),'false');
assert.equal(rows.length,0);
assert.equal(removed.length,1);
buttons.splice(0,buttons.length,makeButton({miSegment:'SUPER PREMIUM'}));
api.bindInlineDetails();
buttons[0].onclick();
assert.ok(rows[0].html.includes('SUPER PREMIUM'));
assert.ok(rows[0].html.includes('colspan="7"'));
console.log('Inline market and segment details open/close in place, without route changes.');
