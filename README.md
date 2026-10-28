# CARÚPANO MARKET INTELLIGENCE

**NielsenIQ · Ron Venezuela · 2025 completo / 2026 YTD septiembre**

Plataforma de inteligencia de mercado para Ron Carúpano, con **13 secciones navegables** y módulos avanzados de segmentos, competencia premium, índice relativo de valor/volumen, distribución y movimientos de marcas.

## Detalles de las tablas sin cambiar de sección

En **Diagnóstico estratégico**, **Competencia por región** y la tabla de segmentos de **Estructura del mercado**, los botones ahora indican **«Ver detalle aquí»**. Al pulsarlos:

- Aparece una fila ampliada inmediatamente debajo de la selección, sin navegar a otra sección ni hacer saltar la página al inicio.
- Se muestra la posición de Carúpano, sus indicadores y los cinco competidores del mismo mercado; para los segmentos, la cuota de las marcas dentro del segmento seleccionado.
- El mismo botón cambia a **«Ocultar detalle»** para contraer la información.
- Al abrir otra fila se cierra la anterior, manteniendo una lectura clara de la tabla.

Los mercados mantienen su propio denominador; los períodos 2025 y 2026 siguen sin ser comparaciones interanuales de igual duración. `tests/test_inline_details.mjs` comprueba apertura, cierre y contenido de los detalles. Los assets usan un identificador de versión para evitar código antiguo en caché.

## Inteligencia de mercado avanzada — cinco dashboards activos

Desde la versión 1.2 se incorporan **cinco módulos de inteligencia de mercado basados en NielsenIQ**. No incluyen simulaciones de participación ni modelos presupuestarios.

| Módulo | Pregunta de negocio | Nivel de cálculo |
| --- | --- | --- |
| **Estructura del mercado** | ¿Qué segmentos representan mayor o menor proporción del mercado en cada región? | Suma de aportaciones por marca-segmento, sin volver a agregar tamaños |
| **Competencia por segmento** | ¿Qué cuota tiene Carúpano *dentro* de Standard, Premium, Super Premium y demás segmentos frente a sus rivales? | Aportación marca-segmento ÷ total del segmento en el mismo mercado |
| **Índice valor/volumen (cálculo propio)** | ¿Qué marcas aportan relativamente más valor que volumen? | Índice derivado = 100 × participación en valor ÷ participación en volumen; ambos porcentajes proceden de NielsenIQ |
| **Diagnóstico de distribución** | ¿Dónde coinciden cambios de participación y presencia numérica o ponderada? | Señales descriptivas por mercado; no mide causalidad |
| **Movimientos competitivos** | ¿Qué marcas ganan o pierden peso relativo y qué segmentos explican su cambio? | Cambios de participación por marca y segmentación |

### Criterios de interpretación

- El denominador de **participación dentro de Super Premium** es el valor del segmento Super Premium, mientras que una **aportación de Super Premium al mercado** usa el valor total de ron. Nunca se deben confundir.
- La base compara **el año completo de 2025 y el acumulado a septiembre de 2026**. Las diferencias entre participaciones se muestran en puntos porcentuales, pero no constituyen crecimiento interanual homogéneo en ventas.
- El índice de **valor/volumen es calculado por este dashboard, no proporcionado directamente por NielsenIQ**; toma las participaciones en valor y volumen del proveedor y tiene como referencia 100 para la categoría. Es un indicador relativo que puede reflejar cambios en precios o mezcla de formatos: **no es un precio real ni permite calcular rentabilidad**. Para evitar ratios extremos, su ranking principal limita las marcas a al menos 0,3 % de participación en valor; Carúpano siempre está incluido en el gráfico de referencia.
- Los **mercados y canales NielsenIQ se solapan** y las distribuciones no son aditivas. No se suman participaciones ni se extrapolan a valor económico absoluto.
- Un cambio de participación de una marca puede explicarse por el peso del segmento y por su participación dentro del segmento. El dashboard ofrece ambas lecturas, sin afirmar transferencia de consumidores.

### Validación de los nuevos módulos

`tests/test_advanced.mjs` comprueba las **105 combinaciones** de cinco dashboards por los 21 cortes de mercado, además de los puntos de referencia:

- Standard nacional: **62,4091 %** del valor de ron en 2026 hasta septiembre.
- Carúpano dentro de Super Premium nacional: **14,6738 %**, calculado sobre el segmento.
- Índice relativo de Carúpano en valor/volumen: **122,56**.
- Conciliación de aportaciones del portafolio por segmento.
- Ranking de marcas y señales de distribución calculadas sin mezclar canales.

`tests/test_navigation.mjs` comprueba la navegación entre las **13 secciones**, incluidos los nuevos accesos directos. Todo se ejecuta al lanzar `npm test`, integrado en GitHub Actions.

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
- **Diagnóstico estratégico:** analiza la competencia, los canales y los segmentos, y conecta cada evidencia con decisiones e investigaciones comerciales.
- **Marcas competidoras:** compara Carúpano con cualquier otra marca medida. El ranking de 12 marcas sustituye a la antigua matriz de puntos que mezclaba cuota y distribución ponderada.
- **Competencia por región:** identifica los cinco principales competidores de cada región, ciudad o canal incluido en Nielsen, junto con los resultados de Carúpano.
- **Estructura del mercado:** descubre el peso de cada segmento en el mercado total.
- **Competencia por segmento:** compara cuotas dentro de Standard, Premium, Super Premium y otras clasificaciones.
- **Índice valor/volumen:** compara un índice construido por el dashboard con los porcentajes en valor y volumen medidos por NielsenIQ; no es una métrica entregada directamente por NielsenIQ.
- **Diagnóstico de distribución:** identifica señales al cruzar presencia y cuota. Ahora distingue distribución numérica de ponderada y propone comprobaciones distintas cuando cambian en sentidos opuestos.
- **Movimientos competitivos:** rastrea ganancias y pérdidas de participación por marca.
- **Canales y regiones:** explora cómo cambia la participación según dónde y cómo se vende.
- **Presencia en tiendas:** compara número de tiendas e importancia comercial de esas tiendas.
- **Productos y formatos:** analiza qué aporta cada segmento del portafolio al mercado.
- **Oportunidades de mejora:** interpreta señales automáticas y los siguientes pasos de investigación.

**Regla editorial:** el relato se divide en dato observado, interpretación prudente y acción por investigar. No se presenta una correlación como prueba de causalidad. Los cambios entre porcentajes se escriben en palabras completas («puntos porcentuales») y se señala que 2025 y 2026 no son períodos de igual duración.

## Navegación y acceso directo

El menú del dashboard tiene trece secciones interactivas. Tras añadir **Competencia por región**, se corrigió un problema potencial de caché: un navegador podía mostrar un `index.html` nuevo junto a un `app.js` anterior, causando que el botón fuera visible pero no respondiera.

Los scripts y estilos se cargan con identificadores de versión coherentes. La sección regional permite ahora acceso directo mediante la URL:

`https://grodriguezal.github.io/ron-carupano-nielsen-2026/#regional`

Al hacer clic en una sección se actualiza el fragmento de la URL, y al abrir un enlace con `#regional` se muestra esa sección tras cargar los datos. Se ejecuta `tests/test_navigation.mjs` junto con el resto de las pruebas, para comprobar de manera automática los manejadores de clic y la visualización del informe regional.

Si el navegador tiene una versión antigua en caché, realiza una recarga forzada y abre el acceso directo anterior.

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

Desde el capítulo de canales del **Diagnóstico estratégico** se puede acceder mediante el botón **Ver 5 rivales**. El comparador permite cambiar de mercado sin salir de la sección.

## Corrección de la conciliación del portafolio

La tarjeta antigua «Diferencia frente al total de Carúpano» mostraba números como «0,0000 puntos porcentuales» acompañados de «Sin comparación», una lectura engañosa. Ahora se muestra:

- **✓ Sí, coincide** cuando la suma de las contribuciones por segmento concuerda con la participación total de Carúpano con una tolerancia de 0,0005 puntos para contemplar el redondeo de valores de origen.
- **Revisar datos** si la diferencia supera ese límite; en tal caso no se atribuye automáticamente a redondeos.
- **Sin datos** cuando no es posible comprobar la conciliación.

En los 21 mercados actuales la diferencia observada se mantiene dentro del margen y no representa ninguna caída comercial.

## Cambios de navegación

Se han retirado los módulos de escenarios hipotéticos y de Inteligencia de formatos, tanto de la navegación como de las rutas y cálculos específicos. El **Diagnóstico estratégico** relaciona hallazgos medidos por NielsenIQ con recomendaciones de investigación y ejecución comercial, sin construir pronósticos no fundamentados.

### Validación de la comparación regional

```bash
npm test
python tests/test_data.py
```

Las pruebas verifican los 15 cortes regionales y especiales, la selección correcta de los cinco competidores (sin incluir Carúpano entre ellos), el acceso a la vista regional, la ausencia del módulo de escenarios y la conciliación del portafolio.

## Nueva sección: Diagnóstico estratégico

La sección **Diagnóstico estratégico** transforma las métricas NielsenIQ en una narrativa ejecutiva organizada por cuatro capítulos:

1. **Competidores:** cuánto cambia la participación de Carúpano, Santa Teresa y Cacique, cómo evoluciona la distancia y qué segmentos explican matemáticamente los cambios de cuota (por ejemplo, el aumento del segmento STANDARD de Santa Teresa); sin atribuir automáticamente las ganancias de una marca a las pérdidas de otra.
2. **Canales y regiones:** comparación visual de los cambios de participación y tabla interactiva para explorar cada corte, sin sumar mercados superpuestos.
3. **Productos y posicionamiento:** composición interna del valor de Carúpano (segmentos que suman 100 % de la marca) y tabla separada de contribuciones a la participación total del mercado, con cambios en puntos porcentuales y precisión para cifras pequeñas.
4. **Prioridades de actuación:** cuatro propuestas diferenciadas, con hallazgo medido, significado, acción, indicador de seguimiento, información interna faltante y responsables sugeridos.

**Casos comerciales prioritarios para estudiar:** autoservicios de Capital (pérdida simultánea de cuota y cobertura), licorerías (mejora de distribución numérica y caída de participación), canal tradicional de Centro + Centro Occidente (participación creciente) y contribución del portafolio de segmentos premium.

La explicación del módulo se recalcula al cambiar de mercado desde el filtro superior. Los botones **Analizar mercado** de la tabla modifican el mercado seleccionado y muestran su diagnóstico. El botón **Copiar resumen para el comité** copia una síntesis editable de los resultados y recomendaciones.

Este material distingue cuidadosamente entre observaciones, hipótesis de negocio y acciones recomendadas. **No demuestra efectos causales, retorno de inversión, ventas absolutas ni transferencia directa de cuota entre marcas.** Todas las comparaciones entre el año completo 2025 y 2026 acumulado a septiembre advierten la diferencia temporal.

### Validación técnica

```bash
npm test
python tests/test_data.py
```

El paquete JavaScript no necesita dependencias instaladas. Las pruebas de la sección estratégica comprueban los 21 cortes de mercado, las tres visualizaciones, la presencia de cuatro acciones propuestas y las referencias numéricas nacionales. GitHub Actions ejecuta las comprobaciones en cada actualización de `main`.


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

## Privacidad y licencia

La información procede de NielsenIQ y el archivo incluye © 2026 Nielsen Consumer LLC. Verifica las condiciones de licencia antes de redistribuir el archivo o desplegar públicamente. El repositorio puede ser público aunque el código o la app no tengan autenticación; **un repositorio privado no convierte automáticamente GitHub Pages en privado**.

## QA

Las cifras nacionales para 2026 YTD deben ser: Carúpano 8,1123%; Santa Teresa 59,1257%; Cacique 14,0290% en cuota de valor. Ver `tests/test_data.py`.
## Diagnóstico por métrica en el resumen ejecutivo

Al elegir **distribución numérica**, las conclusiones comparan el porcentaje de establecimientos con presencia de Carúpano frente al líder del mercado en valor y proponen una auditoría de altas/bajas, surtido y disponibilidad por tienda. Al elegir **distribución ponderada**, el diagnóstico compara el peso de la categoría representado por las tiendas con presencia de cada marca y prioriza cuentas relevantes, surtido e inventario. Las tres tarjetas cambian sus cifras y sus interpretaciones, y la tercera muestra también una acción concreta. Ninguna de estas medidas se suma entre marcas; las cuotas son independientes y pueden solaparse. Las pruebas validan las dos lecturas en los 21 mercados.
