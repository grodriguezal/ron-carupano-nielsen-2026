import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildRegionalView } from '../regional-intelligence.js';

const rows=JSON.parse(readFileSync(new URL('../data/market-brand.json',import.meta.url),'utf8'));
const ids=[
 'Capital Autoservicio1*','Capital Tradicional1*',
 'Andes+Occidente Autoservicio1*','Andes+Occidente Tradicional1*',
 'Centro+Centro Occidente Autoservicio1*','Centro+Centro Occidente Tradicional1*',
 'Oriente Autoservicio1*','Oriente Tradicional1*',
 'T Caracas Alimentos_Abs','T Maracaibo Alimentos_Abs','T Valencia Alimentos_Abs',
 'T Capital Alimentos_Abs','T Andes+Occidente Alimentos_Abs',
 'T Centro+Centro Occidente Alimentos_Abs','T Oriente Alimentos_Abs'
];
for(const market of ids){
 const report=buildRegionalView(rows,market);
 assert.equal(report.market,market);
 assert.equal(report.meta.competitors.length,5,'Must rank five competitors excluding Carúpano: '+market);
 assert.ok(!report.meta.competitors.includes('CARUPANO'),'Do not count Carúpano as its own rival');
 assert.equal(report.meta.regionalCount,8);
 assert.equal(report.meta.cityCount,7);
 assert.equal(report.charts.length,2);
 assert.ok(report.html.includes('regionTopChart'));
 assert.ok(report.html.includes('regionShiftChart'));
 assert.ok(report.html.includes('data-region-market'));
 assert.ok(report.html.includes('participación en valor'));
 assert.ok(!report.html.includes('NaN'));
 assert.ok(report.meta.carRank>0);
}
const capital=buildRegionalView(rows,'Capital Autoservicio1*');
assert.equal(capital.meta.carRank,2);
assert.ok(Math.abs(capital.meta.carShare-21.1308)<0.000001);
assert.equal(capital.meta.competitors[0],'SANTA TERESA');
const andes=buildRegionalView(rows,'Andes+Occidente Autoservicio1*');
assert.equal(andes.meta.carRank,4);
const caracas=buildRegionalView(rows,'T Caracas Alimentos_Abs');
assert.equal(caracas.meta.carRank,2);
assert.ok(Math.abs(caracas.meta.carShare-18.6868)<0.000001);
assert.ok(caracas.html.includes('No representa necesariamente todas las licorerías'));
const missing=buildRegionalView(rows,'any-unknown-market');
assert.equal(missing.market,'Capital Autoservicio1*');

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
assert.ok(html.includes('data-page="regional"'));
assert.ok(!html.includes('data-page="strategy"'),'Scenarios navigation must be removed');
assert.ok(!app.includes('function strategy(){'),'Old scenario logic must be removed');
assert.ok(app.includes('portfolioReconciliationCard'),'Portfolio reconciliation must be explanatory');
assert.ok(app.includes('✓ Sí, coincide'),'Correct rounded sums should be shown as successful');

const pf=JSON.parse(readFileSync(new URL('../data/portfolio.json',import.meta.url),'utf8'));
for(const market of new Set(rows.map(r=>r.market))){
 const car=rows.find(r=>r.market===market&&r.brand==='CARUPANO');
 const parts=pf.filter(r=>r.market===market&&r.brand==='CARUPANO'&&r.segment!=null&&r.size_ml==null);
 if(!car || !parts.length)continue;
 const sum=parts.reduce((n,r)=>n+(r['2026_ytd_sep']?.value??0),0);
 const total=car['2026_ytd_sep']?.value;
 if(total!=null)assert.ok(Math.abs(sum-total)<=0.0005,market+' reconciliation needs review');
}
console.log('15 regional competitor views, all 21 portfolio reconciliations, and no scenario navigation: OK');
