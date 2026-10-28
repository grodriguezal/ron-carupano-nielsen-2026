export function buildAdvancedView(rows,portfolio,page,market,segment="SUPER PREMIUM",focusBrand="CARUPANO"){
 const P0="2025_full",P1="2026_ytd_sep";
 const fmt=(x,n=2)=>x==null||!Number.isFinite(x)?"—":Number(x).toLocaleString("es-VE",{minimumFractionDigits:n,maximumFractionDigits:n});
 const esc=x=>String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
 const value=(r,metric="value",p=P1)=>r?.[p]?.[metric]??null;
 const delta=(r,metric="value")=>value(r,metric,P0)==null||value(r,metric)==null?null:value(r,metric)-value(r,metric,P0);
 const signed=(n,d=2)=>n==null?"No comparable":`${n>0?"+":""}${fmt(n,d)} puntos porcentuales`;
 const smallDelta=n=>n==null?"—":`${n>0?"+":""}${fmt(n)} puntos`;
 const col=n=>n==null?"neutral":n>0.0005?"positive":n<-.0005?"negative":"neutral";
 const label=m=>String(m).replace(/1\*?$/,"").replace(/^T /,"").replaceAll("+"," + ").replaceAll("Alimentos_Abs","corte especial de alimentos");
 const allMarket=rows.filter(r=>r.market===market);
 const allSegments=portfolio.filter(r=>r.market===market&&r.segment!=null&&r.size_ml==null);
 const segNames=["STANDARD","PREMIUM","SUPER PREMIUM","ULTRA PREMIUM","OTROS RON","OTROS SEGMENTOS"];
 const segments=segNames.map(name=>{
  const records=allSegments.filter(r=>r.segment===name);
  const total=p=>records.reduce((acc,r)=>acc+(value(r,"value",p)??0),0);
  const car=records.find(r=>r.brand==="CARUPANO");
  const carContribution=p=>value(car,"value",p)??0;
  const total0=total(P0),total1=total(P1);
  return {name,records,total0,total1,carContribution0:carContribution(P0),carContribution1:carContribution(P1),
    carWithin0:total0>0?carContribution(P0)/total0*100:null,
    carWithin1:total1>0?carContribution(P1)/total1*100:null};
 }).filter(s=>s.records.length>0);
 if(!segments.some(s=>s.name===segment))segment=segments.some(s=>s.name==='SUPER PREMIUM')?'SUPER PREMIUM':segments[0]?.name??'STANDARD';
 const regionIds=[
  "Capital Autoservicio1*","Capital Tradicional1*",
  "Andes+Occidente Autoservicio1*","Andes+Occidente Tradicional1*",
  "Centro+Centro Occidente Autoservicio1*","Centro+Centro Occidente Tradicional1*",
  "Oriente Autoservicio1*","Oriente Tradicional1*"];
 const channelIds=regionIds.filter(x=>rows.some(r=>r.market===x));
 const marketName=label(market);
 const segmentOptions=segNames.filter(s=>segments.some(x=>x.name===s)).map(s=>`<option value="${esc(s)}" ${s===segment?"selected":""}>${esc(s.replace("OTROS RON","Otros tipos de ron").replace("OTROS SEGMENTOS","Otros segmentos"))}</option>`).join("");
 const brandSet=[...new Set(allMarket.map(r=>r.brand))].filter(Boolean).sort();
 const brandOptions=brandSet.map(b=>`<option value="${esc(b)}" ${b===focusBrand?"selected":""}>${esc(b)}</option>`).join("");
 const controls=(selectors)=>`<div class="mi-controls">${selectors.includes("segment")?`<label>Segmento que quieres estudiar<select id="advSegmentSelect">${segmentOptions}</select></label>`:""}${selectors.includes("brand")?`<label>Marca que quieres estudiar<select id="advBrandSelect">${brandOptions}</select></label>`:""}<span>Universo: ${esc(marketName)} · año completo 2025 frente a enero–septiembre 2026</span></div>`;
 const stat=(title,val,context)=>`<div class="mi-stat"><span>${esc(title)}</span><strong>${esc(val)}</strong><small>${context}</small></div>`;
 const statRow=arr=>`<div class="mi-stat-row">${arr.join("")}</div>`;
 const narr=(title,observed,meaning,action)=>`<section class="mi-brief"><span class="mi-eyebrow">LECTURA EJECUTIVA · POR QUÉ IMPORTA</span><h2>${title}</h2><div class="mi-brief-grid"><article><strong>¿Qué muestran los datos?</strong><p>${observed}</p></article><article><strong>¿Qué podemos interpretar?</strong><p>${meaning}</p></article><article><strong>¿Qué debemos investigar?</strong><p>${action}</p></article></div></section>`;
 const disclaimer=`<div class="mi-caveat"><strong>Cómo interpretar estos resultados:</strong> los porcentajes se calculan sobre el mercado que estudia NielsenIQ; el año completo de 2025 y los meses hasta septiembre de 2026 no tienen la misma duración. No se puede deducir de estas cifras el crecimiento real de ventas, las causas de los cambios ni el tamaño monetario de cada región. Los mercados pueden solaparse.</div>`;
 const panel=(id,title,description)=>`<section class="panel mi-panel"><div class="panel-heading"><div><h2>${title}</h2><p>${description}</p></div></div><div class="plot mi-plot" id="${id}"></div></section>`;
 const tbl=(headers,lines)=>`<div class="table-wrap"><table class="table mi-table"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${lines.join("")}</tbody></table></div>`;
 const colors={car:"#d9bd86",other:"#86a8a2",old:"#627172",good:"#80b6a0",bad:"#d28a80"};
 const ax={axisLine:{lineStyle:{color:"#39413d"}},axisLabel:{color:"#c0c9bd",fontSize:11},axisTick:{show:false},splitLine:{lineStyle:{color:"#303a36"}}};
 const chart=(id,option)=>({id,option});
 const buildSegments=()=>{
  const total0=segments.reduce((a,x)=>a+x.total0,0),total1=segments.reduce((a,x)=>a+x.total1,0);
  const standard=segments.find(x=>x.name==="STANDARD");
  const pos=segments.slice().sort((a,b)=>(b.total1-b.total0)-(a.total1-a.total0))[0];
  const weak=segments.slice().sort((a,b)=>(a.total1-a.total0)-(b.total1-b.total0))[0];
  const card=statRow([stat("Peso de Standard",fmt(standard?.total1)+" %","Proporción del valor total medido"),stat("Cambio del peso de Standard",signed((standard?.total1??0)-(standard?.total0??0)),"No equivale a crecimiento absoluto"),stat("Peso de Super Premium",fmt(segments.find(x=>x.name==="SUPER PREMIUM")?.total1)+" %","Parte del valor de la categoría"),stat("Conciliación de segmentos",Math.abs(total1-100)<.01?"✓ Total cercano al 100 %":"Revisar","Suma de una única jerarquía por segmento")]);
  const comparison=segments.map(s=>`<tr><td><strong>${esc(s.name)}</strong></td><td>${fmt(s.total0)} %</td><td>${fmt(s.total1)} %</td><td class="${col(s.total1-s.total0)}">${smallDelta(s.total1-s.total0)}</td><td>${fmt(s.carWithin1)} %</td><td class="${col((s.carWithin1??0)-(s.carWithin0??0))}">${s.carWithin0==null||s.carWithin1==null?"—":smallDelta(s.carWithin1-s.carWithin0)}</td><td><button type="button" class="mi-drill" data-mi-segment="${esc(s.name)}" aria-expanded="false">Ver detalle aquí ▾</button></td></tr>`);
  const intro=narr(`¿Hacia qué segmentos se desplaza el peso relativo del mercado de ${esc(marketName)}?`,
    `El segmento que más aumenta su peso es ${esc(pos.name)} (${signed(pos.total1-pos.total0)}). El que más retrocede es ${esc(weak.name)} (${signed(weak.total1-weak.total0)}).`,
    `Estos resultados muestran cómo se distribuye cada 100 unidades de valor vendido de ron entre segmentos. No podemos concluir que un segmento haya vendido más o menos dinero en términos absolutos.`,
    `Comprobar si las variaciones de Carúpano se deben al peso de los segmentos o a una menor participación dentro de cada uno. La última columna de la tabla permite distinguir ambos fenómenos.`);
  const html=controls([])+intro+card+`<div class="grid2 mi-grid">${panel("miSegmentStack","Composición del mercado de ron","Cada columna suma aproximadamente 100 % de las ventas en valor del mercado seleccionado.")}${panel("miSegmentChange","Qué segmentos ganan o pierden peso","Cambio en puntos porcentuales de su participación en el mercado total.")}</div><section class="panel mi-panel"><div class="panel-heading"><div><h2>Qué ocurre con Carúpano dentro de cada segmento</h2><p>Una columna muestra el peso del segmento en todo el mercado; otra, la participación de Carúpano dentro de ese mismo segmento. «Ver detalle aquí» despliega la comparación con otras marcas sin cambiar de pantalla.</p></div></div>${tbl(["Segmento","Peso 2025","Peso 2026","Cambio de peso","Cuota de Carúpano dentro del segmento, 2026","Cambio de cuota de Carúpano","Explorar"],comparison)}<p class="mi-under-table">Ejemplo: si Super Premium representa 8 % del mercado y Carúpano tiene un 15 % dentro de él, no significa que Super Premium represente 15 % de las ventas de todo el mercado de ron.</p></section>`+disclaimer;
  const rev=segments.slice().reverse();
  const charts=[
    chart("miSegmentStack",{tooltip:{trigger:"axis",valueFormatter:v=>fmt(v)+" %"},legend:{bottom:0,textStyle:{color:"#bac4bb"},data:segments.map(s=>s.name)},grid:{left:45,right:18,top:28,bottom:53},xAxis:{type:"category",data:["2025 completo","2026 hasta septiembre"],...ax},yAxis:{type:"value",min:0,max:100,...ax,axisLabel:{formatter:v=>v+" %",color:"#bac4bb"}},series:segments.map((s,i)=>({type:"bar",stack:"category",name:s.name,barWidth:70,itemStyle:{color:["#c5b783","#628b87","#8f7c65","#6f7d91","#876a72","#425a58"][i]},data:[s.total0,s.total1]}))}),
    chart("miSegmentChange",{tooltip:{trigger:"axis",valueFormatter:v=>fmt(v)+" puntos porcentuales"},grid:{left:122,right:19,top:12,bottom:35},xAxis:{type:"value",...ax},yAxis:{type:"category",data:rev.map(s=>s.name),...ax},series:[{type:"bar",data:rev.map(s=>({value:s.total1-s.total0,itemStyle:{color:s.total1-s.total0>=0?colors.good:colors.bad}})),barMaxWidth:22}]})
  ];
  return {html,charts,meta:{segmentCount:segments.length,categoryTotal2025:total0,categoryTotal2026:total1,standardShare:standard?.total1}};
 };
 const buildPremium=()=>{
  const selected=segments.find(s=>s.name===segment)||segments.find(s=>s.name==="SUPER PREMIUM")||segments[0];
  const marketTotal0=selected.total0,marketTotal1=selected.total1;
  const rank=(p)=>selected.records.filter(r=>value(r,"value",p)!=null&&marketTotal1>0).slice().sort((a,b)=>value(b,"value",p)-value(a,"value",p));
  const top=rank(P1);
  const car=selected.records.find(x=>x.brand==="CARUPANO");
  const carWithin=marketTotal1>0?(value(car)??0)/marketTotal1*100:null;
  const carWithin0=marketTotal0>0&&value(car,"value",P0)!=null?value(car,"value",P0)/marketTotal0*100:null;
  const carRank=top.findIndex(x=>x.brand==="CARUPANO")+1;
  const leader=top[0],leaderWithin=marketTotal1>0?(value(leader)??0)/marketTotal1*100:null;
  const top6=top.slice(0,6);if(car&&!top6.includes(car))top6.push(car);
  const topRows=top.slice(0,Math.min(top.length,12)).map((r,i)=>{
    const before=value(r,'value',P0);const old=marketTotal0>0&&before!=null?before/marketTotal0*100:null;
    const now=marketTotal1>0?value(r)/marketTotal1*100:null;
    return `<tr class="${r.brand==="CARUPANO"?"highlight":""}"><td><strong>${i+1}. ${esc(r.brand)}</strong></td><td>${fmt(old)} %</td><td>${fmt(now)} %</td><td class="${col(old==null||now==null?null:now-old)}">${old==null||now==null?"—":smallDelta(now-old)}</td><td>${fmt(value(r))} %</td></tr>`;
  });
  const rowsRegion=channelIds.map(m=>{
    const rr=portfolio.filter(r=>r.market===m&&r.segment===selected.name&&r.size_ml==null);
    const sum=rr.reduce((a,r)=>a+(value(r)??0),0);
    const ca=rr.find(r=>r.brand==="CARUPANO");
    const oldSum=rr.reduce((a,r)=>a+(value(r,"value",P0)??0),0);
    const carNow=sum>0?(value(ca)??0)/sum*100:null;
    const carOld=oldSum>0?(value(ca,"value",P0)??0)/oldSum*100:null;
    const ordered=rr.filter(r=>value(r)!=null).sort((a,b)=>value(b)-value(a));
    const idx=ordered.findIndex(r=>r.brand==="CARUPANO")+1;
    const first=ordered[0],shareFirst=sum>0?value(first)/sum*100:null;
    return {market:m,carNow,carOld,rank:idx,first:first?.brand,firstShare:shareFirst,segmentWeight:sum};
  });
  const regionTable=rowsRegion.map(x=>`<tr><td><strong>${esc(label(x.market))}</strong></td><td>${fmt(x.segmentWeight)} %</td><td>${x.rank?"#"+x.rank:"—"}</td><td>${fmt(x.carNow)} %</td><td class="${col(x.carOld==null||x.carNow==null?null:x.carNow-x.carOld)}">${x.carOld==null||x.carNow==null?"—":smallDelta(x.carNow-x.carOld)}</td><td>${esc(x.first||"—")} (${fmt(x.firstShare)} %)</td></tr>`);
  const headline=selected.total1<0.01?`En ${selected.name}, el segmento tiene un peso extremadamente reducido.`:`Carúpano representa ${fmt(carWithin)} % del valor vendido dentro de ${selected.name} en ${esc(marketName)}.`;
  const intro=narr(`¿Qué marcas dominan realmente ${esc(selected.name)}?`,
   `${headline} Su posición es ${carRank>0?"#"+carRank:"no disponible"}, frente a ${esc(leader?.brand||"—")} que lidera con ${fmt(leaderWithin)} %.`,
   `Aquí todas las participaciones utilizan únicamente las ventas del segmento ${esc(selected.name)} como denominador. No son participaciones de todo el mercado de ron. La brecha frente al líder es de ${fmt(leaderWithin==null||carWithin==null?null:leaderWithin-carWithin)} puntos.`,
   `Comparar cómo cambia la posición de Carúpano en las ocho regiones y canales de Nielsen. Antes de interpretar diferencias pequeñas, revisar el peso del segmento y posibles reclasificaciones.`);
  const stats=statRow([stat("Peso del segmento en el mercado",fmt(marketTotal1)+" %","De todo el ron vendido en este mercado"),stat("Carúpano dentro del segmento",fmt(carWithin)+" %","No es participación sobre todo el ron"),stat("Posición de Carúpano",carRank?"#"+carRank:"—","Ranking por valor dentro del segmento"),stat("Cambio de Carúpano",carWithin0==null||carWithin==null?"—":signed(carWithin-carWithin0),"Porcentajes de dos ventanas distintas")]);
  const reverse=top6.slice().reverse();
  const html=controls(["segment"])+intro+stats+`<div class="grid2 mi-grid">${panel("miPremiumRank","Quién gana dentro del segmento","Ranking actual por participación en el valor del segmento, no de toda la categoría.")}${panel("miPremiumShift","Cómo cambió la participación dentro del segmento","Las dos barras representan distintos períodos; compara marcas, no ingresos absolutos.")}</div><section class="panel mi-panel"><div class="panel-heading"><div><h2>Ranking del segmento en ${esc(marketName)}</h2><p>Los porcentajes dentro del segmento se calculan dividiendo la aportación de cada marca entre el valor total aportado por ese segmento.</p></div></div>${tbl(["Marca","Cuota dentro del segmento 2025","Cuota 2026","Cambio","Aporte al mercado total 2026"],topRows)}</section><section class="panel mi-panel"><div class="panel-heading"><div><h2>¿Cómo compite Carúpano en este segmento por región?</h2><p>Ocho mercados regionales separados por canal. La comparación se recalcula para el mismo segmento en cada uno.</p></div></div>${tbl(["Región y canal","Peso del segmento en la zona","Puesto Carúpano","Cuota Carúpano en el segmento","Cambio de cuota","Líder del segmento"],regionTable)}<p class="mi-under-table">Las cuotas de distintos canales o regiones no se suman. Cuotas dentro de segmentos extremadamente pequeños pueden ser volátiles; comprueba su peso antes de sacar conclusiones.</p></section>`+disclaimer;
  const charts=[
   chart("miPremiumRank",{tooltip:{trigger:"axis",valueFormatter:v=>fmt(v)+" %"},grid:{left:118,right:22,top:12,bottom:36},xAxis:{type:"value",...ax,axisLabel:{color:"#aeb7ae",formatter:v=>v+" %"}},yAxis:{type:"category",data:reverse.map(r=>r.brand),...ax},series:[{type:"bar",barMaxWidth:20,data:reverse.map(r=>({value:marketTotal1>0?(value(r)??0)/marketTotal1*100:null,itemStyle:{color:r.brand==="CARUPANO"?colors.car:colors.other}}))}]}),
   chart("miPremiumShift",{tooltip:{trigger:"axis",valueFormatter:v=>fmt(v)+" %"},legend:{bottom:0,textStyle:{color:"#c4c9c0"},data:["2025","2026"]},grid:{left:120,right:18,top:8,bottom:50},xAxis:{type:"value",...ax},yAxis:{type:"category",data:reverse.map(r=>r.brand),...ax},series:[{name:"2025",type:"bar",barMaxWidth:12,itemStyle:{color:colors.old},data:reverse.map(r=>marketTotal0>0&&value(r,"value",P0)!=null?value(r,"value",P0)/marketTotal0*100:null)},{name:"2026",type:"bar",barMaxWidth:12,itemStyle:{color:colors.car},data:reverse.map(r=>marketTotal1>0?(value(r)??0)/marketTotal1*100:null)}]})
  ];
  return {html,charts,meta:{segment:selected.name,segmentWeight:marketTotal1,carShare:carWithin,carRank,leader:leader?.brand,regionalRows:rowsRegion.length}};
 };
 const buildValue=()=>{
  const getIndex=(r,p)=>{const v=value(r,"value",p),q=value(r,"volume",p);return v==null||q==null||q<=0?null:100*v/q;};
  const all=allMarket.filter(r=>value(r,"value")!=null&&value(r,"volume")!=null&&value(r,"volume")>0&&value(r,"value")>=.3);
  const rank=all.slice().sort((a,b)=>(getIndex(b,P1)??0)-(getIndex(a,P1)??0));
  const focus=allMarket.find(r=>r.brand==="CARUPANO");
  const carIndex=getIndex(focus,P1),carPast=getIndex(focus,P0);
  const ordered=rank.slice(0,10);if(focus&&!ordered.some(r=>r.brand==="CARUPANO"))ordered.push(focus);
  const reverse=ordered.slice().sort((a,b)=>(getIndex(a,P1)??0)-(getIndex(b,P1)??0));
  const marker=(r)=>r.brand==="CARUPANO"?"Carúpano":r.brand;
  const tableRows=rank.map((r,i)=>`<tr class="${r.brand==="CARUPANO"?"highlight":""}"><td><strong>${i+1}. ${esc(r.brand)}</strong></td><td>${fmt(value(r,"value"))} %</td><td>${fmt(value(r,"volume"))} %</td><td>${fmt(getIndex(r,P1),1)}</td><td class="${col(getIndex(r,P0)==null?null:getIndex(r,P1)-getIndex(r,P0))}">${getIndex(r,P0)==null?"—":`${getIndex(r,P1)>getIndex(r,P0)?"+":""}${fmt(getIndex(r,P1)-getIndex(r,P0),1)} puntos de índice`}</td></tr>`);
  const intro=narr("¿Qué nos dice la relación entre valor y volumen?",
   `En ${esc(marketName)}, Carúpano tiene un índice calculado de ${fmt(carIndex,2)} (100 = referencia de la categoría). Se obtiene a partir de su participación en valor y en volumen, ambas medidas por NielsenIQ.`,
   `Por encima de 100 significa más valor por unidad de volumen en términos relativos frente a la media de ron medida; por debajo, menos. No es una métrica suministrada directamente por NielsenIQ, ni mide precio de etiqueta, margen o rentabilidad.`,
   `Comparar índices de marcas con participación relevante. Contrastar precios por litro, descuentos y mezcla de referencias antes de atribuir causas o tomar decisiones comerciales.`);
  const stats=statRow([stat("Carúpano · índice calculado",fmt(carIndex,2),"100 = promedio de la categoría; cálculo del dashboard"),stat("Participación en valor",fmt(value(focus,"value"))+" %","De cada 100 unidades monetarias medidas"),stat("Participación en volumen",fmt(value(focus,"volume"))+" %","De cada 100 unidades de volumen medidas"),stat("Variación del índice",carIndex!=null&&carPast!=null?`${carIndex>=carPast?"+":""}${fmt(carIndex-carPast,1)} puntos de índice`:"—","No es variación porcentual de precios")]);
  const html=intro+stats+`<div class="mi-formula"><strong>FUENTE Y MÉTODO</strong> · NielsenIQ proporciona participación en valor y participación en volumen. <strong>El índice NO viene calculado en NielsenIQ: lo calcula este dashboard.</strong><p>Fórmula: (cuota de valor ÷ cuota de volumen) × 100. <strong>Carúpano en ${esc(marketName)}:</strong> ${fmt(value(focus,"value"),4)} % ÷ ${fmt(value(focus,"volume"),4)} % × 100 = <strong>${fmt(carIndex,2)}</strong>. Un índice de 100 equivale a la media de la categoría. ${carIndex==null?'Sin datos suficientes para interpretar el resultado.':`Carúpano registra ${fmt(Math.abs(carIndex-100),2)} % ${carIndex>=100?'por encima':'por debajo'} de esa referencia relativa.`}</p><small>No equivale a un precio de venta, margen, rentabilidad ni calidad percibida. La comparación solo es válida dentro del mismo universo y período.</small></div><div class="grid2 mi-grid">${panel("miValueRank","Comparación del índice entre marcas","Se muestran marcas con al menos 0,3 % de cuota en valor para reducir ratios extremos de marcas muy pequeñas. Se añade Carúpano siempre.")}${panel("miValueScatter","Valor y volumen: dos medidas diferentes","Cada punto representa una marca. La línea conceptual de igualdad corresponde al índice 100; estar por encima indica mayor contribución de valor que de volumen.")}</div><section class="panel mi-panel"><div class="panel-heading"><div><h2>Posición relativa de valor de las marcas</h2><p>El índice puede cambiar por precios, promociones o productos vendidos. No permite atribuir una causa única.</p></div></div>${tbl(["Marca","Participación valor","Participación volumen","Índice relativo 2026","Cambio de índice vs. 2025"],tableRows)}<p class="mi-under-table">Se incluyen marcas con al menos 0,3 % de participación nacional o del mercado seleccionado, según corresponda. Algunas marcas menores quedan fuera de este ranking, pero los totales no se recalculan.</p></section>`+disclaimer;
  const max=Math.max(1,...all.map(r=>value(r,"value")), ...all.map(r=>value(r,"volume")));
  const charts=[
   chart("miValueRank",{tooltip:{trigger:"axis",valueFormatter:v=>fmt(v,1)+" puntos de índice"},grid:{left:130,right:22,top:14,bottom:38},xAxis:{type:"value",...ax},yAxis:{type:"category",data:reverse.map(r=>marker(r)),...ax},series:[{type:"bar",barMaxWidth:22,data:reverse.map(r=>({value:getIndex(r,P1),itemStyle:{color:r.brand==="CARUPANO"?colors.car:colors.other}}))}]}),
   chart("miValueScatter",{tooltip:{trigger:"item",formatter:p=>`${esc(p.data.name)}: volumen ${fmt(p.value[0])} %, valor ${fmt(p.value[1])} %, índice ${fmt(p.data.index,1)}`},grid:{left:48,right:23,top:18,bottom:44},xAxis:{type:"value",name:"% volumen",nameLocation:"middle",nameGap:25,...ax},yAxis:{type:"value",name:"% valor",...ax},series:[{type:"line",name:"Mismo peso",showSymbol:false,lineStyle:{type:"dashed",color:"#69706e",width:1},data:[[0,0],[max,max]],silent:true},{type:"scatter",symbolSize:11,data:all.map(r=>({name:r.brand,value:[value(r,"volume"),value(r,"value")],index:getIndex(r,P1),itemStyle:{color:r.brand==="CARUPANO"?colors.car:colors.other}})),label:{show:false}}]})
  ];
  return {html,charts,meta:{carIndex,carPrior:carPast,qualifying:all.length,excluded:allMarket.length-all.length}};
 };
 const buildDistribution=()=>{
  const allMarkets=[...new Set(rows.map(r=>r.market))];
  const arr=allMarkets.map(m=>{const r=rows.find(x=>x.market===m&&x.brand===focusBrand);return {market:m,record:r,share:delta(r,"value"),numeric:delta(r,"numeric_distribution"),weighted:delta(r,"weighted_distribution"),current:value(r)};}).filter(x=>x.record&&x.share!=null&&x.numeric!=null);
  const classify=x=>x.share<-.005&&x.numeric<-.005?"Caen participación y presencia":x.share<-.005&&x.numeric>.005?"Más tiendas, menor cuota":x.share>.005&&x.numeric<-.005?"Menos tiendas, más cuota":x.share>.005&&x.numeric>.005?"Mejoran ambas":"Señales mixtas o estables";
  const breakdown=arr.reduce((o,x)=>(o[classify(x)]=(o[classify(x)]||0)+1,o),{});
  const twoDown=arr.filter(x=>classify(x)==="Caen participación y presencia").sort((a,b)=>a.share-b.share);
  const mixed=arr.filter(x=>classify(x)==="Más tiendas, menor cuota").sort((a,b)=>a.share-b.share);
  const tableRows=arr.slice().sort((a,b)=>a.share-b.share).map(x=>`<tr><td><strong>${esc(label(x.market))}</strong><small>${esc(x.market.startsWith("T ")?"Corte especial de alimentos":"Corte de canal o mercado")}</small></td><td>${fmt(x.current)} %</td><td class="${col(x.share)}">${smallDelta(x.share)}</td><td class="${col(x.numeric)}">${smallDelta(x.numeric)}</td><td class="${col(x.weighted)}">${smallDelta(x.weighted)}</td><td>${esc(classify(x))}</td></tr>`);
  const intro=narr(`¿La presencia en tiendas explica los movimientos de ${esc(focusBrand)}?`,
   `En ${arr.length} mercados con datos comparables de la marca, ${twoDown.length} muestran menor participación y menor presencia numérica; ${mixed.length} muestran más establecimientos pero menor participación.`,
   `Son señales comerciales, no pruebas de causalidad. La distribución numérica cuenta establecimientos y la ponderada tiene en cuenta su relevancia para las ventas de ron. La cuota, por otro lado, representa ventas relativas.`,
   `Investigar primero dónde coinciden señales, pero sin inferir valor económico: el peso comercial, tamaño total y solapamiento de cada mercado no están disponibles en esta base.`);
  const stats=statRow([stat("Mercados con datos",String(arr.length),"Incluye cortes que pueden solaparse"),stat("Cuota y presencia bajan",String(twoDown.length),"Revisar cobertura y disponibilidad"),stat("Más tiendas, menor cuota",String(mixed.length),"Revisar peso de tiendas y ejecución"),stat("Mercados con ambas al alza",String(breakdown["Mejoran ambas"]||0),"Estudiar qué prácticas funcionan")]);
  const html=controls(["brand"])+intro+stats+`<div class="grid2 mi-grid">${panel("miDistributionQuadrants","Cuatro tipos de señales","Eje horizontal: cambio de presencia en tiendas. Eje vertical: cambio de cuota en valor. Cada punto es un corte de mercado.")}${panel("miDistributionChanges","Dónde es mayor el retroceso de participación","Mercados ordenados por diferencia de cuota de la marca seleccionada. No equivale a ordenarlos por ventas.")}</div><section class="panel mi-panel"><div class="panel-heading"><div><h2>Diagnóstico de todos los mercados</h2><p>Compara cuota de valor, presencia numérica y ponderada con una clasificación descriptiva.</p></div></div>${tbl(["Mercado","Cuota 2026","Cambio de cuota","Cambio de tiendas","Cambio de presencia ponderada","Lectura"],tableRows)}</section>`+disclaimer;
  const low=arr.slice().sort((a,b)=>a.share-b.share).slice(0,12).reverse();
  const charts=[
    chart("miDistributionQuadrants",{tooltip:{trigger:"item",formatter:p=>`${esc(p.data.name)}: cambio de tiendas ${smallDelta(p.value[0])}; cambio de cuota ${smallDelta(p.value[1])}`},grid:{left:60,right:30,top:22,bottom:48},xAxis:{type:"value",name:"Cambio de presencia en tiendas",nameLocation:"middle",nameGap:30,...ax},yAxis:{type:"value",name:"Cambio de participación",nameLocation:"middle",nameGap:40,...ax},series:[{type:"scatter",symbolSize:13,markLine:{silent:true,symbol:"none",lineStyle:{color:"#53605a",type:"dashed"},label:{show:false},data:[{xAxis:0},{yAxis:0}]},data:arr.map(x=>({name:label(x.market),value:[x.numeric,x.share],itemStyle:{color:x.share<0&&x.numeric<0?colors.bad:x.share>0&&x.numeric>0?colors.good:colors.car}}))}]}),
    chart("miDistributionChanges",{tooltip:{trigger:"axis",valueFormatter:v=>fmt(v)+" puntos"},grid:{left:176,right:18,top:10,bottom:30},xAxis:{type:"value",...ax},yAxis:{type:"category",data:low.map(x=>label(x.market)),...ax,axisLabel:{color:"#bdc9bd",fontSize:10}},series:[{type:"bar",barMaxWidth:17,data:low.map(x=>({value:x.share,itemStyle:{color:x.share<0?colors.bad:colors.good}}))}]})
  ];
  return {html,charts,meta:{marketCount:arr.length,negativeBoth:twoDown.length,mixed:mixed.length}};
 };
 const buildMovements=()=>{
  const all=allMarket.filter(r=>value(r)!=null&&value(r,"value",P0)!=null);
  const gains=all.filter(r=>delta(r)!=null).sort((a,b)=>delta(b)-delta(a));
  const positive=gains.filter(r=>delta(r)>0);
  const negative=gains.slice().reverse().filter(r=>delta(r)<0);
  const car=all.find(r=>r.brand==="CARUPANO");
  const chosen=all.find(r=>r.brand===focusBrand);
  const top=gains.slice(0,8),bottom=gains.slice(-8).reverse();
  const focusParts=allSegments.filter(r=>r.brand===focusBrand).slice().sort((a,b)=>Math.abs(delta(b)??0)-Math.abs(delta(a)??0));
  const focusSegmentTable=focusParts.map(r=>`<tr><td><strong>${esc(r.segment)}</strong></td><td>${fmt(value(r,"value",P0),4)} %</td><td>${fmt(value(r),4)} %</td><td class="${col(delta(r))}">${smallDelta(delta(r))}</td></tr>`);
  const movementTable=gains.map((r,i)=>`<tr class="${r.brand==="CARUPANO"?"highlight":""}"><td>${esc(r.brand)}</td><td>${fmt(value(r,"value",P0))} %</td><td>${fmt(value(r))} %</td><td class="${col(delta(r))}">${smallDelta(delta(r))}</td><td>${fmt(value(r,"numeric_distribution"))} %</td></tr>`);
  const intro=narr(`¿Qué marcas están modificando el equilibrio competitivo en ${esc(marketName)}?`,
   `${positive.length} marcas aumentan participación en valor y ${negative.length} registran una disminución entre períodos. ${esc(gains[0]?.brand||"—")} presenta la mayor diferencia positiva (${signed(delta(gains[0]))}).`,
   `Las participaciones de mercado son un reparto del total: si unas marcas ganan puntos, otras los pierden, pero este archivo no muestra compradores que cambiaron de marca ni cantidades absolutas vendidas.`,
   `Cruzar los movimientos con segmentos y presencia en tiendas. Repetir la misma comparación por región para evitar asumir que una tendencia nacional se reproduce en todos los canales.`);
  const stats=statRow([stat("Marcas con mayor participación",String(positive.length),"Crecen en peso relativo del mercado"),stat("Marcas con menor participación",String(negative.length),"Disminuyen en peso relativo"),stat("Movimiento de Carúpano",signed(delta(car)),"Participación en valor del mercado elegido"),stat("Mayor avance",esc(gains[0]?.brand||"—"),signed(delta(gains[0])))]);
  const winners=top.slice().reverse();
  const losers=bottom.slice().reverse();
  const html=controls(["brand"])+intro+stats+`<div class="grid2 mi-grid">${panel("miMovementWinners","Las mayores ganancias de participación","Marcas que muestran el aumento más importante en puntos de valor del mercado seleccionado.")}${panel("miMovementLosers","Las mayores pérdidas de participación","Marcas cuyo peso relativo disminuye más en el mismo corte.")}</div><section class="panel mi-panel"><div class="panel-heading"><div><h2>¿De qué segmentos procede el cambio de ${esc(focusBrand)}?</h2><p>La suma de cambios de sus segmentos debe explicar su movimiento total, salvo redondeos y clasificaciones incompletas.</p></div></div>${focusParts.length?tbl(["Segmento","Aportación 2025","Aportación 2026","Cambio"],focusSegmentTable):'<p class="mi-empty">No hay desglose de segmentos para esta marca.</p>'}<p class="mi-under-table">Los cambios por segmento son contribuciones al valor de todo el mercado de ron, no participaciones dentro de cada segmento. El movimiento puede deberse a cambios internos de cuota o del peso del segmento.</p></section><section class="panel mi-panel"><div class="panel-heading"><div><h2>Tabla completa de movimientos por marca</h2><p>Ordenada desde la mayor ganancia relativa hasta la mayor pérdida relativa de participación.</p></div></div>${tbl(["Marca","Valor 2025","Valor 2026","Cambio de cuota","Tiendas con presencia 2026"],movementTable)}</section>`+disclaimer;
  const charts=[
   chart("miMovementWinners",{tooltip:{trigger:"axis",valueFormatter:v=>fmt(v)+" puntos"},grid:{left:134,right:17,top:9,bottom:25},xAxis:{type:"value",...ax},yAxis:{type:"category",data:winners.map(r=>r.brand),...ax},series:[{type:"bar",barMaxWidth:18,itemStyle:{color:colors.good},data:winners.map(r=>delta(r))}]}),
   chart("miMovementLosers",{tooltip:{trigger:"axis",valueFormatter:v=>fmt(v)+" puntos"},grid:{left:134,right:17,top:9,bottom:25},xAxis:{type:"value",...ax},yAxis:{type:"category",data:losers.map(r=>r.brand),...ax},series:[{type:"bar",barMaxWidth:18,itemStyle:{color:colors.bad},data:losers.map(r=>delta(r))}]})
  ];
  return {html,charts,meta:{brands:all.length,gainers:positive.length,losers:negative.length,largestGainer:gains[0]?.brand,carDelta:delta(car)}};
 };
 const pages={segments:buildSegments,premium:buildPremium,value:buildValue,distributionMatrix:buildDistribution,movements:buildMovements};
 if(!pages[page])throw new Error("Dashboard no reconocido: "+page);
 return {page,market,...pages[page]()};
}
