# ClipHub: Marketplace para Configuraciones de Equipos Paperclip

> Nota de supersesión: este plan de marketplace predata la dirección de paquete markdown-first. Para el plan actual de formato de paquete e import/export rollout, ver `doc/plans/2026-03-13-company-import-export-v2.md` y `docs/companies/companies-spec.md`.

> La "tienda de aplicaciones" para equipos de IA de compañía completa — configuraciones Paperclip pre-construidas, blueprints de agentes, skills, y plantillas de gobernanza que envían trabajo real desde el primer día.

## 1. Visión y Posicionamiento

**ClipHub** vende **configuraciones de equipos completas** — organigramas, roles de agentes, workflows inter-agentes, reglas de gobernanza, y plantillas de proyectos — para compañías gestionadas por Paperclip.

| Dimensión | ClipHub |
|---|---|
| Unidad de venta | Blueprint de equipo (org multi-agente) |
| Comprador | Fundador / líder de equipo girando una compañía IA |
| Destino de instalación | Compañía Paperclip (agentes, proyectos, gobernanza) |
| Propuesta de valor | "Salta diseño de org — obtén un equipo enviando en minutos" |
| Rango de precio | $0–$499 por blueprint (+ add-ons individuales) |

---

## 2. Taxonomía de Productos

### 2.1 Team Blueprints (producto primario)

Una configuración completa de compañía Paperclip:

- **Organigrama**: Agentes con roles, títulos, cadenas de reporteo, capacidades
- **Configuraciones de agentes**: Tipo de adapter, modelo, plantillas de prompt, rutas de instrucciones
- **Reglas de gobernanza**: Flujos de aprobación, límites de presupuesto, cadenas de escalada
- **Plantillas de proyecto**: Proyectos pre-configurados con configuración de workspace
- **Skills e instrucciones**: Archivos de skill / AGENTS.md agrupados por agente

**Ejemplos:**
- "SaaS Startup Team" — CEO, CTO, Engineer, CMO, Designer ($199)
- "Content Agency" — Editor-in-Chief, 3 Writers, SEO Analyst, Social Manager ($149)
- "Dev Shop" — CTO, 2 Engineers, QA, DevOps ($99)
- "Solo Founder + Crew" — Agente CEO + 3 ICs en eng/marketing/ops ($79)

### 2.2 Agent Blueprints (agentes individuales dentro de contexto de equipo)

Configuraciones de agente único diseñadas para enchufar en una org Paperclip:

- Definición de rol, plantilla de prompt, configuración de adapter
- Expectativas de cadena de reporteo (a quién reportan)
- Bundles de skill incluidos
- Valores por defecto de gobernanza (presupuesto, permisos)

**Ejemplos:**
- "Staff Engineer" — envía código de producción, gestiona PRs ($29)
- "Growth Marketer" — pipeline de contenido, SEO, social ($39)
- "DevOps Agent" — CI/CD, deployment, monitoreo ($29)

### 2.3 Skills (capacidades modulares)

Archivos de skill portables que cualquier agente Paperclip puede usar:

- Archivos de skill markdown con instrucciones
- Configuraciones de herramientas y scripts shell
- Compatible con el sistema de carga de skill de Paperclip

**Ejemplos:**
- "Git PR Workflow" — creación y revisión de PR estandarizada (Gratis)
- "Deployment Pipeline" — skill de deploy Cloudflare/Vercel ($9)
- "Customer Support Triage" — clasificación y enrutamiento de tickets ($19)

### 2.4 Governance Templates

Flujos de aprobación y políticas pre-construidas:

- Umbrales de presupuesto y cadenas de aprobación
- Reglas de delegación entre equipos
- Procedimientos de escalada
- Estructuras de códigos de facturación

**Ejemplos:**
- "Startup Governance" — ligero, CEO aprueba > $50 (Gratis)
- "Enterprise Governance" — aprobación multi-tier, pista de auditoría ($49)

---

## 3. Esquemas de Datos

### 3.1 Listing

```typescript
interface Listing {
  id: string;
  slug: string;                    // Identificador URL-friendly
  type: 'team_blueprint' | 'agent_blueprint' | 'skill' | 'governance_template';
  title: string;
  tagline: string;                 // Pitch corto (≤120 caracteres)
  description: string;             // Markdown, detalles completos

  // Pricing
  price: number;                   // Centavos (0 = free)
  currency: 'usd';

  // Creator
  creatorId: string;
  creatorName: string;
  creatorAvatar: string | null;

  // Categorización
  categories: string[];            // p.ej. ['saas', 'engineering', 'marketing']
  tags: string[];                  // p.ej. ['claude', 'startup', '5-agent']
  agentCount: number | null;       // Para team blueprints

  // Contenido
  previewImages: string[];         // Screenshots / visuals de organigrama
  readmeMarkdown: string;          // README completo mostrado en página de detalle
  includedFiles: string[];         // Lista de archivos en el bundle

  // Compatibilidad
  compatibleAdapters: string[];    // ['claude_local', 'codex_local', ...]
  requiredModels: string[];        // ['claude-opus-4-6', 'claude-sonnet-4-6']
  paperclipVersionMin: string;     // Versión mínima de Paperclip

  // Prueba social
  installCount: number;
  rating: number | null;           // 1.0–5.0
  reviewCount: number;

  // Metadatos
  version: string;                 // Semver
  publishedAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
}
```

### 3.2 Team Blueprint Bundle

```typescript
interface TeamBlueprint {
  listingId: string;

  // Estructura de org
  agents: AgentBlueprint[];
  reportingChain: { agentSlug: string; reportsTo: string | null }[];

  // Gobernanza
  governance: {
    approvalRules: ApprovalRule[];
    budgetDefaults: { role: string; monthlyCents: number }[];
    escalationChain: string[];     // Slugs de agente en orden de escalada
  };

  // Proyectos
  projects: ProjectTemplate[];

  // Configuración a nivel de compañía
  companyDefaults: {
    name: string;
    defaultModel: string;
    defaultAdapter: string;
  };
}

interface AgentBlueprint {
  slug: string;                     // p.ej. 'cto', 'engineer-1'
  name: string;
  role: string;
  title: string;
  icon: string;
  capabilities: string;
  promptTemplate: string;
  adapterType: string;
  adapterConfig: Record<string, any>;
  instructionsPath: string | null;  // Ruta a AGENTS.md o similar
  skills: SkillBundle[];
  budgetMonthlyCents: number;
  permissions: {
    canCreateAgents: boolean;
    canApproveHires: boolean;
  };
}

interface ProjectTemplate {
  name: string;
  description: string;
  workspace: {
    cwd: string | null;
    repoUrl: string | null;
  } | null;
}

interface ApprovalRule {
  trigger: string;                  // p.ej. 'hire_agent', 'budget_exceed'
  threshold: number | null;
  approverRole: string;
}
```

### 3.3 Creator / Vendedor

```typescript
interface Creator {
  id: string;
  userId: string;                   // ID de proveedor de autenticación
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  website: string | null;
  listings: string[];               // IDs de Listing
  totalInstalls: number;
  totalRevenue: number;             // Centavos ganados
  joinedAt: string;
  verified: boolean;
  payoutMethod: 'stripe_connect';
  stripeAccountId: string | null;
}
```

### 3.4 Compra / Instalación

```typescript
interface Purchase {
  id: string;
  listingId: string;
  buyerUserId: string;
  buyerCompanyId: string | null;    // Compañía Paperclip de destino
  pricePaidCents: number;
  paymentIntentId: string | null;   // Stripe
  installedAt: string | null;       // Cuando fue desplegado a compañía
  status: 'pending' | 'completed' | 'refunded';
  createdAt: string;
}
```

### 3.5 Reseña

```typescript
interface Review {
  id: string;
  listingId: string;
  authorUserId: string;
  authorDisplayName: string;
  rating: number;                   // 1–5
  title: string;
  body: string;                     // Markdown
  verifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## 4. Páginas y Rutas

### 4.1 Páginas Públicas

| Ruta | Página | Descripción |
|---|---|---|
| `/` | Homepage | Hero, blueprints destacados, skills populares, cómo funciona |
| `/browse` | Exploración del marketplace | Grid filterable de todos los listings |
| `/browse?type=team_blueprint` | Team blueprints | Filtrado a configuraciones de equipo |
| `/browse?type=agent_blueprint` | Agent blueprints | Configuraciones de agente único |
| `/browse?type=skill` | Skills | Listados de skill |
| `/browse?type=governance_template` | Governance | Plantillas de políticas |
| `/listings/:slug` | Detalle de listing | Página de producto completa |
| `/creators/:slug` | Perfil de creator | Bio, todos los listings, estadísticas |
| `/about` | Acerca de ClipHub | Misión, cómo funciona |
| `/pricing` | Precios y fees | Compartir de ingresos de creator, info de comprador |

### 4.2 Páginas Autenticadas

| Ruta | Página | Descripción |
|---|---|---|
| `/dashboard` | Dashboard de comprador | Artículos comprados, blueprints instalados |
| `/dashboard/purchases` | Historial de compras | Todas las transacciones |
| `/dashboard/installs` | Instalaciones | Blueprints desplegados con estado |
| `/creator` | Dashboard de creator | Gestión de listings, análisis |
| `/creator/listings/new` | Crear listing | Asistente de listing multi-paso |
| `/creator/listings/:id/edit` | Editar listing | Modificar listing existente |
| `/creator/analytics` | Análisis | Ingresos, instalaciones, vistas |
| `/creator/payouts` | Pagos | Historial de pagos de Stripe Connect |

### 4.3 Rutas de API

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/listings` | Explorar listings (filtros: tipo, categoría, rango de precio, ordenamiento) |
| `GET` | `/api/listings/:slug` | Obtener detalle de listing |
| `POST` | `/api/listings` | Crear listing (autenticación de creator) |
| `PATCH` | `/api/listings/:id` | Actualizar listing |
| `DELETE` | `/api/listings/:id` | Archivar listing |
| `POST` | `/api/listings/:id/purchase` | Comprar listing (checkout de Stripe) |
| `POST` | `/api/listings/:id/install` | Instalar en compañía Paperclip |
| `GET` | `/api/listings/:id/reviews` | Obtener reseñas |
| `POST` | `/api/listings/:id/reviews` | Enviar reseña |
| `GET` | `/api/creators/:slug` | Perfil de creator |
| `GET` | `/api/creators/me` | Perfil de creator actual |
| `POST` | `/api/creators` | Registrarse como creator |
| `GET` | `/api/purchases` | Historial de compras del comprador |
| `GET` | `/api/analytics` | Análisis de creator |

---

## 5. Flujos de Usuario

### 5.1 Comprador: Explorar → Comprar → Instalar

```
Homepage → Explorar marketplace → Filtrar por tipo/categoría
  → Hacer clic en listing → Leer detalles, reseñas, vista previa de organigrama
  → Hacer clic en "Comprar" → Checkout de Stripe (o instalar gratis)
  → Post-compra: botón "Instalar en Compañía"
  → Seleccionar compañía Paperclip de destino (o crear nueva)
  → API de ClipHub llama API de Paperclip para:
      1. Crear agentes con configuraciones del blueprint
      2. Configurar cadenas de reporteo
      3. Crear proyectos con configuraciones de workspace
      4. Aplicar reglas de gobernanza
      5. Desplegar archivos de skill a rutas de instrucción de agente
  → Redirigir a dashboard de Paperclip con nuevo equipo corriendo
```

### 5.2 Creator: Construir → Publicar → Ganar

```
Registrarse como creator → Conectar Stripe
  → Asistente "Nuevo Listing":
      Paso 1: Tipo (team/agent/skill/governance)
      Paso 2: Info básica (título, tagline, descripción, categorías)
      Paso 3: Subir bundle (configuración JSON + archivos de skill + README)
      Paso 4: Vista previa y visualización de organigrama
      Paso 5: Pricing ($0–$499)
      Paso 6: Publicar
  → En vivo en marketplace inmediatamente
  → Rastrear instalaciones, ingresos, reseñas en dashboard de creator
```

### 5.3 Creator: Exportar desde Paperclip → Publicar

```
Compañía Paperclip corriendo → "Exportar como Blueprint" (CLI o UI)
  → Paperclip exporta:
      - Configuraciones de agentes (sanitizadas — sin secretos)
      - Organigrama / cadenas de reporteo
      - Reglas de gobernanza
      - Plantillas de proyecto
      - Archivos de skill
  → Subir a ClipHub como nuevo listing
  → Editar detalles, establecer precio, publicar
```

---

## 6. Dirección de Diseño de UI

### 6.1 Lenguaje Visual

- **Paleta de colores**: Tinta oscura primaria, fondos de arena cálida, color de acento para CTAs (azul/púrpura de marca Paperclip)
- **Tipografía**: Sans-serif limpio, jerarquía fuerte, monoespaciado para detalles técnicos
- **Tarjetas**: Esquinas redondeadas, sombras sutiles, badges de precio claros
- **Visuals de organigrama**: Árbol/gráfico interactivo mostrando relaciones de agentes en team blueprints

### 6.2 Elementos de Diseño Clave

| Elemento | ClipHub |
|---|---|
| Tarjeta de producto | Mini-vista previa de organigrama + badge de conteo de agentes |
| Página de detalle | Organigrama interactivo + desglose por agente |
| Flujo de instalación | Deploy de un clic a compañía Paperclip |
| Prueba social | "X compañías ejecutando este blueprint" |
| Vista previa | Sandbox de demo en vivo (objetivo stretch) |

### 6.3 Diseño de Tarjeta de Listing

```
┌─────────────────────────────────────┐
│  [Mini-Vista Previa de Organigrama] │
│  ┌─CEO─┐                            │
│  ├─CTO─┤                            │
│  └─ENG──┘                           │
│                                     │
│  SaaS Startup Team                  │
│  "Envía tu MVP con un equipo        │
│   de 5 agentes ingeniería + mktg"  │
│                                     │
│  👥 5 agentes  ⬇ 234 instalaciones │
│  ★ 4.7 (12 reseñas)                │
│                                     │
│  Por @masinov          $199  [Comprar] │
└─────────────────────────────────────┘
```

### 6.4 Secciones de Página de Detalle

1. **Hero**: Título, tagline, precio, botón instalar, info de creator
2. **Organigrama**: Visualización interactiva de jerarquía de agentes
3. **Desglose de Agentes**: Tarjetas expandibles para cada agente — rol, capacidades, modelo, skills
4. **Gobernanza**: Flujos de aprobación, estructura de presupuesto, cadena de escalada
5. **Proyectos Incluidos**: Plantillas de proyecto con configuraciones de workspace
6. **README**: Documentación markdown completa
7. **Reseñas**: Calificaciones de estrellas + reseñas escritas
8. **Blueprints Relacionados**: Venta cruzada de configuraciones de equipo similares
9. **Perfil de Creator**: Mini bio, otros listings

---

## 7. Mecánica de Instalación

### 7.1 Flujo de API de Instalación

Cuando un comprador hace clic en "Instalar en Compañía":

```
POST /api/listings/:id/install
{
  "targetCompanyId": "uuid",         // Compañía Paperclip existente
  "overrides": {                      // Personalización opcional
    "agentModel": "claude-sonnet-4-6", // Anular modelo predeterminado
    "budgetScale": 0.5,               // Escalar presupuestos
    "skipProjects": false
  }
}
```

El manejador de instalación:

1. Valida que el comprador posea la compra
2. Valida acceso a compañía de destino
3. Para cada agente en blueprint:
   - `POST /api/companies/:id/agents` (si `paperclip-create-agent` lo soporta, o vía flujo de aprobación)
   - Establece configuración de adapter, plantilla de prompt, ruta de instrucciones
4. Establece cadenas de reporteo
5. Crea proyectos y workspaces
6. Aplica reglas de gobernanza
7. Despliega archivos de skill a rutas configuradas
8. Retorna resumen de recursos creados

### 7.2 Resolución de Conflictos

- **Colisión de nombre de agente**: Anexar sufijo `-2`, `-3`
- **Colisión de nombre de proyecto**: Pedir al comprador que renombre o salte
- **Discrepancia de adapter**: Advertir si blueprint requiere adapter no disponible localmente
- **Disponibilidad de modelo**: Advertir si modelo requerido no está configurado

---

## 8. Modelo de Ingresos

| Fee | Cantidad | Notas |
|---|---|---|
| Compartir de ingresos de creator | 90% del precio de venta | Menos procesamiento de Stripe (~2.9% + $0.30) |
| Fee de plataforma | 10% del precio de venta | Corte de ClipHub |
| Listings libres | $0 | Sin fees para listings libres |
| Stripe Connect | Tasas estándar | Manejado por Stripe |

---

## 9. Arquitectura Técnica

### 9.1 Stack

- **Frontend**: Next.js (React), Tailwind CSS, mismo framework UI que Paperclip
- **Backend**: API Node.js (o extender servidor Paperclip)
- **Database**: Postgres (puede compartir DB de Paperclip o separada)
- **Payments**: Stripe Connect (modo marketplace)
- **Storage**: S3/R2 para bundles de listing e imágenes
- **Auth**: Compartido con autenticación Paperclip (u OAuth2)

### 9.2 Integración con Paperclip

ClipHub puede ser:
- **Opción A**: Una app separada que llama API de Paperclip para instalar blueprints
- **Opción B**: Una sección integrada de la UI de Paperclip (ruta `/marketplace`)

La Opción B es más simple para MVP — agrega rutas a la UI y API existentes de Paperclip.

### 9.3 Formato de Bundle

Los bundles de listing son archivos ZIP/tar conteniendo:

```
blueprint/
├── manifest.json          # Metadatos de listing + configuraciones de agentes
├── README.md              # Documentación
├── org-chart.json         # Jerarquía de agentes
├── governance.json        # Reglas de aprobación, presupuestos
├── agents/
│   ├── ceo/
│   │   ├── prompt.md      # Plantilla de prompt
│   │   ├── AGENTS.md      # Instrucciones
│   │   └── skills/        # Archivos de skill
│   ├── cto/
│   │   ├── prompt.md
│   │   ├── AGENTS.md
│   │   └── skills/
│   └── engineer/
│       ├── prompt.md
│       ├── AGENTS.md
│       └── skills/
└── projects/
    └── default/
        └── workspace.json  # Configuración de workspace de proyecto
```

---

## 10. Alcance de MVP

### Fase 1: Fundación
- [ ] Schema de listing y API CRUD
- [ ] Página de exploración con filtros (tipo, categoría, precio)
- [ ] Página de detalle de listing con visualización de organigrama
- [ ] Registro de creator y asistente de creación de listing
- [ ] Solo instalaciones libres (sin pagos todavía)
- [ ] Flujo de instalación: blueprint → compañía Paperclip

### Fase 2: Pagos y Social
- [ ] Integración de Stripe Connect
- [ ] Flujo de compra
- [ ] Sistema de reseñas
- [ ] Dashboard de análisis de creator
- [ ] Comando CLI "Exportar desde Paperclip"

### Fase 3: Crecimiento
- [ ] Búsqueda con ranking de relevancia
- [ ] Listings destacados/tendencias
- [ ] Programa de verificación de creator
- [ ] Versionado de blueprint y notificaciones de actualización
- [ ] Sandbox de demo en vivo
- [ ] API para publicación programática
