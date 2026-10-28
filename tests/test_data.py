import json
from pathlib import Path
P=Path(__file__).resolve().parents[1]/'data'
r=json.loads((P/'market-brand.json').read_text(encoding='utf-8'))
lookup=lambda b,y,m:next(x for x in r if x['market']=='Total Venezuela1' and x['brand']==b)[y][m]
assert len(r)==779
assert abs(lookup('CARUPANO','2025_full','value')-9.0202)<1e-5
assert abs(lookup('CARUPANO','2026_ytd_sep','value')-8.1123)<1e-5
assert abs(lookup('CARUPANO','2026_ytd_sep','volume')-6.619)<1e-5
assert abs(lookup('SANTA TERESA','2026_ytd_sep','value')-59.1257)<1e-5
assert abs(lookup('CACIQUE','2026_ytd_sep','value')-14.029)<1e-5
print('Dataset validated: 779 market-brand rows, key figures match NielsenIQ.')