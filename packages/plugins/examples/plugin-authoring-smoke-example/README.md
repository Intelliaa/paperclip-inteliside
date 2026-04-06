# Plugin Authoring Smoke Example

A TaskOrg plugin

## Development

```bash
pnpm install
pnpm dev            # watch builds
pnpm dev:ui         # local dev server with hot-reload events
pnpm test
```

## Install Into TaskOrg

```bash
pnpm taskorg plugin install ./
```

## Build Options

- `pnpm build` uses esbuild presets from `@taskorg/plugin-sdk/bundlers`.
- `pnpm build:rollup` uses rollup presets from the same SDK.
