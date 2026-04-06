import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  listCodexSkills,
  syncCodexSkills,
} from "@taskorg/adapter-codex-local/server";

async function makeTempDir(prefix: string): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

describe("codex local skill sync", () => {
  const taskorgKey = "taskorg/taskorg/taskorg";
  const cleanupDirs = new Set<string>();

  afterEach(async () => {
    await Promise.all(Array.from(cleanupDirs).map((dir) => fs.rm(dir, { recursive: true, force: true })));
    cleanupDirs.clear();
  });

  it("reports configured TaskOrg skills for workspace injection on the next run", async () => {
    const codexHome = await makeTempDir("taskorg-codex-skill-sync-");
    cleanupDirs.add(codexHome);

    const ctx = {
      agentId: "agent-1",
      companyId: "company-1",
      adapterType: "codex_local",
      config: {
        env: {
          CODEX_HOME: codexHome,
        },
        taskorgSkillSync: {
          desiredSkills: [taskorgKey],
        },
      },
    } as const;

    const before = await listCodexSkills(ctx);
    expect(before.mode).toBe("ephemeral");
    expect(before.desiredSkills).toContain(taskorgKey);
    expect(before.entries.find((entry) => entry.key === taskorgKey)?.required).toBe(true);
    expect(before.entries.find((entry) => entry.key === taskorgKey)?.state).toBe("configured");
    expect(before.entries.find((entry) => entry.key === taskorgKey)?.detail).toContain("CODEX_HOME/skills/");
  });

  it("does not persist TaskOrg skills into CODEX_HOME during sync", async () => {
    const codexHome = await makeTempDir("taskorg-codex-skill-prune-");
    cleanupDirs.add(codexHome);

    const configuredCtx = {
      agentId: "agent-2",
      companyId: "company-1",
      adapterType: "codex_local",
      config: {
        env: {
          CODEX_HOME: codexHome,
        },
        taskorgSkillSync: {
          desiredSkills: [taskorgKey],
        },
      },
    } as const;

    const after = await syncCodexSkills(configuredCtx, [taskorgKey]);
    expect(after.mode).toBe("ephemeral");
    expect(after.entries.find((entry) => entry.key === taskorgKey)?.state).toBe("configured");
    await expect(fs.lstat(path.join(codexHome, "skills", "taskorg"))).rejects.toMatchObject({
      code: "ENOENT",
    });
  });

  it("keeps required bundled TaskOrg skills configured even when the desired set is emptied", async () => {
    const codexHome = await makeTempDir("taskorg-codex-skill-required-");
    cleanupDirs.add(codexHome);

    const configuredCtx = {
      agentId: "agent-2",
      companyId: "company-1",
      adapterType: "codex_local",
      config: {
        env: {
          CODEX_HOME: codexHome,
        },
        taskorgSkillSync: {
          desiredSkills: [],
        },
      },
    } as const;

    const after = await syncCodexSkills(configuredCtx, []);
    expect(after.desiredSkills).toContain(taskorgKey);
    expect(after.entries.find((entry) => entry.key === taskorgKey)?.state).toBe("configured");
  });

  it("normalizes legacy flat TaskOrg skill refs before reporting configured state", async () => {
    const codexHome = await makeTempDir("taskorg-codex-legacy-skill-sync-");
    cleanupDirs.add(codexHome);

    const snapshot = await listCodexSkills({
      agentId: "agent-3",
      companyId: "company-1",
      adapterType: "codex_local",
      config: {
        env: {
          CODEX_HOME: codexHome,
        },
        taskorgSkillSync: {
          desiredSkills: ["taskorg"],
        },
      },
    });

    expect(snapshot.warnings).toEqual([]);
    expect(snapshot.desiredSkills).toContain(taskorgKey);
    expect(snapshot.desiredSkills).not.toContain("taskorg");
    expect(snapshot.entries.find((entry) => entry.key === taskorgKey)?.state).toBe("configured");
    expect(snapshot.entries.find((entry) => entry.key === "taskorg")).toBeUndefined();
  });
});
