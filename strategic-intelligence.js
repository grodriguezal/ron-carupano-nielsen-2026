export function buildStrategicView(rows,portfolio,market,competitor){
 const BEFORE='2025_full',NOW='2026_ytd_sep',NATION='Total Venezuela1';
 const f=(x,d=2)=>x==null||!Number.isFinite(Number(x))?'—':Number(x).toLocaleString('es-VE',{minimumFractionDigits:d,maximumFractionDigits:d});
 const value=(r,metric='value',period=NOW)=>r?.[period]?.[metric]??null;
 const movement=(r,metric='value')=>{const a=value(r,metric,BEFORE),b=value(r,metric,NOW);return a==null||b==null?null:b-a};
 const signed=(x,d=2)=>x==null?'Sin datos':`${x>0?'+':''}${f(x,d)} puntos porcentuales`;
 const label=s=>String(s||'').replace(/1\*?$/,'').replace(/^T /,'').replaceAll('+',' + ').replace('Alimentos_Abs','alimentos (corte especial)');
 const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
 const brand=(m,b)=>rows.find(r=>r.market===m&&r.brand===b);
 const current=brand(market,'CARUPANO'),st=brand(market,'SANTA TERESA'),cac=brand(market,'CACIQUE'),nat=brand(NATION,'CARUPANO');
 const leaders=[{name:'SANTA TERESA',color:'#bfa17a'},{name:'CACIQUE',color:'#79989d'},{name:'CARUPANO',color:'#e4c78f'},{name:'BODEGA 1800',color:'#6f8075'}];
 const s25=value(st,'value',BEFORE),s26=value(st,'value'),c25=value(current,'value',BEFORE),c26=value(current,'value'),q25=value(cac,'value',BEFORE),q26=value(cac,'value');
 const leadersBefore=(s25??0)+(q25??0),leadersNow=(s26??0)+(q26??0);
 const explanation=movement(current,'value')<0?
   `La participación de Carúpano disminuye ${f(Math.abs(movement(current,'value')))} puntos porcentuales en ${label(market)}, mientras Santa Teresa ${movement(st,'value')>=0?'aumenta':'disminuye'} ${f(Math.abs(movement(st,'value')??0))} puntos. Eso no demuestra que los compradores pasaran de una marca a otra.`:
   `La participación de Carúpano ${movement(current,'value')>0?'aumenta':'se mantiene prácticamente estable'} en ${label(market)}. Conviene comprobar qué hizo diferente este mercado antes de intentar replicarlo.`;
 const defText='Comparación de año completo 2025 y enero–septiembre 2026: son períodos de duración diferente. Las cifras son porcentajes del mercado medido; no son ventas absolutas ni demuestran causas.';
 const marketSeq=[
 ['Total Venezuela1','Todo el país'],['Total Autoservicio1','Total autoservicios'],['Total Licorerias1*','Total licorerías'],
 ['Capital Autoservicio1*','Capital · autoservicios'],['Capital Tradicional1*','Capital · tradicional'],
 ['Centro+Centro Occidente Autoservicio1*','Centro y Centro Occidente · autoservicios'],
 ['Centro+Centro Occidente Tradicional1*','Centro y Centro Occidente · tradicional'],
 ['Andes+Occidente Autoservicio1*','Andes y Occidente · autoservicios'],
 ['Andes+Occidente Tradicional1*','Andes y Occidente · tradicional'],
 ['Oriente Autoservicio1*','Oriente · autoservicios'],
 ['Oriente Tradicional1*','Oriente · tradicional']
 ];
 const marketStats=marketSeq.map(([id,name])=>{const car=brand(id,'CARUPANO'),st=brand(id,'SANTA TERESA'),cac=brand(id,'CACIQUE');return {id,name,c:movement(car),s:movement(st),q:movement(cac),dn:movement(car,'numeric_distribution'),dw:movement(car,'weighted_distribution'),cnow:value(car),snow:value(st),qnow:value(cac)}}).filter(r=>r.c!==null);
 const positive=marketStats.filter(x=>x.c>0.05&&x.id!=='Total Venezuela1').sort((a,b)=>b.c-a.c);
 const dual=marketStats.filter(x=>x.c<-0.05&&x.dn<0).sort((a,b)=>a.dn-b.dn);
 const decBy=movement(current,'value');
 const difference=(x)=>`<span class="${x==null?'neutral':x>0.005?'positive':x<-0.005?'negative':'neutral'}">${signed(x)}</span>`;
 const diag=x=>{
   if(x.c<-.05&&x.dn<-.05)return ['Cuota y presencia bajan','Revisar disponibilidad y cobertura'];
   if(x.c<-.05&&x.dn>.05)return ['Hay más tiendas, pero menos cuota','Revisar tiendas de mayor peso, surtido y conversión'];
   if(x.c>.05&&x.dn>.05)return ['Cuota y presencia mejoran','Investigar qué prácticas podrían repetirse'];
   if(x.c>.05&&x.dn<-.05)return ['Mejora cuota, pero baja cobertura','Comprobar si el avance es sostenible'];
   if(x.c<-.05)return ['Participación menor','Investigar composición del mercado y competencia'];
   return ['Señal mixta o estable','Seguir y contrastar con resultados comerciales'];
 };
 const chartStyle={axisLine:{lineStyle:{color:'#343d3c'}},axisLabel:{color:'#b4bdb8',fontSize:11},axisTick:{show:false},splitLine:{lineStyle:{color:'#29302f'}}};
 const axisStyle=chartStyle;
 const comps=leaders.map(b=>({...b,row:brand(market,b.name)})).filter(x=>x.row);
 const selectedPort=portfolio.filter(r=>r.market===market&&r.brand==='CARUPANO'&&r.segment!=null&&r.size_ml==null).sort((a,b)=>(value(b)||0)-(value(a)||0));
 const preciseShare=x=>x==null?'—':x!==0&&Math.abs(x)<0.01?f(x,4):f(x);
 const mixShare=r=>c26>0&&value(r)!=null?100*value(r)/c26:null;
 const formattedMix=x=>x==null?'—':x!==0&&Math.abs(x)<0.1?f(x,2):f(x,1);
 const deltaPp=x=>x==null?'<span class="neutral">Sin datos</span>':`<span class="${x>0.005?'positive':x<-0.005?'negative':'neutral'}">${x>0?'+':''}${f(x)} pp</span>`;
 const portfolioRows=selectedPort.map(r=>`<tr><td><strong>${esc(r.segment)}</strong></td><td>${preciseShare(value(r,'value',BEFORE))} %</td><td>${preciseShare(value(r))} %</td><td>${deltaPp(movement(r))}</td></tr>`).join('');
 const leadingDeclines=selectedPort.filter(r=>movement(r)!=null&&movement(r)<-0.005).sort((a,b)=>movement(a)-movement(b)).slice(0,2);
 const portfolioInsight=leadingDeclines.length
  ?`Las mayores reducciones de aportación a la cuota se observan en ${leadingDeclines.map(r=>`${esc(r.segment)} (${f(movement(r))} pp)`).join(' y ')}. Esto identifica dónde se concentra el cambio, no su causa.`
  :'No se observan reducciones de más de 0,005 puntos de participación en los segmentos disponibles.';
 const competitorSegment=(who,segment)=>portfolio.find(r=>r.market===market&&r.brand===who&&r.segment===segment&&r.size_ml==null);
 const segments=['STANDARD','PREMIUM','SUPER PREMIUM','ULTRA PREMIUM','OTROS RON'];
 const segmentShift=segments.map(seg=>({
  segment:seg,car:movement(competitorSegment('CARUPANO',seg)),
  st:movement(competitorSegment('SANTA TERESA',seg)),
  cac:movement(competitorSegment('CACIQUE',seg))
 }));
 const stStandard=movement(competitorSegment('SANTA TERESA','STANDARD'));
 const cacStandard=movement(competitorSegment('CACIQUE','STANDARD'));
 const carStandard=movement(competitorSegment('CARUPANO','STANDARD'));
 const segmentMatrix=segmentShift.map(x=>`<tr><td><strong>${esc(x.segment)}</strong></td><td>${difference(x.car)}</td><td>${difference(x.st)}</td><td>${difference(x.cac)}</td></tr>`).join('');
 const nationalPort=portfolio.filter(r=>r.market===NATION&&r.brand==='CARUPANO'&&r.segment!=null&&r.size_ml==null);
 const premium= nationalPort.find(r=>r.segment==='SUPER PREMIUM'),ultra=nationalPort.find(r=>r.segment==='ULTRA PREMIUM');
 const coverage=marketStats.filter(x=>x.id!=='Total Venezuela1').map(x=>`<tr class="${x.id===market?'strategic-focus':''}"><td><strong>${esc(x.name)}</strong><small>${esc(diag(x)[0])}</small></td><td>${difference(x.c)}</td><td>${difference(x.s)}</td><td>${difference(x.q)}</td><td>${difference(x.dn)}</td><td><button class="inspect-link inline-toggle" data-inline-market="${esc(x.id)}" aria-expanded="false" type="button">Ver detalle aquí ▾</button></td></tr>`).join('');
 const num=movement(current,'numeric_distribution'),weighted=movement(current,'weighted_distribution'),stNum=movement(st,'numeric_distribution'),stWeighted=movement(st,'weighted_distribution');
 const comparison=`${label(market)}: Carúpano pasa de ${f(c25)} % a ${f(c26)} % de participación; Santa Teresa de ${f(s25)} % a ${f(s26)} %; y Cacique de ${f(q25)} % a ${f(q26)} %. La diferencia entre Santa Teresa y Carúpano pasa de ${f(s25-c25)} a ${f(s26-c26)} puntos porcentuales (${signed((s26-c26)-(s25-c25))}).`;
 const dominant=`En ${label(market)}, las dos marcas más relevantes de esta comparación —Santa Teresa y Cacique— reúnen ${f(leadersNow)} % del valor medido, frente a ${f(leadersBefore)} % en 2025 completo.`;
 const actions=[
  {id:'capital',flag:'ACCIÓN PROPUESTA · COBERTURA',market:'Capital · autoservicios',owner:'Comercial + Trade Marketing',
   evidence:()=>{const z=brand('Capital Autoservicio1*','CARUPANO');return `La participación pasa de ${f(value(z,'value',BEFORE))} % a ${f(value(z))} % (${signed(movement(z))}) y la presencia numérica ${movement(z,'numeric_distribution')<0?'baja':'sube'} ${f(Math.abs(movement(z,'numeric_distribution')))} puntos.`},
   why:'La coincidencia de menor participación y menor presencia justifica revisar dónde se perdió cobertura; no demuestra cuánto se debe a la falta de stock.',
   do:'Auditar las cadenas y tiendas perdidas; revisar listados, inventario, exhibición y surtido. Antes de activar promociones, confirmar disponibilidad.',
   measure:'Porcentaje de tiendas con Carúpano; presencia en tiendas de mayor peso comercial; participación de valor en Capital autoservicios.',
   missing:'Ventas por cadena y por tienda, faltantes, espacios de exhibición, costos y márgenes.',
   resources:'Priorizar visitas, negociación comercial y material en el punto de venta; presupuestar efectivo solo tras evaluar tiendas y acciones concretas.'
  },
  {id:'licor',flag:'ACCIÓN PROPUESTA · EJECUCIÓN',market:'Licorerías',owner:'Comercial + Marketing Venezuela',
   evidence:()=>{const z=brand('Total Licorerias1*','CARUPANO');return `La participación ${signed(movement(z))}; la presencia numérica ${signed(movement(z,'numeric_distribution'))}, pero la presencia ponderada ${signed(movement(z,'weighted_distribution'))}.`},
   why:'Estar en una proporción ligeramente mayor de tiendas no garantiza mantener participación si cambia la importancia comercial de esos establecimientos o el comportamiento competitivo.',
   do:'Clasificar licorerías por relevancia, estudiar disponibilidad por producto y comparar exhibición, surtido y precios. Seleccionar acciones de trade marketing en tiendas donde haya una hipótesis comercial concreta.',
   measure:'Participación de valor en licorerías; distribución ponderada y numérica; resultados de ventas y disponibilidad en tiendas intervenidas.',
   missing:'Ventas y margen por local; ejecución antes y después; inventarios, promociones y actividad competitiva.',
   resources:'Usar el producto disponible y la ejecución comercial de forma selectiva, evitando regalar producto sin capacidad de medir resultados.'
  },
  {id:'learn',flag:'ACCIÓN PROPUESTA · APRENDIZAJE',market:'Centro y Centro Occidente · tradicional',owner:'Comercial + Inteligencia de Mercado',
   evidence:()=>{const z=brand('Centro+Centro Occidente Tradicional1*','CARUPANO');const w=brand('Centro+Centro Occidente Tradicional1*','SANTA TERESA');return `Carúpano ${signed(movement(z))}; Santa Teresa ${signed(movement(w))}; la presencia ponderada de Carúpano ${signed(movement(z,'weighted_distribution'))}.`},
   why:'Este comportamiento favorable puede servir para estudiar prácticas replicables, pero no permite identificar todavía qué causó la mejora.',
   do:'Investigar qué cambió en clientes, fuerza comercial, distribución, surtido y exhibición. Documentar las acciones verificadas y ensayar una réplica pequeña donde corresponda.',
   measure:'Participación de valor, distribución ponderada y resultados de ventas en el piloto frente a una referencia comparable.',
   missing:'Historial de acciones en tiendas, cobertura del equipo y resultados por cuenta.',
   resources:'Primero investigar y documentar; después ejecutar pilotos limitados antes de extender el presupuesto.'
  },
  {id:'port',flag:'ACCIÓN PROPUESTA · PORTAFOLIO',market:'Mix premium nacional',owner:'Marketing + Comercial + Producto',
   evidence:()=>`En todo el país, Super Premium pasa de ${f(value(premium,'value',BEFORE))} % a ${f(value(premium))} % de participación aportada por Carúpano; Ultra Premium pasa de ${f(value(ultra,'value',BEFORE),4)} % a ${f(value(ultra),4)} %.`,
   why:'La aportación de estos segmentos al total cambia, pero podría influir el surtido, la distribución, la clasificación del proveedor o los formatos. No equivale a medir ventas de cada producto.',
   do:'Validar clasificaciones y tamaños con NielsenIQ, comprobar disponibilidad de referencias y revisar el papel de cada segmento en el posicionamiento premium.',
   measure:'Contribución al mercado por segmento, volumen, disponibilidad por presentación, margen y desempeño por cadena.',
   missing:'Correspondencia segmento–producto, precios, márgenes y unidades vendidas por referencia.',
   resources:'Dar prioridad a capacitación, contenidos de marca y activaciones con producto donde haya datos comerciales que las respalden.'
  }
 ];
 const actionHTML=actions.map((a,i)=>`<article class="strategy-action"><div class="strategy-action-top"><span class="flag">${esc(a.flag)}</span><span class="action-index">0${i+1}</span></div><h3>${esc(a.market)}</h3><div class="strategy-evidence"><strong>Qué sabemos</strong><p>${a.evidence()}</p></div><p class="strategy-copy"><strong>Qué significa:</strong> ${a.why}</p><p class="strategy-copy"><strong>Qué haríamos:</strong> ${a.do}</p><div class="strategy-method"><p><strong>Cómo mediremos:</strong> ${a.measure}</p><p><strong>Qué datos necesitamos:</strong> ${a.missing}</p><p><strong>Uso de recursos:</strong> ${a.resources}</p><p><strong>Responsables sugeridos:</strong> ${a.owner}</p></div></article>`).join('');
 const topStates=dual.slice(0,3).map(x=>x.name).join('; ')||'sin señales dobles destacadas';
 const brief=`CARÚPANO · RESUMEN ESTRATÉGICO NIELSENIQ\nMercado seleccionado: ${label(market)}\nPeríodos: año completo 2025 frente a enero–septiembre 2026 (duración distinta).\n\nCOMPETENCIA\n${comparison}\n${dominant}\nNo se puede atribuir la cuota ganada por una marca a otra sin evidencia adicional.\n\nDISTRIBUCIÓN\nCarúpano: cambio en presencia numérica ${signed(num)} y ponderada ${signed(weighted)}. Santa Teresa: ${signed(stNum)} y ${signed(stWeighted)}, respectivamente.\n\nDÓNDE CONVIENE ACTUAR\n1. Capital autoservicios: recuperar y validar cobertura.\n2. Licorerías: revisar calidad de presencia, surtido y ejecución.\n3. Centro y Centro Occidente tradicional: investigar qué explica el desempeño positivo.\n4. Portafolio premium: verificar clasificación, disponibilidad y contribución por segmento.\n\nCortes con cuota y presencia numérica decrecientes para investigar: ${topStates}.\n\nFuentes: NielsenIQ, Datapull Ron Venezuela 2026 RT. Datos observados frente a hipótesis comerciales; no se dispone aquí de ingresos absolutos, ventas por tienda ni retorno de inversión.`;
 const html=`
 <div class="strategy-toolbar"><span>DIAGNÓSTICO COMERCIAL · BASADO EN DATOS NIELSENIQ</span><button type="button" id="copyStrategyBrief" class="ghost">Copiar resumen para el comité</button></div>
 <section class="strategic-summary">
  <div class="strategy-header"><div><p class="strategic-kicker">LA HISTORIA DETRÁS DE LOS NÚMEROS</p><h2>Carúpano se enfrenta a un mercado más concentrado, <em>pero las respuestas son diferentes según el canal.</em></h2><p>${esc(explanation)}</p></div><div class="strategic-market">Mercado analizado<strong>${esc(label(market))}</strong><small>Año 2025 completo / enero–septiembre 2026</small></div></div>
  <div class="strategic-metrics">
   ${[{n:'Carúpano · participación en valor',r:current},{n:'Santa Teresa · participación en valor',r:st},{n:'Cacique · participación en valor',r:cac},{n:'Santa Teresa + Cacique',r:null}].map((item,i)=>{const n=i===3?leadersNow:value(item.r),d=i===3?leadersNow-leadersBefore:movement(item.r);return `<div class="strategic-metric"><span>${esc(item.n)}</span><strong>${f(n)} %</strong><small class="${d>=0?'positive':'negative'}">${signed(d)} frente a 2025 completo</small></div>`}).join('')}
  </div>
  <p class="strategy-method-note">${defText}</p>
 </section>
 <div class="section-title">CAPÍTULO 1 · COMPETIDORES</div>
 <section class="grid2 strategic-section"><div class="panel"><div class="panel-heading"><div><h2>¿Qué marcas aumentan su peso en el mercado?</h2><p>Comparación de participación en valor. 2025 completo frente a 2026 hasta septiembre.</p></div></div><div class="plot" id="strategicCompetitors"></div><p class="chart-reading"><strong>Cómo leerlo:</strong> cada barra muestra qué parte de cada 100 unidades de valor de ron vendido corresponde a una marca. No indica ventas en dinero.</p></div>
 <div class="panel strategy-explanation"><div class="flag">LECTURA DE LOS DATOS</div><h3>Ganar participación no es lo mismo que llegar a más tiendas</h3><p>${esc(comparison)}</p><p>${esc(dominant)}</p><p>Santa Teresa registra un cambio de ${signed(stNum)} en presencia numérica y de ${signed(stWeighted)} en presencia ponderada en el mercado elegido. <strong>Su cambio de participación no puede atribuirse automáticamente a una ampliación de distribución.</strong></p><div class="explanation-action"><strong>Qué conviene investigar</strong><p>Revisar precios, surtido, actividad comercial, ubicación en tienda y ventas por establecimiento, empezando por los mercados donde se amplía la diferencia competitiva.</p></div><small>Advertencia: una coincidencia entre variaciones de marcas no demuestra transferencia de consumidores entre ellas.</small></div></section>
 <section class="panel strategic-panel strategic-segment-comp">
  <div class="panel-heading"><div><h2>¿En qué segmentos están ganando o perdiendo las marcas?</h2><p>Qué parte del cambio total de participación procede de los distintos tipos de ron, según la clasificación del estudio.</p></div><span class="tag">ORIGEN DEL CAMBIO</span></div>
  <div class="table-wrap"><table class="table strategy-table"><thead><tr><th>Segmento de ron</th><th>Cambio Carúpano</th><th>Cambio Santa Teresa</th><th>Cambio Cacique</th></tr></thead><tbody>${segmentMatrix}</tbody></table></div>
  <div class="strategy-segment-insight"><strong>La lectura clave:</strong> en ${esc(label(market))}, la aportación del segmento STANDARD cambia ${signed(carStandard)} para Carúpano, ${signed(stStandard)} para Santa Teresa y ${signed(cacStandard)} para Cacique. <strong>No todas las marcas crecen o retroceden por las mismas razones ni en los mismos segmentos.</strong></div>
  <p class="chart-reading"><strong>Cómo interpretar la tabla:</strong> cada cambio es una contribución al mercado total de ron del mercado elegido. No es la participación dentro del segmento ni el crecimiento de ventas. Los segmentos se definen según NielsenIQ y deben verificarse antes de asociarlos con productos concretos.</p>
 </section>
 <div class="section-title">CAPÍTULO 2 · GEOGRAFÍA Y CANALES</div>
 <section class="panel strategic-panel"><div class="panel-heading"><div><h2>El movimiento de las marcas, de un vistazo</h2><p>Comparación del cambio de participación en valor entre el año completo 2025 y 2026 hasta septiembre, en ocho cortes regionales y de canal.</p></div></div><div class="plot tall" id="strategicChannelPlot"></div><p class="chart-reading"><strong>Cómo leerlo:</strong> una barra a la derecha de cero indica un aumento de participación; a la izquierda, una disminución. Las marcas pueden moverse en direcciones diferentes en cada canal. No significa que una haya adquirido directamente las ventas de otra.</p></section>
 <section class="panel strategic-panel"><div class="panel-heading"><div><h2>¿Dónde cambia la posición competitiva de Carúpano?</h2><p>Comparamos el cambio de participación en valor de Carúpano, Santa Teresa y Cacique. Pulsa «Ver detalle aquí» para desplegar la explicación y el ranking competitivo debajo de la fila.</p></div><span class="tag">NO SUMAR CANALES</span></div>
 <div class="strategic-table-wrap"><table class="table strategy-table"><thead><tr><th>Mercado / lectura</th><th>Cambio Carúpano</th><th>Cambio Santa Teresa</th><th>Cambio Cacique</th><th>Cambio de presencia de Carúpano</th><th>Detalle en esta tabla</th></tr></thead><tbody>${coverage}</tbody></table></div>
 <div class="chart-reading"><strong>Interpretación:</strong> un mercado con una caída importante en porcentaje no es necesariamente el que más dinero representa. Para establecer prioridades económicas faltan el tamaño de cada mercado y el margen comercial. Los totales de canal y los cortes regionales se solapan: no debemos sumarlos.</div></section>
 <section class="strategy-observation"><div><div class="flag">SEÑAL DE ALERTA</div><h3>Mercados donde caen participación y presencia</h3><p>${dual.length} de los ${marketStats.length-1} cortes específicos de esta tabla muestran ambas señales. Conviene empezar investigando ${esc(topStates)}, sin asumir que son los mercados de mayor valor económico.</p></div><div><div class="flag">SEÑAL PARA APRENDER</div><h3>Resultados favorables que conviene estudiar</h3><p>${positive.length?positive.map(x=>`${x.name}: ${signed(x.c)}`).join('; '):'No hay mercados específicos con un aumento de participación superior a 0,05 puntos en esta selección.'}.</p></div></section>
 <div class="section-title">CAPÍTULO 3 · PRODUCTOS Y POSICIONAMIENTO</div>
 <section class="grid2 strategic-section portfolio-clarity">
  <div class="panel">
   <div class="panel-heading"><div><h2>¿Cómo se reparte la cuota de Carúpano entre segmentos?</h2><p>Distribución del 100 % del valor vendido por Carúpano entre los segmentos NielsenIQ del mercado elegido, enero–septiembre 2026.</p></div></div>
   <div class="portfolio-total"><span>PARTICIPACIÓN TOTAL DE CARÚPANO EN EL MERCADO</span><strong>${f(c26)} %</strong><small>del valor total de ron medido</small></div>
   <div class="plot portfolio-mix-chart" id="strategicPortfolio"></div>
   <p class="chart-reading"><strong>Cómo leerlo:</strong> 100 % representa solo a Carúpano. Un segmento con 58 % significa que aporta aproximadamente 58 de cada 100 unidades de valor de Carúpano, <strong>no</strong> que Carúpano tenga el 58 % de ese segmento en el mercado.</p>
  </div>
  <div class="panel">
   <div class="panel-heading"><div><h2>¿Qué segmentos explican el cambio de participación?</h2><p>Aportación de cada segmento a la cuota de Carúpano sobre <strong>todo el mercado de ron</strong>. La última columna mide cambios en puntos porcentuales (pp).</p></div></div>
   <div class="table-wrap"><table class="table portfolio-shift-table"><thead><tr><th>Segmento</th><th>2025 completo</th><th>2026 hasta sep.</th><th>Cambio (pp)</th></tr></thead><tbody>${portfolioRows||'<tr><td colspan="4">Sin desglose disponible para este mercado.</td></tr>'}</tbody></table></div>
   <p class="portfolio-takeaway"><strong>Lectura principal:</strong> ${portfolioInsight}</p>
   <p class="table-reading"><strong>Importante:</strong> no confundir esta tabla con la composición interna del gráfico de la izquierda. Los cambios son puntos de cuota sobre todo el mercado NielsenIQ; 2025 completo y 2026 hasta septiembre tienen duraciones diferentes. Un segmento con menos cuota no demuestra menor disponibilidad, precio o demanda sin otros datos.</p>
  </div>
 </section>
 <div class="section-title">CAPÍTULO 4 · PRIORIDADES DE ACTUACIÓN</div>
 <section class="strategic-actions-intro"><p class="strategic-kicker">DE LOS HALLAZGOS A LAS DECISIONES</p><h2>Cuatro líneas de actuación a partir de los datos</h2><p>Estas propuestas están ancladas en evidencia del estudio, pero son <strong>hipótesis y decisiones recomendadas</strong>, no iniciativas que Nielsen haya demostrado rentables. Las acciones consideran recursos limitados y priorizan la disponibilidad, el producto y la ejecución comercial antes que grandes presupuestos en efectivo.</p></section>
 <div class="strategy-action-grid">${actionHTML}</div>
 <section class="strategic-close"><div class="flag">MENSAJE PARA DIRECCIÓN</div><h3>La prioridad no es hacer más actividades, sino saber qué problema debe resolver cada actividad.</h3><p>La recuperación de participación requiere un enfoque distinto por mercado: disponibilidad donde estamos perdiendo presencia; ejecución comercial donde ganamos tiendas pero perdemos cuota; aprendizaje donde los indicadores mejoran; y rigor con los segmentos que sostienen el posicionamiento de la marca.</p><p class="strategy-method-note">Datos observados NielsenIQ frente a acciones propuestas. Para fijar metas, presupuestos y retorno económico, complementar con información interna de ventas, rentabilidad, clientes y ejecución en puntos de venta.</p></section>`;
 const regional=marketStats.filter(x=>!x.id.startsWith('Total ')).slice().reverse();
 const charts=[
  {id:'strategicCompetitors',option:{tooltip:{trigger:'axis',axisPointer:{type:'shadow'},valueFormatter:v=>`${f(v)} %`},legend:{bottom:0,textStyle:{color:'#a9b4ad'},data:['2025 completo','2026 hasta septiembre']},grid:{left:116,right:18,top:9,bottom:44},xAxis:{type:'value',...axisStyle,axisLabel:{color:'#a9b4ad',formatter:v=>`${v} %`}},yAxis:{type:'category',data:comps.slice().reverse().map(x=>x.name),...axisStyle},series:[{name:'2025 completo',type:'bar',barMaxWidth:14,itemStyle:{color:'#586466'},data:comps.slice().reverse().map(x=>value(x.row,'value',BEFORE))},{name:'2026 hasta septiembre',type:'bar',barMaxWidth:14,itemStyle:{color:'#d9b778'},data:comps.slice().reverse().map(x=>value(x.row))}]}},
  {id:'strategicChannelPlot',option:{tooltip:{trigger:'axis',axisPointer:{type:'shadow'},valueFormatter:v=>signed(v)},legend:{bottom:0,textStyle:{color:'#adb8ad'},data:['Carúpano','Santa Teresa','Cacique']},grid:{left:215,right:31,top:8,bottom:45},xAxis:{type:'value',...axisStyle,axisLabel:{color:'#aeb9af',formatter:v=>f(v,0)}},yAxis:{type:'category',data:regional.map(x=>x.name),...axisStyle,axisLabel:{color:'#c1c9bc',fontSize:10}},series:[{type:'bar',name:'Carúpano',barMaxWidth:10,itemStyle:{color:'#e1ba7a'},data:regional.map(x=>x.c)},{type:'bar',name:'Santa Teresa',barMaxWidth:10,itemStyle:{color:'#9bafb0'},data:regional.map(x=>x.s)},{type:'bar',name:'Cacique',barMaxWidth:10,itemStyle:{color:'#819a86'},data:regional.map(x=>x.q)}]}},
  {id:'strategicPortfolio',option:{tooltip:{trigger:'item',formatter:p=>`${esc(p.name)}: ${formattedMix(p.value)} % del valor de Carúpano`},grid:{left:132,right:87,top:14,bottom:36},xAxis:{type:'value',min:0,max:100,interval:25,...axisStyle,axisLabel:{color:'#a9b4ad',formatter:v=>v+' %'}},yAxis:{type:'category',data:selectedPort.slice().reverse().map(x=>x.segment),...axisStyle,axisLabel:{fontSize:11,color:'#c0c7bf'}},series:[{type:'bar',barMaxWidth:21,itemStyle:{color:'#c5b783',borderRadius:[0,3,3,0]},label:{show:true,position:'right',distance:8,color:'#e8dfca',fontSize:11,formatter:p=>formattedMix(p.value)+' %'},data:selectedPort.slice().reverse().map(r=>({value:mixShare(r),name:r.segment}))}]}}
 ];
 return {html,charts,brief,stats:{market,observations:marketStats.length,actions:actions.length,carupanoChange:decBy}};
}
