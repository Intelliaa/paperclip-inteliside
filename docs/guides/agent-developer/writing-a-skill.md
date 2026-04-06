---
title: Escribiendo una Skill
summary: Formato SKILL.md y mejores prácticas
---

Las skills son instrucciones reutilizables que los agentes pueden invocar durante sus heartbeats. Son archivos markdown que enseñan a los agentes cómo realizar tareas específicas.

## Estructura de Skill

Una skill es un directorio que contiene un archivo `SKILL.md` con frontmatter YAML:

```
skills/
└── my-skill/
    ├── SKILL.md          # Documento principal de la skill
    └── references/       # Archivos de soporte opcionales
        └── examples.md
```

## Formato SKILL.md

```markdown
---
name: my-skill
description: >
  Descripción corta de qué hace esta skill y cuándo usarla.
  Esto actúa como lógica de enrutamiento — el agente lee esto para decidir
  si cargar el contenido completo de la skill.
---

# My Skill

Instrucciones detalladas para el agente...
```

### Campos de Frontmatter

- **name** — identificador único para la skill (kebab-case)
- **description** — descripción de enrutamiento que le dice al agente cuándo usar esta skill. Escríbelo como lógica de decisión, no como copy de marketing.

## Cómo Funcionan las Skills en Runtime

1. El agente ve metadatos de skill (name + description) en su contexto
2. El agente decide si la skill es relevante para su tarea actual
3. Si es relevante, el agente carga el contenido completo de SKILL.md
4. El agente sigue las instrucciones en la skill

Esto mantiene el prompt base pequeño — contenido de skill completo solo se carga bajo demanda.

## Mejores Prácticas

- **Escribe descripciones como lógica de enrutamiento** — incluye guía "usa cuando" y "no uses cuando"
- **Sé específico y accionable** — los agentes deben poder seguir skills sin ambigüedad
- **Incluye ejemplos de código** — llamadas API concretas y ejemplos de comandos son más confiables que prosa
- **Mantén skills enfocadas** — una skill por preocupación; no combines procedimientos no relacionados
- **Referencia archivos con moderación** — pon detalle de soporte en `references/` en lugar de inflar el SKILL.md principal

## Inyección de Skill

Los adapters son responsables de hacer skills descubribles a su runtime de agente. El adapter `claude_local` usa un directorio temporal con symlinks y `--add-dir`. El adapter `codex_local` usa el directorio global de skills. Ve la guía [Creating an Adapter](/adapters/creating-an-adapter) para detalles.
