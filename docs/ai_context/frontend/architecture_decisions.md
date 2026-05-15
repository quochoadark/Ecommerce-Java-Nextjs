---
name: architecture-decision-records
description: Capture architectural decisions made during coding sessions as structured ADRs. Auto-detects decision moments, records context, alternatives considered, and rationale.
origin: ECC
---

# Architecture Decision Records (ADRs)

Ghi nhận các quyết định kiến trúc xảy ra trong quá trình dev thành các file văn bản có cấu trúc (ADR). Thay vì để quyết định nằm rải rác trong commit message hay PR, skill này giúp tạo document để dev sau này hiểu **tại sao** code lại được viết theo cách đó.

## When to Activate

- Khi có sự lựa chọn giữa các alternatives lớn (framework, thư viện, pattern, DB, API design).
- "Vì sao chúng ta lại dùng X thay vì Y?" (đọc ADR cũ).
- Khi planning và thảo luận các architectural trade-offs.

## Thư mục lưu trữ

```
docs/adr/
├── README.md              ← Index list các ADRs
├── 0001-use-nextjs-app-router.md
├── 0002-postgres-for-db.md
└── template.md            ← File template
```

## Format ADR (Michael Nygard)

```markdown
# ADR-NNNN: [Tiêu đề quyết định]

**Date**: YYYY-MM-DD
**Status**: proposed | accepted | deprecated | superseded by ADR-NNNN

## Context
[2-5 câu mô tả vấn đề, hoàn cảnh, constraint dẫn đến quyết định này]

## Decision
[1-3 câu nêu rõ quyết định đưa ra là gì]

## Alternatives Considered

### Alternative 1: [Tên]
- **Pros**: [Lợi ích]
- **Cons**: [Bất lợi]
- **Why not**: [Lý do cụ thể bị từ chối]

## Consequences (Hệ quả)

### Positive
- [Lợi ích 1]
- [Lợi ích 2]

### Negative
- [Trade-off 1]
- [Trade-off 2]
```

## Các loại Quyết định nên lưu

| Category | Ví dụ |
|----------|---------|
| **Technology** | Framework, language, database, cloud provider |
| **Architecture** | Monolith vs microservices, event-driven, CQRS |
| **API design** | REST vs GraphQL, versioning strategy, auth mechanism |
| **Data modeling**| Schema design, normalization, caching strategy |
| **Infrastructure**| Deployment model, CI/CD pipeline, monitoring |
| **Security** | Auth strategy, encryption, secret management |
| **Testing** | Test framework, coverage targets |

## Best Practices

- **Cụ thể**: "Dùng Prisma ORM" thay vì "Dùng 1 cái ORM"
- **Ghi lại 'Tại sao' (The Why)**: Lý do quan trọng hơn bản thân quyết định.
- **Bao gồm các lựa chọn bị loại**: Rất quan trọng để biết chúng ta đã cân nhắc cái gì.
- **Thực tế về Hệ quả (Consequences)**: Mọi quyết định đều có trade-offs (điểm trừ).
- **Ngắn gọn**: 1 ADR chỉ nên mất 2 phút để đọc.
- **Tránh các quyết định lặt vặt**: Tên biến, convention format code không cần ADR.
