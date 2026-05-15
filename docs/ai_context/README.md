# AI Context — Webbanhang1

Thư mục này chứa toàn bộ bối cảnh (context), rules, và kỹ năng (skills) cho AI assistant khi làm việc với dự án **Webbanhang1** (E-commerce full-stack).

> Đây là nguồn chân lý duy nhất (single source of truth) cho AI context, thay thế cho các thư mục `.agents` cũ ở `backend/` và `front-end/`.

---

## Cấu trúc Thư mục

```
docs/ai_context/
├── README.md                     ← File này — index & hướng dẫn
├── 00-router.md                  ← Global AI context router
│
├── shared/                       ← Context dùng chung cả backend & frontend
│   ├── architect.md              ← Kiến trúc hệ thống, system design
│   └── code-architect.md         ← Blueprint thiết kế tính năng
│
├── backend/                      ← Context cho Java Spring Boot backend
│   ├── backend_rules.md          ← Rules tổng hợp: coding-style, patterns, security, testing, hooks
│   ├── springboot_patterns.md    ← REST API, JPA, caching, async, logging
│   ├── springboot_security.md    ← JWT, CORS, input validation, secrets
│   ├── springboot_tdd.md         ← TDD: JUnit5, Mockito, MockMvc, Testcontainers
│   ├── springboot_verification.md← Verification loop: build, lint, test, security scan
│   ├── hexagonal_architecture.md ← Ports & Adapters (Hexagonal Architecture)
│   ├── java_coding_standards.md  ← Java 17+ coding standards
│   ├── database_migrations.md    ← Database migration patterns (Flyway, SQL)
│   ├── docker_patterns.md        ← Docker & Docker Compose patterns
│   └── backend_patterns.md       ← General backend patterns (TypeScript/Node.js ref)
│
└── frontend/                     ← Context cho Next.js/React frontend
    ├── frontend_rules.md         ← Rules tổng hợp: coding-style, patterns, security, testing, hooks
    ├── design_quality.md         ← Anti-template policy, design standards
    ├── performance.md            ← Core Web Vitals, bundle budgets
    ├── frontend_patterns.md      ← React/Next.js component patterns
    ├── nextjs_turbopack.md       ← Next.js 16+ & Turbopack
    └── architecture_decisions.md ← Architecture Decision Records (ADR)
```

---

## Hướng dẫn Sử dụng cho AI

### 1. Luôn Đọc Router Trước
Đọc `00-router.md` để biết cần load context nào cho task hiện tại.

### 2. Context Shared (Luôn Áp Dụng)
- `shared/architect.md` — khi thiết kế feature mới hoặc refactor lớn
- `shared/code-architect.md` — khi cần blueprint chi tiết cho implementation

### 3. Context Backend
- Task liên quan Java/Spring Boot → đọc `backend/backend_rules.md`
- Task liên quan REST API → thêm `backend/springboot_patterns.md`
- Task liên quan security/auth → thêm `backend/springboot_security.md`
- Task liên quan database → thêm `backend/database_migrations.md`
- Task liên quan Docker → thêm `backend/docker_patterns.md`
- Task liên quan testing → thêm `backend/springboot_tdd.md`

### 4. Context Frontend
- Task liên quan React/Next.js → đọc `frontend/frontend_rules.md`
- Task liên quan UI/design → thêm `frontend/design_quality.md`
- Task liên quan performance → thêm `frontend/performance.md`
- Task liên quan component patterns → thêm `frontend/frontend_patterns.md`

---

## Stack Công Nghệ

| Layer | Công nghệ |
|-------|-----------|
| **Backend** | Java 17+, Spring Boot 3.x, Spring Security (JWT) |
| **Frontend** | Next.js 16+, React, TypeScript, Turbopack |
| **Database** | PostgreSQL/MySQL, JPA/Hibernate, Flyway |
| **DevOps** | Docker, Docker Compose |
| **Testing** | JUnit5, Mockito, Testcontainers (BE) / Playwright (FE) |
