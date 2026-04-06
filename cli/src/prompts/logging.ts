import * as p from "@clack/prompts";
import type { LoggingConfig } from "../config/schema.js";
import { resolveDefaultLogsDir, resolvePaperclipInstanceId } from "../config/home.js";

export async function promptLogging(): Promise<LoggingConfig> {
  const defaultLogDir = resolveDefaultLogsDir(resolvePaperclipInstanceId());
  const mode = await p.select({
    message: "Modo de logging",
    options: [
      { value: "file" as const, label: "Logging basado en archivos", hint: "recomendado" },
      { value: "cloud" as const, label: "Logging en la nube", hint: "próximamente" },
    ],
  });

  if (p.isCancel(mode)) {
    p.cancel("Configuración cancelada.");
    process.exit(0);
  }

  if (mode === "file") {
    const logDir = await p.text({
      message: "Directorio de logs",
      defaultValue: defaultLogDir,
      placeholder: defaultLogDir,
    });

    if (p.isCancel(logDir)) {
      p.cancel("Configuración cancelada.");
      process.exit(0);
    }

    return { mode: "file", logDir: logDir || defaultLogDir };
  }

  p.note("El logging en la nube estará disponible próximamente. Se usará logging basado en archivos por ahora.");
  return { mode: "file", logDir: defaultLogDir };
}
