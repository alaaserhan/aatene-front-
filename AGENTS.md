# Aatene (أعطيني) — Next.js frontend

Never write comments in Arabic. All code comments must be in English. Only user-facing strings (labels, placeholders, toasts, copy) are Arabic — never comments.

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

## Shared feature components

### `OfferBundlePreview`

`src/features/(dashboard)/related-products/components/OfferBundlePreview.tsx` — the
cross-selling offer as the customer sees it: the main product, the bundled products in
a dashed box, and the discounted total. Used by the offers table preview dialog
(`OfferPreviewDialog`), the create/edit wizard's last step (`create/OfferDiscountForm`)
and the empty-state sample (`RelatedProductsHelp`). Reuse it instead of laying out a
new bundle preview.

```tsx
<OfferBundlePreview
    mainProduct={{ id, name, price, imageUrl }}   // optional — omit for bundle-only
    relatedProducts={products}                     // BundleProduct[]
    originalPrice={originalTotal}
    offerPrice={discountedPrice}
    showSavings                                    // adds the "وفّر ... ₪" chip
    mainLabel="المنتج"                              // optional captions
    relatedLabel="المنتجات المرتبطة"
    visibleCount={3}                               // cards before it slides, md+
    variant="default"                              // or "compact"
    showTotals                                     // false drops the "= price" block
    action={<OrderButton />}                       // CTA under the prices
/>
```

Map your data to `BundleProduct` (`{ id?, name, price?, imageUrl? }`) — note `imageUrl`,
not the API's `cover_url`/`cover`.

- **Omit `mainProduct`** wherever the anchor product is already named on screen; the
  slider and totals then stand alone. There is deliberately no `+` between the main
  product and the box — the offer prices the bundled products only.
- **Responsive by itself.** One row from `md` up (main + box + total), stacked below it
  (main as a wide row, box full-width with exactly 2 cards per view, total last).
  Arrows are pointer-only; touch gets swipe plus dot indicators.
- **`variant="compact"`** for tight columns (the product page's info card): no dashed
  frame, 100px cards each outlined in `--c2-primary`, arrows beside the track instead
  of over it, tighter card separators, and the totals stacked as price / "بدلاً من" /
  old price. It is uncapped — the track takes the row's leftover width, so
  `visibleCount` does not apply.
- **`action` renders under the prices, inside their column** — never as a `w-full` child
  of the totals row. A wrapping flex container's intrinsic width is the sum of all its
  children laid end to end, as if nothing wrapped, so a button that *paints* on its own
  line still *claims* its width beside the prices. In compact that width comes straight
  out of the track (`flex-1`), which silently loses a card and leaves dead space between
  the slider and the `=`. Same reason it is centred on the prices, not on the equation.
- **`showTotals={false}`** where the host already prices the offer (the chat header's
  collapsible), so the equation is not spelled out twice.
- **`visibleCount` is a cap, not a fixed width** — inside a narrow container the box
  shrinks and starts sliding sooner.
- **Never put a margin on the outer cards.** The track is `snap-mandatory`, and a card's
  margin shifts its snap position, so it rests a few pixels past the start for good and
  the "previous" arrow never disables. Space the cards off the edges with padding on the
  frame around the scroller instead — a scroller's own inline-end padding collapses once
  the content overflows, which is why it lives on the frame and not on the track.
- **The host must not block shrinking.** The component keeps `min-w-0` at every level,
  but its container has to as well. `DialogContent` is `display: grid`, and a grid item
  defaults to `min-width: auto`, so it grows past the dialog unless you add `min-w-0` to
  the wrapper you render it in.

### `ChatNowButton`

`src/components/shared/ChatNowButton.tsx` — the single "chat now" entry point (stores,
users, products, services, blogs). It builds the URL through `buildChatHref` in
`src/lib/chat-links.ts`, so every screen hands `ChatPage` the same query shape; guests
are redirected to login first. Reuse it instead of pushing a chat URL by hand.

```tsx
<ChatNowButton
    target={{ type: "store", id: store.id, productId: product.id }}
    label="اطلب الآن"
    icon={null}                 // undefined keeps the default message icon
    unstyled                    // bare <button> carrying only className
    loadingReplacesLabel        // spinner over the label, so the width never moves
/>
```

- **`ChatTarget.productId` / `serviceId`** seed the conversation with that item —
  `ChatPage` posts a message instead of just creating the conversation, and `ChatWindow`
  pins the item as a card above the thread.
- **`ChatTarget.bundleProductId`** additionally pins the product's cross-sell offer under
  that card, read-only ([`ChatBundleOffer`](src/features/(dashboard)/chat/components/ChatBundleOffer.tsx),
  collapsed to one line so the header does not eat a phone screen). It travels as the
  `bundle` query param, deliberately **not** listed in `CHAT_TARGET_PARAMS`: those are
  stripped once the conversation exists and the URL becomes `?chat=…`, and this one has
  to outlive them. It carries the product id rather than a flag so the offer only shows
  on the conversation it belongs to.
- **`loadingReplacesLabel`** keeps the label in place but `invisible` and spins over it —
  for buttons whose box must not move while the chat opens. Without it the spinner is
  added beside the label and the button grows.

## Conventions

- **Arabic-first**: Default locale is `ar`. All UI text is in Arabic. JSON translation files: `ar.json`, `en.json`, `he.json`.
- **Code comments in English only**: Write every code comment (`//`, `/* */`, JSDoc, JSX `{/* */}`) in English. Only user-facing strings (labels, placeholders, toasts, copy) are Arabic — never comments.
- **Images — prefer `next/image`**: use `<Image />` from `next/image` instead of a raw `<img>` in every new or edited component (logos, avatars, covers, remote media included). Pass `width`/`height`, or `fill` with a sized parent. For hosts missing from `images.remotePatterns` in `next.config.ts`, add `unoptimized` rather than falling back to `<img>`. Existing `<img>` tags stay until that screen is touched.
- **CSS**: Tailwind v4 with `@tailwindcss/postcss`. Dark mode via `class` strategy (`darkMode: "class"`).
- **Arbitrary values with `calc()` need `_` for spaces**: `w-[calc((100%_-_2rem)/2)]`, not `w-[calc((100%-2rem)/2)]`. CSS requires whitespace around `+`/`-`, so the second is invalid and Tailwind drops the utility **silently** — no error from `lint`, `typecheck` or the editor, just a missing style. Prefer an inline `style` CSS variable for anything more complex.
- **Font**: Custom local font via CSS variable `--font-ping-ar`.
- **No test files** — no Jest, Vitest, Playwright, or Cypress config detected.
