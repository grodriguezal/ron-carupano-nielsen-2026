# CARÚPANO MARKET INTELLIGENCE

**NielsenIQ · Ron Venezuela · 2025 completo / 2026 YTD septiembre**

Dashboard de inteligencia competitiva para Ron Carúpano: **Resumen ejecutivo, Diagnóstico estratégico 2027, Competidores, Competencia por región, Canales, Distribución, Portafolio y Oportunidades de mejora**.

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

Al abrir la página se muestra un resumen de Ron Carúpano. Cada sección empieza por **qué muestran las cifras, qué significan y qué conviene investigar o hacer**. Debajo de cada gráfico hay una guía para interpretarlo. En la parte superior aparece **«¿No conoces Nielsen ni el sector? Empieza aquí»**, que explica términos con ejemplos.

- **Resumen ejecutivo:** descubre la situación de la marca y los cambios de participación.
- **Diagnóstico estratégico 2027:** analiza la competencia, los canales y los segmentos, y conecta cada evidencia con decisiones posibles para el Business Plan.
- **Marcas competidoras:** compara Carúpano con cualquier otra marca medida.
- **Competencia por región:** identifica los cinco principales competidores de cada región, ciudad o canal incluido en Nielsen, junto con los resultados de Carúpano.
- **Canales y regiones:** explora cómo cambia la participación según dónde y cómo se vende.
- **Presencia en tiendas:** compara número de tiendas e importancia comercial de esas tiendas.
- **Productos y formatos:** analiza qué aporta cada segmento del portafolio al mercado.
- **Oportunidades de mejora:** interpreta señales automáticas y los siguientes pasos de investigación.

**Regla editorial:** el relato se divide en dato observado, interpretación prudente y acción por investigar. No se presenta una correlación como prueba de causalidad. Los cambios entre porcentajes se escriben en palabras completas («puntos porcentuales») y se señala que 2025 y 2026 no son períodos de igual duración.

## Comparador de los cinco principales competidores por región

La sección **Competencia por región** muestra la posición de Carúpano frente a las cinco marcas competidoras con mayor participación de mercado en **valor** en cada corte (2026 hasta septiembre). Carúpano siempre aparece como referencia, aunque no figure entre las cinco competidoras. Para cada zona:

- Ranking y participación de Carúpano, con su posición en el mercado.
- Comparación en valor, volumen, distribución numérica y distribución ponderada con las cinco marcas competidoras.
- Diferencia respecto al líder y cambio de participación frente al año completo 2025, expresados en puntos porcentuales.
- Dos gráficos: participación actual y variaciones de participación.
- Tabla de los ocho cortes principales (Capital, Andes y Occidente, Centro y Centro Occidente, Oriente; cada uno separado por autoservicios y canal tradicional).
- Tabla adicional con los siete cortes especiales de alimentos, incluidos **Caracas, Maracaibo y Valencia** y otras agrupaciones.
- Explicaciones dinámicas sobre posiciones, tendencias, señales y limitaciones de cada mercado.

**Importante:** el corte `T Caracas Alimentos_Abs` no es todo el mercado de Caracas. La nomenclatura procede del archivo de NielsenIQ y representa solo el universo de medición correspondiente al corte especial de alimentos. Capital no debe tratarse automáticamente como sinónimo de la ciudad de Caracas. No se agregan regiones ni canales solapados ni se convierten participaciones relativas en ventas absolutas.

Desde el capítulo de canales del **Diagnóstico estratégico 2027** se puede acceder mediante el botón **Ver 5 rivales**. El comparador permite cambiar de mercado sin salir de la sección.

## Corrección de la conciliación del portafolio

La tarjeta antigua «Diferencia frente al total de Carúpano» mostraba números como «0,0000 puntos porcentuales» acompañados de «Sin comparación», una lectura engañosa. Ahora se muestra:

- **✓ Sí, coincide** cuando la suma de las contribuciones por segmento concuerda con la participación total de Carúpano con una tolerancia de 0,0005 puntos para contemplar el redondeo de valores de origen.
- **Revisar datos** si la diferencia supera ese límite; en tal caso no se atribuye automáticamente a redondeos.
- **Sin datos** cuando no es posible comprobar la conciliación.

En los 21 mercados actuales la diferencia observada se mantiene dentro del margen y no representa ninguna caída comercial.

## Cambios de navegación

Se ha **retirado completamente el módulo de escenarios hipotéticos 2027**, tanto de la navegación como de la lógica y el código de simulación. Se mantiene el **Diagnóstico estratégico 2027**, que relaciona hallazgos reales de NielsenIQ con acciones para el Business Plan sin construir pronósticos no fundamentados.

### Validación de la comparación regional

```bash
npm test
python tests/test_data.py
```

Las pruebas verifican los 15 cortes regionales y especiales, la selección correcta de los cinco competidores (sin incluir Carúpano entre ellos), el acceso a la vista regional, la ausencia del módulo de escenarios y la conciliación del portafolio.

## Nueva sección: Diagnóstico estratégico 2027

La sección **Diagnóstico estratégico 2027** transforma las métricas NielsenIQ en una narrativa ejecutiva organizada por cuatro capítulos:

1. **Competidores:** cuánto cambia la participación de Carúpano, Santa Teresa y Cacique, cómo evoluciona la distancia y qué segmentos explican matemáticamente los cambios de cuota (por ejemplo, el aumento del segmento STANDARD de Santa Teresa); sin atribuir automáticamente las ganancias de una marca a las pérdidas de otra.
2. **Canales y regiones:** comparación visual de los cambios de participación y tabla interactiva para explorar cada corte, sin sumar mercados superpuestos.
3. **Productos y posicionamiento:** contribución de los segmentos de Carúpano al total de ron vendido y advertencias sobre cambios de clasificación, mezcla y formatos.
4. **Plan 2027:** cuatro propuestas diferenciadas, con hallazgo medido, significado, acción, indicador de seguimiento, información interna faltante y responsables sugeridos.

**Casos comerciales prioritarios para estudiar:** autoservicios de Capital (pérdida simultánea de cuota y cobertura), licorerías (mejora de distribución numérica y caída de participación), canal tradicional de Centro + Centro Occidente (participación creciente) y contribución del portafolio de segmentos premium.

La explicación del módulo se recalcula al cambiar de mercado desde el filtro superior. Los botones **Analizar mercado** de la tabla modifican el mercado seleccionado y muestran su diagnóstico. El botón **Copiar resumen para el comité** copia una síntesis editable de los resultados y recomendaciones.

Este material distingue cuidadosamente entre observaciones, hipótesis de negocio y acciones recomendadas. **No demuestra efectos causales, retorno de inversión, ventas absolutas ni transferencia directa de cuota entre marcas.** Todas las comparaciones entre el año completo 2025 y 2026 acumulado a septiembre advierten la diferencia temporal.

### Validación técnica

```bash
npm test
python tests/test_data.py
```

El paquete JavaScript no necesita dependencias instaladas. Las pruebas de la sección estratégica comprueban los 21 cortes de mercado, las tres visualizaciones, la presencia de las cuatro acciones BP2027 y las referencias numéricas nacionales. GitHub Actions ejecuta las comprobaciones en cada actualización de `main`.


## Identidad visual oficial

El menú lateral utiliza el **logotipo original dorado horizontal** de Ron Carúpano, obtenido directamente del repositorio del [Brand Hub](https://grodriguezal.github.io/ron-carupano-brand-hub/). Está incluido sin alteraciones en `assets/branding/ron-carupano-logo-gold.webp`. También se conserva la versión negra vertical, para fondos claros, en `assets/branding/ron-carupano-logo-black-vertical.webp`.

**Tipografía de marca:** Adobe Garamond Pro para titulares expresivos y **Inter** para navegación, tablas, explicaciones, controles y cifras. Inter se carga con Google Fonts. Adobe Garamond Pro está declarada en la pila CSS como familia prioritaria; **en los equipos que no tengan instalada una copia licenciada se utiliza Garamond/Georgia como respaldo**. Para obtener Adobe Garamond Pro idéntica en todos los navegadores hace falta configurar una licencia de uso web y servirla a través de Adobe Fonts o un proveedor autorizado. No se redistribuye el archivo propietario de la tipografía.

Los colores de acento siguen el Brand Hub: dorado principal de referencia `#84754e` y dorado claro `#c5b783`, este último empleado para texto y gráficos sobre el fondo oscuro.

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