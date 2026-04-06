---
title: Espacios de Ejecución y Servicios de Runtime
summary: Cómo la configuración de runtime del proyecto, espacios de ejecución y ejecuciones de problemas encajan juntos
---

Esta guía documenta el modelo de runtime previsto para proyectos, espacios de ejecución y ejecuciones de problemas en TaskOrg.

## Configuración de runtime del proyecto

Puedes definir cómo ejecutar un proyecto en el workspace del proyecto mismo.

- La configuración de runtime del workspace del proyecto describe cómo ejecutar servicios para ese checkout de proyecto.
- Esta es la configuración de runtime predeterminada que los workspaces de ejecución hijo pueden heredar.
- Definir la configuración no inicia nada por sí solo.

## Control manual de runtime

Los servicios de runtime se controlan manualmente desde la interfaz.

- Los servicios de runtime del workspace del proyecto se inician y detienen desde la interfaz del workspace del proyecto.
- Los servicios de runtime del workspace de ejecución se inician y detienen desde la interfaz del workspace de ejecución.
- TaskOrg no inicia o detiene automáticamente estos servicios de runtime como parte de la ejecución del problema.
- TaskOrg tampoco reinicia automáticamente servicios de runtime del workspace en el arranque del servidor.

## Herencia del workspace de ejecución

Los espacios de ejecución aíslan el código y el estado de runtime del workspace principal del proyecto.

- Un workspace de ejecución aislado tiene su propia ruta de checkout, rama e instancia de runtime local.
- La configuración de runtime puede heredar del workspace del proyecto vinculado por defecto.
- El workspace de ejecución puede anular esa configuración de runtime con sus propias configuraciones específicas del workspace.
- La configuración heredada responde "cómo ejecutar el servicio", pero el proceso en ejecución sigue siendo específico de ese workspace de ejecución.

## Problemas y espacios de ejecución

Los problemas se adjuntan al comportamiento del workspace de ejecución, no a la gestión automática de runtime.

- Un problema puede crear un nuevo workspace de ejecución cuando eliges modo de workspace aislado.
- Un problema puede reutilizar un workspace de ejecución existente cuando eliges reutilización.
- Múltiples problemas pueden compartir intencionalmente un workspace de ejecución para que puedan trabajar contra la misma rama y servicios de runtime en ejecución.
- Asignar o ejecutar un problema no inicia o detiene automáticamente servicios de runtime para ese workspace.

## Ciclo de vida del workspace de ejecución

Los espacios de ejecución son duraderos hasta que un humano los cierra.

- La interfaz puede archivar un workspace de ejecución.
- Cerrar un workspace de ejecución detiene sus servicios de runtime y limpia sus artefactos de workspace cuando está permitido.
- Los workspaces compartidos que apuntan al checkout principal del proyecto se tratan más conservadoramente durante la limpieza que los workspaces aislados desechables.

## Lógica de workspace resuelto durante ejecuciones de heartbeat

El heartbeat sigue resolviendo un workspace para la ejecución, pero eso se trata de ubicación de código y continuidad de sesión, no de control de servicios de runtime.

1. El heartbeat resuelve un workspace base para la ejecución.
2. TaskOrg realiza el workspace de ejecución efectivo, incluyendo creación o reutilización de un worktree cuando sea necesario.
3. TaskOrg persiste metadatos del workspace de ejecución como rutas, refs y configuraciones de provisión.
4. El heartbeat pasa el workspace de código resuelto a la ejecución del agente.
5. Los servicios de runtime del workspace permanecen como controles gestionados por la interfaz manual en lugar de servicios gestionados por heartbeat automático.

## Garantías de implementación actual

Con la implementación actual:

- La configuración de runtime del workspace del proyecto es el respaldo para controles de interfaz del workspace de ejecución.
- Los overrides de runtime del workspace de ejecución se almacenan en el workspace de ejecución.
- Las ejecuciones de heartbeat no inician automáticamente servicios de runtime del workspace.
- El arranque del servidor no reinicia automáticamente servicios de runtime del workspace.
