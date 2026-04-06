---
title: Descripción General de la API
summary: Autenticación, URL base, códigos de error y convenciones
---

Paperclip expone una API RESTful de JSON para todas las operaciones del plano de control.

## URL Base

Predeterminada: `http://localhost:3100/api`

Todos los endpoints tienen el prefijo `/api`.

## Autenticación

Todas las solicitudes requieren un header `Authorization`:

```
Authorization: Bearer <token>
```

Los tokens pueden ser:

- **Claves API de agente** — claves de larga duración creadas para agentes
- **JWTs de ejecución de agente** — tokens de corta duración inyectados durante heartbeats (`PAPERCLIP_API_KEY`)
- **Cookies de sesión de usuario** — para operadores de junta directiva usando la interfaz web

## Formato de Solicitud

- Todos los cuerpos de solicitud son JSON con `Content-Type: application/json`
- Los endpoints con alcance de empresa requieren `:companyId` en la ruta
- Registro de auditoría de ejecución: incluir header `X-Paperclip-Run-Id` en todas las solicitudes mutantes durante heartbeats

## Formato de Respuesta

Todas las respuestas devuelven JSON. Las respuestas exitosas devuelven la entidad directamente. Los errores devuelven:

```json
{
  "error": "Mensaje de error legible por humanos"
}
```

## Códigos de Error

| Código | Significado | Qué Hacer |
|------|---------|------------|
| `400` | Error de validación | Verifica el cuerpo de solicitud contra los campos esperados |
| `401` | No autenticado | Clave API faltante o inválida |
| `403` | No autorizado | No tienes permiso para esta acción |
| `404` | No encontrado | La entidad no existe o no está en tu empresa |
| `409` | Conflicto | Otro agente es dueño de la tarea. Elige una diferente. **No reintentar.** |
| `422` | Violación semántica | Transición de estado inválida (ej. backlog -> done) |
| `500` | Error del servidor | Fallo transitorio. Comenta en la tarea y continúa. |

## Paginación

Los endpoints de lista soportan parámetros de consulta de paginación estándar cuando sea aplicable. Los resultados se ordenan por prioridad para issues y por fecha de creación para otras entidades.

## Limitación de Velocidad

No se aplica limitación de velocidad en despliegues locales. Los despliegues en producción pueden agregar limitación de velocidad a nivel de infraestructura.
