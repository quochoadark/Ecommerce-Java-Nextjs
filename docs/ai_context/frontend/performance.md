> This file extends common performance guidance with web-specific content.

# Web Performance Rules

## Core Web Vitals Targets

| Metric | Target |
|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s |
| INP (Interaction to Next Paint)| < 200ms |
| CLS (Cumulative Layout Shift)  | < 0.1 |
| FCP (First Contentful Paint)   | < 1.5s |
| TBT (Total Blocking Time)      | < 200ms |

## Bundle Budget

| Page Type | JS Budget (gzipped) | CSS Budget |
|-----------|---------------------|------------|
| Landing page | < 150kb | < 30kb |
| App page | < 300kb | < 50kb |
| Microsite | < 80kb | < 15kb |

## Loading Strategy

1. Inline critical above-the-fold CSS khi hợp lý.
2. Preload **hero image** và **primary font** (chỉ preload những resource này).
3. Defer non-critical CSS hoặc JS.
4. Dynamically import heavy libraries:

```js
const gsapModule = await import('gsap');
const { ScrollTrigger } = await import('gsap/ScrollTrigger');
```

## Image Optimization

- Luôn cung cấp `width` và `height` rõ ràng
- `loading="eager"` + `fetchpriority="high"` cho hero media (above the fold)
- `loading="lazy"` cho below-the-fold assets
- Ưu tiên **AVIF** hoặc **WebP** với fallbacks
- KHÔNG BAO GIỜ ship source images với kích thước quá lớn so với rendered size

## Font Loading

- Tối đa **2 font families** trừ khi có lý do thật đặc biệt
- `font-display: swap`
- Subset font khi có thể
- Chỉ preload những weight/style **thực sự cần thiết** (critical)

## Animation Performance

- Chỉ animate các **compositor-friendly properties** (`transform`, `opacity`)
- Sử dụng `will-change` một cách tiết kiệm và loại bỏ nó khi animate xong
- Ưu tiên CSS cho các simple transitions
- Sử dụng `requestAnimationFrame` hoặc established animation libraries (GSAP, Framer Motion) cho JS motion
- Tránh scroll handler churn; sử dụng `IntersectionObserver` hoặc thư viện được tối ưu tốt

## Performance Checklist

- [ ] Tất cả images đều có explicit dimensions (width/height)
- [ ] Không có accidental render-blocking resources
- [ ] Không có layout shifts (CLS) từ dynamic content
- [ ] Motion chỉ nằm trên các compositor-friendly properties
- [ ] Third-party scripts (analytics, tracking) load async/defer và chỉ khi cần thiết
