import * as p from "@clack/prompts";
import type { SecretProvider } from "@taskorg/shared";
import type { SecretsConfig } from "../config/schema.js";
import { resolveDefaultSecretsKeyFilePath, resolveTaskOrgInstanceId } from "../config/home.js";

function defaultKeyFilePath(): string {
  return resolveDefaultSecretsKeyFilePath(resolveTaskOrgInstanceId());
}

export function defaultSecretsConfig(): SecretsConfig {
  const keyFilePath = defaultKeyFilePath();
  return {
    provider: "local_encrypted",
    strictMode: false,
    localEncrypted: {
      keyFilePath,
    },
  };
}

export async function promptSecrets(current?: SecretsConfig): Promise<SecretsConfig> {
  const base = current ?? defaultSecretsConfig();

  const provider = await p.select({
    message: "Proveedor de secretos",
    options: [
      {
        value: "local_encrypted" as const,
        label: "Cifrado local (recomendado)",
        hint: "ideal para instalaciones de un solo desarrollador",
      },
      {
        value: "aws_secrets_manager" as const,
        label: "AWS Secrets Manager",
        hint: "requiere integración con adapter externo",
      },
      {
        value: "gcp_secret_manager" as const,
        label: "GCP Secret Manager",
        hint: "requiere integración con adapter externo",
      },
      {
        value: "vault" as const,
        label: "HashiCorp Vault",
        hint: "requiere integración con adapter externo",
      },
    ],
    initialValue: base.provider,
  });

  if (p.isCancel(provider)) {
    p.cancel("Configuración cancelada.");
    process.exit(0);
  }

  const strictMode = await p.confirm({
    message: "¿Requerir referencias de secretos para variables de entorno sensibles?",
    initialValue: base.strictMode,
  });

  if (p.isCancel(strictMode)) {
    p.cancel("Configuración cancelada.");
    process.exit(0);
  }

  const fallbackDefault = defaultKeyFilePath();
  let keyFilePath = base.localEncrypted.keyFilePath || fallbackDefault;
  if (provider === "local_encrypted") {
    const keyPath = await p.text({
      message: "Ruta del archivo de clave de cifrado local",
      defaultValue: keyFilePath,
      placeholder: fallbackDefault,
      validate: (value) => {
        if (!value || value.trim().length === 0) return "La ruta del archivo de clave es obligatoria";
      },
    });

    if (p.isCancel(keyPath)) {
      p.cancel("Configuración cancelada.");
      process.exit(0);
    }
    keyFilePath = keyPath.trim();
  }

  if (provider !== "local_encrypted") {
    p.note(
      `${provider} aún no está completamente integrado en esta versión. Mantén local_encrypted a menos que estés implementando activamente ese adapter.`,
      "Aviso",
    );
  }

  return {
    provider: provider as SecretProvider,
    strictMode,
    localEncrypted: {
      keyFilePath,
    },
  };
}
