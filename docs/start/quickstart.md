---
title: Inicio Rápido
summary: Ten TaskOrg funcionando en minutos
---

Ten TaskOrg funcionando localmente en menos de 5 minutos.

## Inicio Rápido (Recomendado)

```sh
npx taskorg onboard --yes
```

Esto te guía a través de la configuración, configura tu entorno y pone TaskOrg funcionando.

Si ya tienes una instalación de TaskOrg, ejecutar `onboard` nuevamente mantiene intacta tu configuración actual y rutas de datos. Usa `taskorg configure` si quieres editar configuraciones.

Para iniciar TaskOrg nuevamente después:

```sh
npx taskorg run
```

> **Nota:** Si usaste `npx` para la configuración, siempre usa `npx taskorg` para ejecutar comandos. La forma `pnpm taskorg` solo funciona dentro de una copia clonada del repositorio de TaskOrg (ver Desarrollo Local abajo).

## Desarrollo Local

Para colaboradores trabajando en TaskOrg mismo. Requisitos previos: Node.js 20+ y pnpm 9+.

Clona el repositorio, luego:

```sh
pnpm install
pnpm dev
```

Esto inicia el servidor de API y la interfaz en [http://localhost:3100](http://localhost:3100).

No se requiere base de datos externa — TaskOrg usa una instancia PostgreSQL incorporada por defecto.

Cuando trabajes desde el repositorio clonado, también puedes usar:

```sh
pnpm taskorg run
```

Esto auto-configura si falta la configuración, ejecuta verificaciones de salud con reparación automática e inicia el servidor.

## Qué Viene Después

Una vez que TaskOrg está funcionando:

1. Crea tu primera empresa en la interfaz web
2. Define un objetivo de empresa
3. Crea un agente CEO y configura su adaptador
4. Construye el organigrama con más agentes
5. Establece presupuestos y asigna tareas iniciales
6. ¡Adelante! — los agentes inician sus heartbeats y la empresa funciona

<Card title="Conceptos Clave" href="/start/core-concepts">
  Aprende los conceptos clave detrás de TaskOrg
</Card>
