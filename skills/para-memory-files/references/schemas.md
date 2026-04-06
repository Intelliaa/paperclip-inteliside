# Esquemas y Decaimiento de Memoria

## Esquema de Hechos Atómicos (items.yaml)

```yaml
- id: entity-001
  fact: "The actual fact"
  category: relationship | milestone | status | preference
  timestamp: "YYYY-MM-DD"
  source: "YYYY-MM-DD"
  status: active # active | superseded
  superseded_by: null # e.g. entity-002
  related_entities:
    - companies/acme
    - people/jeff
  last_accessed: "YYYY-MM-DD"
  access_count: 0
```

## Decaimiento de Memoria

Los hechos decaen en prioridad de recuperación con el tiempo para que la información obsoleta no desplace el contexto reciente.

**Seguimiento de acceso:** Cuando un hecho se usa en una conversación, incrementa `access_count` y establece `last_accessed` a hoy. Durante la extracción del heartbeat, escanea la sesión en busca de hechos de entidades referenciados y actualiza sus metadatos de acceso.

**Niveles de recencia (para reescritura de summary.md):**

- **Caliente** (accedido en los últimos 7 días) -- incluir prominentemente en summary.md.
- **Tibio** (hace 8-30 días) -- incluir con menor prioridad.
- **Frío** (más de 30 días o nunca accedido) -- omitir de summary.md. Sigue en items.yaml, recuperable bajo demanda.
- Un `access_count` alto resiste el decaimiento -- los hechos usados frecuentemente permanecen tibios más tiempo.

**Síntesis semanal:** Ordena por nivel de recencia, luego por access_count dentro del nivel. Los hechos fríos salen del resumen pero permanecen en items.yaml. Acceder a un hecho frío lo recalienta.

Sin eliminación. El decaimiento solo afecta la prioridad de recuperación mediante la curación de summary.md. El registro completo siempre vive en items.yaml.
