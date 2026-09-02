# Project notes for Claude

## Comments are English — always

Never write a code comment in Arabic. Every `//`, `/* */`, JSDoc block and JSX
`{/* */}` comment is English, and so is every developer-facing message (`throw new
Error(...)`, `console.*`). Arabic belongs only in user-facing strings — labels,
placeholders, toasts, copy.

This holds **even when the file you are editing is already full of Arabic
comments**. Many older files are; matching their style is the mistake, not the
fix. Leave the existing Arabic comments alone unless asked, but everything you
add is English.

## Images — reach for `next/image` first

Use `<Image />` from `next/image` instead of a raw `<img>` for every image you
add or touch: store logos, avatars, covers, banners, remote backend media.
Give each one explicit `width`/`height`, or `fill` inside a sized, positioned
parent. Keep `alt` meaningful; `alt=""` only for purely decorative art.

When the source host isn't listed in `images.remotePatterns` in
[next.config.ts](next.config.ts) — and can't be added — pass `unoptimized`
rather than dropping back to `<img>`. A plain `<img>` is a last resort, not a
shortcut around sizing props.

Existing `<img>` tags in older files are fine where they are; convert them when
you're already reworking that screen, not as a standalone cleanup.

## Colors / design tokens

All colors live in [src/app/globals.css](src/app/globals.css) as CSS custom properties, mirrored into Tailwind's `@theme inline` block so both `var(--token)` and Tailwind utilities (`bg-c2-navy-900`, `text-c2-danger`, ...) work.

There are two generations of tokens in that file:

- **Legacy tokens** — `--blue-*`, `--gray-*`, `--red-*`, `--black-1`, `--white-1`, `--gold-1`, plus the shadcn `--primary`/`--secondary`/`--muted`/etc. set. Inconsistent naming, some duplicate values. Still used throughout the existing UI — don't touch them just to "clean up"; they get refactored screen-by-screen separately.
- **`--c2-*` tokens** — the new, going-forward color system (added 2026-08-19). Organized as numbered scales per hue family (`navy-950`…`navy-300`, `red-800`…`red-400`, `neutral-*`) plus semantic aliases (`--c2-primary`, `--c2-danger`, `--c2-warning`, `--c2-success`). Full mapping and rationale are in the `:root` block comments in globals.css.

**Rule: use `--c2-*` for all new or changed UI.** If a task calls for a color that isn't already a `--c2-*` token (a new brand color, a one-off accent, etc.):

1. Add it to `:root` in globals.css under the `NEW COLOR SYSTEM (c2)` section first, following the existing naming scheme (hue family + numbered scale, or a semantic alias if it's a status color).
2. Mirror it into the `@theme inline` block as `--color-c2-<name>: var(--c2-<name>);`.
3. Only then use it in components.

Never invent a one-off hex value inline in a component or add a new legacy-style (`--blue-N`) token — new colors always go through the `c2` system.
