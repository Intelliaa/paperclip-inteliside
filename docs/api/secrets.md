---
title: Secretos
summary: CRUD de Secretos
---

Gestiona secretos encriptados que los agentes referencian en su configuración de entorno.

## Listar Secretos

```
GET /api/companies/{companyId}/secrets
```

Devuelve metadatos de secreto (no valores desencriptados).

## Crear Secreto

```
POST /api/companies/{companyId}/secrets
{
  "name": "anthropic-api-key",
  "value": "sk-ant-..."
}
```

El valor está encriptado en reposo. Solo se devuelven el ID del secreto y los metadatos.

## Actualizar Secreto

```
PATCH /api/secrets/{secretId}
{
  "value": "sk-ant-new-value..."
}
```

Crea una nueva versión del secreto. Los agentes que referencian `"version": "latest"` obtienen automáticamente el nuevo valor en el siguiente heartbeat.

## Usar Secretos en Configuración de Agente

Referencia secretos en la configuración del adaptador del agente en lugar de valores inline:

```json
{
  "env": {
    "ANTHROPIC_API_KEY": {
      "type": "secret_ref",
      "secretId": "{secretId}",
      "version": "latest"
    }
  }
}
```

El servidor resuelve y desencripta referencias de secreto en tiempo de ejecución, inyectando el valor real en el entorno del proceso del agente.
