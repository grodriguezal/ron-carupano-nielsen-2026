import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const page=read('index.html');
const app=read('app.js');
const strategic=read('strategic-intelligence.js');
const regional=read('regional-intelligence.js');
const advanced=read('advanced-intelligence.js');
const navPages=[...page.matchAll(/class="nav-button[^"]*"\s+data-page="([^"]+)"/g)].map(x=>x[1]);
assert.equal(navPages.length,13,'All thirteen navigation sections must be present');
assert.ok(navPages.includes('regional'),'Regional intelligence must be in the menu');
for(const page of ['segments','premium','value','distributionMatrix','movements'])assert.ok(navPages.includes(page),'Missing advanced navigation: '+page);
assert.ok(!navPages.includes('strategy'),'Retired scenarios must not reappear');
assert.ok(!navPages.includes('formats'),'Retired formats dashboard must not appear in navigation');
assert.ok(!app.includes('formats:advancedPage'),'Retired formats route must not remain');
assert.ok(page.includes('app.js?v='),'Versioned app.js required to prevent stale menu and code');
assert.ok(app.includes('regional-intelligence.js?v='),'Versioned regional module import required');
assert.ok(app.includes('advanced-intelligence.js?v='),'Versioned advanced module import required');

const events=new Map();
const nodes=new Map();
function element(id){
 if(!nodes.has(id))nodes.set(id,{
  id,innerHTML:'',textContent:'',value:'',dataset:{},style:{},
  classList:{toggle(){}},
  addEventListener(name,callback){events.set(id+':'+name,callback)},
  closest(){return {style:{}}},
  insertAdjacentHTML(_placement,html){this.innerHTML+=html}
 });
 return nodes.get(id);
}
const buttons=navPages.map(id=>({
 dataset:{page:id},classList:{toggle(){}},
 addEventListener(name,callback){events.set('nav:'+id+':'+name,callback)}
}));
const document={
 getElementById:element,
 querySelectorAll(selector){return selector==='.nav-button'?buttons:[]}
};
const window={
 echarts:null,location:{hash:''},
 addEventListener(name,callback){events.set('window:'+name,callback)},
 scrollTo(){},print(){}
};
const payload={
 'data/market-brand.json':JSON.parse(read('data/market-brand.json')),
 'data/portfolio.json':JSON.parse(read('data/portfolio.json')),
 'data/metadata.json':JSON.parse(read('data/metadata.json'))
};
const fetch=async path=>({ok:!!payload[path],json:async()=>payload[path]});
const program=[
 strategic.replace(/^export /,''),
 regional.replace(/^export /,''),
 advanced.replace(/^export /,''),
 app.replace(/^(?:import[^\n]*\n)+/,'').replace(/main\(\);\s*$/, ''),
 'globalThis.__state=state; globalThis.__metricFunctions={insights,readerNarrative,distributionDiagnosis,render}; globalThis.__loaded=main();'
].join('\n');
const context={document,window,fetch,console};
vm.runInNewContext(program,context,{filename:'dashboard-navigation-smoke.js'});
await context.__loaded;

assert.equal(context.__state.rows.length,779);
assert.equal(events.size>=navPages.length,true,'Navigation must register click listeners');
for(const target of ['regional','segments','premium','value','distributionMatrix','movements','competition','strategic','overview']){
 const onClick=events.get('nav:'+target+':click');
 assert.equal(typeof onClick,'function','Click listener missing: '+target);
 onClick();
 assert.equal(context.__state.page,target,'Click must switch section: '+target);
 assert.equal(window.location.hash,target,'Browser URL hash must follow section');
 assert.ok(element('view').innerHTML.length>1000,'Section must render visible content');
 if(target==='competition'){
  assert.ok(!element('view').innerHTML.includes('scatterPlot'),'Eliminar matriz de puntos confusa en comparativa de marcas');
  assert.ok(element('view').innerHTML.includes('¿Quién lidera el mercado'),'Mostrar ranking de marcas completo');
 }
 if(target==='regional'){
  assert.ok(element('view').innerHTML.includes('INTELIGENCIA COMPETITIVA GEOGRÁFICA'));
  assert.ok(element('view').innerHTML.includes('regionTopChart'));
 }
}
window.location.hash='#regional';
events.get('window:hashchange')();
assert.equal(context.__state.page,'regional');
assert.ok(element('view').innerHTML.includes('INTELIGENCIA COMPETITIVA GEOGRÁFICA'));
window.location.hash='#formats';
events.get('window:hashchange')();
assert.equal(context.__state.page,'overview','Old formats links must redirect to executive overview');
assert.equal(window.location.hash,'overview');

const metrics=['value','volume','numeric_distribution','weighted_distribution'];
let checked=0;
for(const market of payload['data/metadata.json'].markets){
 for(const metric of metrics){
  context.__state.page='overview';
  context.__state.market=market;
  context.__state.metric=metric;
  context.__metricFunctions.render();
  const html=element('view').innerHTML;
  const notes=context.__metricFunctions.insights(market,metric);
  assert.equal(notes.length,3,market+' '+metric+': three metric-specific insights');
  assert.ok(notes.every(n=>n.title&&n.body&&!/undefined|NaN/.test(n.title+n.body)),market+' '+metric+': valid insights');
  assert.ok(html.includes(notes[0].title),'Selected metric must appear in insight title: '+market+' '+metric);
  assert.ok(html.includes(notes[1].title),'Comparison headline must match selected metric: '+market+' '+metric);
  assert.ok(html.includes('2025 completo')&&html.includes('2026 hasta septiembre'),'Both periods and metric table should render');
  if(metric.endsWith('distribution')){
   assert.ok(notes[1].body.includes('puede vender varias marcas'),'Distribution overlap must be explained');
   assert.ok(!/juntas representan|reúnen el|participación conjunta/i.test(notes[1].title+' '+notes[1].body),'Must never sum brand distributions');
   assert.ok(notes[2].body.includes('Distribución numérica:')&&notes[2].body.includes('ponderada:'),'Both distribution differences must be stated');
   assert.ok(!html.includes('181,19 % del valor'),'Impossible combined distribution must never appear');
  }else{
   assert.ok(notes[1].title.includes(metric==='value'?'valor':'volumen'),'Competition concentration must use correct denominator');
  }
  checked++;
 }
}
const num=context.__metricFunctions.insights('Total Venezuela1','numeric_distribution');
const weighted=context.__metricFunctions.insights('Total Venezuela1','weighted_distribution');
assert.ok(num[0].body.includes('10,68 %'),'National numeric distribution correctly sourced');
assert.ok(weighted[0].body.includes('72,25 %'),'National weighted distribution correctly sourced');
assert.notEqual(num[1].body,weighted[1].body,'Changing metric changes competitor analysis');
assert.notEqual(num[2].action,weighted[2].action,'Changing distribution metric changes follow-up investigation');
const liquor=context.__metricFunctions.distributionDiagnosis(payload['data/market-brand.json'].find(x=>x.market==='Total Licorerias1*'&&x.brand==='CARUPANO'));
const capital=context.__metricFunctions.distributionDiagnosis(payload['data/market-brand.json'].find(x=>x.market==='Capital Tradicional1*'&&x.brand==='CARUPANO'));
assert.equal(liquor.title,'Más tiendas, menor distribución ponderada');
assert.equal(capital.title,'Menos tiendas, mayor distribución ponderada');
assert.ok(!app.includes('Santa Teresa y Cacique reúnen el'),'Old metric-mismatched headline must be gone');
console.log('Metric consistency: '+checked+' metric×market views, overlapping distributions and two opposing-signal cases validated.');

console.log('Navigation passed: 13 sections, five advanced dashboards, regional routing and deep links.');
