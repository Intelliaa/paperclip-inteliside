# Plan de Traducción al Español

**Rama:** `feat/traduccion-espanol`  
**Fecha:** 2026-04-05  
**Estado:** En progreso — Fases 1-3 completadas

---

## Objetivo

Traducir al español toda la interfaz de usuario, documentación, prompts y skills del proyecto Paperclip, cuidando la ortografía y acentos.

---

## Reglas de Traducción

| Qué se traduce | Qué NO se traduce |
|---|---|
| Texto visible al usuario (labels, títulos, mensajes, descripciones) | Nombres de variables, funciones, componentes |
| Prosa en documentación y skills | Bloques de código, comandos, endpoints de API |
| Mensajes de error y placeholders | Rutas de archivos, nombres de campo JSON |
| Frontmatter YAML (campos `name`, `description`) | Valores enum (`todo`, `in_progress`, `done`, etc.) |
| Comentarios explicativos en docs | Identificadores técnicos (PAP-001, issueId) |
| | Referencias entre archivos (links a otros archivos, rutas relativas en markdown) |
| | Nombres de archivos de skills, prompts y cualquier otro archivo del proyecto |

**Términos técnicos que se mantienen en inglés:** heartbeat, checkout, commit, PR (pull request), skill, adapter, plugin, webhook, cron, worktree, endpoint, token, slug, deploy, dashboard, pipeline, hub-and-spoke.

---

## Alcance por Área

### Fase 1 — Skills (23 archivos)

Prioridad alta. Los agentes ejecutan estas instrucciones directamente.

#### `skills/` (9 archivos) ✅
- [x] `skills/paperclip/SKILL.md`
- [x] `skills/paperclip/references/api-reference.md`
- [x] `skills/paperclip/references/company-skills.md`
- [x] `skills/paperclip/references/routines.md`
- [x] `skills/paperclip-create-agent/SKILL.md`
- [x] `skills/paperclip-create-agent/references/api-reference.md`
- [x] `skills/paperclip-create-plugin/SKILL.md`
- [x] `skills/para-memory-files/SKILL.md`
- [x] `skills/para-memory-files/references/schemas.md`

#### `.agents/skills/` (12 archivos) ✅
- [x] `.agents/skills/company-creator/SKILL.md`
- [x] `.agents/skills/company-creator/references/companies-spec.md`
- [x] `.agents/skills/company-creator/references/example-company.md`
- [x] `.agents/skills/company-creator/references/from-repo-guide.md`
- [x] `.agents/skills/create-agent-adapter/SKILL.md`
- [x] `.agents/skills/doc-maintenance/SKILL.md`
- [x] `.agents/skills/doc-maintenance/references/audit-checklist.md`
- [x] `.agents/skills/doc-maintenance/references/section-map.md`
- [x] `.agents/skills/pr-report/SKILL.md`
- [x] `.agents/skills/pr-report/references/style-guide.md`
- [x] `.agents/skills/release-changelog/SKILL.md`
- [x] `.agents/skills/release/SKILL.md`

#### `.claude/skills/` (2 archivos) ✅
- [x] `.claude/skills/design-guide/SKILL.md`
- [x] `.claude/skills/design-guide/references/component-index.md`

---

### Fase 2 — Prompts del CLI (6 archivos)

Prioridad alta. Texto que ve el usuario durante la configuración interactiva.

- [x] `cli/src/prompts/database.ts`
- [x] `cli/src/prompts/llm.ts`
- [x] `cli/src/prompts/logging.ts`
- [x] `cli/src/prompts/secrets.ts`
- [x] `cli/src/prompts/server.ts`
- [x] `cli/src/prompts/storage.ts`

---

### Fase 3 — UI: Páginas (41 archivos) ✅

Prioridad alta. Texto visible directamente al usuario en el navegador. Se excluyen archivos `.test.tsx`.

- [x] `ui/src/pages/Activity.tsx`
- [x] `ui/src/pages/AdapterManager.tsx`
- [x] `ui/src/pages/AgentDetail.tsx`
- [x] `ui/src/pages/Agents.tsx`
- [x] `ui/src/pages/ApprovalDetail.tsx`
- [x] `ui/src/pages/Approvals.tsx`
- [x] `ui/src/pages/Auth.tsx`
- [x] `ui/src/pages/BoardClaim.tsx`
- [x] `ui/src/pages/CliAuth.tsx`
- [x] `ui/src/pages/Companies.tsx`
- [x] `ui/src/pages/CompanyExport.tsx`
- [x] `ui/src/pages/CompanyImport.tsx`
- [x] `ui/src/pages/CompanySettings.tsx`
- [x] `ui/src/pages/CompanySkills.tsx`
- [x] `ui/src/pages/Costs.tsx`
- [x] `ui/src/pages/Dashboard.tsx`
- [x] `ui/src/pages/DesignGuide.tsx`
- [x] `ui/src/pages/ExecutionWorkspaceDetail.tsx`
- [x] `ui/src/pages/GoalDetail.tsx`
- [x] `ui/src/pages/Goals.tsx`
- [x] `ui/src/pages/Inbox.tsx`
- [x] `ui/src/pages/InstanceExperimentalSettings.tsx`
- [x] `ui/src/pages/InstanceGeneralSettings.tsx`
- [x] `ui/src/pages/InstanceSettings.tsx`
- [x] `ui/src/pages/InviteLanding.tsx`
- [x] `ui/src/pages/IssueDetail.tsx`
- [x] `ui/src/pages/Issues.tsx`
- [x] `ui/src/pages/MyIssues.tsx`
- [x] `ui/src/pages/NewAgent.tsx`
- [x] `ui/src/pages/NotFound.tsx`
- [x] `ui/src/pages/Org.tsx`
- [x] `ui/src/pages/OrgChart.tsx`
- [x] `ui/src/pages/PluginManager.tsx`
- [x] `ui/src/pages/PluginPage.tsx`
- [x] `ui/src/pages/PluginSettings.tsx`
- [x] `ui/src/pages/ProjectDetail.tsx`
- [x] `ui/src/pages/ProjectWorkspaceDetail.tsx`
- [x] `ui/src/pages/Projects.tsx`
- [x] `ui/src/pages/RoutineDetail.tsx`
- [x] `ui/src/pages/Routines.tsx`
- [x] `ui/src/pages/RunTranscriptUxLab.tsx`

---

### Fase 4 — UI: Componentes (~80 archivos)

Prioridad media. Texto compartido entre páginas. Se excluyen `.test.tsx`.

- [ ] `ui/src/components/AccountingModelCard.tsx`
- [ ] `ui/src/components/ActiveAgentsPanel.tsx`
- [ ] `ui/src/components/ActivityCharts.tsx`
- [ ] `ui/src/components/ActivityRow.tsx`
- [ ] `ui/src/components/AgentActionButtons.tsx`
- [ ] `ui/src/components/AgentConfigForm.tsx`
- [ ] `ui/src/components/AgentIconPicker.tsx`
- [ ] `ui/src/components/AgentProperties.tsx`
- [ ] `ui/src/components/ApprovalCard.tsx`
- [ ] `ui/src/components/ApprovalPayload.tsx`
- [ ] `ui/src/components/BillerSpendCard.tsx`
- [ ] `ui/src/components/BreadcrumbBar.tsx`
- [ ] `ui/src/components/BudgetIncidentCard.tsx`
- [ ] `ui/src/components/BudgetPolicyCard.tsx`
- [ ] `ui/src/components/BudgetSidebarMarker.tsx`
- [ ] `ui/src/components/ClaudeSubscriptionPanel.tsx`
- [ ] `ui/src/components/CodexSubscriptionPanel.tsx`
- [ ] `ui/src/components/CommandPalette.tsx`
- [ ] `ui/src/components/CommentThread.tsx`
- [ ] `ui/src/components/CompanyRail.tsx`
- [ ] `ui/src/components/CompanySwitcher.tsx`
- [ ] `ui/src/components/CopyText.tsx`
- [ ] `ui/src/components/DevRestartBanner.tsx`
- [ ] `ui/src/components/EmptyState.tsx`
- [ ] `ui/src/components/EntityRow.tsx`
- [ ] `ui/src/components/ExecutionWorkspaceCloseDialog.tsx`
- [ ] `ui/src/components/FilterBar.tsx`
- [ ] `ui/src/components/FinanceBillerCard.tsx`
- [ ] `ui/src/components/FinanceKindCard.tsx`
- [ ] `ui/src/components/FinanceTimelineCard.tsx`
- [ ] `ui/src/components/GoalProperties.tsx`
- [ ] `ui/src/components/GoalTree.tsx`
- [ ] `ui/src/components/Identity.tsx`
- [ ] `ui/src/components/ImageGalleryModal.tsx`
- [ ] `ui/src/components/InlineEditor.tsx`
- [ ] `ui/src/components/InlineEntitySelector.tsx`
- [ ] `ui/src/components/InstanceSidebar.tsx`
- [ ] `ui/src/components/IssueDocumentsSection.tsx`
- [ ] `ui/src/components/IssueProperties.tsx`
- [ ] `ui/src/components/IssueRow.tsx`
- [ ] `ui/src/components/IssueWorkspaceCard.tsx`
- [ ] `ui/src/components/IssuesList.tsx`
- [ ] `ui/src/components/IssuesQuicklook.tsx`
- [ ] `ui/src/components/JsonSchemaForm.tsx`
- [ ] `ui/src/components/KanbanBoard.tsx`
- [ ] `ui/src/components/Layout.tsx`
- [ ] `ui/src/components/LiveRunWidget.tsx`
- [ ] `ui/src/components/MarkdownBody.tsx`
- [ ] `ui/src/components/MarkdownEditor.tsx`
- [ ] `ui/src/components/MetricCard.tsx`
- [ ] `ui/src/components/MobileBottomNav.tsx`
- [ ] `ui/src/components/NewAgentDialog.tsx`
- [ ] `ui/src/components/NewGoalDialog.tsx`
- [ ] `ui/src/components/NewIssueDialog.tsx`
- [ ] `ui/src/components/NewProjectDialog.tsx`
- [ ] `ui/src/components/OnboardingWizard.tsx`
- [ ] `ui/src/components/OutputFeedbackButtons.tsx`
- [ ] `ui/src/components/PackageFileTree.tsx`
- [ ] `ui/src/components/PageTabBar.tsx`
- [ ] `ui/src/components/PathInstructionsModal.tsx`
- [ ] `ui/src/components/PriorityIcon.tsx`
- [ ] `ui/src/components/ProjectProperties.tsx`
- [ ] `ui/src/components/PropertiesPanel.tsx`
- [ ] `ui/src/components/ProviderQuotaCard.tsx`
- [ ] `ui/src/components/QuotaBar.tsx`
- [ ] `ui/src/components/ReportsToPicker.tsx`
- [ ] `ui/src/components/RoutineRunVariablesDialog.tsx`
- [ ] `ui/src/components/RoutineVariablesEditor.tsx`
- [ ] `ui/src/components/ScheduleEditor.tsx`
- [ ] `ui/src/components/Sidebar.tsx`
- [ ] `ui/src/components/SidebarAgents.tsx`
- [ ] `ui/src/components/SidebarNavItem.tsx`
- [ ] `ui/src/components/SidebarProjects.tsx`
- [ ] `ui/src/components/SidebarSection.tsx`
- [ ] `ui/src/components/StatusBadge.tsx`
- [ ] `ui/src/components/StatusIcon.tsx`
- [ ] `ui/src/components/SwipeToArchive.tsx`
- [ ] `ui/src/components/WorktreeBanner.tsx`
- [ ] `ui/src/components/agent-config-primitives.tsx`

---

### Fase 5 — Documentación (62 archivos)

Prioridad media-baja. Documentación del proyecto para desarrolladores y operadores.

#### `docs/start/` (4 archivos)
- [ ] `docs/start/what-is-paperclip.md`
- [ ] `docs/start/quickstart.md`
- [ ] `docs/start/architecture.md`
- [ ] `docs/start/core-concepts.md`

#### `docs/api/` (12 archivos)
- [ ] `docs/api/overview.md`
- [ ] `docs/api/authentication.md`
- [ ] `docs/api/agents.md`
- [ ] `docs/api/issues.md`
- [ ] `docs/api/approvals.md`
- [ ] `docs/api/companies.md`
- [ ] `docs/api/costs.md`
- [ ] `docs/api/dashboard.md`
- [ ] `docs/api/goals-and-projects.md`
- [ ] `docs/api/activity.md`
- [ ] `docs/api/routines.md`
- [ ] `docs/api/secrets.md`

#### `docs/cli/` (3 archivos)
- [ ] `docs/cli/overview.md`
- [ ] `docs/cli/control-plane-commands.md`
- [ ] `docs/cli/setup-commands.md`

#### `docs/deploy/` (9 archivos)
- [ ] `docs/deploy/overview.md`
- [ ] `docs/deploy/docker.md`
- [ ] `docs/deploy/database.md`
- [ ] `docs/deploy/deployment-modes.md`
- [ ] `docs/deploy/environment-variables.md`
- [ ] `docs/deploy/local-development.md`
- [ ] `docs/deploy/secrets.md`
- [ ] `docs/deploy/storage.md`
- [ ] `docs/deploy/tailscale-private-access.md`

#### `docs/adapters/` (9 archivos)
- [ ] `docs/adapters/overview.md`
- [ ] `docs/adapters/adapter-ui-parser.md`
- [ ] `docs/adapters/claude-local.md`
- [ ] `docs/adapters/codex-local.md`
- [ ] `docs/adapters/creating-an-adapter.md`
- [ ] `docs/adapters/external-adapters.md`
- [ ] `docs/adapters/gemini-local.md`
- [ ] `docs/adapters/http.md`
- [ ] `docs/adapters/process.md`

#### `docs/guides/board-operator/` (12 archivos)
- [ ] `docs/guides/board-operator/activity-log.md`
- [ ] `docs/guides/board-operator/approvals.md`
- [ ] `docs/guides/board-operator/costs-and-budgets.md`
- [ ] `docs/guides/board-operator/creating-a-company.md`
- [ ] `docs/guides/board-operator/dashboard.md`
- [ ] `docs/guides/board-operator/delegation.md`
- [ ] `docs/guides/board-operator/execution-workspaces-and-runtime-services.md`
- [ ] `docs/guides/board-operator/importing-and-exporting.md`
- [ ] `docs/guides/board-operator/managing-agents.md`
- [ ] `docs/guides/board-operator/managing-tasks.md`
- [ ] `docs/guides/board-operator/org-structure.md`

#### `docs/guides/agent-developer/` (7 archivos)
- [ ] `docs/guides/agent-developer/comments-and-communication.md`
- [ ] `docs/guides/agent-developer/cost-reporting.md`
- [ ] `docs/guides/agent-developer/handling-approvals.md`
- [ ] `docs/guides/agent-developer/heartbeat-protocol.md`
- [ ] `docs/guides/agent-developer/how-agents-work.md`
- [ ] `docs/guides/agent-developer/task-workflow.md`
- [ ] `docs/guides/agent-developer/writing-a-skill.md`

#### Otros docs (6 archivos)
- [ ] `docs/agents-runtime.md`
- [ ] `docs/feedback-voting.md`
- [ ] `docs/companies/companies-spec.md`
- [ ] `docs/guides/openclaw-docker-setup.md`
- [ ] `docs/specs/agent-config-ui.md`
- [ ] `docs/specs/cliphub-plan.md`

---

## Resumen de Volumen

| Fase | Área | Archivos | Prioridad |
|------|------|----------|-----------|
| 1 | Skills | 23 | Alta |
| 2 | Prompts CLI | 6 | Alta |
| 3 | UI Páginas | 40 | Alta |
| 4 | UI Componentes | ~80 | Media |
| 5 | Documentación | 62 | Media-baja |
| **Total** | | **~211** | |

---

## Estrategia de Ejecución

1. Cada fase se ejecuta con agentes en paralelo (3-5 agentes simultáneos por fase)
2. Se hace commit al final de cada fase completada
3. Se verifica que `tsc -b` (typecheck) pase después de cambios en UI
4. Se revisa que no se rompan strings que el backend espera (valores enum, claves de API, etc.)

---

## Notas

- No hay sistema de i18n (react-i18next, etc.) configurado. Las traducciones son reemplazos inline directos.
- Los archivos `.test.tsx` se excluyen de traducción.
- Los componentes base de shadcn/ui (`ui/src/components/ui/`) no se modifican.
- Los archivos de API (`ui/src/api/`) no se modifican (son llamadas HTTP, no texto de usuario).
