# Índice de Componentes de TaskOrg

Inventario completo de todos los componentes UI. Actualizar este archivo al agregar nuevos componentes reutilizables.

---

## Tabla de Contenidos

1. [Primitivos shadcn/ui](#primitivos-shadcnui)
2. [Componentes Personalizados](#componentes-personalizados)
3. [Componentes de Layout](#componentes-de-layout)
4. [Componentes de Diálogo y Formulario](#componentes-de-diálogo-y-formulario)
5. [Componentes del Panel de Propiedades](#componentes-del-panel-de-propiedades)
6. [Configuración de Agentes](#configuración-de-agentes)
7. [Utilidades y Hooks](#utilidades-y-hooks)

---

## Primitivos shadcn/ui

Ubicación: `ui/src/components/ui/`

Estos son componentes base de shadcn/ui. No modificar directamente — extender vía composición.

| Componente | Archivo | Props Principales | Notas |
|------------|---------|-------------------|-------|
| Button | `button.tsx` | `variant` (default, secondary, outline, ghost, destructive, link), `size` (xs, sm, default, lg, icon, icon-xs, icon-sm, icon-lg) | Elemento interactivo principal. Usa CVA. |
| Card | `card.tsx` | CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter | Componente compuesto. Padding por defecto `py-6`. |
| Input | `input.tsx` | `disabled` | Input de texto estándar. |
| Badge | `badge.tsx` | `variant` (default, secondary, outline, destructive, ghost) | Etiqueta/tag genérica. Para estado, usar StatusBadge en su lugar. |
| Label | `label.tsx` | — | Etiqueta de formulario, envuelve Radix Label. |
| Select | `select.tsx` | Trigger, Content, Item, etc. | Selector desplegable basado en Radix. |
| Separator | `separator.tsx` | `orientation` (horizontal, vertical) | Línea divisora. |
| Checkbox | `checkbox.tsx` | `checked`, `onCheckedChange` | Checkbox de Radix con indicador. |
| Textarea | `textarea.tsx` | Props estándar de textarea | Input multilínea. |
| Avatar | `avatar.tsx` | `size` (sm, default, lg). Incluye AvatarGroup, AvatarGroupCount | Imagen o iniciales de respaldo. |
| Breadcrumb | `breadcrumb.tsx` | BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage | Breadcrumbs de navegación. |
| Command | `command.tsx` | CommandInput, CommandList, CommandGroup, CommandItem | Paleta de comandos / búsqueda. Basado en cmdk. |
| Dialog | `dialog.tsx` | DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter | Overlay modal. |
| DropdownMenu | `dropdown-menu.tsx` | Trigger, Content, Item, Separator, etc. | Menús de contexto/acción. |
| Popover | `popover.tsx` | PopoverTrigger, PopoverContent | Panel de contenido flotante. |
| Tabs | `tabs.tsx` | `variant` (pill, line). TabsList, TabsTrigger, TabsContent | Navegación por pestañas. Pill = por defecto, line = estilo subrayado. |
| Tooltip | `tooltip.tsx` | TooltipTrigger, TooltipContent | Tooltips al pasar el cursor. La app está envuelta en TooltipProvider. |
| ScrollArea | `scroll-area.tsx` | — | Contenedor desplazable personalizado. |
| Collapsible | `collapsible.tsx` | CollapsibleTrigger, CollapsibleContent | Secciones expandir/colapsar. |
| Skeleton | `skeleton.tsx` | className para dimensionamiento | Placeholder de carga con efecto shimmer. |
| Sheet | `sheet.tsx` | SheetTrigger, SheetContent, SheetHeader, etc. | Overlay de panel lateral. |

---

## Componentes Personalizados

Ubicación: `ui/src/components/`

### StatusBadge

**Archivo:** `StatusBadge.tsx`
**Props:** `status: string`
**Uso:** Pastilla coloreada que muestra el estado de una entidad. Soporta 20+ estados con colores mapeados.

```tsx
<StatusBadge status="in_progress" />
```

Usar para mostrar estado en paneles de propiedades, filas de entidad y vistas de lista. Nunca codificar colores de estado en duro — siempre usar este componente.

### StatusIcon

**Archivo:** `StatusIcon.tsx`
**Props:** `status: string`, `onChange?: (status: string) => void`
**Uso:** Ícono circular que representa el estado de un issue. Cuando se proporciona `onChange`, abre un selector popover.

```tsx
<StatusIcon status="todo" onChange={setStatus} />
```

Soporta: backlog, todo, in_progress, in_review, done, cancelled, blocked. Usar en slots leading de filas de entidad y encabezados de listas agrupadas.

### PriorityIcon

**Archivo:** `PriorityIcon.tsx`
**Props:** `priority: string`, `onChange?: (priority: string) => void`
**Uso:** Ícono indicador de prioridad. Interactivo cuando se proporciona `onChange`.

```tsx
<PriorityIcon priority="high" onChange={setPriority} />
```

Soporta: critical, high, medium, low. Usar junto a StatusIcon en slots leading de filas de entidad.

### EntityRow

**Archivo:** `EntityRow.tsx`
**Props:** `leading`, `identifier`, `title`, `subtitle?`, `trailing?`, `onClick?`, `selected?`
**Uso:** Fila de lista estándar para issues, agentes, proyectos. Soporta resaltado hover y estado seleccionado.

```tsx
<EntityRow
  leading={<><StatusIcon status="todo" /><PriorityIcon priority="medium" /></>}
  identifier="PAP-003"
  title="Write API documentation"
  trailing={<StatusBadge status="todo" />}
  onClick={() => navigate(`/issues/${id}`)}
/>
```

Envolver múltiples EntityRows en un contenedor `border border-border rounded-md`.

### MetricCard

**Archivo:** `MetricCard.tsx`
**Props:** `icon: LucideIcon`, `value: string | number`, `label: string`, `description?: string`
**Uso:** Tarjeta de estadística para dashboard con ícono, valor grande, etiqueta y descripción opcional.

```tsx
<MetricCard icon={Bot} value={12} label="Active Agents" description="+3 this week" />
```

Usar siempre en una cuadrícula responsiva: `grid md:grid-cols-2 xl:grid-cols-4 gap-4`.

### EmptyState

**Archivo:** `EmptyState.tsx`
**Props:** `icon: LucideIcon`, `message: string`, `action?: string`, `onAction?: () => void`
**Uso:** Placeholder de lista vacía con ícono, mensaje y botón CTA opcional.

```tsx
<EmptyState icon={Inbox} message="No items yet." action="Create Item" onAction={handleCreate} />
```

### FilterBar

**Archivo:** `FilterBar.tsx`
**Props:** `filters: FilterValue[]`, `onRemove: (key) => void`, `onClear: () => void`
**Tipo:** `FilterValue = { key: string; label: string; value: string }`
**Uso:** Visualización de chips de filtro con botones de eliminar y limpiar todo.

```tsx
<FilterBar filters={filters} onRemove={handleRemove} onClear={() => setFilters([])} />
```

### Identity

**Archivo:** `Identity.tsx`
**Props:** `name: string`, `avatarUrl?: string`, `initials?: string`, `size?: "sm" | "default" | "lg"`
**Uso:** Visualización de avatar + nombre para usuarios y agentes. Deriva las iniciales del nombre automáticamente. Tres tamaños que coinciden con los tamaños de Avatar.

```tsx
<Identity name="Agent Alpha" size="sm" />
<Identity name="CEO Agent" />
<Identity name="Backend Service" size="lg" avatarUrl="/img/bot.png" />
```

Usar en filas de propiedades, encabezados de comentarios, visualizaciones de asignados y en cualquier lugar donde se muestre una referencia a usuario/agente.

### InlineEditor

**Archivo:** `InlineEditor.tsx`
**Props:** `value: string`, `onSave: (val: string) => void`, `as?: string`, `className?: string`
**Uso:** Texto clic-para-editar. Se renderiza como texto de visualización, al hacer clic entra en modo edición. Enter guarda, Escape cancela.

```tsx
<InlineEditor value={title} onSave={updateTitle} as="h2" className="text-xl font-bold" />
```

### PageSkeleton

**Archivo:** `PageSkeleton.tsx`
**Props:** `variant: "list" | "detail"`
**Uso:** Skeleton de carga de página completa que coincide con el layout de lista o detalle.

```tsx
<PageSkeleton variant="list" />
```

### CommentThread

**Archivo:** `CommentThread.tsx`
**Uso:** Lista de comentarios con formulario para agregar comentarios. Usado en vistas de detalle de issues y entidades.

### GoalTree

**Archivo:** `GoalTree.tsx`
**Uso:** Árbol jerárquico de objetivos con expandir/colapsar. Usado en la página de objetivos.

### CompanySwitcher

**Archivo:** `CompanySwitcher.tsx`
**Uso:** Selector desplegable de empresa en el encabezado del sidebar.

---

## Componentes de Layout

### Layout

**Archivo:** `Layout.tsx`
**Uso:** Shell principal de la aplicación. Layout de tres zonas: Sidebar + Contenido principal + Panel de propiedades. Envuelve todas las rutas.

### Sidebar

**Archivo:** `Sidebar.tsx`
**Uso:** Barra lateral de navegación izquierda (`w-60`). Contiene CompanySwitcher, botón de búsqueda, botón de nuevo issue y SidebarSections.

### SidebarSection

**Archivo:** `SidebarSection.tsx`
**Uso:** Grupo colapsable del sidebar con etiqueta de encabezado y toggle de chevron.

### SidebarNavItem

**Archivo:** `SidebarNavItem.tsx`
**Props:** Ícono, etiqueta, conteo de badge opcional
**Uso:** Elemento de navegación individual dentro de un SidebarSection.

### BreadcrumbBar

**Archivo:** `BreadcrumbBar.tsx`
**Uso:** Navegación de breadcrumb superior que abarca contenido principal + panel de propiedades.

### PropertiesPanel

**Archivo:** `PropertiesPanel.tsx`
**Uso:** Panel de propiedades del lado derecho (`w-80`). Cerrable. Se muestra en vistas de detalle.

### CommandPalette

**Archivo:** `CommandPalette.tsx`
**Uso:** Modal de búsqueda global Cmd+K. Busca issues, proyectos, agentes.

---

## Componentes de Diálogo y Formulario

### NewIssueDialog

**Archivo:** `NewIssueDialog.tsx`
**Uso:** Crear nuevo issue con selección de proyecto/asignado/prioridad. Soporta guardado de borrador.

### NewProjectDialog

**Archivo:** `NewProjectDialog.tsx`
**Uso:** Diálogo para crear nuevo proyecto.

### NewAgentDialog

**Archivo:** `NewAgentDialog.tsx`
**Uso:** Diálogo para crear nuevo agente.

### OnboardingWizard

**Archivo:** `OnboardingWizard.tsx`
**Uso:** Flujo de onboarding de múltiples pasos para nuevos usuarios/empresas.

---

## Componentes del Panel de Propiedades

Estos se renderizan dentro del PropertiesPanel para diferentes tipos de entidad:

| Componente | Archivo | Entidad |
|------------|---------|---------|
| IssueProperties | `IssueProperties.tsx` | Issues |
| AgentProperties | `AgentProperties.tsx` | Agentes |
| ProjectProperties | `ProjectProperties.tsx` | Proyectos |
| GoalProperties | `GoalProperties.tsx` | Objetivos |

Todos siguen el patrón de fila de propiedad: etiqueta `text-xs text-muted-foreground` a la izquierda, valor a la derecha, espaciado `py-1.5`.

---

## Configuración de Agentes

### agent-config-primitives

**Archivo:** `agent-config-primitives.tsx`
**Exportaciones:** Field, ToggleField, ToggleWithNumber, CollapsibleSection, AutoExpandTextarea, DraftInput
**Uso:** Primitivos de campos de formulario reutilizables para formularios de configuración de agentes.

### AgentConfigForm

**Archivo:** `AgentConfigForm.tsx`
**Uso:** Formulario completo de creación/edición de agente con selección de tipo de adapter.

---

## Utilidades y Hooks

### cn() — Fusionador de Nombres de Clase

**Archivo:** `ui/src/lib/utils.ts`
**Uso:** Fusiona nombres de clase con clsx + tailwind-merge. Usar en cada componente.

```tsx
import { cn } from "@/lib/utils";
<div className={cn("base-classes", conditional && "extra", className)} />
```

### Utilidades de Formato

**Archivo:** `ui/src/lib/utils.ts`

| Función | Uso |
|---------|-----|
| `formatCents(cents)` | Visualización de dinero: `$12.34` |
| `formatDate(date)` | Visualización de fecha: `Jan 15, 2025` |
| `relativeTime(date)` | Tiempo relativo: `2m ago`, `Jan 15` |
| `formatTokens(count)` | Conteo de tokens: `1.2M`, `500k` |

### useKeyboardShortcuts

**Archivo:** `ui/src/hooks/useKeyboardShortcuts.ts`
**Uso:** Manejador de atajos de teclado globales. Registra Cmd+K, C, [, ], Cmd+Enter.

### Query Keys

**Archivo:** `ui/src/lib/queryKeys.ts`
**Uso:** Fábricas de claves estructuradas de React Query para gestión de caché.

### groupBy

**Archivo:** `ui/src/lib/groupBy.ts`
**Uso:** Utilidad genérica de agrupación de arrays.
