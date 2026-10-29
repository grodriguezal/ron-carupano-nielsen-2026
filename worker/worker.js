// Cloudflare Workers AI interpreta la intención; no recibe valores ni registros Nielsen.
const ALLOW_ORIGINS=new Set(['https://grodriguezal.github.io','http://localhost:8000','http://127.0.0.1:8000']);
const MODEL='@cf/meta/llama-3.1-8b-instruct-fp8-fast';
const intents=['compare','summary','opportunities','segment','distribution','markets','ranking','glossary'];
function headers(origin){
 return {'Content-Type':'application/json; charset=utf-8',
   'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS',
   'Access-Control-Allow-Headers':'Content-Type','Vary':'Origin','Cache-Control':'no-store'};
}
function response(body,status,origin){return new Response(JSON.stringify(body),{status,headers:headers(origin)});}
function extractJSON(content){
 if(typeof content!=='string')return null;
 try{return JSON.parse(content);}catch{}
 const start=content.indexOf('{'),end=content.lastIndexOf('}');
 if(start<0||end<start)return null;
 try{return JSON.parse(content.slice(start,end+1));}catch{return null;}
}
export default {
 async fetch(request,env){
  const origin=request.headers.get('Origin')||'';
  if(!ALLOW_ORIGINS.has(origin))return new Response('Origen no permitido',{status:403});
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:headers(origin)});
  if(request.method!=='POST')return response({error:'Método no permitido'},405,origin);
  if(Number(request.headers.get('Content-Length'))>12000)return response({error:'Solicitud demasiado grande'},413,origin);
  try{
   const incoming=await request.json();
   const question=typeof incoming?.question==='string'?incoming.question.trim():'';
   const markets=Array.isArray(incoming?.markets)?incoming.markets.filter(x=>typeof x==='string').slice(0,30):[];
   const brands=Array.isArray(incoming?.brands)?incoming.brands.filter(x=>typeof x==='string').slice(0,80):[];
   const previous=incoming?.previous && typeof incoming.previous==='object'?incoming.previous:{};
   if(question.length<3||question.length>350||!markets.length||!brands.length)return response({error:'Pregunta o catálogo inválido'},400,origin);
   if(!env.AI)return response({error:'Vinculación AI sin configurar'},503,origin);
   const prompt=[
    'Eres un clasificador de preguntas comerciales en español para un dataset NielsenIQ de ron en Venezuela.',
    'Devuelve UNICAMENTE un objeto JSON válido: {"intent":"compare","market":"...","metric":"value","brand":"SANTA TERESA","segment":"SUPER PREMIUM"}.',
    'intents posibles: '+intents.join(', ')+'.',
    'compare = comparar Carúpano vs otra marca en un corte; summary = resumen; opportunities = oportunidades/prioridades; segment = cuota dentro de segmento; distribution = numérica y ponderada juntas; markets = en qué regiones/cortes sube o baja; ranking = líderes/top marcas; glossary = definiciones.',
    'metric debe ser uno de value, volume, numeric_distribution, weighted_distribution.',
    'market debe ser EXACTAMENTE uno de: '+JSON.stringify(markets)+'.',
    'brand debe ser EXACTAMENTE una marca distinta de CARUPANO de: '+JSON.stringify(brands)+'.',
    'segment debe ser SUPER PREMIUM, PREMIUM, STANDARD, OTROS RON u OTROS SEGMENTOS.',
    'Si habla de Caracas usa "T Caracas Alimentos_Abs"; si dice Capital usa "T Capital Alimentos_Abs". No inventes mercados.',
    'Si no menciona región, usa el mercado previo o Total Venezuela1. Si no menciona métrica, usa la previa o value.',
    'Si pregunta por el líder dentro de un segmento usa segment. No respondas con cifras.',
    'Contexto de pregunta anterior: '+JSON.stringify({market:previous.market||null,metric:previous.metric||null,brand:previous.brand||null,segment:previous.segment||null}),
    'Pregunta: '+question
   ].join('\n');
   const output=await env.AI.run(MODEL,{messages:[{role:'system',content:'Solo JSON de clasificación sin texto adicional, sin cifras.'},{role:'user',content:prompt}],max_tokens:180,temperature:0});
   const plan=extractJSON(output?.response);
   if(!plan||!intents.includes(plan.intent))return response({error:'No se pudo interpretar la consulta'},422,origin);
   return response({plan},200,origin);
  }catch(err){
   // No se devuelve el error de Cloudflare ni detalles del usuario.
   return response({error:'IA no disponible temporalmente'},503,origin);
  }
 }
};
