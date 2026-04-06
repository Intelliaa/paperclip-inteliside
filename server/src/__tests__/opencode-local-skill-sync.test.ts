import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  listOpenCodeSkills,
  syncOpenCodeSkills,
} from "@taskorg/adapter-opencode-local/server";

async function makeTempDir(prefix: string): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

describe("opencode local skill sync", () => {
  const taskorgKey = "taskorg/taskorg/taskorg";
  const cleanupDirs = new Set<string>();

  afterEach(async () => {
    await Promise.all(Array.from(cleanupDirs).map((dir) => fs.rm(dir, { recursive: true, force: true })));
    cleanupDirs.clear();
  });

  it("reports configured TaskOrg skills and installs them into the shared Claude/OpenCode skills home", async () => {
    const home = await makeTempDir("taskorg-opencode-skill-sync-");
    cleanupDirs.add(home);

    const ctx = {
      agentId: "agent-1",
      companyId: "company-1",
      adapterType: "opencode_local",
      config: {
        env: {
          HOME: home,
        },
        taskorgSkillSync: {
          desiredSkills: [taskorgKey],
        },
      },
    } as const;

    const before = await listOpenCodeSkills(ctx);
    expect(before.mode).toBe("persistent");
    expect(before.warnings).toContain("OpenCode currently uses the shared Claude skills home (~/.claude/skills).");
    expect(before.desiredSkills).toContain(taskorgKey);
    expect(before.entries.find((entry) => entry.key === taskorgKey)?.required).toBe(true);
    expect(before.entries.find((entry) => entry.key === taskorgKey)?.state).toBe("missing");

    const after = await syncOpenCodeSkills(ctx, [taskorgKey]);
    expect(after.entries.find((entry) => entry.key === taskorgKey)?.state).toBe("installed");
    expect((await fs.lstat(path.join(home, ".claude", "skills", "taskorg"))).isSymbolicLink()).toBe(true);
  });

  it("keeps required bundled TaskOrg skills installed even when the desired set is emptied", async () => {
    const home = await makeTempDir("taskorg-opencode-skill-prune-");
    cleanupDirs.add(home);

    const configuredCtx = {
      agentId: "agent-2",
      companyId: "company-1",
      adapterType: "opencode_local",
      config: {
        env: {
          HOME: home,
        },
        taskorgSkillSync: {
          desiredSkills: [taskorgKey],
        },
      },
    } as const;

    await syncOpenCodeSkills(configuredCtx, [taskorgKey]);

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

    const after = await syncOpenCodeSkills(clearedCtx, []);
    expect(after.desiredSkills).toContain(taskorgKey);
    expect(after.entries.find((entry) => entry.key === taskorgKey)?.state).toBe("installed");
    expect((await fs.lstat(path.join(home, ".claude", "skills", "taskorg"))).isSymbolicLink()).toBe(true);
  });
});
