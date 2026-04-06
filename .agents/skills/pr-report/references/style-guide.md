# Guía de Estilo de Reporte de PR

Usar esta guía cuando el usuario quiera un artefacto de reporte, especialmente una página web.

## Objetivo

Hacer que el reporte se sienta como una reseña editorial, no como un dashboard de administración
interno. La página debe hacer que un argumento técnico extenso sea fácil de escanear sin verse
genérico o sobre-diseñado.

## Dirección Visual

Tono preferido:

- editorial
- cálido
- serio
- alto contraste
- artesanal, no SaaS corporativo

Evitar:

- layouts de shell de aplicación por defecto
- gradientes púrpura sobre blanco
- dashboards genéricos de tarjetas
- páginas apretadas con jerarquía débil
- fuentes novedosas que perjudican la legibilidad

## Tipografía

Patrón recomendado:

- una fuente serif o display expresiva para encabezados principales
- una sans-serif robusta para cuerpo de texto y etiquetas de UI

Buenas combinaciones:

- Newsreader + IBM Plex Sans
- Source Serif 4 + Instrument Sans
- Fraunces + Public Sans
- Libre Baskerville + Work Sans

Reglas:

- los encabezados deben sentirse deliberados y grandes
- el cuerpo de texto debe mantenerse cómodo para lectura prolongada
- las etiquetas de referencia e insignias deben usar texto sans denso más pequeño

## Layout

Estructura recomendada:

- una navegación fija lateral o superior para reportes largos
- un resumen hero fuerte en la parte superior
- secciones tipo panel o papel para cada tema principal
- grillas de tarjetas multi-columna para comparaciones y fortalezas
- texto de cuerpo en una sola columna para hallazgos y recomendaciones

Usar espaciado generoso. Los reportes técnicos extensos necesitan espacio para respirar.

## Color

Preferir fondos tipo papel apagados con un acento cálido y un contrapeso frío.

Categorías de tokens sugeridas:

- `--bg`
- `--paper`
- `--ink`
- `--muted`
- `--line`
- `--accent`
- `--good`
- `--warn`
- `--bad`

El acento debe resaltar navegación, insignias y etiquetas importantes. No dejar
que los colores de acento dominen el texto del cuerpo.

## Elementos de UI Útiles

Incluir estilos pequeños reutilizables para:

- métricas de resumen
- insignias
- citas o llamadas de atención
- tarjetas de hallazgos
- etiquetas de severidad
- etiquetas de referencia
- tarjetas de comparación
- secciones responsivas de dos columnas

## Movimiento

Mantener el movimiento contenido.

Bueno:

- fundido/deslizamiento suave en la primera carga
- respuesta hover en elementos de navegación o tarjetas

Malo:

- animación constante
- formas flotantes
- movimiento decorativo sin beneficio de lectura

## Presentación de Contenido

Incluso cuando el usuario quiere pulido de diseño, la claridad sigue siendo primaria.

Buena estructura para reportes largos:

1. resumen ejecutivo
2. qué cambió
3. explicación tutorial
4. fortalezas
5. hallazgos
6. comparaciones
7. recomendación

Los encabezados exactos pueden cambiar. Lo importante es separar la explicación
del juicio.

## Referencias

Las etiquetas de referencia deben ser visualmente discretas pero fáciles de detectar.

Buen patrón:

- texto pequeño apagado
- monoespaciada o sans compacta
- mantenerlas cerca del párrafo que apoyan

## Uso del Inicio

Si necesitas una base pulida rápida, comenzar desde:

- `assets/html-report-starter.html`

Personalizar:

- fuentes
- tokens de color
- texto hero
- orden de secciones
- densidad de tarjetas

No preservar las secciones de marcador de posición si no encajan con el reporte real.
