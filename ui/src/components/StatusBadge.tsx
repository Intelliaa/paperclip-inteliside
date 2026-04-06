import { cn } from "../lib/utils";
import { statusBadge, statusBadgeDefault } from "../lib/status-colors";

const statusDisplayLabels: Record<string, string> = {
  backlog: "Pendiente",
  todo: "Por hacer",
  in_progress: "En progreso",
  in_review: "En revisión",
  done: "Hecho",
  cancelled: "Cancelado",
  blocked: "Bloqueado",
  planned: "Planificado",
  completed: "Completado",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap shrink-0",
        statusBadge[status] ?? statusBadgeDefault
      )}
    >
      {statusDisplayLabels[status] ?? status.replace("_", " ")}
    </span>
  );
}
