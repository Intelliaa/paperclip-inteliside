# Crear una Compañía Desde un Repositorio Existente

Cuando un usuario proporciona un repositorio git (URL, ruta local o tweet enlazando a un repo), analízalo y crea un paquete de compañía que envuelva su contenido.

## Pasos de Análisis

1. **Clonar o leer el repo** — Usar `git clone` para URLs, leer directamente para rutas locales
2. **Buscar archivos de agente/skill existentes** — Buscar SKILL.md, AGENTS.md, CLAUDE.md, directorios .claude/, u otra configuración similar de agentes
3. **Entender el propósito del repo** — Leer README, package.json, archivos fuente principales para entender qué hace el proyecto
4. **Identificar roles naturales de agente** — Basándose en la estructura y propósito del repo, determinar qué agentes serían útiles

## Manejo de Skills Existentes

Muchos repos ya contienen skills (archivos SKILL.md). Cuando los encuentres:

**Comportamiento por defecto: usar referencias, no copias.**

En lugar de copiar contenido de skills a tu paquete de compañía, crea una referencia a la fuente:

```yaml
metadata:
  sources:
    - kind: github-file
      repo: owner/repo
      path: path/to/SKILL.md
      commit: <obtener el SHA del commit HEAD actual>
      attribution: <propietario del repo o nombre de la organización>
      license: <del archivo LICENSE del repo>
      usage: referenced
```

Para obtener el SHA del commit:
```bash
git ls-remote https://github.com/owner/repo HEAD
```

Solo incluir (copiar) skills cuando:
- El usuario lo pide explícitamente
- El skill es muy pequeño y está estrechamente acoplado a la compañía
- El repo fuente es privado o puede dejar de estar disponible

## Manejo de Configuraciones de Agente Existentes

Si el repo tiene configuraciones de agente (CLAUDE.md, directorios .claude/, configuraciones de codex, etc.):
- Úsalas como inspiración para las instrucciones de AGENTS.md
- No las copies textualmente — adáptalas al formato Agent Companies
- Preserva la intención e instrucciones clave

## Repos Solo con Skills (Sin Agentes)

Cuando un repo contiene solo skills y no agentes:
- Crea agentes que naturalmente usarían esos skills
- Los agentes deben ser mínimos — solo lo suficiente para dar a los skills un contexto de ejecución
- Un solo agente puede usar múltiples skills del repo
- Nombra los agentes según el dominio que cubren los skills

Ejemplo: Un repo con skills de `code-review`, `testing` y `deployment` podría convertirse en:
- Un agente "Ingeniero Principal" con los tres skills
- O agentes separados de "Revisor", "Ingeniero de QA" y "DevOps" si los skills son lo suficientemente distintos

## Patrones Comunes de Repositorios

### Repos de Herramientas de Desarrollo / CLI
- Crear agentes para los casos de uso principales de la herramienta
- Referenciar skills existentes
- Agregar un agente mantenedor o líder del proyecto

### Repos de Biblioteca / Framework
- Crear agentes para desarrollo, pruebas, documentación
- Los skills del repo se convierten en capacidades del agente

### Repos de Aplicación Completa
- Mapear a departamentos: ingeniería, producto, QA
- Crear una estructura de equipo ligera apropiada al tamaño del proyecto

### Repos de Colección de Skills (ej. repos de skills.sh)
- Cada skill o grupo de skills obtiene un agente
- Crear un envoltorio ligero de compañía o equipo
- Mantener la cantidad de agentes proporcional a la diversidad de skills
