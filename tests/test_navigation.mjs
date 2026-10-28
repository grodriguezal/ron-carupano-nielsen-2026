import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const page=read('index.html');
const app=read('app.js');
const strategic=read('strategic-intelligence.js');
const regional=read('regional-intelligence.js');
const navPages=[...page.matchAll(/class="nav-button[^"]*"\s+data-page="([^"]+)"/g)].map(x=>x[1]);
assert.equal(navPages.length,8,'Eight interactive navigation sections must be present');
assert.ok(navPages.includes('regional'),'Regional intelligence must be in the menu');
assert.ok(!navPages.includes('strategy'),'Retired scenarios must not reappear');
assert.ok(page.includes('app.js?v='),'Versioned app.js required to prevent stale menu and code');
assert.ok(app.includes('regional-intelligence.js?v='),'Versioned regional module import required');

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
 app.replace(/^(?:import[^\n]*\n)+/,'').replace(/main\(\);\s*$/, ''),
 'globalThis.__state=state; globalThis.__loaded=main();'
].join('\n');
const context={document,window,fetch,console};
vm.runInNewContext(program,context,{filename:'dashboard-navigation-smoke.js'});
await context.__loaded;

assert.equal(context.__state.rows.length,779);
assert.equal(events.size>=navPages.length,true,'Navigation must register click listeners');
for(const target of ['regional','competition','strategic','overview']){
 const onClick=events.get('nav:'+target+':click');
 assert.equal(typeof onClick,'function','Click listener missing: '+target);
 onClick();
 assert.equal(context.__state.page,target,'Click must switch section: '+target);
 assert.equal(window.location.hash,target,'Browser URL hash must follow section');
 assert.ok(element('view').innerHTML.length>1000,'Section must render visible content');
 if(target==='regional'){
  assert.ok(element('view').innerHTML.includes('INTELIGENCIA COMPETITIVA GEOGRÁFICA'));
  assert.ok(element('view').innerHTML.includes('regionTopChart'));
 }
}
window.location.hash='#regional';
events.get('window:hashchange')();
assert.equal(context.__state.page,'regional');
assert.ok(element('view').innerHTML.includes('INTELIGENCIA COMPETITIVA GEOGRÁFICA'));
console.log('Navigation passed: all eight buttons, regional click, content and deep links.');
