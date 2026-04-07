---
title: Base de Datos
summary: PostgreSQL embebido vs Docker Postgres vs alojado
---

TaskOrg usa PostgreSQL a través de Drizzle ORM. Hay tres formas de ejecutar la base de datos.

## 1. PostgreSQL Embebido (Predeterminado)

Cero configuración. Si no estableces `DATABASE_URL`, el servidor inicia una instancia embebida de PostgreSQL automáticamente.

```sh
pnpm dev
```

En el primer inicio, el servidor:

1. Crea `~/.taskorg/instances/default/db/` para almacenamiento
2. Asegura que la base de datos `taskorg` existe
3. Ejecuta migraciones automáticamente
4. Comienza a servir solicitudes

Los datos persisten entre reinicios. Para reiniciar: `rm -rf ~/.taskorg/instances/default/db`.

El inicio rápido de Docker también usa PostgreSQL embebido por defecto.

## 2. PostgreSQL Local (Docker)

Para un servidor PostgreSQL completo localmente:

```sh
docker compose up -d
```

Esto inicia PostgreSQL 17 en `localhost:5432`. Establece la cadena de conexión:

```sh
cp .env.example .env
# DATABASE_URL=postgres://taskorg:taskorg@localhost:5432/taskorg
```

Presiona el esquema:

```sh
DATABASE_URL=postgres://taskorg:taskorg@localhost:5432/taskorg \
  npx drizzle-kit push
```

## 3. PostgreSQL Alojado (Supabase)

Para producción, usa un proveedor alojado como [Supabase](https://supabase.com/).

1. Crea un proyecto en [database.new](https://database.new)
2. Copia la cadena de conexión desde Project Settings > Database
3. Establece `DATABASE_URL` en tu `.env`

Usa la **conexión directa** (puerto 5432) para migraciones y la **conexión agrupada** (puerto 6543) para la aplicación.

Si usas connection pooling, deshabilita las declaraciones preparadas:

```ts
// packages/db/src/client.ts
export function createDb(url: string) {
  const sql = postgres(url, { prepare: false });
  return drizzlePg(sql, { schema });
}
```

## Cambiar Entre Modos

| `DATABASE_URL` | Modo |
|----------------|------|
| No establecido | PostgreSQL Embebido |
| `postgres://...localhost...` | PostgreSQL Local Docker |
| `postgres://...supabase.com...` | Supabase Alojado |

El esquema de Drizzle (`packages/db/src/schema/`) es igual independientemente del modo.
