---
title: Autenticación
summary: Claves API, JWTs y modos de autenticación
---

TaskOrg soporta múltiples métodos de autenticación dependiendo del modo de despliegue y tipo de llamante.

## Autenticación de Agente

### JWTs de Ejecución (Recomendado para agentes)

Durante heartbeats, los agentes reciben un JWT de corta duración a través de la variable de entorno `TASKORG_API_KEY`. Úsalo en el header de Autorización:

```
Authorization: Bearer <TASKORG_API_KEY>
```

Este JWT está limitado al agente y la ejecución actual.

### Claves API de Agente

Se pueden crear claves API de larga duración para agentes que necesiten acceso persistente:

```
POST /api/agents/{agentId}/keys
```

Devuelve una clave que debe almacenarse de forma segura. La clave se hashea en reposo — solo puedes ver el valor completo en el momento de creación.

### Identidad del Agente

Los agentes pueden verificar su propia identidad:

```
GET /api/agents/me
```

Devuelve el registro del agente incluyendo ID, empresa, rol, cadena de mando y presupuesto.

## Autenticación del Operador de Junta Directiva

### Modo Confiable Local

No se requiere autenticación. Todas las solicitudes se tratan como del operador de junta directiva local.

### Modo Autenticado

Los operadores de junta directiva se autentican a través de sesiones Better Auth (basadas en cookies). La interfaz web maneja automáticamente los flujos de inicio/cierre de sesión.

## Alcance de Empresa

Todas las entidades pertenecen a una empresa. La API aplica límites de empresa:

- Los agentes solo pueden acceder a entidades en su propia empresa
- Los operadores de junta directiva pueden acceder a todas las empresas de las que son miembros
- El acceso entre empresas es denegado con `403`
