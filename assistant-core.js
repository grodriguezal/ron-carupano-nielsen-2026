// Motor analítico determinista: nunca envía las cifras de Nielsen a servicios externos.
export const PERIOD = '2026 hasta septiembre (acumulado)';
export const PREVIOUS = '2025 completo';
export const METRICS = {
  value: 'participación en valor',
  volume: 'participación en volumen',
  numeric_distribution: 'distribución numérica',
  weighted_distribution: 'distribución ponderada'
};
const NATION = 'Total Venezuela1';
const clean = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const n = v => v == null || !Number.isFinite(Number(v)) ? 'sin dato' : Number(v).toLocaleString('es-VE', {minimumFractionDigits:2,maximumFractionDigits:2})+' %';
const pp = v => v == null || !Number.isFinite(v) ? 'sin dato' : (v > 0 ? '+' : '')+v.toLocaleString('es-VE',{minimumFractionDigits:2,maximumFractionDigits:2})+' pp';
const val = (r, metric, period='2026_ytd_sep') => r?.[period]?.[metric] ?? null;
const delta = (r, metric) => {const a=val(r,metric,'2025_full'),b=val(r,metric);return a==null||b==null?null:b-a;};
const label = m => m.replace(/^T /,'').replace(/ Alimentos_Abs$/,'').replace(/1\*?$/,'').replace(/Autoservicio/,' · Autoservicio').replace(/Tradicional/,' · Tradicional').trim();
const aliases = {
  'caracas': 'T Caracas Alimentos_Abs', 'capital': 'T Capital Alimentos_Abs',
  'maracaibo': 'T Maracaibo Alimentos_Abs', 'valencia': 'T Valencia Alimentos_Abs',
  'andes': 'T Andes+Occidente Alimentos_Abs', 'occidente': 'T Andes+Occidente Alimentos_Abs',
  'oriente': 'T Oriente Alimentos_Abs', 'centro occidente':'T Centro+Centro Occidente Alimentos_Abs',
  'centro': 'T Centro+Centro Occidente Alimentos_Abs', 'venezuela': NATION,
  'nacional': NATION, 'pais': NATION, 'total': NATION
};
const segments=['SUPER PREMIUM','PREMIUM','STANDARD','OTROS RON','OTROS SEGMENTOS'];
const pickMarket = (q, markets, preferred=NATION) => {
  const normalized=clean(q);
  for(const market of [...markets].sort((a,b)=>b.length-a.length)) {
    if(normalized.includes(clean(market)) || normalized.includes(clean(label(market)))) return market;
  }
  const hasAuto=/autoservicio|supermercado/i.test(normalized),hasTrad=/tradicional/i.test(normalized);
  for(const [key,name] of Object.entries(aliases).sort((a,b)=>b[0].length-a[0].length)){
    if(!normalized.includes(key))continue;
    if(hasAuto||hasTrad){
      const region=key==='caracas'||key==='capital'?'Capital':key==='andes'||key==='occidente'?'Andes+Occidente':key==='oriente'?'Oriente':key==='centro'||key==='centro occidente'?'Centro+Centro Occidente':null;
      const candidate=markets.find(x=>region && x.startsWith(region+' ') && x.includes(hasAuto?'Autoservicio':'Tradicional'));
      if(candidate)return candidate;
    }
    if(markets.includes(name))return name;
  }
  if(/licorerias/.test(normalized) && markets.includes('Total Licorerias1*'))return 'Total Licorerias1*';
  if(/supermercados independientes/.test(normalized) && markets.includes('Total Supermercados Ind1*'))return 'Total Supermercados Ind1*';
  if(/autoservicio/.test(normalized) && markets.includes('Total Autoservicio1'))return 'Total Autoservicio1';
  if(/tradicional/.test(normalized) && markets.includes('Total Tradicional1'))return 'Total Tradicional1';
  return markets.includes(preferred)?preferred:NATION;
};
const detectMetric = (q, previous='value') => {
  const s=clean(q);
  if(/ponderad|tiendas (mas |comercialmente )?(importantes|relevantes)|peso comercial/.test(s))return 'weighted_distribution';
  if(/numerica|cantidad de tiendas|cobertura|presencia en tiendas|puntos de venta/.test(s))return 'numeric_distribution';
  if(/volumen|botellas|litros/.test(s))return 'volume';
  if(/valor|cuota|participacion|ventas|market share/.test(s))return 'value';
  return METRICS[previous]?previous:'value';
};
export function parseQuestion(question, meta, previous={}){
  const s=clean(question).replace(/[¿?¡!]/g,'');
  const markets=meta.markets||[], brands=meta.brands||[];
  const market=pickMarket(question,markets,previous.market||NATION);
  let brand=brands.filter(x=>x!=='CARUPANO' && s.includes(clean(x))).sort((a,b)=>b.length-a.length)[0] || previous.brand || 'SANTA TERESA';
  if(!brands.includes(brand))brand='SANTA TERESA';
  let segment=segments.find(x=>s.includes(clean(x)))||previous.segment||'SUPER PREMIUM';
  let metric=detectMetric(question,previous.metric||'value');
  let intent='compare';
  if(/que significa|que es |explica(me)? (la |el )?(distribucion|participacion|indice)|diferencia entre numerica/.test(s))intent='glossary';
  else if(/resumen|sintesis|panorama|diagnostico general/.test(s))intent='summary';
  else if(/prioridad|oportunidad|donde (debemos|conviene) (actuar|mejorar)|acciones comerciales/.test(s))intent='opportunities';
  else if(/segmento|super premium|standard|otros ron/.test(s))intent='segment';
  else if(/distribucion.*(numerica.*ponderada|ponderada.*numerica)|ambas distribuciones/.test(s))intent='distribution';
  else if(/donde|cuales (son|fueron) (los|las)|mas (perd|gan|aument|baj|caid)|mayores cambios|por region|regiones/.test(s))intent='markets';
  else if(/lider|ranking|top ?[0-9]|principales marcas|quien (domina|encabeza)/.test(s))intent='ranking';
  return {intent,market,metric,brand,segment,limit:5};
}
export function validatePlan(input, meta, fallback){
  if(!input || typeof input!=='object' || Array.isArray(input))return fallback;
  const validIntents=['compare','summary','opportunities','segment','distribution','markets','ranking','glossary'];
  return {
    intent:validIntents.includes(input.intent)?input.intent:fallback.intent,
    market:(meta.markets||[]).includes(input.market)?input.market:fallback.market,
    metric:METRICS[input.metric]?input.metric:fallback.metric,
    brand:(meta.brands||[]).includes(input.brand)&&input.brand!=='CARUPANO'?input.brand:fallback.brand,
    segment:segments.includes(input.segment)?input.segment:fallback.segment,
    limit:5
  };
}
function result(title,body,market=NATION,detail='competition'){
  return {title,body,source:'Fuente: NielsenIQ · '+label(market)+' · '+PERIOD+'. Comparación con '+PREVIOUS+' (ventanas de distinta duración).',link:'#'+detail};
}
function row(rows,m,b){return rows.find(r=>r.market===m&&r.brand===b);}
function rank(rows,m,metric){return rows.filter(r=>r.market===m&&val(r,metric)!=null).sort((a,b)=>val(b,metric)-val(a,metric));}
function readable(d,unit=' pp'){return d==null?'sin dato':(d>0?'+':'')+d.toLocaleString('es-VE',{minimumFractionDigits:2,maximumFractionDigits:2})+unit;}
function observations(rows,m,metric){
  const r=row(rows,m,'CARUPANO');
  if(!r)return null;
  return {r,leader:rank(rows,m,'value')[0],change:delta(r,metric)};
}
function compare(rows,p){
  const {market:m,metric,brand}=p;const c=row(rows,m,'CARUPANO'),b=row(rows,m,brand);
  if(!c || !b || val(c,metric)==null || val(b,metric)==null)return result('Comparación no disponible','No hay cifras suficientes para comparar esas dos marcas en este corte. Prueba otro mercado o indicador.',m);
  const difference=val(c,metric)-val(b,metric);
  const metricName=METRICS[metric];
  let body=[
    'En '+label(m)+', Carúpano registra '+n(val(c,metric))+' de '+metricName+' y '+brand+' '+n(val(b,metric))+'.',
    'Brecha Carúpano frente a '+brand+': '+pp(difference)+'.',
    'Variación Carúpano respecto a '+PREVIOUS+': '+pp(delta(c,metric))+'; '+brand+': '+pp(delta(b,metric))+'.'
  ];
  if(metric.includes('distribution'))body.push('La distribución indica presencia en establecimientos, no participación en ventas. No debe sumarse entre marcas.');
  else body.push('Las participaciones usan el mismo denominador del corte seleccionado; los cambios entre ventanas son señales descriptivas, no crecimiento interanual homogéneo.');
  return result('Carúpano vs. '+brand+' · '+METRICS[metric],body,m,metric.includes('distribution')?'distribution':'competition');
}
function ranking(rows,p){
  const entries=rank(rows,p.market,p.metric).slice(0,5);
  const car=row(rows,p.market,'CARUPANO');
  const position=rank(rows,p.market,p.metric).findIndex(r=>r.brand==='CARUPANO')+1;
  return result('Líderes en '+label(p.market)+' · '+METRICS[p.metric],
    [...entries.map((r,i)=>(i+1)+'. '+r.brand+': '+n(val(r,p.metric))),
    'Carúpano: '+n(val(car,p.metric))+' (puesto '+(position||'sin dato')+').',
    'El ranking corresponde solo al corte seleccionado. No se agregan regiones ni canales.'],p.market,'regional');
}
function markets(rows,p){
  const all=[...new Set(rows.map(r=>r.market))];
  const scored=all.map(m=>({m,r:row(rows,m,'CARUPANO')})).filter(x=>x.r&&delta(x.r,p.metric)!=null).sort((a,b)=>delta(a.r,p.metric)-delta(b.r,p.metric));
  const isGain=/ganar|subir/.test(clean(p.question||'')); if(isGain)scored.reverse();
  return result('Cambios por corte de mercado · '+METRICS[p.metric],
    [isGain?'Mayores incrementos observados:':'Mayores disminuciones observadas:',
    ...scored.slice(0,5).map((x,i)=>(i+1)+'. '+label(x.m)+': '+pp(delta(x.r,p.metric))+' ('+n(val(x.r,p.metric))+ ' actual).'),
    'Estos son cortes NielsenIQ, no necesariamente regiones independientes. Algunos se solapan; no es correcto sumar sus porcentajes ni interpretar esta lista como pérdidas absolutas de ventas.',
    '2025 completo y 2026 acumulado a septiembre tienen distinta duración.'],p.market,'channels');
}
function distribution(rows,p){
  const c=row(rows,p.market,'CARUPANO'),leader=rank(rows,p.market,'value')[0];
  if(!c)return result('Sin datos','No se encontró Carúpano en el corte solicitado.',p.market);
  const dn=delta(c,'numeric_distribution'),dw=delta(c,'weighted_distribution');
  const lines=[
    'Distribución numérica: '+n(val(c,'numeric_distribution'))+'; cambio '+pp(dn)+'.',
    'Distribución ponderada: '+n(val(c,'weighted_distribution'))+'; cambio '+pp(dw)+'.',
    'Líder de categoría en valor ('+(leader?.brand||'sin datos')+'): '+n(val(leader,'numeric_distribution'))+' numérica y '+n(val(leader,'weighted_distribution'))+' ponderada.'
  ];
  if(dn!=null&&dw!=null){
    if(dn>0&&dw<0)lines.push('Hay más cobertura de establecimientos, pero menos peso comercial representado por esas tiendas. Investigar el mix de cuentas, no asumir causalidad.');
    else if(dn<0&&dw>0)lines.push('Hay menos establecimientos con presencia, pero los cubiertos tienen más peso comercial. Investigar qué cuentas entraron o salieron.');
    else if(dn<0&&dw<0)lines.push('Retroceden ambas medidas: revisar listados, inventarios y cobertura de cuentas clave.');
    else if(dn>0&&dw>0)lines.push('Ambas coberturas aumentan, pero eso no prueba por sí solo que aumenten las ventas.');
    else lines.push('Las señales son mixtas o estables; revisar cobertura y relevancia comercial por cuenta.');
  }
  return result('Dos lecturas de distribución · '+label(p.market),lines,p.market,'distributionMatrix');
}
function segmentAnswer(portfolio,p){
  const selected=portfolio.filter(r=>r.market===p.market && r.segment===p.segment && r.size_ml==null && val(r,'value')!=null);
  const total=selected.reduce((acc,r)=>acc+val(r,'value'),0);
  if(!total)return result('Segmento sin datos','No hay una base suficiente para calcular cuotas en este segmento y mercado.',p.market,'premium');
  const ranked=selected.map(r=>({brand:r.brand,share:100*val(r,'value')/total,contribution:val(r,'value')})).sort((a,b)=>b.share-a.share);
  const car=ranked.find(x=>x.brand==='CARUPANO');
  return result(p.segment+' · '+label(p.market),[
    'El segmento representa '+n(total)+' del valor de todo el mercado de ron de este corte.',
    'Cuota de Carúpano dentro del segmento: '+n(car?.share)+'.',
    'Cinco líderes dentro del segmento: '+ranked.slice(0,5).map((r,i)=>(i+1)+'. '+r.brand+' '+n(r.share)).join(' · ')+'.',
    'IMPORTANTE: cuota dentro del segmento = aporte de marca / aporte total del segmento. No confundirla con su aportación al mercado completo.'
  ],p.market,'premium');
}
function opportunities(rows,p){
  const markets=[...new Set(rows.map(r=>r.market))];
  const signals=markets.map(m=>{
    const c=row(rows,m,'CARUPANO');
    if(!c)return null;
    const d=delta(c,'value'),w=delta(c,'weighted_distribution'),num=delta(c,'numeric_distribution');
    if([d,w,num].some(x=>x==null))return null;
    const score=(d<0?2:0)+(w<0?2:0)+(num<0?1:0);
    return {m,c,d,w,num,score};
  }).filter(Boolean).sort((a,b)=>b.score-a.score || a.d-b.d);
  const selected=signals.filter(x=>x.score>0).slice(0,5);
  return result('Señales comerciales para investigar',[
    'Priorización exploratoria por coincidencia de menor participación en valor y retrocesos de distribución. No es una estimación de ROI, ventas perdidas ni causalidad.',
    ...selected.map((x,i)=>(i+1)+'. '+label(x.m)+': cuota '+pp(x.d)+', distribución numérica '+pp(x.num)+', ponderada '+pp(x.w)+'.'),
    'Próximo paso: contrastar estos indicios con inventarios, cuentas perdidas, surtido, disponibilidad, precios y ejecución comercial antes de asignar presupuesto.',
    'Los mercados incluyen canales y geografías solapados: no deben sumarse ni entenderse como una clasificación de oportunidades económicas absolutas.'
  ],p.market,'distributionMatrix');
}
function summary(rows,p){
  const m=p.market,c=row(rows,m,'CARUPANO');if(!c)return result('Sin datos','No se encontró la marca en el corte indicado.',m);
  const leader=rank(rows,m,'value')[0];
  return result('Panorama de Carúpano · '+label(m),[
    'Participación en valor: '+n(val(c,'value'))+' (cambio '+pp(delta(c,'value'))+').',
    'Participación en volumen: '+n(val(c,'volume'))+' (cambio '+pp(delta(c,'volume'))+').',
    'Distribución numérica: '+n(val(c,'numeric_distribution'))+' (cambio '+pp(delta(c,'numeric_distribution'))+').',
    'Distribución ponderada: '+n(val(c,'weighted_distribution'))+' (cambio '+pp(delta(c,'weighted_distribution'))+').',
    'Líder del corte en participación en valor: '+(leader?.brand||'sin dato')+' con '+n(val(leader,'value'))+'.',
    'Estos datos describen el mercado medido; no permiten deducir causas ni ventas absolutas.'
  ],m,'overview');
}
function glossary(p){
  const texts={
    weighted_distribution:'Distribución ponderada: porcentaje del peso de ventas de la categoría correspondiente a las tiendas donde está presente la marca. No es su participación en ventas.',
    numeric_distribution:'Distribución numérica: porcentaje de establecimientos del universo medido donde está presente la marca, sin ponderar la importancia de cada tienda.',
    volume:'Participación en volumen: porcentaje del volumen total vendido en la categoría correspondiente a la marca.',
    value:'Participación en valor: porcentaje del valor vendido de toda la categoría correspondiente a la marca.'
  };
  return result('Cómo interpretar '+METRICS[p.metric],[texts[p.metric],'Distribución numérica y ponderada tienen denominadores conceptualmente distintos y nunca deben sumarse entre marcas o mercados.','Diferencia de porcentajes = puntos porcentuales (pp); no equivale a variación porcentual relativa.'],p.market,'overview');
}
export function answerQuestion(rows,portfolio,meta,question,provided,previous){
  const fallback=parseQuestion(question,meta,previous);
  const p=validatePlan(provided,meta,fallback);
  p.question=question;
  let output;
  switch(p.intent){
    case 'summary':output=summary(rows,p);break;
    case 'opportunities':output=opportunities(rows,p);break;
    case 'segment':output=segmentAnswer(portfolio,p);break;
    case 'distribution':output=distribution(rows,p);break;
    case 'markets':output=markets(rows,p);break;
    case 'ranking':output=ranking(rows,p);break;
    case 'glossary':output=glossary(p);break;
    default:output=compare(rows,p);
  }
  return {...output,plan:p};
}
