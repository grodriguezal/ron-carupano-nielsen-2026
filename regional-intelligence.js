export function buildRegionalView(rows, selectedMarket="Capital Autoservicio1*"){
  const markets=[
    {id:"Capital Autoservicio1*",area:"Capital",label:"Capital · autoservicios",kind:"region",channel:"Autoservicios"},
    {id:"Capital Tradicional1*",area:"Capital",label:"Capital · tradicional",kind:"region",channel:"Tradicional"},
    {id:"Andes+Occidente Autoservicio1*",area:"Andes y Occidente",label:"Andes y Occidente · autoservicios",kind:"region",channel:"Autoservicios"},
    {id:"Andes+Occidente Tradicional1*",area:"Andes y Occidente",label:"Andes y Occidente · tradicional",kind:"region",channel:"Tradicional"},
    {id:"Centro+Centro Occidente Autoservicio1*",area:"Centro y Centro Occidente",label:"Centro y Centro Occidente · autoservicios",kind:"region",channel:"Autoservicios"},
    {id:"Centro+Centro Occidente Tradicional1*",area:"Centro y Centro Occidente",label:"Centro y Centro Occidente · tradicional",kind:"region",channel:"Tradicional"},
    {id:"Oriente Autoservicio1*",area:"Oriente",label:"Oriente · autoservicios",kind:"region",channel:"Autoservicios"},
    {id:"Oriente Tradicional1*",area:"Oriente",label:"Oriente · tradicional",kind:"region",channel:"Tradicional"},
    {id:"T Caracas Alimentos_Abs",area:"Caracas",label:"Caracas · corte especial de alimentos",kind:"special",channel:"Alimentos (corte especial)"},
    {id:"T Maracaibo Alimentos_Abs",area:"Maracaibo",label:"Maracaibo · corte especial de alimentos",kind:"special",channel:"Alimentos (corte especial)"},
    {id:"T Valencia Alimentos_Abs",area:"Valencia",label:"Valencia · corte especial de alimentos",kind:"special",channel:"Alimentos (corte especial)"},
    {id:"T Capital Alimentos_Abs",area:"Capital",label:"Capital · corte especial de alimentos",kind:"special",channel:"Alimentos (corte especial)"},
    {id:"T Andes+Occidente Alimentos_Abs",area:"Andes y Occidente",label:"Andes y Occidente · corte especial de alimentos",kind:"special",channel:"Alimentos (corte especial)"},
    {id:"T Centro+Centro Occidente Alimentos_Abs",area:"Centro y Centro Occidente",label:"Centro y Centro Occidente · corte especial de alimentos",kind:"special",channel:"Alimentos (corte especial)"},
    {id:"T Oriente Alimentos_Abs",area:"Oriente",label:"Oriente · corte especial de alimentos",kind:"special",channel:"Alimentos (corte especial)"}
  ];
  const escape=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  const num=(v,d=2)=>v==null||!Number.isFinite(Number(v))?"Sin dato":Number(v).toLocaleString("es-VE",{minimumFractionDigits:d,maximumFractionDigits:d});
  const val=(r,metric="value",period="2026_ytd_sep")=>r?.[period]?.[metric]??null;
  const change=(r,metric="value")=>{const a=val(r,metric,"2025_full"),b=val(r,metric);return a==null||b==null?null:b-a};
  const difference=d=>d==null?"No comparable":`${d>0?"+":""}${num(d)} puntos porcentuales`;
  const compact=d=>d==null?"—":`${d>0?"+":""}${num(d)} puntos`;
  const classDiff=d=>d==null?"neutral":d>0.005?"positive":d<-.005?"negative":"neutral";
  const byMarket=m=>rows.filter(r=>r.market===m && val(r,"value")!=null).sort((a,b)=>(val(b,"value")??0)-(val(a,"value")??0));
  const byBrand=(m,brand)=>rows.find(r=>r.market===m&&r.brand===brand);
  const chosen=markets.find(m=>m.id===selectedMarket)||markets[0];
  selectedMarket=chosen.id;
  const ranking=byMarket(selectedMarket);
  const car=byBrand(selectedMarket,"CARUPANO");
  const carRank=ranking.findIndex(r=>r.brand==="CARUPANO")+1;
  const competitors=ranking.filter(r=>r.brand!=="CARUPANO").slice(0,5);
  const displayRows=[...competitors,car].filter(Boolean).sort((a,b)=>(val(b,"value")??0)-(val(a,"value")??0));
  const leader=competitors[0],fifth=competitors[4];
  const carVal=val(car,"value"),leadVal=val(leader,"value");
  const gap=carVal==null||leadVal==null?null:leadVal-carVal;
  const coverage=change(car,"numeric_distribution");
  const weighted=change(car,"weighted_distribution");
  const delta=change(car,"value");
  const largestGain=ranking.filter(r=>change(r,"value")!=null).slice().sort((a,b)=>change(b,"value")-change(a,"value"))[0];
  const largestLoss=ranking.filter(r=>change(r,"value")!=null).slice().sort((a,b)=>change(a,"value")-change(b,"value"))[0];
  const carSharePast=val(car,"value","2025_full");
  const previousRank=rows.filter(r=>r.market===selectedMarket&&val(r,"value","2025_full")!=null).sort((a,b)=>val(b,"value","2025_full")-val(a,"value","2025_full")).findIndex(r=>r.brand==="CARUPANO")+1;
  const shareReadable=carVal==null?"sin dato de participación":`${num(carVal)} % de las ventas en valor medidas`;
  const delMessage=delta==null?"No disponemos de ambos períodos para calcular el cambio de Carúpano.":Math.abs(delta)<.005?"Su participación prácticamente no cambia.":`Su participación ${delta<0?"disminuye":"aumenta"} ${num(Math.abs(delta))} puntos porcentuales frente al período de referencia.`;
  const coverageMessage=coverage==null?"Faltan datos para comparar su presencia en tiendas.":coverage<-.005?"Su presencia numérica en tiendas también cae; conviene investigar disponibilidad y cobertura.":coverage>.005?"Su presencia numérica en tiendas mejora. Esto no garantiza una participación mayor: hay que revisar el peso de las tiendas y el surtido.":"La presencia numérica es prácticamente estable; hay que investigar otros factores del cambio de participación.";
  const regionalMatrix=markets.filter(m=>m.kind==="region").map(m=>{
    const r=byMarket(m.id),c=byBrand(m.id,"CARUPANO"),p=r.findIndex(x=>x.brand==="CARUPANO")+1,top=r.filter(x=>x.brand!=="CARUPANO").slice(0,5);
    return {market:m,rank:p,car:c,top,leader:top[0]};
  });
  const cityMatrix=markets.filter(m=>m.kind==="special").map(m=>{
    const r=byMarket(m.id),c=byBrand(m.id,"CARUPANO"),p=r.findIndex(x=>x.brand==="CARUPANO")+1,top=r.filter(x=>x.brand!=="CARUPANO").slice(0,5);
    return {market:m,rank:p,car:c,top,leader:top[0]};
  });
  const rowAction=(m)=>`<button type="button" class="region-jump inline-toggle" data-inline-market="${escape(m.id)}" aria-expanded="false" aria-label="Desplegar detalles de ${escape(m.label)} aquí">Ver detalle aquí ▾</button>`;
  const topRow=(r)=>{
    const v=val(r,"value"),d=change(r),rank=ranking.findIndex(x=>x.brand===r.brand)+1;
    return `<tr class="${r.brand==="CARUPANO"?"highlight":""}"><td><strong>${rank}. ${escape(r.brand)}</strong>${r.brand==="CARUPANO"?'<small class="region-carupano-label">Nuestra marca</small>':""}</td><td>${num(v)} %</td><td><span class="${classDiff(d)}">${difference(d)}</span></td><td>${num(val(r,"volume"))} %</td><td>${num(val(r,"numeric_distribution"))} %</td><td>${num(val(r,"weighted_distribution"))} %</td></tr>`;
  };
  const matrixRow=(x)=>`<tr class="${x.market.id===chosen.id?"region-highlight":""}"><td><strong>${escape(x.market.label)}</strong><small>${x.market.kind==="special"?"No representa todas las tiendas de la ciudad":x.market.channel}</small></td><td class="region-rank">${x.rank>0?`#${x.rank}`:"—"}</td><td>${num(val(x.car))} % <small class="${classDiff(change(x.car))}">${compact(change(x.car))}</small></td><td>${escape(x.leader?.brand||"Sin datos")} <small>${num(val(x.leader))} %</small></td><td>${x.top.map((b,i)=>`<div class="rival-mini"><span>${i+1}. ${escape(b.brand)}</span><strong>${num(val(b))} %</strong></div>`).join("")}</td><td>${rowAction(x.market)}</td></tr>`;
  const option=(m)=>`<option value="${escape(m.id)}" ${m.id===chosen.id?"selected":""}>${escape(m.label)}</option>`;
  const cards=`
     <div class="regional-kpis">
      <article class="regional-kpi"><span>Carúpano en ${escape(chosen.area)}</span><strong>${num(carVal)} %</strong><small>Participación en valor, 2026 hasta septiembre</small></article>
      <article class="regional-kpi"><span>Posición de Carúpano</span><strong>${carRank>0?"#"+carRank:"Sin datos"}</strong><small>Entre ${ranking.length} marcas con cuota de valor reportada${previousRank>0?`; posición anterior #${previousRank}`:""}</small></article>
      <article class="regional-kpi"><span>Marca líder: ${escape(leader?.brand||"—")}</span><strong>${num(leadVal)} %</strong><small>${gap==null?"Sin comparación":`${num(gap)} puntos de participación por encima de Carúpano`}</small></article>
      <article class="regional-kpi"><span>Variación de Carúpano</span><strong class="${classDiff(delta)}">${delta==null?"—":(delta>0?"+":"")+num(delta)}</strong><small>puntos porcentuales frente a 2025 completo</small></article>
     </div>`;
  const noteSpecial=chosen.kind==="special"?`<div class="regional-method-alert"><strong>Atención al alcance:</strong> «${escape(chosen.label)}» es el corte especial de alimentos identificado por NielsenIQ. No representa necesariamente todas las licorerías, supermercados o ventas de ron de ${escape(chosen.area)}. No debe tratarse como participación total de la ciudad.</div>`:`<div class="regional-method-alert"><strong>Ámbito geográfico:</strong> «${escape(chosen.area)}» es una agrupación de NielsenIQ; no equivale necesariamente a la ciudad del mismo nombre. Los canales de autoservicio y tradicional son universos diferentes, así que se comparan por separado.</div>`;
  const insights=`
    <div class="regional-insights">
       <div class="regional-insight"><span>01 · POSICIÓN COMPETITIVA</span><h3>¿Qué lugar ocupa Carúpano?</h3><p>Carúpano ocupa la posición <strong>${carRank>0?"#"+carRank:"no disponible"}</strong> por ventas en valor en este corte, con ${shareReadable}. ${escape(leader?.brand||"La marca líder")} encabeza el ranking con ${num(leadVal)} %. La diferencia entre ambas es de ${gap==null?"valor desconocido":`${num(gap)} puntos porcentuales`}.</p></div>
       <div class="regional-insight"><span>02 · EVOLUCIÓN</span><h3>¿Estamos mejor o peor?</h3><p>En 2025 completo, Carúpano tenía ${num(carSharePast)} %; en 2026 hasta septiembre, ${num(carVal)} %. ${delMessage} ${coverageMessage}</p></div>
       <div class="regional-insight"><span>03 · QUÉ INVESTIGAR</span><h3>¿Qué debemos revisar?</h3><p>Antes de decidir una inversión, cruzar la participación de Carúpano con distribución numérica (${num(val(car,"numeric_distribution"))} %) y ponderada (${num(val(car,"weighted_distribution"))} %). También observar a ${escape(largestGain?.brand||"las marcas al alza")} (${difference(change(largestGain))}) y ${escape(largestLoss?.brand||"las marcas a la baja")} (${difference(change(largestLoss))}). Esto indica movimientos relativos, no transferencias demostradas de compradores.</p></div>
    </div>`;
  const html=`<section class="regional-intro"><div class="regional-intro-head"><div><div class="strategic-kicker">INTELIGENCIA COMPETITIVA GEOGRÁFICA</div><h2>¿Cómo compite Carúpano <em>en cada región?</em></h2><p>Analizamos por separado cada región y canal: quiénes son sus cinco competidores con mayor participación en valor, cuánto representan y qué cambia frente a los datos de 2025. Las conclusiones se ajustan al territorio seleccionado.</p></div></div>
   <div class="regional-controls"><label for="regionDetailSelect">Selecciona la región o el corte de ciudad<select id="regionDetailSelect"><optgroup label="Regiones · canales tradicionales y autoservicios">${markets.filter(x=>x.kind==="region").map(option).join("")}</optgroup><optgroup label="Ciudades y cortes especiales de alimentos">${markets.filter(x=>x.kind==="special").map(option).join("")}</optgroup></select></label><span class="regional-legend">Clasificación por participación de mercado en valor · hasta septiembre de 2026</span></div>
   ${noteSpecial}${cards}
   <div class="section-title">LECTURA DEL MERCADO · ${escape(chosen.label.toUpperCase())}</div>
   ${insights}
   <div class="grid2 regional-charts"><div class="panel"><div class="panel-heading"><div><h2>Las cinco marcas competidoras más importantes</h2><p>Comparamos los cinco competidores con mayor participación y añadimos a Carúpano como referencia.</p></div></div><div class="plot tall" id="regionTopChart"></div><div class="chart-reading">Cada barra representa el porcentaje del valor vendido de ron en este mismo mercado; no es facturación en dólares.</div></div>
   <div class="panel"><div class="panel-heading"><div><h2>Quién gana y pierde participación</h2><p>Diferencia entre 2025 completo y 2026 hasta septiembre. Incluimos a Carúpano para compararlo con los cinco competidores.</p></div></div><div class="plot tall" id="regionShiftChart"></div><div class="chart-reading">Un aumento de participación no demuestra que una marca haya obtenido directamente las ventas de otra. Los períodos comparados tienen distinta duración.</div></div></div>
   <div class="panel regional-leaderboard"><div class="panel-heading"><div><h2>Comparación completa en ${escape(chosen.label)}</h2><p>Los cinco competidores líderes, más Carúpano, con volumen y presencia en tiendas.</p></div></div><div class="table-wrap"><table class="table region-table"><thead><tr><th>Marca y puesto</th><th>Participación en valor</th><th>Cambio de participación</th><th>Participación en volumen</th><th>Tiendas con presencia</th><th>Presencia ponderada</th></tr></thead><tbody>${displayRows.map(topRow).join("")}</tbody></table></div><div class="chart-reading"><strong>Qué significan las columnas:</strong> «valor» mide la parte del dinero vendido; «volumen», la proporción de cantidad vendida; «tiendas» indica presencia numérica; «ponderada» da más peso a las tiendas relevantes. Son indicadores diferentes y no se suman.</div></div>
   <div class="section-title">PANORAMA GENERAL · OCHO MERCADOS REGIONALES</div>
   <section class="panel regional-matrix"><div class="panel-heading"><div><h2>Mapa competitivo de todas las regiones</h2><p>Cada fila tiene su propio ranking de cinco competidores. «Capital» y «Andes y Occidente» son áreas NielsenIQ; cada canal tiene un denominador distinto.</p></div></div><div class="table-wrap"><table class="table region-comparison"><thead><tr><th>Región y canal</th><th>Carúpano, puesto</th><th>Carúpano, participación</th><th>Marca líder</th><th>Los cinco principales competidores</th><th>Detalle</th></tr></thead><tbody>${regionalMatrix.map(matrixRow).join("")}</tbody></table></div><p class="regional-footnote">Los porcentajes de diferentes regiones y canales no deben sumarse. Un porcentaje más alto tampoco significa necesariamente un mayor volumen de ventas absoluto.</p></section>
   <div class="section-title">CARACAS, MARACAIBO Y VALENCIA · CORTES ESPECIALES</div>
   <section class="panel regional-matrix"><div class="panel-heading"><div><h2>Comparación por ciudad y cortes específicos de alimentos</h2><p>Estos son los cortes adicionales que contiene NielsenIQ. Se presentan de manera diferenciada para evitar confundirlos con el mercado completo de una ciudad.</p></div></div><div class="table-wrap"><table class="table region-comparison"><thead><tr><th>Zona y alcance</th><th>Carúpano, puesto</th><th>Carúpano, participación</th><th>Marca líder</th><th>Los cinco principales competidores</th><th>Detalle</th></tr></thead><tbody>${cityMatrix.map(matrixRow).join("")}</tbody></table></div><p class="regional-footnote">La denominación «Alimentos_Abs» procede del archivo NielsenIQ. La selección de productos y establecimientos de este corte no se puede equiparar automáticamente a «todos los rones vendidos en la ciudad».</p></section>
   <div class="regional-method"><strong>Fuente y límites.</strong> NielsenIQ, 2025 completo frente a 2026 acumulado hasta septiembre. Top cinco calculado dentro de cada mercado según participación en valor de 2026. Carúpano se agrega siempre aparte si no está en el top cinco. La clasificación y el cambio son descriptivos; no incluyen precios, facturación total ni rentabilidad.</div>
  </section>`;
  const ax={axisLine:{lineStyle:{color:"#353a38"}},axisLabel:{color:"#bec5bc",fontSize:11},axisTick:{show:false},splitLine:{lineStyle:{color:"#343a37"}}};
  const reverse=displayRows.slice().reverse();
  const charts=[
    {id:"regionTopChart",option:{
      grid:{left:124,right:22,top:12,bottom:30},tooltip:{trigger:"axis",axisPointer:{type:"shadow"},valueFormatter:v=>`${num(v)} %`},
      xAxis:{type:"value",...ax,axisLabel:{color:"#aeb4a9",formatter:v=>v+" %"}},
      yAxis:{type:"category",data:reverse.map(r=>r.brand),...ax,axisLabel:{color:"#cbd0c6",fontSize:11}},
      series:[{type:"bar",barMaxWidth:22,data:reverse.map(r=>({value:val(r),itemStyle:{color:r.brand==="CARUPANO"?"#c5b783":"#617e7b"}}))}]}
    },
    {id:"regionShiftChart",option:{
      grid:{left:124,right:22,top:12,bottom:30},tooltip:{trigger:"axis",axisPointer:{type:"shadow"},valueFormatter:v=>`${num(v)} puntos porcentuales`},
      xAxis:{type:"value",...ax,axisLabel:{color:"#aeb4a9"}},
      yAxis:{type:"category",data:reverse.map(r=>r.brand),...ax,axisLabel:{color:"#cbd0c6",fontSize:11}},
      series:[{type:"bar",barMaxWidth:22,data:reverse.map(r=>({value:change(r),itemStyle:{color:r.brand==="CARUPANO"?"#c5b783":change(r)<0?"#ce8379":"#79a995"}}))}]}
    }
  ];
  return {html,charts,market:selectedMarket,meta:{marketCount:markets.length,regionalCount:regionalMatrix.length,cityCount:cityMatrix.length,competitors:competitors.map(r=>r.brand),carRank,carShare:carVal,leader:leader?.brand,gap,coverageChange:coverage,weightedChange:weighted}};
}
