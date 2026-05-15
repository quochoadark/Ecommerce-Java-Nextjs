---
name: backend-patterns
description: General backend patterns for REST API, database optimization, caching, auth, and error handling.
origin: ECC
---

# Backend Development Patterns (General)

## API Design

```
GET    /api/products          # List with filtering
GET    /api/products/:id      # Get single
POST   /api/products          # Create
PUT    /api/products/:id      # Replace
PATCH  /api/products/:id      # Partial update
DELETE /api/products/:id      # Delete

# Query params
GET /api/products?category=electronics&sort=price&page=0&size=20
```

## Repository Pattern

```java
// Spring Data JPA
public interface ProductRepository extends JpaRepository<ProductEntity, Long> {
    Page<ProductEntity> findByCategoryAndStockGreaterThan(
        String category, int minStock, Pageable pageable);
}
```

## N+1 Query Prevention

```java
// BAD: N+1 queries
List<Order> orders = orderRepo.findAll();
for (Order o : orders) {
    User user = userRepo.findById(o.getUserId()); // N extra queries!
}

// GOOD: Join fetch in JPQL
@Query("SELECT o FROM Order o JOIN FETCH o.user WHERE o.status = :status")
List<Order> findWithUsers(@Param("status") OrderStatus status);

// GOOD: EntityGraph
@EntityGraph(attributePaths = {"user", "items"})
List<Order> findByStatus(OrderStatus status);
```

## Caching (Redis / Spring Cache)

```java
@Cacheable(value = "products", key = "#id")
public Product getById(Long id) { ... }

@CacheEvict(value = "products", key = "#id")
public void deleteProduct(Long id) { ... }

@CachePut(value = "products", key = "#result.id()")
public Product updateProduct(Long id, UpdateRequest req) { ... }
```

## Error Handling

```java
// Centralized in @ControllerAdvice
@ExceptionHandler(ProductNotFoundException.class)
ResponseEntity<ApiError> handleNotFound(ProductNotFoundException ex) {
    return ResponseEntity.status(404).body(ApiError.of(ex.getMessage()));
}

// API response envelope
record ApiError(String error, int status, Instant timestamp) {
    static ApiError of(String error) {
        return new ApiError(error, 404, Instant.now());
    }
}
```

## Pagination

```java
// Standard paginated response
Page<ProductResponse> page = productService.list(PageRequest.of(0, 20));
// Returns: { content: [...], totalElements: 100, totalPages: 5, ... }
```

## JWT Auth Pattern

```java
// Validate in filter, set authentication context
String token = header.substring(7); // Remove "Bearer "
Authentication auth = jwtService.authenticate(token);
SecurityContextHolder.getContext().setAuthentication(auth);
```

## Retry with Exponential Backoff

```java
public <T> T withRetry(Supplier<T> supplier, int maxRetries) {
    for (int i = 0; i < maxRetries; i++) {
        try { return supplier.get(); }
        catch (Exception ex) {
            if (i == maxRetries - 1) throw ex;
            Thread.sleep((long) Math.pow(2, i) * 1000L);
        }
    }
    throw new RuntimeException("Unreachable");
}
```
