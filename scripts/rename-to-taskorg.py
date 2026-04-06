#!/usr/bin/env python3
"""Reemplazo masivo: Paperclip → TaskOrg"""

import os
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent

# Extensiones a procesar
EXTENSIONS = {
    '.ts', '.tsx', '.js', '.mjs', '.cjs',
    '.json', '.yaml', '.yml',
    '.md', '.sh', '.html', '.css',
    '.env', '.container', '.pod',
}
# Nombres de archivo sin extensión a procesar
EXACT_NAMES = {'Dockerfile', '.mailmap', '.env.example'}

# Directorios/paths a excluir
EXCLUDE_PATHS = {
    'node_modules', '.git', 'pnpm-lock.yaml',
    'packages/db/src/migrations',
    'releases',
    'patches',
}
# Archivos exactos a excluir
EXCLUDE_FILES = {
    'LICENSE', 'NOTICE', 'RENAME-TASKORG-CHECKLIST.md',
    'rename-to-taskorg.sh', 'rename-to-taskorg.py',
}

# Reemplazos en orden (más específicos primero)
REPLACEMENTS = [
    # 1. npm scope
    ('@paperclipai/', '@taskorg/'),
    # 2. CLI/package names (comillas para ser precisos)
    ('"paperclipai"', '"taskorg"'),
    ("'paperclipai'", "'taskorg'"),
    ('paperclipai@', 'taskorg@'),
    ('pnpm paperclipai', 'pnpm taskorg'),
    ('npx paperclipai', 'npx taskorg'),
    # 3. Env vars
    ('PAPERCLIP_', 'TASKORG_'),
    # 4. Paths
    ('.paperclip/', '.taskorg/'),
    ('~/.paperclip', '~/.taskorg'),
    ('"/paperclip"', '"/taskorg"'),
    ("'/paperclip'", "'/taskorg'"),
    ('/paperclip/', '/taskorg/'),
    # 5. Config files
    ('.paperclip.yaml', '.taskorg.yaml'),
    # 6. Branding (orden importa: más específico primero)
    ('Paperclip AI', 'Inteliside'),
    ('Paperclip', 'TaskOrg'),
    # 7. Lowercase
    ('paperclip', 'taskorg'),
]


def should_exclude(path: Path) -> bool:
    parts = path.parts
    for excl in EXCLUDE_PATHS:
        excl_parts = tuple(excl.split('/'))
        for i in range(len(parts)):
            if parts[i:i+len(excl_parts)] == excl_parts:
                return True
    if path.name in EXCLUDE_FILES:
        return True
    return False


def should_process(path: Path) -> bool:
    if path.suffix in EXTENSIONS:
        return True
    if path.name in EXACT_NAMES:
        return True
    return False


def process_file(path: Path, dry_run: bool = False) -> int:
    try:
        content = path.read_text(encoding='utf-8', errors='replace')
    except Exception as e:
        print(f'  SKIP (read error): {path} — {e}')
        return 0

    new_content = content
    for old, new in REPLACEMENTS:
        new_content = new_content.replace(old, new)

    if new_content != content:
        if not dry_run:
            path.write_text(new_content, encoding='utf-8')
        return 1
    return 0


def main():
    dry_run = '--dry-run' in sys.argv
    if dry_run:
        print('DRY RUN — no se escribirán cambios')

    changed = 0
    skipped = 0
    total = 0

    for root, dirs, files in os.walk(REPO_ROOT):
        root_path = Path(root)
        rel_root = root_path.relative_to(REPO_ROOT)

        # Filtrar directorios excluidos
        dirs[:] = [
            d for d in dirs
            if not should_exclude(root_path / d)
        ]

        for fname in files:
            fpath = root_path / fname
            if should_exclude(fpath):
                skipped += 1
                continue
            if not should_process(fpath):
                continue
            total += 1
            n = process_file(fpath, dry_run=dry_run)
            if n:
                changed += 1
                rel = fpath.relative_to(REPO_ROOT)
                print(f'  CHANGED: {rel}')

    print(f'\n==> Completado: {changed} archivos modificados de {total} procesados ({skipped} excluidos)')


if __name__ == '__main__':
    main()
