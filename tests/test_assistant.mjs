import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseQuestion,validatePlan,answerQuestion} from '../assistant-core.js';
const read = path => JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const rows=read('data/market-brand.json');
const portfolio=read('data/portfolio.json');
const meta=read('data/metadata.json');
assert.equal(parseQuestion('¿Cómo estamos frente a Santa Teresa en Caracas?',meta).market,'T Caracas Alimentos_Abs');
assert.equal(parseQuestion('¿Cómo estamos frente a Santa Teresa en Caracas?',meta).brand,'SANTA TERESA');
assert.equal(parseQuestion('¿Dónde perdemos distribución ponderada?',meta).metric,'weighted_distribution');
assert.equal(parseQuestion('¿Quién lidera Super Premium?',meta).intent,'segment');
assert.equal(parseQuestion('¿Qué diferencia hay entre distribución numérica y ponderada?',meta).intent,'glossary');
assert.equal(parseQuestion('¿Cómo vamos en Andes?',meta).market,'T Andes+Occidente Alimentos_Abs');
assert.equal(parseQuestion('¿Cómo vamos en Capital Autoservicio?',meta).market,'Capital Autoservicio1*');
const unknown=validatePlan({intent:'freeform',market:'inventado',metric:'ventas_totales',brand:'INVENTADA'},meta,parseQuestion('Carúpano vs Cacique',meta));
assert.equal(unknown.intent,'compare');
assert.equal(unknown.market,'Total Venezuela1');
assert.equal(unknown.metric,'value');
const compare=answerQuestion(rows,portfolio,meta,'¿Cómo estamos frente a Santa Teresa en Caracas?');
assert.equal(compare.plan.market,'T Caracas Alimentos_Abs');
assert.equal(compare.plan.brand,'SANTA TERESA');
assert.match(compare.title,/SANTA TERESA/);
assert.ok(compare.body.some(s=>s.includes('Carúpano')));
const other=answerQuestion(rows,portfolio,meta,'¿Cómo estamos frente a Cacique en Caracas?');
assert.notDeepEqual(compare.body,other.body,'different competitors must change observations');
const numeric=answerQuestion(rows,portfolio,meta,'¿Cómo estamos en distribución numérica frente a Santa Teresa?');
const weighted=answerQuestion(rows,portfolio,meta,'¿Cómo estamos en distribución ponderada frente a Santa Teresa?');
assert.notDeepEqual(numeric.body,weighted.body,'numeric and weighted must not be treated as the same metric');
assert.equal(numeric.plan.metric,'numeric_distribution');
assert.equal(weighted.plan.metric,'weighted_distribution');
const segment=answerQuestion(rows,portfolio,meta,'¿Quién lidera Super Premium en Venezuela?');
assert.equal(segment.plan.intent,'segment');
assert.ok(segment.body.some(s=>s.includes('14,67')),'Super Premium national within-segment share should be about 14.67%');
const opportunity=answerQuestion(rows,portfolio,meta,'¿Cuáles son las mayores oportunidades comerciales?');
assert.equal(opportunity.plan.intent,'opportunities');
assert.ok(opportunity.body.some(s=>s.includes('solapados')));
const marketFall=answerQuestion(rows,portfolio,meta,'¿Dónde cae más la distribución ponderada?');
assert.equal(marketFall.plan.intent,'markets');
assert.equal(marketFall.plan.metric,'weighted_distribution');
const distribution=answerQuestion(rows,portfolio,meta,'Compara distribución numérica y ponderada en Caracas');
assert.equal(distribution.plan.intent,'distribution');
assert.ok(distribution.body.some(s=>s.startsWith('Distribución numérica:')));
assert.ok(distribution.body.some(s=>s.startsWith('Distribución ponderada:')));
const summary=answerQuestion(rows,portfolio,meta,'Dame un resumen de Venezuela');
assert.equal(summary.plan.intent,'summary');
assert.ok(summary.body.some(s=>s.includes('2025'))===false);
for(const test of [compare,other,numeric,weighted,segment,opportunity,marketFall,distribution,summary]){
 const output=JSON.stringify(test);
 assert.ok(!output.includes('NaN') && !output.includes('undefined'));
 assert.ok(test.source.includes('NielsenIQ'));
 assert.ok(test.link.startsWith('#'));
}
const causal=answerQuestion(rows,portfolio,meta,'¿Por qué bajó la cuota de Carúpano en Caracas?');
assert.equal(causal.plan.intent,'causes');
assert.ok(causal.body.some(x=>x.includes('NO permiten determinar por qué')));
const noAbsolute=answerQuestion(rows,portfolio,meta,'¿Cuántas botellas vendimos en Venezuela?');
assert.equal(noAbsolute.plan.intent,'limits');
assert.ok(noAbsolute.body.some(x=>x.includes('no ventas absolutas')));
for(const market of meta.markets){
 for(const metric of meta.metrics){
  const r=answerQuestion(rows,portfolio,meta,'Compara Carúpano con Santa Teresa',{intent:'compare',market,metric,brand:'SANTA TERESA',segment:'SUPER PREMIUM'});
  assert.equal(r.plan.market,market);
  assert.equal(r.plan.metric,metric);
  assert.ok(!JSON.stringify(r).includes('NaN') && !JSON.stringify(r).includes('undefined'));
 }
}
console.log('Nielsen assistant: queries, market separation, metrics, validation and source checks passed.');
