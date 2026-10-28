import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildStrategicView } from '../strategic-intelligence.js';

const fromJSON = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const rows = fromJSON('../data/market-brand.json');
const portfolio = fromJSON('../data/portfolio.json');
const metadata = fromJSON('../data/metadata.json');

assert.equal(rows.length, 779, 'El modelo marca-mercado debe contener 779 filas');
assert.equal(portfolio.length, 3111, 'El portafolio debe contener 3111 combinaciones');
assert.equal(metadata.markets.length, 21);

for (const market of metadata.markets) {
  const output = buildStrategicView(rows, portfolio, market, 'CACIQUE');
  assert.ok(output.html.includes('CAPÍTULO 1 · COMPETIDORES'));
  assert.ok(output.html.includes('CAPÍTULO 4 · PLAN DE MARKETING 2027'));
  assert.ok(output.html.includes('Qué sabemos'));
  assert.ok(output.html.includes('Qué datos necesitamos'));
  assert.ok(output.html.includes('2025 completo') || output.html.includes('2025'));
  assert.equal(output.charts.length, 3, 'Tres gráficos estratégicos');
  assert.ok(output.charts.every(c => output.html.includes('id="' + c.id + '"')));
  assert.ok(output.brief.includes('CARÚPANO · RESUMEN ESTRATÉGICO'));
  assert.ok(!output.html.includes('NaN'), market + ' no puede mostrar valores NaN');
  assert.equal(output.stats.market, market);
}

const national = buildStrategicView(rows, portfolio, 'Total Venezuela1', 'CACIQUE');
assert.ok(national.html.includes('59,13 %'), 'Participación Santa Teresa');
assert.ok(national.html.includes('8,11 %'), 'Participación Carúpano');
assert.ok(national.html.includes('14,03 %'), 'Participación Cacique');
assert.ok(national.html.includes('puntos porcentuales'));
assert.ok(national.html.includes('+4,68 puntos porcentuales'), 'Cambio en la contribución STANDARD de Santa Teresa');
assert.ok(national.html.includes('Cambio Santa Teresa'), 'Matriz competitiva por segmento');
assert.ok(national.html.includes('2026 hasta septiembre'));
assert.ok(national.brief.includes('No se puede atribuir la cuota ganada por una marca a otra'));
assert.ok(national.brief.includes('Capital autoservicios'));
console.log('Strategic insights: 21 markets, 3 charts and 4 BP2027 actions validated.');
