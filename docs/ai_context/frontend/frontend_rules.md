# Frontend Rules — Next.js / React / TypeScript

> **Scope**: Áp dụng cho tất cả code trong `front-end/front-end-ecommerce/`
> **Tổng hợp từ**: `coding-style.md`, `patterns.md`, `security.md`, `testing.md`, `hooks.md`

---

## 1. Coding Style

### File Organization

Organize by feature or surface area, **not** by file type:

```text
src/
├── components/
│   ├── product-card/
│   │   ├── ProductCard.tsx
│   │   ├── ProductCardSkeleton.tsx
│   │   └── product-card.css
│   ├── cart/
│   │   ├── Cart.tsx
│   │   └── cart.css
│   └── ui/
│       ├── Button.tsx
│       └── Input.tsx
├── hooks/
│   ├── useCart.ts
│   └── useAuth.ts
├── lib/
│   └── api.ts
└── styles/
    ├── tokens.css
    └── global.css
```

### CSS Custom Properties (Design Tokens)

```css
:root {
  --color-surface: oklch(98% 0 0);
  --color-text: oklch(18% 0 0);
  --color-accent: oklch(68% 0.21 250);

  --text-base: clamp(1rem, 0.92rem + 0.4vw, 1.125rem);

  --space-section: clamp(4rem, 3rem + 5vw, 10rem);

  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Animation — Compositor-Friendly Only

```css
/* GOOD — compositor properties */
transform, opacity, clip-path, filter

/* BAD — causes layout recalculation */
width, height, top, left, margin, padding, font-size
```

### Semantic HTML

```html
<header>
  <nav aria-label="Main navigation">...</nav>
</header>
<main>
  <section aria-labelledby="hero-heading">
    <h1 id="hero-heading">...</h1>
  </section>
</main>
<footer>...</footer>
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | `PascalCase` | `ProductCard`, `CartSummary` |
| Hooks | `use` prefix | `useCart`, `useAuth` |
| CSS classes | `kebab-case` | `product-card`, `btn-primary` |
| Animation timelines | `camelCase` with intent | `heroRevealTl` |

---

## 2. Component Patterns

### Composition Over Inheritance

```tsx
// GOOD: Component composition
interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'outlined'
}

export function Card({ children, variant = 'default' }: CardProps) {
  return <div className={`card card-${variant}`}>{children}</div>
}
```

### Compound Components

```tsx
<Tabs defaultValue="overview">
  <Tabs.List>
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="overview">...</Tabs.Content>
</Tabs>
```

### Container / Presentational Split

- Container components: data loading, side effects, state
- Presentational components: receive props, render UI, stay pure
- Keep presentational components as pure as possible

### State Management

| Concern | Tooling |
|---------|---------|
| Server state | TanStack Query, SWR |
| Client state | Zustand, Jotai, useState |
| URL state | search params, route segments |
| Form state | React Hook Form |

```tsx
// GOOD: Prefer server state in TanStack Query
const { data: products, isLoading } = useQuery({
  queryKey: ['products'],
  queryFn: () => fetchProducts()
})

// BAD: Don't duplicate server state into client stores
const [products, setProducts] = useState([]) // avoid if TanStack Query is used
```

### URL As State

Persist shareable state in the URL:
- filters, sort order, pagination, active tab, search query

---

## 3. Data Fetching

### Stale-While-Revalidate

```tsx
// Return cached data immediately, revalidate in background
const { data } = useSWR('/api/products', fetcher)
```

### Optimistic Updates

```tsx
// Snapshot → Optimistic update → Rollback on failure
const mutation = useMutation({
  mutationFn: updateProduct,
  onMutate: async (newProduct) => {
    await queryClient.cancelQueries(['products'])
    const previousProducts = queryClient.getQueryData(['products'])
    queryClient.setQueryData(['products'], old => [...old, newProduct])
    return { previousProducts }
  },
  onError: (err, newProduct, context) => {
    queryClient.setQueryData(['products'], context.previousProducts)
  }
})
```

---

## 4. Security Rules

### Content Security Policy

```text
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{RANDOM}';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https:;
  connect-src 'self' http://localhost:8080 https://api.webbanhang.com;
  frame-src 'none';
  object-src 'none';
```

### XSS Prevention

```tsx
// NEVER inject unsanitized HTML
// BAD
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// GOOD — sanitize first if needed
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />
```

### Security Headers

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
```

### Forms Security

- CSRF protection on state-changing forms
- Validate both client-side AND server-side
- Rate limiting on submission endpoints

---

## 5. Testing Rules

### Priority Order

1. **Visual Regression** — screenshot key breakpoints: 320, 768, 1024, 1440
2. **Accessibility** — keyboard nav, reduced motion, color contrast
3. **Performance** — Lighthouse, Core Web Vitals
4. **Cross-Browser** — Chrome, Firefox, Safari
5. **Responsive** — 320, 375, 768, 1024, 1440, 1920

### E2E (Playwright)

```ts
import { test, expect } from '@playwright/test'

test('product page loads', async ({ page }) => {
  await page.goto('/products')
  await expect(page.locator('h1')).toBeVisible()
  await expect(page.locator('[data-testid="product-list"]')).toBeVisible()
})
```

### Unit Tests

- Test utilities, data transforms, and custom hooks
- Visual regression supplements coverage; does not replace
- Avoid flaky timeout-based assertions — use deterministic waits

---

## 6. Hooks (PostToolUse)

Configure in `~/.claude/settings.json` hoặc `.claude/settings.local.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "pnpm prettier --write \"$FILE_PATH\"",
        "description": "Format edited frontend files"
      },
      {
        "matcher": "Write|Edit",
        "command": "pnpm eslint --fix \"$FILE_PATH\"",
        "description": "Run ESLint on edited files"
      },
      {
        "matcher": "Write|Edit",
        "command": "pnpm tsc --noEmit --pretty false",
        "description": "Type-check after edits"
      }
    ],
    "Stop": [
      {
        "command": "pnpm build",
        "description": "Verify production build at session end"
      }
    ]
  }
}
```

### File Size Guard

Block writes exceeding 800 lines (split into modules instead):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "command": "node -e \"let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const i=JSON.parse(d);const c=i.tool_input?.content||'';const lines=c.split('\\n').length;if(lines>800){console.error('[Hook] BLOCKED: File exceeds 800 lines ('+lines+' lines)');process.exit(2)}console.log(d)})\""
      }
    ]
  }
}
```
