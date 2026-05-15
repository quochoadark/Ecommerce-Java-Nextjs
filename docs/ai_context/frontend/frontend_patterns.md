---
name: frontend-patterns
description: Frontend development patterns for React, Next.js, component architecture, state management, and custom hooks.
origin: ECC
---

# Frontend Development Patterns

## Component Architecture

### Compound Components
Chia nhỏ components phức tạp nhưng chia sẻ state qua Context.

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
- **Container**: Data fetching, side effects, state logic.
- **Presentational**: UI thuần, nhận props, stateless (hoặc chỉ UI state).

## Custom Hooks Patterns

### Async Data Fetching
```typescript
export function useQuery<T>(key: string, fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    fetcher()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [key])

  return { data, loading, error }
}
```

### Debounce Hook
```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
```

## State Management

- **Server State**: SWR, TanStack Query (Nên ưu tiên)
- **Client State**: Zustand, Jotai, `useState`, `useReducer`
- **URL State**: Query parameters (Cho filtering, pagination)

## Performance Optimization

### Memoization
```tsx
// useMemo: Tính toán nặng
const sortedItems = useMemo(() => items.sort(), [items])

// useCallback: Pass function xuống child components
const handleAction = useCallback(() => doSomething(), [])

// React.memo: Pure component bị re-render nhiều
const MemoizedCard = React.memo(({ item }) => <Card item={item} />)
```

### Code Splitting
```tsx
import { lazy, Suspense } from 'react'

const HeavyChart = lazy(() => import('./HeavyChart'))

<Suspense fallback={<Skeleton />}>
  <HeavyChart data={data} />
</Suspense>
```

### Virtualization
Dùng `@tanstack/react-virtual` cho list dài > 100 items.

## Form Handling (Controlled with Validation)

```tsx
const validate = () => {
  const errors: Record<string, string> = {}
  if (!formData.name) errors.name = 'Required'
  setErrors(errors)
  return Object.keys(errors).length === 0
}
```

*(Nên ưu tiên dùng `react-hook-form` kết hợp `zod` cho form phức tạp).*

## Animations (Framer Motion)

```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <ModalContent />
    </motion.div>
  )}
</AnimatePresence>
```

## Accessibility (a11y)

- Hỗ trợ keyboard navigation (`Tab`, `Enter`, `Escape`, mũi tên).
- Dùng `aria-*` attributes (VD: `aria-expanded`, `aria-hidden`).
- Quản lý focus: Restore focus khi đóng Modal.
