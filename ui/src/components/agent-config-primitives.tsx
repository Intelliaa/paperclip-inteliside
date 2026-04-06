import { useState, useRef, useEffect, useCallback } from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";
import { AGENT_ROLE_LABELS } from "@paperclipai/shared";

/* ---- Help text for (?) tooltips ---- */
export const help: Record<string, string> = {
  name: "Nombre visible de este agente.",
  title: "Título del trabajo mostrado en el organigrama.",
  role: "Rol organizacional. Determina posición y capacidades.",
  reportsTo: "El agente al que este reporta en la jerarquía organizacional.",
  capabilities: "Describe lo que este agente puede hacer. Mostrado en el organigrama y usado para asignación de tareas.",
  adapterType: "Cómo ejecuta este agente: CLI local (Claude/Codex/OpenCode), OpenClaw Gateway, proceso iniciado, o webhook HTTP genérico.",
  cwd: "Directorio de trabajo obsoleto para adapters locales. Los agentes existentes pueden tener este valor, pero las nuevas configuraciones deben usar project workspaces.",
  promptTemplate: "Enviado en cada heartbeat. Mantenlo pequeño y dinámico. Úsalo para enmarcar la tarea actual, no instrucciones estáticas largas. Soporta {{ agent.id }}, {{ agent.name }}, {{ agent.role }} y otras variables de template.",
  model: "Sobreescribe el modelo predeterminado usado por el adapter.",
  thinkingEffort: "Controla la profundidad de razonamiento del modelo. Los valores soportados varían por adapter/modelo.",
  chrome: "Habilita la integración Chrome de Claude pasando --chrome.",
  dangerouslySkipPermissions: "Ejecuta sin supervisión aprobando automáticamente los permisos del adapter cuando esté soportado.",
  dangerouslyBypassSandbox: "Ejecuta Codex sin restricciones de sandbox. Requerido para acceso a sistema de archivos/red.",
  search: "Habilita la capacidad de búsqueda web de Codex durante las ejecuciones.",
  workspaceStrategy: "Cómo Paperclip debe aprovisionar un workspace de ejecución para este agente. Mantén project_primary para ejecución normal de cwd, o usa git_worktree para checkouts aislados por tarea.",
  workspaceBaseRef: "Ref git base usado al crear una rama de worktree. Dejar en blanco para usar el ref del workspace resuelto o HEAD.",
  workspaceBranchTemplate: "Template para nombrar ramas derivadas. Soporta {{issue.identifier}}, {{issue.title}}, {{agent.name}}, {{project.id}}, {{workspace.repoRef}} y {{slug}}.",
  worktreeParentDir: "Directorio donde se crearán los worktrees derivados. Soporta rutas absolutas, prefijo ~, y rutas relativas al repositorio.",
  runtimeServicesJson: "Definiciones opcionales de servicios de ejecución del workspace. Úsalas para servidores de aplicaciones compartidos, workers u otros procesos de larga duración adjuntos al workspace.",
  maxTurnsPerRun: "Número máximo de turnos agénticos (llamadas a herramientas) por ejecución de heartbeat.",
  command: "El comando a ejecutar (ej. node, python).",
  localCommand: "Sobreescribe la ruta al comando CLI que quieres que el adapter llame (ej. /usr/local/bin/claude, codex, opencode).",
  args: "Argumentos de línea de comandos, separados por coma.",
  extraArgs: "Argumentos CLI adicionales para adapters locales, separados por coma.",
  envVars: "Variables de entorno inyectadas en el proceso del adapter. Usa valores simples o referencias a secretos.",
  bootstrapPrompt: "Solo se envía cuando Paperclip inicia una nueva sesión. Úsalo para guías de configuración estables que no deben repetirse en cada heartbeat.",
  payloadTemplateJson: "JSON opcional fusionado en los payloads de solicitud del adapter remoto antes de que Paperclip agregue sus campos estándar de wake y workspace.",
  webhookUrl: "La URL que recibe solicitudes POST cuando el agente es invocado.",
  heartbeatInterval: "Ejecuta este agente automáticamente en un temporizador. Útil para tareas periódicas como verificar nuevo trabajo.",
  intervalSec: "Segundos entre invocaciones automáticas de heartbeat.",
  timeoutSec: "Segundos máximos que puede ejecutarse antes de ser terminado. 0 significa sin límite.",
  graceSec: "Segundos de espera después de enviar interrupción antes de forzar la terminación del proceso.",
  wakeOnDemand: "Permite que este agente sea activado por asignaciones, llamadas API, acciones de UI o sistemas automatizados.",
  cooldownSec: "Segundos mínimos entre ejecuciones consecutivas de heartbeat.",
  maxConcurrentRuns: "Número máximo de ejecuciones de heartbeat que pueden correr simultáneamente para este agente.",
  budgetMonthlyCents: "Límite de gasto mensual en centavos. 0 significa sin límite.",
};

import { getAdapterLabels } from "../adapters/adapter-display-registry";

export const adapterLabels = getAdapterLabels();

export const roleLabels = AGENT_ROLE_LABELS as Record<string, string>;

/* ---- Primitive components ---- */

export function HintIcon({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="inline-flex text-muted-foreground/50 hover:text-muted-foreground transition-colors">
          <HelpCircle className="h-3 w-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <label className="text-xs text-muted-foreground">{label}</label>
        {hint && <HintIcon text={hint} />}
      </div>
      {children}
    </div>
  );
}

export function ToggleField({
  label,
  hint,
  checked,
  onChange,
  toggleTestId,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  toggleTestId?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        {hint && <HintIcon text={hint} />}
      </div>
      <ToggleSwitch
        checked={checked}
        onCheckedChange={onChange}
        data-testid={toggleTestId}
      />
    </div>
  );
}

export function ToggleWithNumber({
  label,
  hint,
  checked,
  onCheckedChange,
  number,
  onNumberChange,
  numberLabel,
  numberHint,
  numberPrefix,
  showNumber,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  number: number;
  onNumberChange: (v: number) => void;
  numberLabel: string;
  numberHint?: string;
  numberPrefix?: string;
  showNumber: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">{label}</span>
          {hint && <HintIcon text={hint} />}
        </div>
        <ToggleSwitch
          checked={checked}
          onCheckedChange={onCheckedChange}
        />
      </div>
      {showNumber && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {numberPrefix && <span>{numberPrefix}</span>}
          <input
            type="number"
            className="w-16 rounded-md border border-border px-2 py-0.5 bg-transparent outline-none text-xs font-mono text-center"
            value={number}
            onChange={(e) => onNumberChange(Number(e.target.value))}
          />
          <span>{numberLabel}</span>
          {numberHint && <HintIcon text={numberHint} />}
        </div>
      )}
    </div>
  );
}

export function CollapsibleSection({
  title,
  icon,
  open,
  onToggle,
  bordered,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  bordered?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(bordered && "border-t border-border")}>
      <button
        className="flex items-center gap-2 w-full px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-accent/30 transition-colors"
        onClick={onToggle}
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        {icon}
        {title}
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}

export function AutoExpandTextarea({
  value,
  onChange,
  onBlur,
  placeholder,
  minRows,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  minRows?: number;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const rows = minRows ?? 3;
  const lineHeight = 20;
  const minHeight = rows * lineHeight;

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(minHeight, el.scrollHeight)}px`;
  }, [minHeight]);

  useEffect(() => { adjustHeight(); }, [value, adjustHeight]);

  return (
    <textarea
      ref={textareaRef}
      className="w-full rounded-md border border-border px-2.5 py-1.5 bg-transparent outline-none text-sm font-mono placeholder:text-muted-foreground/40 resize-none overflow-hidden"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      style={{ minHeight }}
    />
  );
}

/**
 * Text input that manages internal draft state.
 * Calls `onCommit` on blur (and optionally on every change if `immediate` is set).
 */
export function DraftInput({
  value,
  onCommit,
  immediate,
  className,
  ...props
}: {
  value: string;
  onCommit: (v: string) => void;
  immediate?: boolean;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "className">) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  return (
    <input
      className={className}
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value);
        if (immediate) onCommit(e.target.value);
      }}
      onBlur={() => {
        if (draft !== value) onCommit(draft);
      }}
      {...props}
    />
  );
}

/**
 * Auto-expanding textarea with draft state and blur-commit.
 */
export function DraftTextarea({
  value,
  onCommit,
  immediate,
  placeholder,
  minRows,
}: {
  value: string;
  onCommit: (v: string) => void;
  immediate?: boolean;
  placeholder?: string;
  minRows?: number;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const rows = minRows ?? 3;
  const lineHeight = 20;
  const minHeight = rows * lineHeight;

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(minHeight, el.scrollHeight)}px`;
  }, [minHeight]);

  useEffect(() => { adjustHeight(); }, [draft, adjustHeight]);

  return (
    <textarea
      ref={textareaRef}
      className="w-full rounded-md border border-border px-2.5 py-1.5 bg-transparent outline-none text-sm font-mono placeholder:text-muted-foreground/40 resize-none overflow-hidden"
      placeholder={placeholder}
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value);
        if (immediate) onCommit(e.target.value);
      }}
      onBlur={() => {
        if (draft !== value) onCommit(draft);
      }}
      style={{ minHeight }}
    />
  );
}

/**
 * Number input with draft state and blur-commit.
 */
export function DraftNumberInput({
  value,
  onCommit,
  immediate,
  className,
  ...props
}: {
  value: number;
  onCommit: (v: number) => void;
  immediate?: boolean;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "className" | "type">) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);

  return (
    <input
      type="number"
      className={className}
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value);
        if (immediate) onCommit(Number(e.target.value) || 0);
      }}
      onBlur={() => {
        const num = Number(draft) || 0;
        if (num !== value) onCommit(num);
      }}
      {...props}
    />
  );
}

/**
 * "Choose" button that opens a dialog explaining the user must manually
 * type the path due to browser security limitations.
 */
export function ChoosePathButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent/50 transition-colors shrink-0"
        onClick={() => setOpen(true)}
      >
        Elegir
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Especificar ruta manualmente</DialogTitle>
            <DialogDescription>
              La seguridad del navegador impide que las aplicaciones lean rutas locales completas mediante un selector de archivos.
              Copia la ruta absoluta y pégala en el campo de entrada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <section className="space-y-1.5">
              <p className="font-medium">macOS (Finder)</p>
              <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
                <li>Encuentra la carpeta en Finder.</li>
                <li>Mantén presionada la tecla <kbd>Option</kbd> y haz clic derecho en la carpeta.</li>
                <li>Haz clic en "Copiar &lt;nombre de carpeta&gt; como ruta de acceso".</li>
                <li>Pega el resultado en el campo de ruta.</li>
              </ol>
              <p className="rounded-md bg-muted px-2 py-1 font-mono text-xs">
                /Users/yourname/Documents/project
              </p>
            </section>
            <section className="space-y-1.5">
              <p className="font-medium">Windows (File Explorer)</p>
              <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
                <li>Encuentra la carpeta en el Explorador de archivos.</li>
                <li>Mantén presionada la tecla <kbd>Shift</kbd> y haz clic derecho en la carpeta.</li>
                <li>Haz clic en "Copiar como ruta".</li>
                <li>Pega el resultado en el campo de ruta.</li>
              </ol>
              <p className="rounded-md bg-muted px-2 py-1 font-mono text-xs">
                C:\Users\yourname\Documents\project
              </p>
            </section>
            <section className="space-y-1.5">
              <p className="font-medium">Alternativa por terminal (macOS/Linux)</p>
              <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
                <li>Ejecuta <code>cd /ruta/a/la/carpeta</code>.</li>
                <li>Ejecuta <code>pwd</code>.</li>
                <li>Copia la salida y pégala en el campo de ruta.</li>
              </ol>
            </section>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Label + input rendered on the same line (inline layout for compact fields).
 */
export function InlineField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 shrink-0">
        <label className="text-xs text-muted-foreground">{label}</label>
        {hint && <HintIcon text={hint} />}
      </div>
      <div className="w-24 ml-auto">{children}</div>
    </div>
  );
}
