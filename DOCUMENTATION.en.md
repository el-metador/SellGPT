# Documentation

## Overview
The landing is built with React + TypeScript (Vite). Two page variants are available:
- `index.html` — base version.
- `index-sales.html` — sales version with more aggressive copy.

Both versions include:
- Telegram auto‑redirect (countdown + cancel button);
- lead form that auto‑generates a Telegram message;
- openai/chatgpt‑style typography;
- animations (background orbs, shimmer, reveal, typing terminal).

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Main settings
### Telegram URL
In `src/App.tsx`:
```
const TELEGRAM_URL = "https://t.me/imnotsheikh";
```

### Redirect timer
```
const REDIRECT_SECONDS = 12;
```

### Disable auto‑redirect
You can:
- remove the `redirect-banner` component;
- skip the redirect effect in `App`.

### Lead form
The form collects:
- name
- Telegram handle
- seats
- company (optional)
- goals (optional)

On submit it opens Telegram with a prefilled message.

## Where to edit copy
All copy is in `src/App.tsx` (the `VARIANT_COPY` object).

## Animations
- `drift` — background orb motion.
- `pulse` — status indicator.
- `shimmer` — model chip highlight.
- `reveal` — scroll reveal for cards.
- typing terminals via `useTypingEffect` hook.

## CSS
All styles in `src/styles.css`:
- tokens/palette in `:root`
- layout blocks `hero`, `pricing`, `card`, `terminal`
- responsive rules in `@media (max-width: 900px)`

## Recommendations
- Add A/B toggles via query param if needed.
- Send form data to CRM before opening Telegram.

