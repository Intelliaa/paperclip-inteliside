---
name: design-guide
description: >
  Guía del sistema de diseño UI de TaskOrg para construir componentes frontend
  consistentes y reutilizables. Usar al crear nuevos componentes UI, modificar
  los existentes, agregar páginas o funcionalidades al frontend, estilizar
  elementos UI, o cuando necesites entender el lenguaje y las convenciones de
  diseño. Cubre: creación de componentes, tokens de diseño, tipografía, sistemas
  de estado/prioridad, patrones de composición y la página de showcase
  /design-guide. Usar siempre este skill junto con el skill frontend-design
  (para calidad visual) y el skill web-design-guidelines (para mejores prácticas
  web).
---

# Guía de Diseño de TaskOrg

La UI de TaskOrg es un plano de control de grado profesional — denso, orientado al teclado, con tema oscuro por defecto. Cada píxel justifica su lugar.

**Usar siempre con:** `frontend-design` (pulido visual) y `web-design-guidelines` (mejores prácticas web).

---

## 1. Principios de Diseño

- **Denso pero escaneable.** Máxima información sin clics para revelar. El espacio en blanco separa, no rellena.
- **Teclado primero.** Atajos globales (Cmd+K, C, [, ]). Los usuarios avanzados rara vez tocan el ratón.
- **Contextual, no modal.** Edición en línea sobre cuadros de diálogo. Desplegables sobre navegaciones de página.
- **Tema oscuro por defecto.** Grises neutros (OKLCH), no negro puro. Colores de acento solo para estado/prioridad. El texto es el elemento visual principal.
- **Orientado a componentes.** Preferir componentes reutilizables que capturen convenciones de estilo. Construir en la abstracción correcta — ni demasiado granular, ni demasiado monolítico.

---

## 2. Stack Tecnológico

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** con variables CSS (espacio de color OKLCH)
- **shadcn/ui** (estilo new-york, base neutra, variables CSS habilitadas)
- **Radix UI** primitivos (accesibilidad, gestión de foco)
- **Lucide React** íconos (16px nav, 14px en línea)
- **class-variance-authority** (CVA) para variantes de componentes
- **clsx + tailwind-merge** vía utilidad `cn()`

Configuración: `ui/components.json` (alias: `@/components`, `@/components/ui`, `@/lib`, `@/hooks`)

---

## 3. Tokens de Diseño

Todos los tokens definidos como variables CSS en `ui/src/index.css`. Tanto el tema claro como el oscuro usan OKLCH.

### Colores

Usar nombres de tokens semánticos, nunca valores de color crudos:

| Token | Uso |
|-------|-----|
| `--background` / `--foreground` | Fondo de página y texto principal |
| `--card` / `--card-foreground` | Superficies de tarjetas |
| `--primary` / `--primary-foreground` | Acciones primarias, énfasis |
| `--secondary` / `--secondary-foreground` | Superficies secundarias |
| `--muted` / `--muted-foreground` | Texto atenuado, etiquetas |
| `--accent` / `--accent-foreground` | Estados hover, elementos de nav activos |
| `--destructive` | Acciones destructivas |
| `--border` | Todos los bordes |
| `--ring` | Anillos de foco |
| `--sidebar-*` | Variantes específicas del sidebar |
| `--chart-1` hasta `--chart-5` | Visualización de datos |

### Radio de Borde

Variable única `--radius` (0.625rem) con tamaños derivados:

- `rounded-sm` — inputs pequeños, pastillas
- `rounded-md` — botones, inputs, componentes pequeños
- `rounded-lg` — tarjetas, diálogos
- `rounded-xl` — contenedores de tarjetas, componentes grandes
- `rounded-full` — badges, avatares, puntos de estado

### Sombras

Sombras mínimas: `shadow-xs` (botones outline), `shadow-sm` (tarjetas). Sin sombras pesadas.

---

## 4. Escala Tipográfica

Usar exactamente estos patrones — no inventar nuevos:

| Patrón | Clases | Uso |
|--------|--------|-----|
| Título de página | `text-xl font-bold` | Parte superior de páginas |
| Título de sección | `text-lg font-semibold` | Secciones principales |
| Encabezado de sección | `text-sm font-semibold text-muted-foreground uppercase tracking-wide` | Encabezados de sección en guía de diseño, sidebar |
| Título de tarjeta | `text-sm font-medium` o `text-sm font-semibold` | Encabezados de tarjeta, títulos de elementos de lista |
| Cuerpo | `text-sm` | Texto de cuerpo por defecto |
| Atenuado | `text-sm text-muted-foreground` | Descripciones, texto secundario |
| Etiqueta pequeña | `text-xs text-muted-foreground` | Metadatos, marcas de tiempo, etiquetas de propiedades |
| Identificador mono | `text-xs font-mono text-muted-foreground` | Claves de issues (PAP-001), variables CSS |
| Estadística grande | `text-2xl font-bold` | Valores de métricas del dashboard |
| Código/log | `font-mono text-xs` | Salida de logs, fragmentos de código |

---

## 5. Sistemas de Estado y Prioridad

### Colores de Estado (consistentes en todas las entidades)

Definidos en `StatusBadge.tsx` y `StatusIcon.tsx`:

| Estado | Color | Tipos de entidad |
|--------|-------|-----------------|
| active, achieved, completed, succeeded, approved, done | Tonos de verde | Agentes, objetivos, issues, aprobaciones |
| running | Cian | Agentes |
| paused | Naranja | Agentes |
| idle, pending | Amarillo | Agentes, aprobaciones |
| failed, error, rejected, blocked | Tonos de rojo | Ejecuciones, agentes, aprobaciones, issues |
| archived, planned, backlog, cancelled | Gris neutro | Varios |
| todo | Azul | Issues |
| in_progress | Índigo | Issues |
| in_review | Violeta | Issues |

### Íconos de Prioridad

Definidos en `PriorityIcon.tsx`: critical (rojo/AlertTriangle), high (naranja/ArrowUp), medium (amarillo/Minus), low (azul/ArrowDown).

### Puntos de Estado de Agentes

Puntos coloreados en línea: running (cian, animate-pulse), active (verde), paused (amarillo), error (rojo), offline (neutro).

---

## 6. Jerarquía de Componentes

Tres niveles:

1. **Primitivos shadcn/ui** (`ui/src/components/ui/`) — Button, Card, Input, Badge, Dialog, Tabs, etc. No modificar estos directamente; extender vía composición.
2. **Compuestos personalizados** (`ui/src/components/`) — StatusBadge, EntityRow, MetricCard, etc. Estos capturan el lenguaje de diseño específico de TaskOrg.
3. **Componentes de página** (`ui/src/pages/`) — Componen primitivos y compuestos en vistas completas.

**Ver [references/component-index.md](references/component-index.md) para el inventario completo de componentes con guía de uso.**

### Cuándo Crear un Nuevo Componente

Crear un componente reutilizable cuando:
- El mismo patrón visual aparece en 2+ lugares
- El patrón tiene comportamiento interactivo (cambio de estado, edición en línea)
- El patrón codifica lógica de dominio (colores de estado, íconos de prioridad)

NO crear un componente para:
- Diseños únicos específicos de una sola página
- Combinaciones simples de className (usar Tailwind directamente)
- Envoltorios delgados que no añaden valor semántico

---

## 7. Patrones de Composición

Estos patrones describen cómo los componentes trabajan juntos. Puede que no sean un componente propio, pero deben usarse de forma consistente en toda la aplicación.

### Fila de Entidad con Estado + Prioridad

El elemento de lista estándar para issues y entidades similares:

```tsx
<EntityRow
  leading={<><StatusIcon status="in_progress" /><PriorityIcon priority="high" /></>}
  identifier="PAP-001"
  title="Implement authentication flow"
  subtitle="Assigned to Agent Alpha"
  trailing={<StatusBadge status="in_progress" />}
  onClick={() => {}}
/>
```

El slot leading siempre: StatusIcon primero, luego PriorityIcon. Slot trailing: StatusBadge o marca de tiempo.

### Lista Agrupada

Issues agrupados por encabezado de estado + filas de entidad:

```tsx
<div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-t-md">
  <StatusIcon status="in_progress" />
  <span className="text-sm font-medium">In Progress</span>
  <span className="text-xs text-muted-foreground ml-1">2</span>
</div>
<div className="border border-border rounded-b-md">
  <EntityRow ... />
  <EntityRow ... />
</div>
```

### Fila de Propiedad

Pares clave-valor en paneles de propiedades:

```tsx
<div className="flex items-center justify-between py-1.5">
  <span className="text-xs text-muted-foreground">Status</span>
  <StatusBadge status="active" />
</div>
```

La etiqueta siempre es `text-xs text-muted-foreground`, el valor a la derecha. Envolver en un contenedor con `space-y-1`.

### Cuadrícula de Tarjetas de Métricas

Métricas del dashboard en una cuadrícula responsiva:

```tsx
<div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
  <MetricCard icon={Bot} value={12} label="Active Agents" description="+3 this week" />
  ...
</div>
```

### Barra de Progreso (Presupuesto)

Color por umbral: verde (<60%), amarillo (60-85%), rojo (>85%):

```tsx
<div className="w-full h-2 bg-muted rounded-full overflow-hidden">
  <div className="h-full rounded-full bg-green-400" style={{ width: `${pct}%` }} />
</div>
```

### Hilo de Comentarios

Encabezado del autor (nombre + marca de tiempo) luego cuerpo, en tarjetas con borde y `space-y-3`. Añadir textarea de comentario + botón debajo.

### Tabla de Costos

`<table>` estándar con `text-xs`, fila de encabezado con `bg-accent/20`, `font-mono` para valores numéricos.

### Visor de Logs

Contenedor `bg-neutral-950 rounded-lg p-3 font-mono text-xs`. Colorear líneas por nivel: default (foreground), WARN (yellow-400), ERROR (red-400), SYS (blue-300). Incluir punto indicador en vivo cuando se transmite en streaming.

---

## 8. Patrones Interactivos

### Estados Hover

- Filas de entidad: `hover:bg-accent/50`
- Elementos de nav: `hover:bg-accent/50 hover:text-accent-foreground`
- Nav activo: `bg-accent text-accent-foreground`

### Foco

`focus-visible:ring-ring focus-visible:ring-[3px]` — anillo focus-visible estándar de Tailwind.

### Deshabilitado

`disabled:opacity-50 disabled:pointer-events-none`

### Edición en Línea

Usar componente `InlineEditor` — clic en texto para editar, Enter guarda, Escape cancela.

### Selectores Popover

StatusIcon y PriorityIcon usan Radix Popover para selección en línea. Seguir este patrón para cualquier propiedad clicable que abra un selector.

---

## 9. Sistema de Layout

Layout de tres zonas definido en `Layout.tsx`:

```
┌──────────┬──────────────────────────────┬──────────────────────┐
│ Sidebar  │  Barra de breadcrumb         │                      │
│ (w-60)   ├──────────────────────────────┤  Panel de            │
│          │  Contenido principal (flex-1) │  propiedades         │
│          │                              │  (w-80, opcional)    │
└──────────┴──────────────────────────────┴──────────────────────┘
```

- Sidebar: `w-60`, colapsable, contiene CompanySwitcher + SidebarSections
- Panel de propiedades: `w-80`, visible en vistas de detalle, oculto en listas
- Contenido principal: desplazable, `flex-1`

---

## 10. La Página /design-guide

**Ubicación:** `ui/src/pages/DesignGuide.tsx`
**Ruta:** `/design-guide`

Esta es la vitrina viviente de cada componente y patrón en la aplicación. Es la fuente de verdad de cómo se ven las cosas.

### Reglas

1. **Cuando agregues un nuevo componente reutilizable, DEBES añadirlo a la página de la guía de diseño.** Mostrar todas las variantes, tamaños y estados.
2. **Cuando modifiques la API de un componente existente, actualizar su sección en la guía de diseño.**
3. **Cuando agregues un nuevo patrón de composición, añadir una sección demostrándolo.**
4. Seguir la estructura existente: envoltorio `<Section title="...">` con `<SubSection>` para agrupar.
5. Mantener las secciones ordenadas lógicamente: fundacionales (colores, tipografía) primero, luego primitivos, luego compuestos, luego patrones.

### Agregar una Nueva Sección

```tsx
<Section title="My New Component">
  <SubSection title="Variants">
    {/* Show all variants */}
  </SubSection>
  <SubSection title="Sizes">
    {/* Show all sizes */}
  </SubSection>
  <SubSection title="States">
    {/* Show interactive/disabled states */}
  </SubSection>
</Section>
```

---

## 11. Índice de Componentes

**Ver [references/component-index.md](references/component-index.md) para el inventario completo de componentes.**

Cuando crees un nuevo componente reutilizable:
1. Añadirlo al archivo de referencia del índice de componentes
2. Añadirlo a la página /design-guide
3. Seguir las convenciones existentes de nombres y archivos

---

## 12. Convenciones de Archivos

- **Primitivos shadcn:** `ui/src/components/ui/{component}.tsx` — minúsculas, kebab-case
- **Componentes personalizados:** `ui/src/components/{ComponentName}.tsx` — PascalCase
- **Páginas:** `ui/src/pages/{PageName}.tsx` — PascalCase
- **Utilidades:** `ui/src/lib/{name}.ts`
- **Hooks:** `ui/src/hooks/{useName}.ts`
- **Módulos API:** `ui/src/api/{entity}.ts`
- **Proveedores de contexto:** `ui/src/context/{Name}Context.tsx`

Todos los componentes usan `cn()` de `@/lib/utils` para la fusión de className. Todos los componentes usan CVA para definiciones de variantes cuando tienen múltiples variantes visuales.

---

## 13. Errores Comunes a Evitar

- Usar colores hex/rgb crudos en lugar de tokens de variables CSS
- Crear estilos tipográficos ad-hoc en lugar de usar la escala establecida
- Codificar colores de estado en duro en lugar de usar StatusBadge/StatusIcon
- Construir elementos estilizados únicos cuando existe un componente reutilizable
- Agregar componentes sin actualizar la página de la guía de diseño
- Usar `shadow-md` o más pesado — mantener sombras mínimas (solo xs, sm)
- Usar `rounded-2xl` o mayor — el máximo es `rounded-xl` (excepto `rounded-full` para pastillas)
- Olvidar el modo oscuro — siempre usar tokens semánticos, nunca codificar valores claros/oscuros en duro
