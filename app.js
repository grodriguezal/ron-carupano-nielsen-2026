import {buildStrategicView} from './strategic-intelligence.js?v=20261028-market-v3';
import {buildRegionalView} from './regional-intelligence.js?v=20261028-market-v3';
import {buildAdvancedView} from './advanced-intelligence.js?v=20261028-market-v3';
const COLORS={gold:'#c5b783',white:'#ebe9e0',muted:'#919b96',grid:'#2b3230',red:'#e08d80',green:'#85b89c',blue:'#79989d'};
const NATION='Total Venezuela1';
const PAGES={
 segments:['09 / ESTRUCTURA DEL MERCADO','Entender <em>cómo cambia la categoría.</em>','Qué peso tiene cada segmento en el mercado de ron y cuánto controla Carúpano dentro de cada uno.'],
 premium:['10 / COMPETENCIA POR SEGMENTO','Competir <em>dentro del segmento.</em>','Ranking real por segmento: quién domina Standard, Premium, Super Premium y las demás categorías Nielsen.'],
 value:['11 / POSICIONAMIENTO DE VALOR','¿Cuánto valor aporta <em>cada volumen vendido?</em>','Índice relativo de valor frente a volumen. Una herramienta de comparación, no un indicador de precio real.'],
 distributionMatrix:['12 / DIAGNÓSTICO DE DISTRIBUCIÓN','¿La marca llega <em>a las tiendas adecuadas?</em>','Cruza la presencia numérica y ponderada con los cambios de participación, sin suponer causalidad.'],
 formats:['13 / INTELIGENCIA DE FORMATOS','Entender lo que pasa <em>con 700 y 750 ml.</em>','Qué formatos aportan participación, cómo cambia su peso y dónde conviene revisar códigos y disponibilidad.'],
 movements:['14 / MOVIMIENTOS COMPETITIVOS','¿Quién gana y pierde <em>participación?</em>','Identifica desplazamientos por marca y segmento sin atribuir las ganancias de una marca a pérdidas de otra.'],
 strategic:['08 / INTELIGENCIA ESTRATÉGICA','De Nielsen a <em>las decisiones de 2027.</em>','Cuatro capítulos para entender la competencia, descubrir diferencias entre mercados y justificar acciones comerciales concretas.'],
 overview:['01 / ENTENDER EL MERCADO','Qué está pasando <em>con Carúpano.</em>','Una explicación paso a paso de la posición de la marca, la competencia y los cambios que merecen atención.'],
 regional:['03 / COMPETENCIA POR REGIÓN','¿Quién lidera <em>cada región?</em>','Compara a Carúpano con los cinco competidores principales en cada región, canal y ciudad disponible.'],
 competition:['02 / OTRAS MARCAS','¿Quién compite <em>con nosotros?</em>','Conoce las marcas con mayor participación y compara su presencia y sus resultados con los de Carúpano.'],
 channels:['03 / DÓNDE SE VENDE','Cada canal cuenta <em>una historia.</em>','La situación de Carúpano cambia según la región y el tipo de tienda. Explora las diferencias sin sumar mercados que se solapan.'],
 distribution:['04 / PRESENCIA EN TIENDAS','No basta con <em>estar en la tienda.</em>','Comprende cuántos establecimientos venden la marca y qué importancia comercial tienen dentro de la categoría.'],
 portfolio:['05 / NUESTROS PRODUCTOS','¿Qué aporta cada <em>tipo de ron?</em>','Descubre cómo contribuyen los distintos segmentos a la participación total de Carúpano.'],
 radar:['06 / DECISIONES DE NEGOCIO','Dónde conviene <em>investigar primero.</em>','Identificamos señales que podrían requerir una acción comercial, sin confundir coincidencias con causas.']};
const state={page:'overview',market:NATION,metric:'value',competitor:'CACIQUE',regionalMarket:'Capital Autoservicio1*',advancedSegment:'SUPER PREMIUM',advancedBrand:'CARUPANO',rows:[],portfolio:[],meta:{},charts:[]};
const $=id=>document.getElementById(id),fmt=(v,d=2)=>v==null?'—':Number(v).toLocaleString('es-VE',{minimumFractionDigits:d,maximumFractionDigits:d});
const diff=(a,b)=>a==null||b==null?null:b-a;
const signed=(x,d=2)=>x==null?'—':`${x>=0?'+':''}${fmt(x,d)} puntos porcentuales`;
const tone=x=>x==null?'neutral':x>0?'positive':x<0?'negative':'neutral';
const metricLabel={value:'Participación en el dinero gastado en ron',volume:'Participación en el volumen vendido',numeric_distribution:'Porcentaje de tiendas donde se vende',weighted_distribution:'Presencia ponderada por importancia de las tiendas'};
function key(r,period= '2026_ytd_sep',metric=state.metric){return r?.[period]?.[metric]??null}
function row(m,b){return state.rows.find(x=>x.market===m&&x.brand===b)}
function marketRows(m=state.market){return state.rows.filter(x=>x.market===m)}
function sorted(m=state.market,metric=state.metric){return marketRows(m).filter(x=>key(x,'2026_ytd_sep',metric)!=null).sort((a,b)=>key(b,'2026_ytd_sep',metric)-key(a,'2026_ytd_sep',metric))}
function chart(dom,option){if(!window.echarts){$(dom).innerHTML='<p style="color:#c9a36d;padding:22px">La librería de gráficos no cargó. Los indicadores y las tablas siguen disponibles.</p>';return}const c=echarts.init($(dom),null,{renderer:'canvas'});c.setOption({backgroundColor:'transparent',animationDuration:750,textStyle:{fontFamily:'Inter, Arial, Helvetica, sans-serif',color:COLORS.white},tooltip:{trigger:'axis',backgroundColor:'#222827',borderColor:'#685538',textStyle:{color:'#eee'},valueFormatter:v=>fmt(v,2)+' %'},grid:{left:65,right:22,top:22,bottom:46},...option});state.charts.push(c)}
const axis={axisLine:{lineStyle:{color:COLORS.grid}},axisLabel:{color:COLORS.muted},axisTick:{show:false}};
function card(label,value,delta,sub='Comparación con el año completo de 2025; períodos de duración distinta'){return `<article class="kpi"><div class="klabel">${label}</div><div class="number">${value}</div><div class="delta ${tone(delta)}">${delta==null?'':signed(delta)+' '}<span style="color:#a7b1a7">${sub}</span></div></article>`}
function portfolioReconciliationCard(sum,brandTotal){
 const difference=sum==null||brandTotal==null?null:sum-brandTotal;
 const ok=difference!=null&&Math.abs(difference)<=0.0005;
 return `<article class="kpi reconciliation-card"><div class="klabel">¿Coinciden los segmentos con el total de Carúpano?</div><div class="number ${ok?'positive':difference==null?'neutral':'negative'}">${difference==null?'Sin datos':ok?'✓ Sí, coincide':'Revisar datos'}</div><div class="delta">${difference==null?'No hay suficientes cifras para comprobarlo.':ok?`La suma de los segmentos (${fmt(sum,4)} %) coincide con el total (${fmt(brandTotal,4)} %) dentro del margen de redondeo. La diferencia no es una pérdida de mercado.`:`La suma (${fmt(sum,4)} %) no coincide con el total de marca (${fmt(brandTotal,4)} %). Antes de interpretar, revisar niveles, segmentos ausentes y redondeos.`}</div></article>`;
}
function panel(title,subtitle,plot,tag='',klass=''){return `<div class="panel ${klass}"><div class="panel-heading"><div><h2>${title}</h2><p>${subtitle}</p></div><span class="tag">${tag}</span></div><div class="plot ${plot==='tall'?'tall':''}" id="${plot}"></div></div>`}
function table(headers,lines){return `<div class="table-wrap"><table class="table"><thead><tr>${headers.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${lines.join('')}</tbody></table></div>`}
function brandTable(m,top=15){let rr=sorted(m,'value').slice(0,top);return table(['Marca','Participación en valor 2025','Participación en valor 2026 hasta septiembre','Diferencia entre períodos','Presencia ponderada en tiendas'],rr.map((x,i)=>`<tr class="${x.brand==='CARUPANO'?'highlight':''}"><td><strong>${i+1}. ${x.brand}</strong></td><td>${fmt(key(x,'2025_full','value'))}%</td><td>${fmt(key(x,'2026_ytd_sep','value'))}%</td><td class="${tone(diff(key(x,'2025_full','value'),key(x,'2026_ytd_sep','value')))}">${signed(diff(key(x,'2025_full','value'),key(x,'2026_ytd_sep','value')))}</td><td>${fmt(key(x,'2026_ytd_sep','weighted_distribution'))}%</td></tr>`))}
function insights(m=state.market){const c=row(m,'CARUPANO'), st=row(m,'SANTA TERESA'), ca=row(m,'CACIQUE');if(!c)return[];const v0=key(c,'2025_full','value'),v1=key(c,'2026_ytd_sep','value');const top=(key(st,'2026_ytd_sep','value')??0)+(key(ca,'2026_ytd_sep','value')??0);const prior=(key(st,'2025_full','value')??0)+(key(ca,'2025_full','value')??0);return [
 {tag:'01 / SITUACIÓN DE CARÚPANO',title:`Carúpano ${v1<v0?'pierde':'gana'} participación en valor`,body:`En ${readableMarket(m)}, de cada 100 unidades de valor vendido de ron, a Carúpano le corresponden ${fmt(v1)} en 2026 hasta septiembre, frente a ${fmt(v0)} en todo 2025. La diferencia es de ${signed(v1-v0)}. Los períodos no tienen la misma duración.`,type:'high'},
 {tag:'02 / POSICIÓN DE LAS MARCAS LÍDERES',title:`Santa Teresa y Cacique reúnen el ${fmt(top)}% del valor medido`,body:`En ${readableMarket(m)} representan juntas ${fmt(prior)}% en 2025 completo y ${fmt(top)}% en 2026 hasta septiembre. Esta concentración puede dificultar que el resto de marcas gane presencia; no demuestra por sí sola de dónde proceden los cambios de participación.`,type:'high'},
 {tag:'03 / LO QUE FALTA POR SABER',title:'Estar en tiendas no es lo mismo que vender más',body:'Una marca puede encontrarse en más establecimientos y, aun así, perder participación. Para conocer las causas hace falta revisar disponibilidad, inventarios, surtido, precios y actividad de competidores.',type:'medium'}];}
function overview(){const c=row(state.market,'CARUPANO');if(!c){$('view').innerHTML='<div class="notice">Carúpano no tiene observaciones en este corte de mercado.</div>';return}const cm=(m)=>[key(c,'2025_full',m),key(c,'2026_ytd_sep',m)];let metric=state.metric;let [prev,cur]=cm(metric);const n=sorted().findIndex(x=>x.brand==='CARUPANO')+1;
 $('view').innerHTML=`<div class="cards">${card('Participación de Carúpano · '+metricLabel[metric],fmt(cur)+'%',diff(prev,cur))}${card('Lugar de Carúpano entre las marcas','#'+n,null,'ordenado según el indicador seleccionado')}${card('Peso comercial de tiendas con la marca',fmt(key(c,'2026_ytd_sep','weighted_distribution'))+'%',diff(...cm('weighted_distribution')))}${card('Participación en volumen',fmt(key(c,'2026_ytd_sep','volume'))+'%',diff(...cm('volume')))}</div><div class="grid2">${panel('¿Qué marcas tienen mayor participación?','Comparamos el año completo 2025 con 2026 acumulado hasta septiembre','rankChart','COMPETENCIA')}${panel('Marcas que aumentan o reducen su participación','Cambios medidos en puntos porcentuales, entre períodos distintos','deltaChart','DIFERENCIAS')}</div><div class="section-title">TRES IDEAS PARA ENTENDER LOS RESULTADOS</div><div class="grid2 equal"><div class="panel"><div class="insight-list">${insights().map(i=>`<div class="insight"><div class="flag">${i.tag}</div><h3>${i.title}</h3><p>${i.body}</p></div>`).join('')}</div></div><div class="panel"><div class="panel-heading"><div><h2>Orden de las marcas en este mercado</h2><p>${state.market.replaceAll('*','')} · Participación en valor</p></div></div>${brandTable(state.market,10)}</div></div>`;
 const winners=sorted(state.market,metric).slice(0,8).reverse();chart('rankChart',{tooltip:{trigger:'axis'},grid:{left:120,right:20,top:14,bottom:33},xAxis:{type:'value',...axis},yAxis:{type:'category',data:winners.map(x=>x.brand),...axis,axisLabel:{color:COLORS.muted,fontSize:10}},series:[{name:'2025 completo',type:'bar',data:winners.map(x=>key(x,'2025_full',metric)),itemStyle:{color:'#6b7470'},barMaxWidth:13},{name:'2026 hasta septiembre',type:'bar',data:winners.map(x=>key(x,'2026_ytd_sep',metric)),itemStyle:{color:COLORS.gold},barMaxWidth:13}],legend:{bottom:0,textStyle:{color:COLORS.muted}}});
 const dd=marketRows().filter(x=>diff(key(x,'2025_full',metric),key(x,'2026_ytd_sep',metric))!=null).sort((a,b)=>Math.abs(diff(key(b,'2025_full',metric),key(b,'2026_ytd_sep',metric)))-Math.abs(diff(key(a,'2025_full',metric),key(a,'2026_ytd_sep',metric)))).slice(0,9).reverse(); chart('deltaChart',{tooltip:{trigger:'axis',valueFormatter:v=>fmt(v,2)+' puntos porcentuales'},grid:{left:116,right:32,top:14,bottom:26},xAxis:{type:'value',...axis,axisLabel:{color:COLORS.muted,formatter:v=>String(v)}},yAxis:{type:'category',data:dd.map(x=>x.brand),...axis,axisLabel:{color:COLORS.muted,fontSize:10}},series:[{type:'bar',data:dd.map(x=>{const d=diff(key(x,'2025_full',metric),key(x,'2026_ytd_sep',metric));return {value:d,itemStyle:{color:d>=0?COLORS.green:COLORS.red}}}),barMaxWidth:20}]});}
function competition(){const selected=sorted(state.market,'value').slice(0,12);const r=row(state.market,'CARUPANO'),op=row(state.market,state.competitor);$('view').innerHTML=`<div class="cards">${card('Carúpano · valor',fmt(key(r,'2026_ytd_sep','value'))+'%',diff(key(r,'2025_full','value'),key(r,'2026_ytd_sep','value')))}${card(`${state.competitor} · valor`,fmt(key(op,'2026_ytd_sep','value'))+'%',diff(key(op,'2025_full','value'),key(op,'2026_ytd_sep','value')))}${card('Diferencia entre marcas',fmt(diff(key(r,'2026_ytd_sep','value'),key(op,'2026_ytd_sep','value')))+' puntos porcentuales',null,'participación de la otra marca menos participación de Carúpano')}${card('Marcas medidas en este mercado',marketRows().length,null,'con datos en el estudio')}</div><div class="grid2">${panel('¿Qué porcentaje del mercado tiene cada marca?','Las 12 marcas de mayor participación en este mercado','comparePlot','ORDEN DE MARCAS')}${panel('Relación entre participación y presencia en tiendas','Cada punto representa una marca: presencia en tiendas y participación en valor','scatterPlot','MATRIZ')}</div><div class="panel"><div class="panel-heading"><div><h2>Detalle de las marcas competidoras</h2><p>Participación en valor y presencia de cada marca en tiendas</p></div></div>${brandTable(state.market,35)}</div>`;
chart('comparePlot',{grid:{left:116,right:28,top:16,bottom:20},xAxis:{type:'value',...axis},yAxis:{type:'category',data:selected.slice().reverse().map(x=>x.brand),...axis,axisLabel:{color:COLORS.muted}},series:[{name:'Participación 2026 hasta septiembre',type:'bar',barMaxWidth:18,data:selected.slice().reverse().map(x=>({value:key(x,'2026_ytd_sep','value'),itemStyle:{color:x.brand==='CARUPANO'?COLORS.gold:'#5a7477'}}))}]});chart('scatterPlot',{tooltip:{trigger:'item',formatter:p=>`${p.data[2]}<br/>Valor: ${fmt(p.data[1])}%<br/>Distribución ponderada: ${fmt(p.data[0])}%`},xAxis:{type:'value',name:'Presencia ponderada',nameTextStyle:{color:COLORS.muted},...axis},yAxis:{type:'value',name:'Participación en valor',nameTextStyle:{color:COLORS.muted},...axis},series:[{type:'scatter',symbolSize:v=>v[2]==='CARUPANO'?19:10,data:marketRows().filter(x=>key(x,'2026_ytd_sep','weighted_distribution')!=null&&key(x,'2026_ytd_sep','value')!=null).map(x=>({value:[key(x,'2026_ytd_sep','weighted_distribution'),key(x,'2026_ytd_sep','value'),x.brand],itemStyle:{color:x.brand==='CARUPANO'?COLORS.gold:COLORS.blue}}))}]});}
function channels(){const mk=state.meta.markets||[...new Set(state.rows.map(x=>x.market))];let rec=mk.map(m=>({m,x:row(m,'CARUPANO')})).filter(x=>x.x).sort((a,b)=>key(b.x,'2026_ytd_sep','value')-key(a.x,'2026_ytd_sep','value'));$('view').innerHTML=`<div class="notice">Los cortes regionales y de canal <strong>pueden solaparse</strong>. Cada participación usa el denominador de su propio mercado; las cuotas no se suman. Abre <strong>Competencia por región</strong> para comparar las cinco marcas líderes en cada zona.</div><div class="grid2">${panel('¿Dónde tiene más participación Carúpano?','De cada 100 de valor vendido de ron en ese mercado, cuánto corresponde a Carúpano','marketPlot','21 CORTES')}${panel('Presencia en tiendas frente a participación','Cada punto representa un mercado distinto, con un total de ventas propio','geoPlot','DIAGNÓSTICO')}</div><div class="panel"><div class="panel-heading"><div><h2>Comparación por canal y región</h2><p>Mercados ordenados por participación de Carúpano en 2026 hasta septiembre</p></div></div>${table(['Mercado','Participación 2025','Participación 2026 hasta septiembre','Diferencia de participación','Tiendas con presencia de la marca','Peso comercial de las tiendas con la marca'],rec.map(({m,x})=>`<tr><td><strong>${readableMarket(m)}</strong></td><td>${fmt(key(x,'2025_full','value'))}%</td><td>${fmt(key(x,'2026_ytd_sep','value'))}%</td><td class="${tone(diff(key(x,'2025_full','value'),key(x,'2026_ytd_sep','value')))}">${signed(diff(key(x,'2025_full','value'),key(x,'2026_ytd_sep','value')))}</td><td>${fmt(key(x,'2026_ytd_sep','numeric_distribution'))}%</td><td>${fmt(key(x,'2026_ytd_sep','weighted_distribution'))}%</td></tr>`))}</div>`;
 chart('marketPlot',{grid:{left:190,right:28,top:7,bottom:20},xAxis:{type:'value',...axis},yAxis:{type:'category',data:rec.slice(0,13).reverse().map(x=>readableMarket(x.m)),axisLabel:{fontSize:10,color:COLORS.muted},axisLine:{show:false},axisTick:{show:false}},series:[{type:'bar',data:rec.slice(0,13).reverse().map(x=>key(x.x,'2026_ytd_sep','value')),barMaxWidth:14,itemStyle:{color:COLORS.gold}}]});chart('geoPlot',{tooltip:{trigger:'item',formatter:p=>p.data[2]+'<br/>Participación: '+fmt(p.data[1])+'%<br/>Presencia ponderada: '+fmt(p.data[0])+'%'},xAxis:{type:'value',name:'Peso comercial de las tiendas con la marca',nameTextStyle:{color:COLORS.muted},...axis},yAxis:{type:'value',name:'Participación',nameTextStyle:{color:COLORS.muted},...axis},series:[{type:'scatter',symbolSize:12,itemStyle:{color:COLORS.gold},data:rec.map(x=>[key(x.x,'2026_ytd_sep','weighted_distribution'),key(x.x,'2026_ytd_sep','value'),x.m])}]});}
function distribution(){const r=row(state.market,'CARUPANO'),op=row(state.market,state.competitor);$('view').innerHTML=`<div class="cards">${card('Tiendas que venden Carúpano',fmt(key(r,'2026_ytd_sep','numeric_distribution'))+'%',diff(key(r,'2025_full','numeric_distribution'),key(r,'2026_ytd_sep','numeric_distribution')))}${card('Presencia en tiendas de mayor peso comercial',fmt(key(r,'2026_ytd_sep','weighted_distribution'))+'%',diff(key(r,'2025_full','weighted_distribution'),key(r,'2026_ytd_sep','weighted_distribution')))}${card('Tiendas que venden la otra marca',fmt(key(op,'2026_ytd_sep','numeric_distribution'))+'%',null,state.competitor)}${card('Peso comercial de tiendas de la otra marca',fmt(key(op,'2026_ytd_sep','weighted_distribution'))+'%',null,state.competitor)}</div><div class="grid2">${panel('Comparación de presencia entre marcas','Carúpano frente a la marca seleccionada, en el período 2026 hasta septiembre','distributionPlot','PRESENCIA')}${panel('¿Presencia en tiendas o participación en ventas?','Dos indicadores diferentes: estar disponible no garantiza que el comprador elija la marca','ratioPlot','DIAGNÓSTICO')}</div><div class="notice"><strong>Cómo interpretar:</strong> distribución ponderada representa el peso de establecimientos donde está presente la marca según la definición NielsenIQ. No es porcentaje de ventas de marca ni una suma de establecimientos.</div>`;
 const brands=[r,op].filter(Boolean);const labs=['Tiendas con la marca','Peso comercial de las tiendas','Participación en valor'];chart('distributionPlot',{tooltip:{trigger:'axis'},xAxis:{type:'category',data:labs,...axis},yAxis:{type:'value',...axis},legend:{bottom:0,textStyle:{color:COLORS.muted}},series:brands.map((b,i)=>({name:b.brand,type:'bar',barMaxWidth:32,itemStyle:{color:i===0?COLORS.gold:COLORS.blue},data:['numeric_distribution','weighted_distribution','value'].map(k=>key(b,'2026_ytd_sep',k))}))});chart('ratioPlot',{xAxis:{type:'category',data:brands.map(x=>x.brand),...axis},yAxis:{type:'value',...axis},legend:{bottom:0,textStyle:{color:COLORS.muted}},series:[{name:'Participación en valor',type:'bar',data:brands.map(x=>key(x,'2026_ytd_sep','value')),itemStyle:{color:COLORS.gold}},{name:'Tiendas con presencia de la marca',type:'bar',data:brands.map(x=>key(x,'2026_ytd_sep','numeric_distribution')),itemStyle:{color:COLORS.blue}}]});}
function portfolio(){let rows=state.portfolio.filter(x=>x.market===state.market&&x.brand==='CARUPANO'&&x.segment!=null&&x.size_ml==null);const total=rows.reduce((a,b)=>a+(key(b,'2026_ytd_sep','value')??0),0);$('view').innerHTML=`<div class="cards">${card('Participación de Carúpano en el mercado elegido',fmt(key(row(state.market,'CARUPANO'),'2026_ytd_sep','value'))+'%',diff(key(row(state.market,'CARUPANO'),'2025_full','value'),key(row(state.market,'CARUPANO'),'2026_ytd_sep','value')))}${card('Tipos de ron incluidos',rows.length,null,'sin volver a contar sus formatos de envase')}${card('Participación aportada por los segmentos',fmt(total)+'%',null,'suma de los segmentos en el mismo mercado')}${portfolioReconciliationCard(total,key(row(state.market,'CARUPANO'),'2026_ytd_sep','value'))}</div><div class="grid2">${panel('¿Qué segmentos aportan participación?','Cada porción aporta una parte de la participación total de Carúpano','segmentPlot','PORTAFOLIO')}${panel('Participación aportada por cada segmento de Carúpano','Cada cifra es un porcentaje de todo el ron vendido en el mercado seleccionado','segmentBar','COMPOSICIÓN')}</div><div class="panel"><div class="panel-heading"><div><h2>Qué aporta cada tipo de ron de Carúpano</h2><p>Marca Carúpano en ${readableMarket(state.market)} · niveles no aditivos diferenciados</p></div></div>${table(['Tipo de ron','Participación 2025','Participación 2026 hasta septiembre','Diferencia entre períodos'],rows.map(x=>`<tr><td><strong>${x.segment}</strong></td><td>${fmt(key(x,'2025_full','value'))}%</td><td>${fmt(key(x,'2026_ytd_sep','value'))}%</td><td class="${tone(diff(key(x,'2025_full','value'),key(x,'2026_ytd_sep','value')))}">${signed(diff(key(x,'2025_full','value'),key(x,'2026_ytd_sep','value')))}</td></tr>`))}</div>`;
 chart('segmentPlot',{tooltip:{trigger:'item',formatter:p=>p.name+': '+fmt(p.value)+'% del mercado'},legend:{bottom:0,textStyle:{color:COLORS.muted}},series:[{type:'pie',radius:['52%','76%'],center:['50%','43%'],label:{show:false},data:rows.map((r,i)=>({name:r.segment,value:key(r,'2026_ytd_sep','value')||0,itemStyle:{color:[COLORS.gold,COLORS.blue,'#967e68','#5f755d','#b47b75'][i%5]}}))}]});chart('segmentBar',{xAxis:{type:'category',data:rows.map(x=>x.segment),axisLabel:{rotate:30,color:COLORS.muted,fontSize:10},...axis},yAxis:{type:'value',...axis},series:[{type:'bar',itemStyle:{color:COLORS.gold},data:rows.map(x=>key(x,'2026_ytd_sep','value'))}]});}
function opportunities(){return (state.meta.markets||[]).map(m=>{let r=row(m,'CARUPANO');if(!r)return null;let dv=diff(key(r,'2025_full','value'),key(r,'2026_ytd_sep','value')),dd=diff(key(r,'2025_full','numeric_distribution'),key(r,'2026_ytd_sep','numeric_distribution')),dw=diff(key(r,'2025_full','weighted_distribution'),key(r,'2026_ytd_sep','weighted_distribution'));let score=Math.max(0,-dv||0)*3+Math.max(0,-dd||0)*0.12+Math.max(0,-dw||0)*0.18;let issue=dv<0&&dd<0?'Pérdida de cuota y de cobertura':dv<0&&dd>=0?'La presencia no se convierte en cuota':dv>=0&&dd<0?'Cuota resistente, distribución en riesgo':'Sin deterioro combinado';return {market:m,dv,dd,dw,score,issue,action:dv<0&&dd<0?'Comprobar puntos de venta, disponibilidad y surtido':dv<0?'Revisar velocidad de venta, combinación de productos y presencia en tiendas':'Monitorizar y documentar palancas'};}).filter(Boolean).sort((a,b)=>b.score-a.score)}
function radar(){const records=opportunities();const max=records[0];$('view').innerHTML=`<div class="cards">${card('Mercados incluidos en el análisis',records.length,null,'cada corte es un denominador diferente')}${card('Mercados con menor participación',records.filter(x=>x.dv<0).length,null,'variación entre ventanas')}${card('Mercados con menor participación y presencia',records.filter(x=>x.dv<0&&x.dd<0).length,null,'cuota y distribución numérica')}${card('Mayor puntuación de revisión',max?.score!=null?fmt(max.score):'—',null,'Criterio de ordenación, no dinero ni impacto estimado')}</div><div class="notice"><strong>Cómo se calcula el orden de revisión:</strong> 3 × pérdida de cuota valor (en puntos porcentuales) + 0,12 × pérdida de distribución numérica (en puntos porcentuales) + 0,18 × pérdida de distribución ponderada (en puntos porcentuales). Se contabilizan solo pérdidas. La fórmula da más peso a la pérdida de participación que a la pérdida de presencia. Es un criterio práctico para ordenar investigaciones, no un pronóstico ni una prueba de las causas.</div><div class="panel"><div class="panel-heading"><div><h2>Qué mercados conviene revisar primero</h2><p>Cambios medidos, motivos por investigar y siguientes acciones</p></div><span class="tag">SEÑALES DETECTADAS EN LOS DATOS</span></div>${table(['Prioridad','Mercado','Señal','Cambio de participación en valor','Cambio de presencia en tiendas','Cambio de peso comercial de tiendas','Siguiente acción'],records.map((x,i)=>`<tr><td><span class="priority ${i>=5?'medium':''}">${i<5?'REVISAR PRIMERO':'INVESTIGAR'}</span></td><td><strong>${readableMarket(x.market)}</strong></td><td>${x.issue}</td><td class="${tone(x.dv)}">${signed(x.dv)}</td><td class="${tone(x.dd)}">${signed(x.dd)}</td><td class="${tone(x.dw)}">${signed(x.dw)}</td><td>${x.action}</td></tr>`))}</div>`}
function readableMarket(m){
 return String(m||'mercado seleccionado').replace(/1\*?$/,'').replace(/^T /,'').replace(/Alimentos_Abs/g,'alimentos (corte especial)').replace(/\+/g,' + ').trim();
}
function describeMovement(d){
 if(d==null)return 'No tenemos datos suficientes para comparar ambos períodos.';
 if(Math.abs(d)<0.005)return 'prácticamente se mantiene estable';
 return d<0?`disminuye ${fmt(Math.abs(d))} puntos porcentuales`:`aumenta ${fmt(d)} puntos porcentuales`;
}
function shortMetricExplain(m){
 return ({
 value:'De cada 100 unidades de valor de ron vendido en el mercado estudiado, qué parte corresponde a la marca. No son ingresos absolutos.',
 volume:'De cada 100 unidades de volumen de ron vendido en el mercado estudiado, qué parte corresponde a la marca. No expresa directamente facturación.',
 numeric_distribution:'Qué porcentaje de los establecimientos medidos tiene la marca presente. No indica cuánto vende cada establecimiento.',
 weighted_distribution:'Qué parte del peso comercial de las tiendas medidas corresponde a establecimientos con presencia de la marca. Tiene en cuenta la importancia de la tienda para la categoría.'
 })[m]||'';
}
function readerNarrative(){
 const c=row(state.market,'CARUPANO'), rival=row(state.market,state.competitor);
 const share0=key(c,'2025_full','value'),share1=key(c,'2026_ytd_sep','value');
 const shareChange=diff(share0,share1),m=readableMarket(state.market);
 const dn0=key(c,'2025_full','numeric_distribution'),dn1=key(c,'2026_ytd_sep','numeric_distribution');
 const dw0=key(c,'2025_full','weighted_distribution'),dw1=key(c,'2026_ytd_sep','weighted_distribution');
 const share=(v)=>v==null?'sin dato':`${fmt(v)} %`;
 if(state.page==='overview'){
   const old=key(c,'2025_full',state.metric),current=key(c,'2026_ytd_sep',state.metric);
   const rank=sorted(state.market,state.metric).findIndex(x=>x.brand==='CARUPANO')+1;
   return {title:`¿Qué nos está diciendo el mercado de ${m}?`,
    lead:`Esta pantalla resume cómo le va a Ron Carúpano dentro del mercado de ron que mide NielsenIQ. El indicador seleccionado es «${metricLabel[state.metric]}». ${shortMetricExplain(state.metric)}`,
    observed:`Carúpano registra ${share(current)} en 2026 hasta septiembre, frente a ${share(old)} en el año completo 2025: ${describeMovement(diff(old,current))}. Ocupa el lugar ${rank||'no disponible'} según el indicador seleccionado.`,
    means:`El porcentaje indica qué proporción del mercado medido corresponde a Carúpano. No es una cifra de ventas absolutas. Los gráficos comparan marcas y muestran si aumentan o disminuyen sus participaciones.`,
    next:`Revisa las marcas que ganan participación y cruza la situación de Carúpano con su presencia en tiendas. Si encontramos pérdidas de participación y de distribución, será prioritario investigar cobertura y disponibilidad.`,
    note:'Las dos ventanas temporales tienen diferente duración. Estos cambios de participación no equivalen a variaciones interanuales de facturación.'};
 }
 if(state.page==='competition'){
   const cv=key(c,'2026_ytd_sep','value'),rv=key(rival,'2026_ytd_sep','value');
   const gap=rv==null||cv==null?null:Math.abs(rv-cv);
   return {title:`¿Cómo se compara Carúpano con ${state.competitor}?`,
     lead:`Aquí mostramos qué marcas concentran el valor vendido de ron dentro de ${m}. Puedes cambiar la marca de comparación arriba. Tener más participación significa representar una mayor proporción de las ventas medidas.`,
     observed:`En 2026 hasta septiembre, Carúpano tiene ${share(cv)} del valor medido, frente a ${share(rv)} de ${state.competitor}. ${gap==null?'':`${rv>cv?state.competitor:'Carúpano'} lleva una ventaja de ${fmt(gap)} puntos porcentuales.`}`,
     means:'El gráfico de puntos relaciona cuánto vende cada marca en proporción al mercado con la importancia de las tiendas donde está presente. Una marca puede tener mucha distribución sin una participación equivalente.',
     next:'Identifica al competidor con el que quieras compararte y examina si su fortaleza proviene de una mayor presencia en tiendas o de una mayor participación donde está disponible. Para confirmar motivos hacen falta datos adicionales de ventas y precios.',
     note:'La concentración del mercado no identifica de qué marca proceden las ganancias o pérdidas de otra. Los indicadores no prueban causalidad.'};
 }
 if(state.page==='channels'){
   const a=row('Total Autoservicio1','CARUPANO'),l=row('Total Licorerias1*','CARUPANO'),cap=row('Capital Autoservicio1*','CARUPANO');
   const av=diff(key(a,'2025_full','value'),key(a,'2026_ytd_sep','value'));
   const lv=diff(key(l,'2025_full','value'),key(l,'2026_ytd_sep','value'));
   const capDn=diff(key(cap,'2025_full','numeric_distribution'),key(cap,'2026_ytd_sep','numeric_distribution'));
   return {title:'No todos los tipos de tienda cuentan la misma historia',
     lead:'NielsenIQ separa el mercado de ron en distintos canales —por ejemplo, autoservicios y licorerías— y regiones. Cada porcentaje se calcula sobre las ventas del propio mercado. Por eso no debe sumarse al porcentaje de otra región o canal.',
     observed:`En el total de autoservicios, la participación en valor de Carúpano ${describeMovement(av)}. En licorerías, la participación ${describeMovement(lv)}. En autoservicios de Capital, su presencia numérica ${describeMovement(capDn)}.`,
     means:'Una participación de 20 % en una región no significa que esa región aporte el doble de ventas que otra donde la marca tiene 10 %. El tamaño total de cada mercado puede ser distinto y no está disponible en este archivo.',
     next:'Prioriza la revisión de los mercados donde coinciden caídas de participación y de presencia en tiendas. Contrástalos con ventas internas, puntos de venta concretos y potencial comercial antes de asignar recursos.',
     note:'Algunos cortes geográficos y de canal se solapan, y los cortes de «alimentos» son específicos del proveedor. No representan necesariamente territorios independientes.'};
 }
 if(state.page==='distribution'){
   const rivalNum=key(rival,'2026_ytd_sep','numeric_distribution');
   let contrast=shareChange<0&&dn1>dn0?'Aunque Carúpano aparece en una proporción ligeramente mayor de tiendas, su participación en valor es menor.':'La participación y la presencia en establecimientos deben revisarse juntas, porque no miden lo mismo.';
   return {title:'Estar presente en una tienda no garantiza que el comprador elija Carúpano',
     lead:'Este apartado separa dos preguntas: ¿en cuántas tiendas aparece la marca? y ¿qué importancia tienen esas tiendas para las ventas de ron? La primera es la distribución numérica; la segunda, la distribución ponderada.',
     observed:`En ${m}, Carúpano está presente en ${share(dn1)} de los establecimientos medidos (sin ponderar) y en establecimientos que representan ${share(dw1)} del peso comercial de la categoría. ${state.competitor} aparece en ${share(rivalNum)} de las tiendas.`,
     means:contrast,
     next:'Solicita al equipo comercial revisión de disponibilidad real, inventarios, exhibición, surtido y ejecución en tiendas importantes. Un aumento de presencia sin aumento de cuota no demuestra, por sí solo, un problema de rotación.',
     note:'La distribución ponderada no es participación en las ventas de Carúpano ni porcentaje de botellas vendidas.'};
 }
 if(state.page==='portfolio'){
   const seg=state.portfolio.filter(x=>x.market===state.market&&x.brand==='CARUPANO'&&x.segment!=null&&x.size_ml==null);
   const main=seg.slice().sort((a,b)=>(key(b,'2026_ytd_sep','value')||0)-(key(a,'2026_ytd_sep','value')||0))[0];
   const total=seg.reduce((v,x)=>v+(key(x,'2026_ytd_sep','value')||0),0);
   return {title:'¿Qué aporta cada tipo de ron a la posición de Carúpano?',
     lead:'El proveedor agrupa productos en segmentos como estándar, premium o super premium. En esta vista separamos esos segmentos sin volver a sumar tamaños, para evitar contar dos veces las mismas ventas.',
     observed:`En ${m}, el segmento que más aporta a la participación en valor de Carúpano es «${main?.segment||'sin clasificar'}» (${share(key(main,'2026_ytd_sep','value'))} del valor de todo el mercado de ron). La suma de los segmentos disponibles es ${share(total)}, frente al total de Carúpano de ${share(share1)}.`,
     means:'Ojo: estos porcentajes se refieren al mercado total de ron, no a cuánto representa cada segmento dentro de Carúpano. El gráfico circular muestra la composición entre los segmentos de la marca, pero la tabla muestra su contribución al mercado general.',
     next:'Compara qué segmentos sostienen la participación total y cuáles pierden peso. Antes de cambiar inversiones, revisa precio, rentabilidad, disponibilidad y posibles movimientos entre formatos.',
     note:'Las clasificaciones del proveedor pueden variar. Cambios entre envases de 700 y 750 mililitros no deben interpretarse automáticamente como abandono del producto.'};
 }
 if(state.page==='radar'){
   const rec=opportunities(),top=rec[0],downs=rec.filter(x=>x.dv<0&&x.dd<0).length;
   return {title:'Un detector de señales, no un pronóstico de ventas',
     lead:'El sistema compara automáticamente cambios de participación en valor con cambios de presencia en tiendas. Después ordena los mercados mediante una puntuación de revisión basada en reglas visibles. No usa inteligencia artificial para inventar causas.',
     observed:`En ${rec.length} cortes de mercado se identifican ${downs} casos donde la participación en valor y la distribución numérica son menores en el período más reciente. El corte que encabeza la lista es ${readableMarket(top?.market)}.`,
     means:'Una puntuación alta significa que varias señales de deterioro coinciden; no indica cuánto dinero está perdiendo la marca ni garantiza que la oportunidad sea la mayor del mercado. Los cortes más pequeños pueden producir variaciones grandes.',
     next:'Usa el orden como una lista de investigaciones para Comercial: confirmar datos de clientes, disponibilidad, inventarios y potencial antes de definir prioridades de inversión.',
     note:'La regla aplica pesos definidos para ordenar señales; no está calibrada con ventas absolutas, tamaño de mercado o rentabilidad. Los períodos comparados no son idénticos.'};
 }
 return null;
}
function explainCharts(){
 const hints={
 rankChart:['Cómo se lee','Las barras representan la participación del indicador seleccionado de cada marca. El color más claro corresponde a 2025 completo y el dorado a 2026 hasta septiembre. Compara las barras de una misma marca; no sumes participaciones de distintos canales.'],
 deltaChart:['Cómo se lee','Las barras muestran cuánto ha aumentado o disminuido la participación en puntos porcentuales. Ejemplo: de 9 % a 8 % es una caída de 1 punto porcentual, no una caída de 1 % de ventas.'],
 comparePlot:['Cómo se lee','Cada barra muestra qué parte del valor total de ventas de ron corresponde a una marca en el mercado elegido. Las barras no muestran ventas en dinero.'],
 scatterPlot:['Cómo se lee','Cada punto es una marca. Más a la derecha significa presencia en tiendas de mayor peso comercial; más arriba significa mayor participación en valor. No podemos deducir la causa de la diferencia solo con estas dos cifras.'],
 marketPlot:['Cómo se lee','Compara la proporción del mercado de ron que representa Carúpano dentro de cada corte. Una barra más alta no significa necesariamente más dinero vendido, porque cada mercado tiene un tamaño diferente.'],
 geoPlot:['Cómo se lee','Cada punto representa un mercado diferente. Su posición horizontal refleja la importancia comercial de las tiendas con presencia de Carúpano; la vertical muestra su participación en valor dentro de ese corte.'],
 distributionPlot:['Cómo se lee','Las tres categorías no significan lo mismo: porcentaje de tiendas que tienen la marca, importancia de esas tiendas y proporción de valor vendido. No deben sumarse.'],
 ratioPlot:['Cómo se lee','Las columnas comparan dos mediciones diferentes: cuánto valor representa la marca y en qué porcentaje de establecimientos aparece. Una diferencia entre ambas no permite calcular ventas por tienda.'],
 segmentPlot:['Cómo se lee','Este círculo distribuye entre segmentos la contribución total de Carúpano al mercado. Una porción grande significa que ese segmento aporta más participación a la marca, no necesariamente mayor rentabilidad.'],
 segmentBar:['Cómo se lee','Cada barra representa el porcentaje del valor total del mercado de ron aportado por los productos Carúpano de ese segmento. No es la participación de Carúpano dentro de ese segmento del mercado.'],
 };
 for(const [id,[title,body]] of Object.entries(hints)){
  const target=document.getElementById(id);
  if(target&&target.closest('#view'))target.insertAdjacentHTML('afterend',`<div class="chart-reading"><strong>${title}.</strong><p>${body}</p></div>`);
 }
 const tableHints={
  overview:'Cada fila es una marca. Los porcentajes de 2025 y 2026 tienen como referencia el mercado seleccionado; la columna de diferencia muestra el cambio directo entre esos porcentajes, no crecimiento de ventas.',
  competition:'Para cada marca, compara cuánto representa del valor de ventas de ron y si aparece en tiendas comercialmente relevantes. Su relación es descriptiva: no prueba por qué una marca tiene más ventas que otra.',
  channels:'Cada fila corresponde a un mercado con su propio total de ventas de ron. Ordenar por porcentaje no equivale a ordenar por facturación, porque falta el tamaño de cada mercado.',
  portfolio:'Las filas son segmentos del portafolio Carúpano. Sus contribuciones pueden sumarse dentro de un mismo nivel, pero no se deben sumar de nuevo con tamaños o totales de marca.',
  radar:'La señal es una hipótesis de trabajo. La columna de acción propone un paso para investigar, no una conclusión definitiva ni un compromiso de inversión.'
 };
 if(tableHints[state.page])document.querySelectorAll('#view .table-wrap').forEach(t=>t.insertAdjacentHTML('afterend',`<p class="table-reading"><strong>Cómo leer esta tabla:</strong> ${tableHints[state.page]}</p>`));
}
function explainDashboard(){
 const filters={segments:['marketSelect'],premium:['marketSelect'],value:['marketSelect'],distributionMatrix:['marketSelect'],formats:['marketSelect'],movements:['marketSelect'],regional:[],strategic:['marketSelect'],overview:['marketSelect','metricSelect'],competition:['marketSelect','competitorSelect'],channels:[],distribution:['marketSelect','competitorSelect'],portfolio:['marketSelect'],radar:[]};
 for(const name of ['marketSelect','metricSelect','competitorSelect']){
  const element=$(name);
  if(element?.closest('label'))element.closest('label').style.display=(filters[state.page]||[]).includes(name)?'':'none';
 }
 const n=readerNarrative();
 if(!n)return;
 const section=`<section class="reader-first" aria-label="Explicación de la sección"><div class="reader-kicker">ANTES DE VER LOS GRÁFICOS</div><h2>${n.title}</h2><p class="lead">${n.lead}</p><div class="reader-columns"><div class="reader-tile"><h3>1 · Qué muestran las cifras</h3><p>${n.observed}</p></div><div class="reader-tile"><h3>2 · Qué significan</h3><p>${n.means}</p></div><div class="reader-tile"><h3>3 · Qué conviene hacer</h3><p>${n.next}</p></div></div><div class="reader-note"><strong>Límite de los datos:</strong> ${n.note}</div></section>`;
 $('view').insertAdjacentHTML('afterbegin',section);
 explainCharts();
}
function advancedPage(){
 const result=buildAdvancedView(state.rows,state.portfolio,state.page,state.market,state.advancedSegment,state.advancedBrand);
 $('view').innerHTML=result.html;
 result.charts.forEach(c=>chart(c.id,c.option));
 const segment=$('advSegmentSelect');
 if(segment)segment.addEventListener('change',()=>{state.advancedSegment=segment.value;render()});
 const brand=$('advBrandSelect');
 if(brand)brand.addEventListener('change',()=>{state.advancedBrand=brand.value;render()});
}
function regional(){
 const result=buildRegionalView(state.rows,state.regionalMarket);
 $('view').innerHTML=result.html;
 result.charts.forEach(c=>chart(c.id,c.option));
 const selector=$('regionDetailSelect');
 if(selector)selector.addEventListener('change',()=>{state.regionalMarket=selector.value;render()});
 document.querySelectorAll('#view [data-region-market]').forEach(button=>button.addEventListener('click',()=>{
  const id=button.dataset.regionMarket;
  if(!id)return;
  state.regionalMarket=id;
  render();
  window.scrollTo({top:0,behavior:'smooth'});
 }));
}
function strategic(){
 const report=buildStrategicView(state.rows,state.portfolio,state.market,state.competitor);
 $('view').innerHTML=report.html;
 for(const c of report.charts){chart(c.id,c.option);}
 document.querySelectorAll('#view [data-inspect-market]').forEach(button=>{
   button.addEventListener('click',()=>{
     const chosen=button.dataset.inspectMarket;
     if(!chosen)return;
     state.market=chosen;
     $('marketSelect').value=chosen;
     render();
     window.scrollTo({top:0,behavior:'smooth'});
   });
 });
 document.querySelectorAll('#view [data-regional-rivals]').forEach(button=>button.addEventListener('click',()=>{
   const id=button.dataset.regionalRivals;
   if(!id)return;
   state.regionalMarket=id;
   state.page='regional';
   render();
   window.scrollTo({top:0,behavior:'smooth'});
 }));
 const b=$('copyStrategyBrief');
 if(b)b.addEventListener('click',async ()=>{
  try{
   if(!navigator.clipboard?.writeText)throw new Error('El navegador no permite copiar automáticamente');
   await navigator.clipboard.writeText(report.brief);
   b.textContent='Resumen copiado';
  }catch(e){
   b.textContent='Usa la opción Exportar vista o copia el texto del informe';
  }
 });
}
function render(){state.charts.forEach(c=>c.dispose());state.charts=[];const [kick,title,desc]=PAGES[state.page];$('kicker').textContent=kick;$('pageTitle').innerHTML=title;$('pageDesc').textContent=desc;document.querySelectorAll('.nav-button').forEach(x=>x.classList.toggle('active',x.dataset.page===state.page));({overview,strategic,competition,regional,channels,distribution,portfolio,radar,segments:advancedPage,premium:advancedPage,value:advancedPage,distributionMatrix:advancedPage,formats:advancedPage,movements:advancedPage})[state.page]();explainDashboard();}
function navigate(page,{updateHash=true}={}){
 if(!Object.prototype.hasOwnProperty.call(PAGES,page)){
  console.error('Sección desconocida:',page);
  return;
 }
 state.page=page;
 if(updateHash&&window.location&&window.location.hash!==('#'+page)){
  window.location.hash=page;
 }
 render();
}
function initialize(){if($('brandHome'))$('brandHome').addEventListener('click',()=>navigate('overview'));const markets=state.meta.markets||[...new Set(state.rows.map(x=>x.market))];$('marketSelect').innerHTML=markets.map(m=>`<option value="${m}" ${m===NATION?'selected':''}>${readableMarket(m)}</option>`).join('');const national=sorted(NATION,'value');$('competitorSelect').innerHTML=national.filter(x=>x.brand!=='CARUPANO').map(r=>`<option value="${r.brand}" ${r.brand==='CACIQUE'?'selected':''}>${r.brand}</option>`).join('');document.querySelectorAll('.nav-button').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.page)));$('marketSelect').addEventListener('change',e=>{state.market=e.target.value;render()});$('metricSelect').addEventListener('change',e=>{state.metric=e.target.value;render()});$('competitorSelect').addEventListener('change',e=>{state.competitor=e.target.value;render()});$('exportBtn').addEventListener('click',()=>window.print());window.addEventListener('resize',()=>state.charts.forEach(c=>c.resize()));window.addEventListener('hashchange',()=>{const page=window.location?.hash?.slice(1);if(page&&PAGES[page]&&page!==state.page)navigate(page,{updateHash:false})});const requestedPage=window.location?.hash?.slice(1);if(requestedPage&&PAGES[requestedPage])state.page=requestedPage;render()}
async function main(){try{const results=await Promise.all(['data/market-brand.json','data/portfolio.json','data/metadata.json'].map(p=>fetch(p).then(r=>{if(!r.ok)throw new Error(`${p}: ${r.status}`);return r.json()})));[state.rows,state.portfolio,state.meta]=results;initialize()}catch(err){$('view').innerHTML=`<div class="notice" role="alert"><strong>No se pudieron cargar los datos de NielsenIQ.</strong> ${String(err.message).replace(/</g,'&lt;')}. <button type="button" id="retryData" class="ghost">Reintentar carga</button><p>Si el menú no responde, actualiza la página sin caché y vuelve a intentar.</p></div>`;const retry=$('retryData');if(retry)retry.addEventListener('click',()=>main());console.error(err)}}main();