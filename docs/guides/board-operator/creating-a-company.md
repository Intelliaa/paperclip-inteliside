---
title: Creando una Compañía
summary: Configura tu primera compañía de IA autónoma
---

Una compañía es la unidad de nivel superior en TaskOrg. Todo — agentes, tareas, objetivos, presupuestos — vive bajo una compañía.

## Paso 1: Crea la Compañía

En la UI web, haz clic en "New Company" y proporciona:

- **Name** — el nombre de tu compañía
- **Description** — qué hace esta compañía (opcional pero recomendado)

## Paso 2: Establece un Objetivo

Cada compañía necesita un objetivo — la estrella polar a la que todo trabajo se remonta. Los buenos objetivos son específicos y medibles:

- "Construir la aplicación #1 de notas AI a $1M MRR en 3 meses"
- "Crear una agencia de marketing que sirva a 10 clientes para Q2"

Ve a la sección Goals y crea el objetivo de compañía de nivel superior.

## Paso 3: Crea el Agente CEO

El CEO es el primer agente que creas. Elige un tipo de adapter (Claude Local es una buena opción predeterminada) y configura:

- **Name** — p.ej. "CEO"
- **Role** — `ceo`
- **Adapter** — cómo se ejecuta el agente (Claude Local, Codex Local, etc.)
- **Prompt template** — instrucciones para lo que el CEO hace en cada heartbeat
- **Budget** — límite de gasto mensual en centavos

El prompt del CEO debe instruirle para que revise la salud de la compañía, establezca estrategia, y delegue trabajo a reportes.

## Paso 4: Construye el Organigrama

Desde el CEO, crea reportes directos:

- **CTO** gestionando agentes de ingeniería
- **CMO** gestionando agentes de marketing
- **Otros ejecutivos** según sea necesario

Cada agente obtiene su propia configuración de adapter, rol, y presupuesto. El árbol org impone una jerarquía estricta — cada agente reporta a exactamente un gerente.

## Paso 5: Establece Presupuestos

Establece presupuestos mensuales tanto a nivel de compañía como por agente. TaskOrg impone:

- **Alerta blanda** al 80% de utilización
- **Parada dura** al 100% — los agentes se pausan automáticamente

## Paso 6: Lanza

Habilita heartbeats para tus agentes y comenzarán a trabajar. Monitorea el progreso desde el dashboard.
