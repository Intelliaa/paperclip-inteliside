import path from "node:path";
import {
  expandHomePrefix,
  resolveDefaultConfigPath,
  resolveDefaultContextPath,
  resolveTaskOrgInstanceId,
} from "./home.js";

export interface DataDirOptionLike {
  dataDir?: string;
  config?: string;
  context?: string;
  instance?: string;
}

export interface DataDirCommandSupport {
  hasConfigOption?: boolean;
  hasContextOption?: boolean;
}

export function applyDataDirOverride(
  options: DataDirOptionLike,
  support: DataDirCommandSupport = {},
): string | null {
  const rawDataDir = options.dataDir?.trim();
  if (!rawDataDir) return null;

  const resolvedDataDir = path.resolve(expandHomePrefix(rawDataDir));
  process.env.TASKORG_HOME = resolvedDataDir;

  if (support.hasConfigOption) {
    const hasConfigOverride = Boolean(options.config?.trim()) || Boolean(process.env.TASKORG_CONFIG?.trim());
    if (!hasConfigOverride) {
      const instanceId = resolveTaskOrgInstanceId(options.instance);
      process.env.TASKORG_INSTANCE_ID = instanceId;
      process.env.TASKORG_CONFIG = resolveDefaultConfigPath(instanceId);
    }
  }

  if (support.hasContextOption) {
    const hasContextOverride = Boolean(options.context?.trim()) || Boolean(process.env.TASKORG_CONTEXT?.trim());
    if (!hasContextOverride) {
      process.env.TASKORG_CONTEXT = resolveDefaultContextPath();
    }
  }

  return resolvedDataDir;
}
