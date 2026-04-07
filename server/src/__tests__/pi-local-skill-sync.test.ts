import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  listPiSkills,
  syncPiSkills,
} from "@taskorg/adapter-pi-local/server";

async function makeTempDir(prefix: string): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

describe("pi local skill sync", () => {
  const taskorgKey = "taskorg/taskorg/taskorg";
  const cleanupDirs = new Set<string>();

  afterEach(async () => {
    await Promise.all(Array.from(cleanupDirs).map((dir) => fs.rm(dir, { recursive: true, force: true })));
    cleanupDirs.clear();
  });

  it("reports configured TaskOrg skills and installs them into the Pi skills home", async () => {
    const home = await makeTempDir("taskorg-pi-skill-sync-");
    cleanupDirs.add(home);

    const ctx = {
      agentId: "agent-1",
      companyId: "company-1",
      adapterType: "pi_local",
      config: {
        env: {
          HOME: home,
        },
        taskorgSkillSync: {
          desiredSkills: [taskorgKey],
        },
      },
    } as const;

    const before = await listPiSkills(ctx);
    expect(before.mode).toBe("persistent");
    expect(before.desiredSkills).toContain(taskorgKey);
    expect(before.entries.find((entry) => entry.key === taskorgKey)?.required).toBe(true);
    expect(before.entries.find((entry) => entry.key === taskorgKey)?.state).toBe("missing");

    const after = await syncPiSkills(ctx, [taskorgKey]);
    expect(after.entries.find((entry) => entry.key === taskorgKey)?.state).toBe("installed");
    expect((await fs.lstat(path.join(home, ".pi", "agent", "skills", "taskorg"))).isSymbolicLink()).toBe(true);
  });

  it("keeps required bundled TaskOrg skills installed even when the desired set is emptied", async () => {
    const home = await makeTempDir("taskorg-pi-skill-prune-");
    cleanupDirs.add(home);

    const configuredCtx = {
      agentId: "agent-2",
      companyId: "company-1",
      adapterType: "pi_local",
      config: {
        env: {
          HOME: home,
        },
        taskorgSkillSync: {
          desiredSkills: [taskorgKey],
        },
      },
    } as const;

    await syncPiSkills(configuredCtx, [taskorgKey]);

    const clearedCtx = {
      ...configuredCtx,
      config: {
        env: {
          HOME: home,
        },
        taskorgSkillSync: {
          desiredSkills: [],
        },
      },
    } as const;

    const after = await syncPiSkills(clearedCtx, []);
    expect(after.desiredSkills).toContain(taskorgKey);
    expect(after.entries.find((entry) => entry.key === taskorgKey)?.state).toBe("installed");
    expect((await fs.lstat(path.join(home, ".pi", "agent", "skills", "taskorg"))).isSymbolicLink()).toBe(true);
  });
});
