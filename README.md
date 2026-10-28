# CARÚPANO MARKET INTELLIGENCE

**NielsenIQ · Ron Venezuela · 2025 completo / 2026 YTD septiembre**

Dashboard de inteligencia competitiva para Ron Carúpano: **Executive Center, Competidores, Canales, Distribución, Portafolio, Opportunity Radar y Strategy Lab**.

## Datos

El libro NielsenIQ contiene **15.644 filas de métricas**, normalizadas en **3.911 combinaciones** de mercado, marca, segmento y tamaño. Las métricas son participación en valor y volumen y distribución numérica y ponderada. Los 21 cortes de mercado no se pueden agregar arbitrariamente; los distintos niveles de jerarquía no se suman entre sí.

`python scripts/build_data.py "Datapull Ron Venezuela 2026 RT.xlsx"` genera:

- `data/cube.json`: matriz íntegra normalizada (3.911 combinaciones).
- `data/market-brand.json`: 779 observaciones de marca por mercado, sin duplicar niveles de segmento.
- `data/portfolio.json`: desglose por segmento y tamaño.
- `data/metadata.json`: dimensiones, controles y procedencia.

### Ejecutar

```bash
python scripts/build_data.py "Datapull Ron Venezuela 2026 RT.xlsx"
python -m http.server 8000
```

Abrir `http://localhost:8000`. La interfaz utiliza ECharts a través de CDN. GitHub Pages requiere habilitar Pages en los ajustes del repositorio y seleccionar la rama `main` y carpeta `/ (root)`.


## Cómo utilizar el dashboard (no hace falta saber Nielsen)

Al abrir la página se muestra un resumen de Ron Carúpano. Cada una de las siete secciones empieza por **qué muestran las cifras, qué significan y qué conviene investigar o hacer**. Debajo de cada gráfico hay una guía para interpretarlo. En la parte superior aparece **«¿No conoces Nielsen ni el sector? Empieza aquí»**, que explica términos con ejemplos.

- **Resumen ejecutivo:** descubre la situación de la marca y los cambios de participación.
- **Marcas competidoras:** compara Carúpano con cualquier otra marca medida.
- **Canales y regiones:** explora cómo cambia la participación según dónde y cómo se vende.
- **Presencia en tiendas:** compara número de tiendas e importancia comercial de esas tiendas.
- **Productos y formatos:** analiza qué aporta cada segmento del portafolio al mercado.
- **Oportunidades de mejora:** interpreta señales automáticas y los siguientes pasos de investigación.
- **Escenarios 2027:** prueba metas hipotéticas, sin confundirlas con predicciones.

**Regla editorial:** el relato se divide en dato observado, interpretación prudente y acción por investigar. No se presenta una correlación como prueba de causalidad. Los cambios entre porcentajes se escriben en palabras completas («puntos porcentuales») y se señala que 2025 y 2026 no son períodos de igual duración.

## Precauciones metodológicas

- **2025 completo y 2026 YTD sep no son periodos comparables para YoY de ventas**. Mostrar diferencias de cuota (pp) con advertencia.
- La cuota es relativa, no expresa ventas absolutas. No se infieren dólares, litros, ROI ni precios reales.
- Distribución numérica/ponderada no son métricas aditivas.
- Las regiones/canales pueden solaparse y tienen distintos denominadores.
- Las alertas son hipótesis y no pruebas de causalidad.
- El simulador 2027 explora metas de participación, no forecasts.

## Privacidad y licencia

La información procede de NielsenIQ y el archivo incluye © 2026 Nielsen Consumer LLC. Verifica las condiciones de licencia antes de redistribuir el archivo o desplegar públicamente. El repositorio puede ser público aunque el código o la app no tengan autenticación; **un repositorio privado no convierte automáticamente GitHub Pages en privado**.

## QA

Las cifras nacionales para 2026 YTD deben ser: Carúpano 8,1123%; Santa Teresa 59,1257%; Cacique 14,0290% en cuota de valor. Ver `tests/test_data.py`.