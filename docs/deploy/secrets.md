---
title: Gestión de Secretos
summary: Clave maestra, encriptación, y modo estricto
---

TaskOrg encripta secretos en reposo usando una clave maestra local. Las variables de entorno del agente que contienen valores sensibles (claves API, tokens) se almacenan como referencias secretas encriptadas.

## Proveedor Predeterminado: `local_encrypted`

Los secretos se encriptan con una clave maestra local almacenada en:

```
~/.taskorg/instances/default/secrets/master.key
```

Esta clave se crea automáticamente durante la incorporación. La clave nunca abandona tu máquina.

## Configuración

### Configuración CLI

La incorporación escribe la configuración predeterminada de secretos:

```sh
pnpm taskorg onboard
```

Actualiza la configuración de secretos:

```sh
pnpm taskorg configure --section secrets
```

Valida la configuración de secretos:

```sh
pnpm taskorg doctor
```

### Anulaciones de Entorno

| Variable | Descripción |
|----------|-------------|
| `TASKORG_SECRETS_MASTER_KEY` | Clave de 32 bytes como base64, hex, o string raw |
| `TASKORG_SECRETS_MASTER_KEY_FILE` | Ruta personalizada del archivo de clave |
| `TASKORG_SECRETS_STRICT_MODE` | Establece en `true` para aplicar referencias secretas |

## Modo Estricto

Cuando se habilita el modo estricto, las claves env sensibles (que coinciden con `*_API_KEY`, `*_TOKEN`, `*_SECRET`) deben usar referencias secretas en lugar de valores simples en línea.

```sh
TASKORG_SECRETS_STRICT_MODE=true
```

Recomendado para cualquier despliegue más allá de local de confianza.

## Migrar Secretos en Línea

Si tienes agentes existentes con claves API en línea en su configuración, migralos a referencias secretas encriptadas:

```sh
pnpm secrets:migrate-inline-env         # ejecución en seco
pnpm secrets:migrate-inline-env --apply # aplicar migración
```

## Referencias Secretas en Configuración del Agente

Las variables de entorno del agente usan referencias secretas:

```json
{
  "env": {
    "ANTHROPIC_API_KEY": {
      "type": "secret_ref",
      "secretId": "8f884973-c29b-44e4-8ea3-6413437f8081",
      "version": "latest"
    }
  }
}
```

El servidor resuelve y desencripta estos en runtime, inyectando el valor real en el entorno del proceso del agente.
