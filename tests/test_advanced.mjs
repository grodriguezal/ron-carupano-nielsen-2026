import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildAdvancedView} from '../advanced-intelligence.js';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const rows=read('data/market-brand.json'), portfolio=read('data/portfolio.json'), meta=read('data/metadata.json');
const pages=['segments','premium','value','distributionMatrix','formats','movements'];
for(const market of meta.markets){
 for(const page of pages){
  const r=buildAdvancedView(rows,portfolio,page,market,'SUPER PREMIUM','CARUPANO');
  assert.equal(r.page,page);
  assert.equal(r.market,market);
  assert.equal(r.charts.length,2,page+' must render two charts');
  assert.ok(r.html.includes('LECTURA EJECUTIVA'),page+': plain-language explanation missing');
  assert.ok(r.html.includes('Cómo interpretar'),page+': methodology note missing');
  assert.ok(!r.html.includes('NaN'),page+': NaN shown');
  assert.ok(!r.html.includes('undefined'),page+': undefined shown');
  assert.ok(r.charts.every(x=>r.html.includes('id="'+x.id+'"')),page+': unmatched chart');
  assert.ok(!/Presupuesto para 2027|Simulador 2027|ROI calculado/.test(r.html));
 }
}
const nation='Total Venezuela1';
const segments=buildAdvancedView(rows,portfolio,'segments',nation);
assert.ok(Math.abs(segments.meta.categoryTotal2025-100)<.01);
assert.ok(Math.abs(segments.meta.categoryTotal2026-100)<.01);
assert.ok(Math.abs(segments.meta.standardShare-62.4091)<0.00001);
const premium=buildAdvancedView(rows,portfolio,'premium',nation,'SUPER PREMIUM');
assert.equal(premium.meta.carRank,2);
assert.equal(premium.meta.regionalRows,8);
assert.ok(Math.abs(premium.meta.carShare-14.6737759844)<0.000001);
const value=buildAdvancedView(rows,portfolio,'value',nation);
assert.ok(Math.abs(value.meta.carIndex-122.56080979)<.00001);
assert.ok(value.html.includes('No equivale a un precio por botella'));
const distribution=buildAdvancedView(rows,portfolio,'distributionMatrix',nation);
assert.equal(distribution.meta.marketCount,21);
assert.equal(distribution.meta.negativeBoth,12);
const formats=buildAdvancedView(rows,portfolio,'formats',nation,'STANDARD');
assert.ok(formats.meta.reconciliation<=.0005);
assert.ok(Math.abs(formats.meta.change700-1.8554)<.00001);
assert.ok(Math.abs(formats.meta.change750+2.7633)<.00001);
const movement=buildAdvancedView(rows,portfolio,'movements',nation);
assert.equal(movement.meta.largestGainer,'SANTA TERESA');
assert.ok(Math.abs(movement.meta.carDelta+0.9079)<.000001);
const alternate=buildAdvancedView(rows,portfolio,'premium','Andes+Occidente Autoservicio1*','STANDARD');
assert.equal(alternate.meta.segment,'STANDARD');
const competitor=buildAdvancedView(rows,portfolio,'movements',nation,'STANDARD','CACIQUE');
assert.ok(competitor.html.includes('CACIQUE'));
console.log('Advanced intelligence: all 126 page-market views and benchmark indicators validated.');
