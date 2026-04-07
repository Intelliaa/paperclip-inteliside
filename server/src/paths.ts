import fs from "node:fs";
import path from "node:path";
import { readEnv } from "@taskorg/shared";
import { resolveDefaultConfigPath } from "./home-paths.js";

const TASKORG_CONFIG_BASENAME = "config.json";
const TASKORG_ENV_FILENAME = ".env";

function findConfigFileFromAncestors(startDir: string): string | null {
  const absoluteStartDir = path.resolve(startDir);
  let currentDir = absoluteStartDir;

  while (true) {
    const candidate = path.resolve(currentDir, ".taskorg", TASKORG_CONFIG_BASENAME);
    if (fs.existsSync(candidate)) {
      return candidate;
    }

    const nextDir = path.resolve(currentDir, "..");
    if (nextDir === currentDir) break;
    currentDir = nextDir;
  }

  return null;
}

export function resolveTaskOrgConfigPath(overridePath?: string): string {
  if (overridePath) return path.resolve(overridePath);
  const configEnv = readEnv("TASKORG_CONFIG", "PAPERCLIP_CONFIG");
  if (configEnv) return path.resolve(configEnv);
  return findConfigFileFromAncestors(process.cwd()) ?? resolveDefaultConfigPath();
}

export function resolveTaskOrgEnvPath(overrideConfigPath?: string): string {
  return path.resolve(path.dirname(resolveTaskOrgConfigPath(overrideConfigPath)), TASKORG_ENV_FILENAME);
}
