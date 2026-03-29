# Family Tree+ — Architecture Documentation

## Overview

**family-tree+** is a Next.js 14 (App Router) web application for managing Vietnamese family genealogy trees. It is SEO-friendly, responsive, accessible, and supports multi-language (EN/VI).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Tree Visualization | @xyflow/react (React Flow) |
| i18n | next-intl |
| API Client | Axios |
| Icons | Lucide React |
| Utilities | clsx, tailwind-merge |

---

## Folder Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth route group (no layout header)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (main)/                 # Main app route group (with layout)
│   │   ├── layout.tsx          # Sidebar + Header layout
│   │   ├── home/
│   │   │   └── page.tsx
│   │   ├── account/
│   │   │   └── page.tsx
│   │   └── tree/
│   │       └── [treeId]/
│   │           └── page.tsx
│   ├── welcome/
│   │   └── page.tsx
│   ├── layout.tsx              # Root layout (providers, fonts, metadata)
│   ├── not-found.tsx
│   └── page.tsx                # Redirect to /welcome or /home
│
├── components/                 # Reusable UI components
│   ├── ui/                     # Primitive design system components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Select/
│   │   ├── Modal/
│   │   ├── Alert/
│   │   ├── Confirm/
│   │   └── Table/
│   ├── tree/                   # Family tree specific components
│   │   ├── FamilyTreeCanvas/
│   │   ├── NodeChip/
│   │   ├── RelationshipModal/
│   │   └── AddRelationshipFlow/
│   └── layout/
│       ├── Header/
│       ├── Sidebar/
│       └── PageWrapper/
│
├── core/                       # Business logic, independent from UI
│   ├── api/
│   │   ├── client.ts           # Axios instance + interceptors
│   │   ├── auth.api.ts
│   │   └── tree.api.ts
│   ├── store/
│   │   ├── auth.store.ts       # Zustand auth slice
│   │   └── tree.store.ts       # Zustand tree slice
│   └── validation/
│       ├── tree.validation.ts
│       └── relationship.validation.ts
│
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts
│   ├── useFamilyTree.ts
│   ├── useI18n.ts
│   └── useRelationship.ts
│
├── lib/                        # Pure utility functions / config
│   ├── relationship/
│   │   ├── analyzer.ts         # Path finding + relationship analysis
│   │   └── address-resolver.ts # Vietnamese/English address terms
│   ├── cn.ts                   # clsx + tailwind-merge utility
│   └── utils.ts
│
├── types/                      # TypeScript interfaces / types
│   ├── auth.types.ts
│   ├── tree.types.ts
│   └── relationship.types.ts
│
└── styles/
    ├── globals.css             # Tailwind base + custom properties
    └── tokens.css              # Design tokens (CSS variables)

locales/
├── en.json
└── vi.json

docs/
├── architecture.md             # This file
├── components-api.md
├── folder-structure.md
├── relationship-analysis.md
└── validation-rules.md

public/
└── icons/
```

---

## Patterns & Conventions

### Container / Presentational Pattern

- **Container**: handles data fetching, state, side-effects (e.g., `FamilyTreePage`)
- **Presentational**: pure rendering, props-driven (e.g., `FamilyTreeCanvas`)

### Custom Hooks

All business logic extracted into `hooks/` and `core/`. Components stay thin.

### Global Store (Zustand)

```ts
// Slices: auth.store.ts, tree.store.ts
// Each slice has: state, actions, selectors

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: async (credentials) => { ... },
  logout: () => set({ user: null }),
}));
```

### API Client Pattern

```ts
// core/api/client.ts
// - Base URL from env
// - Auth token injected via interceptor
// - Error normalization
```

### i18n Pattern

- `next-intl` with `[locale]` route prefix
- Fallback: `en` if translation key missing in `vi`
- Hook: `useI18n` wraps `useTranslations` with type safety

---

## SEO Strategy

- `generateMetadata()` per page with title, description
- Open Graph tags in root layout
- `sitemap.ts` + `robots.ts` at app root
- Semantic HTML: `<main>`, `<nav>`, `<header>`, `<section>`, `<article>`
- Alt text on all images

---

## Accessibility

- WAI-ARIA roles on interactive elements
- Focus management in modals
- Keyboard navigation in tree
- Color contrast ≥ 4.5:1 (WCAG AA)
- Skip-to-content link

---

## Responsive Breakpoints (Tailwind)

| Name | Min Width | Usage |
|---|---|---|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Wide desktop |
