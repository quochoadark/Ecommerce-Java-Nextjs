# AI Context Router — Webbanhang1

Đây là **Global Router** cho AI assistant khi làm việc với dự án Webbanhang1.
Khi nhận một task, AI **PHẢI** đọc router này trước, rồi load đúng context cần thiết.

---

## 1. Global Rules (Luôn Áp Dụng)

Những rules này **bắt buộc** áp dụng cho MỌI task:

| File | Mục đích |
|------|---------|
| `shared/architect.md` | System design, kiến trúc, trade-off analysis |
| `shared/code-architect.md` | Blueprint implementation chi tiết |

---

## 2. Routing theo Task — Backend (Java/Spring Boot)

Khi task liên quan đến `backend/backend-ecommerce/`:

```
IF task liên quan Java code bất kỳ
  → ĐỌC backend/backend_rules.md
    (coding style, patterns, security, testing tổng hợp)

IF task liên quan REST API / Controller / Service / Repository
  → THÊM backend/springboot_patterns.md

IF task liên quan Security / Auth / JWT / CORS / Password
  → THÊM backend/springboot_security.md

IF task liên quan Testing / TDD / JUnit / Mockito
  → THÊM backend/springboot_tdd.md

IF task liên quan Database / Entity / JPA / Migration / Flyway
  → THÊM backend/database_migrations.md

IF task liên quan Docker / Docker Compose / Containerization
  → THÊM backend/docker_patterns.md

IF task liên quan Domain Design / Module mới phức tạp
  → THÊM backend/hexagonal_architecture.md

IF cần verification trước PR / deploy
  → THÊM backend/springboot_verification.md
```

---

## 3. Routing theo Task — Frontend (Next.js/React)

Khi task liên quan đến `front-end/front-end-ecommerce/`:

```
IF task liên quan React / TypeScript / Next.js code bất kỳ
  → ĐỌC frontend/frontend_rules.md
    (coding style, patterns, security, testing tổng hợp)

IF task liên quan Component design / UI patterns / State management
  → THÊM frontend/frontend_patterns.md

IF task liên quan UI/UX / Design / Visual quality
  → THÊM frontend/design_quality.md

IF task liên quan Performance / Core Web Vitals / Bundle size
  → THÊM frontend/performance.md

IF task liên quan Next.js config / Turbopack / Build optimization
  → THÊM frontend/nextjs_turbopack.md

IF cần ghi lại quyết định kiến trúc quan trọng
  → THÊM frontend/architecture_decisions.md
```

---

## 4. Ưu Tiên Đọc Context

```
1. Đọc 00-router.md (file này)
2. Đọc shared/architect.md nếu cần system design
3. Đọc context layer tương ứng (backend/ hoặc frontend/)
4. Đọc skills chuyên biệt theo task
```

---

## 5. Project Structure Reference

```
Webbanhang1 AI agent/
├── backend/
│   └── backend-ecommerce/        ← Spring Boot app
│       └── src/main/java/com/ecommerce/backend_ecommerce/
│           ├── auth/             ← Authentication module
│           ├── user/             ← User management module
│           └── ...
├── front-end/
│   └── front-end-ecommerce/      ← Next.js app
│       └── src/
│           ├── app/              ← App Router pages
│           ├── components/       ← React components
│           └── ...
├── docs/
│   └── ai_context/               ← AI context (thư mục này)
└── mcp-server/                   ← MCP server (tự động hóa context)
```
