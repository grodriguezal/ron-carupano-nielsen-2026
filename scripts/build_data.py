#!/usr/bin/env python3
"""Transform NielsenIQ report into a safe, non-additive analytical cube.
Requires artifact_tool. Run: python scripts/build_data.py path/to/report.xlsx
"""
import json
import sys
from pathlib import Path
from collections import Counter
from artifact_tool import Blob, SpreadsheetFile

BASE=Path(__file__).resolve().parent.parent
OUT=BASE/'data'; OUT.mkdir(exist_ok=True)
METRICS={
 'Part. de Vtas Valor - Product':'value',
 'Part. de Vtas (KG/LT) - Product':'volume',
 'Dist. Num. Tiendas Handling (C)':'numeric_distribution',
 'Dist. Pond. Tiendas Handling (C)':'weighted_distribution',
}
PERIODS={'2025':'2025_full','2026':'2026_ytd_sep'}

def generate(source):
 wb=SpreadsheetFile.import_xlsx(Blob.load(str(source)))
 sheet=wb.worksheets.get_item_at(0)
 lines=sheet.get_range('A10:H15659').values
 cube={}; seen=set(); issue=[]
 for n,row in enumerate(lines,10):
  market,category,brand,segment,size,fact,a,b=row
  if market is None or fact not in METRICS: continue
  key=(str(market),str(category),brand,segment,size)
  item=cube.setdefault(key,{'market':market,'category':category,'brand':brand,'segment':segment,'size_ml':size,'2025_full':{},'2026_ytd_sep':{}})
  mk=(key,fact)
  if mk in seen: issue.append({'row':n,'issue':'duplicated hierarchy metric'})
  seen.add(mk)
  item['2025_full'][METRICS[fact]]=a
  item['2026_ytd_sep'][METRICS[fact]]=b
 records=list(cube.values())
 brand=[x for x in records if x['brand'] is not None and x['segment'] is None and x['size_ml'] is None]
 segments=[x for x in records if x['brand'] is not None and x['segment'] is not None]
 (OUT/'cube.json').write_text(json.dumps(records,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
 (OUT/'market-brand.json').write_text(json.dumps(brand,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
 (OUT/'portfolio.json').write_text(json.dumps(segments,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
 meta={'source':source.name,'exported':'2026-10-27','periods':{'2025_full':'Año 2025 — Sem/Fin 23/12/25','2026_ytd_sep':'YTD Meses — Sem/Fin 22/09/26'},'markets':sorted({x['market'] for x in records}),'brands':sorted({x['brand'] for x in brand}), 'metrics':list(METRICS.values()),'raw_metric_rows':len(seen),'analytical_rows':len(records),'market_brand_rows':len(brand),'portfolio_rows':len(segments),'issues':issue,'copyright':'© 2026 Nielsen Consumer LLC. Todos los derechos reservados.'}
 (OUT/'metadata.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 def lookup(m,b,period,metric):
  x=next((r for r in brand if r['market']==m and r['brand']==b),None)
  return x and x[period].get(metric)
 assert len(records)==3911, f'Expected 3911 analytical rows, got {len(records)}'
 for b,p,a in [('CARUPANO','2025_full',9.0202),('CARUPANO','2026_ytd_sep',8.1123),('SANTA TERESA','2026_ytd_sep',59.1257),('CACIQUE','2026_ytd_sep',14.029)]:
  value=lookup('Total Venezuela1',b,p,'value')
  assert abs(value-a)<1e-5,(b,p,value,a)
 print(json.dumps({k:meta[k] for k in ['raw_metric_rows','analytical_rows','market_brand_rows','portfolio_rows']},indent=2))

if __name__=='__main__':
 if len(sys.argv)<2: raise SystemExit('Usage: python scripts/build_data.py path/to/input.xlsx')
 generate(Path(sys.argv[1]))