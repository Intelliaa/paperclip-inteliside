---
name: taskorg-create-plugin
description: >
  Crea nuevos plugins de TaskOrg con el SDK/runtime alpha actual. Úsalo cuando
  necesites generar la estructura de un paquete de plugin, agregar un nuevo plugin de ejemplo, o actualizar
  la documentación de autoría de plugins. Cubre la superficie soportada de worker/UI, convenciones de rutas,
  flujo de generación de estructura y pasos de verificación.
---

# Crear un Plugin de TaskOrg

Usa este skill cuando la tarea sea crear, generar la estructura o documentar un plugin de TaskOrg.

## 1. Reglas básicas

Lee estos primero cuando sea necesario:

1. `doc/plugins/PLUGIN_AUTHORING_GUIDE.md`
2. `packages/plugins/sdk/README.md`
3. `doc/plugins/PLUGIN_SPEC.md` solo para contexto a futuro

Suposiciones actuales del runtime:

- los workers de plugin son código de confianza
- la UI del plugin es código host del mismo origen y de confianza
- las APIs de worker están controladas por capacidades
- la UI del plugin no está aislada por las capacidades del manifiesto
- aún no hay kit de componentes de UI compartidos proporcionado por el host
- `ctx.assets` no está soportado en el runtime actual

## 2. Flujo de trabajo preferido

Usa el paquete de generación de estructura en lugar de escribir el código repetitivo a mano:

```bash
pnpm --filter @taskorg/create-taskorg-plugin build
node packages/plugins/create-taskorg-plugin/dist/index.js <npm-package-name> --output <target-dir>
```

Para un plugin que vive fuera del repositorio de TaskOrg, pasa `--sdk-path` y deja que la generación copie una instantánea del SDK local/paquetes compartidos en `.taskorg-sdk/`:

```bash
pnpm --filter @taskorg/create-taskorg-plugin build
node packages/plugins/create-taskorg-plugin/dist/index.js @acme/plugin-name \
  --output /absolute/path/to/plugin-repos \
  --sdk-path /absolute/path/to/taskorg/packages/plugins/sdk
```

Destino recomendado dentro de este repositorio:

- `packages/plugins/examples/` para plugins de ejemplo
- otra carpeta `packages/plugins/<name>/` si se está convirtiendo en un paquete real

## 3. Después de generar la estructura

Verifica y ajusta:

- `src/manifest.ts`
- `src/worker.ts`
- `src/ui/index.tsx`
- `tests/plugin.spec.ts`
- `package.json`

Asegúrate de que el plugin:

- declare solo capacidades soportadas
- no use `ctx.assets`
- no importe stubs de componentes de UI del host
- mantenga la UI autocontenida
- use `routePath` solo en slots de tipo `page`
- se instale en TaskOrg desde una ruta local absoluta durante el desarrollo

## 4. Si el plugin debe aparecer en la aplicación

Para comportamiento de ejemplo incluido/descubrible, actualiza el cableado relevante del host:

- lista de ejemplos incluidos en `server/src/routes/plugins.ts`
- cualquier documentación que liste ejemplos dentro del repositorio

Solo haz esto si el usuario quiere que el plugin aparezca como un ejemplo incluido.

## 5. Verificación

Siempre ejecuta:

```bash
pnpm --filter <plugin-package> typecheck
pnpm --filter <plugin-package> test
pnpm --filter <plugin-package> build
```

Si también cambiaste código del SDK/host/runtime del plugin, ejecuta verificaciones más amplias del repositorio según corresponda.

## 6. Expectativas de documentación

Al redactar o actualizar documentación de plugins:

- distingue la implementación actual de ideas de especificación futura
- sé explícito sobre el modelo de código de confianza
- no prometas componentes de UI del host o APIs de assets
- prefiere guías de deploy vía paquete npm sobre flujos locales del repositorio para producción
