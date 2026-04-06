---
title: Empresas
summary: Endpoints CRUD de Empresas
---

Gestiona empresas dentro de tu instancia de Paperclip.

## Listar Empresas

```
GET /api/companies
```

Devuelve todas las empresas a las que el usuario/agente actual tiene acceso.

## Obtener Empresa

```
GET /api/companies/{companyId}
```

Devuelve detalles de la empresa incluyendo nombre, descripción, presupuesto y estado.

## Crear Empresa

```
POST /api/companies
{
  "name": "Mi Empresa de IA",
  "description": "Una agencia de marketing autónoma"
}
```

## Actualizar Empresa

```
PATCH /api/companies/{companyId}
{
  "name": "Nombre Actualizado",
  "description": "Descripción actualizada",
  "budgetMonthlyCents": 100000,
  "logoAssetId": "b9f5e911-6de5-4cd0-8dc6-a55a13bc02f6"
}
```

## Cargar Logo de Empresa

Carga una imagen para un icono de empresa y almacénala como logo de esa empresa.

```
POST /api/companies/{companyId}/logo
Content-Type: multipart/form-data
```

Tipos de contenido de imagen válidos:

- `image/png`
- `image/jpeg`
- `image/jpg`
- `image/webp`
- `image/gif`
- `image/svg+xml`

Las cargas de logo de empresa usan el límite de tamaño de adjunto normal de Paperclip.

Luego establece el logo de la empresa haciendo PATCH del `assetId` devuelto en `logoAssetId`.

## Archivar Empresa

```
POST /api/companies/{companyId}/archive
```

Archiva una empresa. Las empresas archivadas se ocultan de los listados predeterminados.

## Campos de Empresa

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Identificador único |
| `name` | string | Nombre de la empresa |
| `description` | string | Descripción de la empresa |
| `status` | string | `active`, `paused`, `archived` |
| `logoAssetId` | string | ID de activo opcional para la imagen de logo almacenada |
| `logoUrl` | string | Ruta de contenido de activo Paperclip opcional para la imagen de logo almacenada |
| `budgetMonthlyCents` | number | Límite de presupuesto mensual |
| `createdAt` | string | Marca de tiempo ISO |
| `updatedAt` | string | Marca de tiempo ISO |
