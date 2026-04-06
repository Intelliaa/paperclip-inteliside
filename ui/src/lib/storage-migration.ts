/**
 * One-time migration of legacy localStorage keys from "paperclip:*" / "paperclip.*"
 * to the new "taskorg:*" / "taskorg.*" namespace.
 * Safe to call multiple times — skips keys that already exist in the new namespace.
 */

const KEY_MIGRATIONS: [string, string][] = [
  ["paperclip.theme", "taskorg.theme"],
  ["paperclip.selectedCompanyId", "taskorg.selectedCompanyId"],
  ["paperclip.lastInstanceSettingsPath", "taskorg.lastInstanceSettingsPath"],
  ["paperclip.companyOrder", "taskorg.companyOrder"],
  ["paperclip.companyPaths", "taskorg.companyPaths"],
  ["paperclip:panel-visible", "taskorg:panel-visible"],
  ["paperclip:issue-draft", "taskorg:issue-draft"],
  ["paperclip:inbox:dismissed", "taskorg:inbox:dismissed"],
  ["paperclip:inbox:read-items", "taskorg:inbox:read-items"],
  ["paperclip:inbox:last-tab", "taskorg:inbox:last-tab"],
  ["paperclip:inbox:issue-columns", "taskorg:inbox:issue-columns"],
  ["paperclip:recent-assignees", "taskorg:recent-assignees"],
];

export function migrateLocalStorage(): void {
  try {
    for (const [oldKey, newKey] of KEY_MIGRATIONS) {
      const oldValue = localStorage.getItem(oldKey);
      if (oldValue !== null && localStorage.getItem(newKey) === null) {
        localStorage.setItem(newKey, oldValue);
        localStorage.removeItem(oldKey);
      }
    }
  } catch {
    // localStorage may be unavailable in some contexts
  }
}
