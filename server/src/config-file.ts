import fs from "node:fs";
import { taskorgConfigSchema, type TaskOrgConfig } from "@taskorg/shared";
import { resolveTaskOrgConfigPath } from "./paths.js";

export function readConfigFile(): TaskOrgConfig | null {
  const configPath = resolveTaskOrgConfigPath();

  if (!fs.existsSync(configPath)) return null;

  try {
    const raw = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    return taskorgConfigSchema.parse(raw);
  } catch {
    return null;
  }
}
