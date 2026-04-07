#!/usr/bin/env bash
# Script de reemplazo masivo: Paperclip → TaskOrg
# Excluye: node_modules, pnpm-lock.yaml, migrations, .git, releases, LICENSE, NOTICE, RENAME-TASKORG-CHECKLIST.md

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "==> Iniciando reemplazo masivo Paperclip → TaskOrg"
echo "==> Directorio: $REPO_ROOT"

# Función de reemplazo seguro con LC_ALL para caracteres especiales
do_replace() {
  local from="$1"
  local to="$2"
  local desc="$3"
  echo "--- $desc"
  LC_ALL=C find . \
    -type f \
    \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.mjs" -o -name "*.cjs" \
    -o -name "*.json" -o -name "*.yaml" -o -name "*.yml" \
    -o -name "*.md" -o -name "*.sh" -o -name "*.html" -o -name "*.css" \
    -o -name "*.env" -o -name "*.env.example" -o -name "*.container" -o -name "*.pod" \
    -o -name "Dockerfile" -o -name "Dockerfile.*" -o -name ".mailmap" \
    \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/pnpm-lock.yaml" \
    -not -path "*/packages/db/src/migrations/*" \
    -not -path "*/releases/*" \
    -not -name "LICENSE" \
    -not -name "NOTICE" \
    -not -name "RENAME-TASKORG-CHECKLIST.md" \
    -not -name "rename-to-taskorg.sh" \
    | xargs LC_ALL=C sed -i '' "s|${from}|${to}|g" 2>/dev/null || true
}

# 1. Scope de paquetes npm
do_replace "@paperclipai/" "@taskorg/" "npm scope @paperclipai/ → @taskorg/"

# 2. CLI binary y package name (palabra exacta)
do_replace "\"paperclipai\"" "\"taskorg\"" "package name paperclipai → taskorg (quoted)"
do_replace "'paperclipai'" "'taskorg'" "package name paperclipai → taskorg (single quoted)"
do_replace "paperclipai@" "taskorg@" "package name en URLs/references con @"
# Binario en scripts
do_replace "pnpm paperclipai" "pnpm taskorg" "pnpm paperclipai command"
do_replace "npx paperclipai" "npx taskorg" "npx paperclipai command"

# 3. Variables de entorno (PAPERCLIP_ prefix)
do_replace "PAPERCLIP_" "TASKORG_" "env vars PAPERCLIP_ → TASKORG_"

# 4. Paths de directorio
do_replace "\.paperclip/" ".taskorg/" ".paperclip/ → .taskorg/"
do_replace "~/.paperclip" "~/.taskorg" "~/.paperclip → ~/.taskorg"
do_replace '"/paperclip"' '"/taskorg"' "/paperclip path → /taskorg"
do_replace "'/paperclip'" "'/taskorg'" "/paperclip path → /taskorg (single quoted)"
do_replace "/paperclip/" "/taskorg/" "/paperclip/ path → /taskorg/"

# 5. Config file
do_replace "\.paperclip\.yaml" ".taskorg.yaml" ".paperclip.yaml → .taskorg.yaml"

# 6. Branding PascalCase
do_replace "Paperclip AI" "Inteliside" "Paperclip AI → Inteliside (company)"
do_replace "Paperclip" "TaskOrg" "Paperclip → TaskOrg (branding)"

# 7. Lowercase identifiers, CSS classes, DB creds
do_replace "paperclip" "taskorg" "paperclip → taskorg (lowercase identifiers)"

echo ""
echo "==> Reemplazo masivo COMPLETADO"
echo "==> IMPORTANTE: Verificar manualmente:"
echo "    - LICENSE (restaurar si fue tocado)"
echo "    - NOTICE (restaurar si fue tocado)"
echo "    - packages/db/src/migrations/ (NO deben haber cambios)"
echo "    - releases/ (NO deben haber cambios)"
