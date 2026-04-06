---
title: Almacenamiento
summary: Disco local vs almacenamiento compatible con S3
---

TaskOrg almacena archivos subidos (adjuntos de issues, imágenes) usando un proveedor de almacenamiento configurable.

## Disco Local (Predeterminado)

Los archivos se almacenan en:

```
~/.taskorg/instances/default/data/storage
```

No se requiere configuración. Adecuado para desarrollo local y despliegues en máquina única.

## Almacenamiento Compatible con S3

Para producción o despliegues multi-nodo, usa almacenamiento de objetos compatible con S3 (AWS S3, MinIO, Cloudflare R2, etc.).

Configura vía CLI:

```sh
pnpm taskorg configure --section storage
```

## Configuración

| Proveedor | Mejor para |
|----------|----------|
| `local_disk` | Desarrollo local, despliegues en máquina única |
| `s3` | Producción, multi-nodo, despliegues en nube |

La configuración de almacenamiento se almacena en el archivo de configuración de instancia:

```
~/.taskorg/instances/default/config.json
```
