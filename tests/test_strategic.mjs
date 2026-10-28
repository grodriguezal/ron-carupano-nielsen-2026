import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { buildStrategicView } from '../strategic-intelligence.js';

const fromJSON = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));

const dashboardHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const dashboardCss = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const dashboardJs = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
assert.ok(!/BP2027|Business Plan|Diagnóstico estratégico 2027/i.test(dashboardHtml + dashboardJs), 'Dashboard sin referencias al BP2027');
assert.ok(dashboardHtml.includes('assets/branding/ron-carupano-logo-gold.webp'), 'Official Ron Carúpano signature must be displayed');
assert.ok(!dashboardHtml.includes('class="symbol"'), 'Old placeholder monogram must not appear');
assert.ok(dashboardHtml.includes('family=Inter'), 'Inter should load for UI and data');
assert.ok(dashboardCss.includes("'Adobe Garamond Pro'"), 'Official primary display font should be declared');
assert.ok(dashboardCss.includes("--font-secondary:'Inter'"), 'Official secondary font should be declared');
assert.ok(!/Manrope|DM Sans/.test(dashboardCss), 'Legacy typography must be removed');
assert.ok(dashboardJs.includes("fontFamily:'Inter"), 'Charts should use Inter');
assert.ok(existsSync(new URL('../assets/branding/ron-carupano-logo-gold.webp', import.meta.url)), 'Gold logo must be bundled');
assert.ok(existsSync(new URL('../assets/branding/ron-carupano-logo-black-vertical.webp', import.meta.url)), 'Black logo must be bundled');

const rows = fromJSON('../data/market-brand.json');
const portfolio = fromJSON('../data/portfolio.json');
const metadata = fromJSON('../data/metadata.json');

assert.equal(rows.length, 779, 'El modelo marca-mercado debe contener 779 filas');
assert.equal(portfolio.length, 3111, 'El portafolio debe contener 3111 combinaciones');
assert.equal(metadata.markets.length, 21);

for (const market of metadata.markets) {
  const output = buildStrategicView(rows, portfolio, market, 'CACIQUE');
  assert.ok(output.html.includes('CAPÍTULO 1 · COMPETIDORES'));
  assert.ok(output.html.includes('CAPÍTULO 4 · PRIORIDADES DE ACTUACIÓN'));
  assert.ok(output.html.includes('Qué sabemos'));
  assert.ok(!/BP2027|Business Plan|Plan de Marketing 2027/i.test(output.html + output.brief), 'Sin referencias al BP2027');
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
console.log('Strategic insights: 21 markets, 3 charts and 4 data-driven actions validated.');
