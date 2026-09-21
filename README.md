# Tantro

Minimal coming-soon website for Tantro, with an interactive Connect → See → Act capability sequence.

## Development

Use Node.js 22.13 or later. On Windows ARM, use an x64 Node runtime for compatibility with the Cloudflare development tools.

```sh
npm ci
npm run dev
```

## Build

```sh
npm run build
```

The application uses React, TypeScript, Vinext and Cloudflare Workers. The page and animation are in `app/page.tsx`; styling is in `app/globals.css`.

The `.openai/hosting.json` file identifies the existing Tantro Sites deployment. It contains no authentication credentials.
