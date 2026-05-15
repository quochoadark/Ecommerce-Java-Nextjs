---
name: hexagonal-architecture
description: Design, implement, and refactor Ports & Adapters systems with clear domain boundaries.
origin: ECC
---

# Hexagonal Architecture (Ports & Adapters)

## When to Use
- Building new features where maintainability and testability matter
- Replacing infrastructure without rewriting business rules
- Supporting multiple interfaces (HTTP, CLI, queue workers)

## Package Layout (Spring Boot)

```
src/main/java/com/ecommerce/backend_ecommerce/
└── {module}/
    ├── domain/           # Business rules — NO framework imports
    ├── application/
    │   ├── port/
    │   │   ├── in/       # Inbound ports (interfaces)
    │   │   └── out/      # Outbound ports (interfaces)
    │   └── usecase/      # Use case implementations
    └── adapter/
        ├── in/web/       # HTTP controllers (inbound adapter)
        └── out/jpa/      # JPA repositories (outbound adapter)
```

## Key Rules
- Domain imports NOTHING external (no Spring, JPA, etc.)
- Adapters do all protocol/persistence mapping
- Use cases only know about port interfaces
- Composition root wires everything together

## Testing per Boundary
1. **Domain** — pure unit tests, zero mocks
2. **Use case** — unit test with in-memory fakes for ports
3. **Adapter** — integration test with real infra (Testcontainers)

## Migration (from layered to hexagonal)
1. Pick one endpoint slice with frequent pain
2. Extract use-case boundary (input/output types)
3. Introduce outbound ports around infra calls
4. Move business logic from service → use case
5. Repeat slice-by-slice — avoid full rewrites
