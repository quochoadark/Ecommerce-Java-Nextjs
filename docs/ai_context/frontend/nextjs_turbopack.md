---
name: nextjs-turbopack
description: Next.js 16+ and Turbopack — incremental bundling, FS caching, dev speed, and when to use Turbopack vs webpack.
origin: ECC
---

# Next.js and Turbopack

Next.js 16+ sử dụng **Turbopack** mặc định cho môi trường local development: một incremental bundler được viết bằng Rust giúp tăng tốc đáng kể thời gian khởi động (startup) và hot module replacement (HMR).

## When to Use

- **Turbopack (default dev)**: Sử dụng cho phát triển hàng ngày. Thời gian cold start và HMR nhanh hơn nhiều, đặc biệt là trong các app lớn.
- **Webpack (legacy dev)**: Chỉ sử dụng nếu bạn gặp bug với Turbopack hoặc phụ thuộc vào một plugin chỉ hỗ trợ webpack trong dev. Disable bằng cờ `--webpack` (hoặc `--no-turbopack` tùy version; hãy check tài liệu Next.js).
- **Production**: Hành vi build production (`next build`) có thể dùng Turbopack hoặc Webpack tùy vào phiên bản Next.js; hãy kiểm tra tài liệu chính thức.

Sử dụng khi: phát triển hoặc debug Next.js 16+ apps, khi cần chẩn đoán lỗi dev startup chậm/HMR chậm, hoặc khi tối ưu production bundles.

## How It Works

- **Turbopack**: Incremental bundler cho Next.js dev. Sử dụng file-system caching nên các lần restart nhanh hơn nhiều (vd: 5–14x trên project lớn).
- **Default in dev**: Từ Next.js 16, `next dev` chạy với Turbopack trừ khi bị disable.
- **File-system caching**: Các lần restart tái sử dụng kết quả (work) từ lần trước; cache thường nằm dưới thư mục `.next`; không cần config thêm cho việc sử dụng cơ bản.
- **Bundle Analyzer (Next.js 16.1+)**: Experimental Bundle Analyzer giúp kiểm tra output và tìm các dependencies nặng; bật thông qua config hoặc experimental flag.

## Commands

```bash
next dev      # Chạy dev server với Turbopack
next build    # Build production bundle
next start    # Chạy production server
```

## Best Practices

- Luôn dùng phiên bản Next.js 16.x mới nhất để có Turbopack và caching behavior ổn định nhất.
- Nếu dev bị chậm, hãy chắc chắn bạn đang dùng Turbopack (default) và cache không bị xóa một cách không cần thiết.
- Đối với vấn đề bundle size ở production, hãy dùng tool phân tích bundle (bundle analysis tooling) chính thức của Next.js tương ứng với phiên bản của bạn.
- Ưu tiên **App Router** và **Server Components** khi có thể để tối ưu JS bundle size đẩy xuống client.
