# Aatene (أعطيني) — Next.js frontend

## Commands

| Command | Action |
|---|---|
| `pnpm run dev` | Dev server (http://localhost:3000) |
| `pnpm run build` | Production build |
| `pnpm run typecheck` | `tsc --noEmit` |
| `pnpm run lint` | ESLint |
| `pnpm run production` | `next build && next start` |

Order for safety: `lint` → `typecheck` → `build`. No test framework exists in this repo.

## Structure

- **`src/app/[locale]/(web)/`** — Public routes (home, login, signup, search, products, stores, chat, etc.)
- **`src/app/[locale]/(dashboard)/[type]/`** — Admin/merchant dashboard; `[type]` is the section name (e.g. `products`, `users`, `stores`)
- **`src/features/(web)/`** / **`src/features/(dashboard)/`** — Feature modules corresponding to route groups
- **`src/components/(web)/` / `src/components/(dashboard)/`** — Route-specific components
- **`src/components/ui/`** — shadcn/ui + custom UI primitives (46 files: button, dialog, form, etc.)
- **`src/components/providers/`** — App providers (Query, Auth, Settings, analytics pixels)
- **`src/lib/`** — Utilities: `axios.ts` (configured instance w/ interceptors), `utils.ts` (`cn()`, `fixMediaUrl()`, `upgradeHttpToHttps()`)
- **`src/stores/`** — Zustand stores: `auth-store`, `settings-store`, `ui-store`
- **`src/i18n/`** — `next-international` client/server; locales: `ar` (default), `en`, `he`; RTL for ar/he
- **`src/hooks/`** — Custom hooks: `use-api-query` (wraps TanStack Query, auto-appends locale to keys), `use-language`, `use-debounce`, `use-echo-channel`, `use-fcm-token`
- **`src/config/role-permissions.ts`** — Role-based dashboard access rules
- **`src/proxy.ts`** — Edge middleware: i18n rewrite, Coming Soon mode, auth guard, role/permission checks

## Key patterns

- **Path alias** `@/*` maps to project root (e.g. `import { cn } from "@/src/lib/utils"`).
- **shadcn/ui** configured with `components.json`: New York style, RSC enabled, icon library = lucide.
- **API calls** go through `src/lib/axios.ts` (Axios instance, baseURL from `NEXT_PUBLIC_API_BASE_URL`, defaults to `https://backend.aatene.com/api`). Interceptors handle token injection, 401 → logout, and error toasts.
- **Dashboard API endpoints** are dynamic: `getDynamicEndpoint()` prefixes `/merchants` or `/admin` based on `user_type` cookie.
- **Data fetching** uses `useApiQuery` hook (TanStack Query wrapper) which automatically appends the current locale to the query key for per-language caching.
- **Auth** via zustand persist + `js-cookie`. Token stored in cookie `token` (path="/", sameSite="lax"). Auth hydration runs in `AuthHydrator` provider.
- **Rewrites** in `next.config.ts`: `/admin` → `/ar/admin`, `/chat` → `/ar/chat`, `/search` → `/ar/search` (locale-less URLs default to Arabic).
- **Media URLs** from backend may contain `http://localhost` — use `fixMediaUrl()` to replace with real API origin.
- **`NEXT_PUBLIC_API_BASE_URL`** env var must be set (in `.env` for dev). See `.env` for all required vars (Firebase, Google Maps, etc.).
- **Coming Soon mode** controlled by `COMING_SOON_ENABLED` env var + `COMING_SOON_PREVIEW_SECRET` cookie bypass.

## Conventions

- **Arabic-first**: Default locale is `ar`. All UI text is in Arabic. JSON translation files: `ar.json`, `en.json`, `he.json`.
- **CSS**: Tailwind v4 with `@tailwindcss/postcss`. Dark mode via `class` strategy (`darkMode: "class"`).
- **Font**: Custom local font via CSS variable `--font-ping-ar`.
- **No test files** — no Jest, Vitest, Playwright, or Cypress config detected.
