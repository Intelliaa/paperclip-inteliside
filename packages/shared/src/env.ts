/**
 * Helper for reading environment variables with backward compatibility.
 * Reads TASKORG_* first, falls back to legacy PAPERCLIP_* with a deprecation warning.
 */

const warned = new Set<string>();

export function readEnv(newKey: string, legacyKey: string): string | undefined {
  const newValue = process.env[newKey];
  const legacyValue = process.env[legacyKey];

  if (legacyValue && !newValue && !warned.has(legacyKey)) {
    warned.add(legacyKey);
    console.warn(
      `[DEPRECATED] Environment variable ${legacyKey} is deprecated. Use ${newKey} instead.`,
    );
  }

  return newValue ?? legacyValue;
}
