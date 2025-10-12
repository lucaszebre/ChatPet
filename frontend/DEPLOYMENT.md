# Deploying to Cloudflare Pages

This project is a Vite + React app. These instructions will get it running on Cloudflare Pages as a static site.

Quick summary

- Build command: tsc -b && vite build
- Output (publish) directory: dist
- SPA routing: `pages.config.json` and `public/404.html` included for fallback

Environment variables
This app uses Vite environment variables prefixed with `VITE_`. The following variables were found in the codebase and should be added in Cloudflare Pages (Project > Settings > Environment Variables):

- VITE_BASE_URL — frontend base URL (used for auth callback URLs)
- VITE_BACKEND_BASE_URL — URL of your backend API

If you need other variables, search for `import.meta.env.VITE_` in the `src/` directory.

Cloudflare Pages setup steps

1. Create a new Pages project and connect it to your Git repository.
2. In the Pages project settings set:
   - Framework preset: "Other"
   - Build command: `npm run build` (or `pnpm build`/`yarn build` depending on your lockfile)
   - Build directory: `dist`
3. Add the `VITE_...` environment variables to the Pages project settings.
4. (Optional) For preview deployments, set the same env vars under "Preview" if needed.

Notes and troubleshooting

- The repo uses `tsc -b` in the build script; ensure TypeScript compiles in CI. If you prefer, you can change the `build` script to only `vite build` after ensuring type errors are handled elsewhere.
- If you plan to use Cloudflare Functions (server-side code), you'll need a `wrangler.toml` and possibly an adapter. This repo appears to be a static SPA that talks to an external API, so static Pages is appropriate.
- If you receive 404s for client-side routes, `pages.config.json` and `public/404.html` should ensure routing works by serving `index.html` for unknown paths.

Advanced: Deploying functions or SSR
If you want server-side rendering or to deploy server functions at the edge, we can add a `wrangler.toml` and adapt the build (e.g., use `@cloudflare/pages-plugin-worker` or `@cloudflare/kv-asset-handler`). Tell me if you need that.
