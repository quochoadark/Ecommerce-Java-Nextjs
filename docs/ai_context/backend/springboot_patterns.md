---
name: springboot-patterns
description: Spring Boot architecture patterns, REST API design, layered services, data access, caching, async processing, and logging. Use for Java Spring Boot backend work.
origin: ECC
---

# Spring Boot Development Patterns

Spring Boot architecture và API patterns cho scalable, production-grade services.

## When to Activate

- Building REST APIs với Spring MVC
- Structuring controller → service → repository layers
- Configuring Spring Data JPA, caching, hoặc async processing
- Adding validation, exception handling, hoặc pagination
- Setting up profiles cho dev/staging/production
- Implementing event-driven patterns với Spring Events

## REST API Structure

```java
@RestController
@RequestMapping("/api/products")
@Validated
class ProductController {
    private final ProductService productService;

    ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    ResponseEntity<Page<ProductResponse>> list(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
        Page<Product> products = productService.list(PageRequest.of(page, size));
        return ResponseEntity.ok(products.map(ProductResponse::from));
    }

    @PostMapping
    ResponseEntity<ProductResponse> create(@Valid @RequestBody CreateProductRequest request) {
        Product product = productService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ProductResponse.from(product));
    }

    @GetMapping("/{id}")
    ResponseEntity<ProductResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ProductResponse.from(productService.findById(id)));
    }

    @PutMapping("/{id}")
    ResponseEntity<ProductResponse> update(
        @PathVariable Long id,
        @Valid @RequestBody UpdateProductRequest request) {
        return ResponseEntity.ok(ProductResponse.from(productService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

## Repository Pattern (Spring Data JPA)

```java
public interface ProductRepository extends JpaRepository<ProductEntity, Long> {
    @Query("SELECT p FROM ProductEntity p WHERE p.category = :category ORDER BY p.createdAt DESC")
    Page<ProductEntity> findByCategory(@Param("category") String category, Pageable pageable);

    Optional<ProductEntity> findBySlug(String slug);

    boolean existsByName(String name);
}
```

## Service Layer với Transactions

```java
@Service
public class ProductService {
    private final ProductRepository repo;

    public ProductService(ProductRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public Product findById(Long id) {
        return repo.findById(id)
            .map(Product::from)
            .orElseThrow(() -> new ProductNotFoundException(id));
    }

    @Transactional
    public Product create(CreateProductRequest request) {
        if (repo.existsByName(request.name())) {
            throw new DuplicateProductException(request.name());
        }
        ProductEntity entity = ProductEntity.from(request);
        ProductEntity saved = repo.save(entity);
        return Product.from(saved);
    }

    @Transactional
    public Product update(Long id, UpdateProductRequest request) {
        ProductEntity entity = repo.findById(id)
            .orElseThrow(() -> new ProductNotFoundException(id));
        entity.update(request);
        return Product.from(repo.save(entity));
    }
}
```

## DTOs và Validation

```java
public record CreateProductRequest(
    @NotBlank @Size(max = 200) String name,
    @NotBlank @Size(max = 2000) String description,
    @NotNull @DecimalMin("0.01") BigDecimal price,
    @NotBlank String category,
    @Min(0) int stock
) {}

public record ProductResponse(Long id, String name, BigDecimal price, String category) {
    public static ProductResponse from(Product product) {
        return new ProductResponse(
            product.id(), product.name(), product.price(), product.category());
    }
}
```

## Exception Handling (GlobalExceptionHandler)

```java
@ControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(ApiError.validation(message));
    }

    @ExceptionHandler(ProductNotFoundException.class)
    ResponseEntity<ApiError> handleNotFound(ProductNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiError.of(ex.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ApiError> handleAccessDenied() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiError.of("Forbidden"));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiError> handleGeneric(Exception ex) {
        log.error("Unexpected error", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiError.of("Internal server error"));
    }
}
```

## Caching

Yêu cầu `@EnableCaching` trên configuration class:

```java
@Service
public class ProductCacheService {
    private final ProductRepository repo;

    @Cacheable(value = "product", key = "#id")
    public Product getById(Long id) {
        return repo.findById(id)
            .map(Product::from)
            .orElseThrow(() -> new ProductNotFoundException(id));
    }

    @CacheEvict(value = "product", key = "#id")
    public void evict(Long id) {}

    @CachePut(value = "product", key = "#result.id()")
    @Transactional
    public Product update(Long id, UpdateProductRequest request) {
        // ...
    }
}
```

## Async Processing

Yêu cầu `@EnableAsync` trên configuration class:

```java
@Service
public class EmailService {
    @Async
    public CompletableFuture<Void> sendOrderConfirmation(String email, Long orderId) {
        // send email
        return CompletableFuture.completedFuture(null);
    }
}
```

## Logging (SLF4J)

```java
@Service
public class OrderService {
    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    public Order createOrder(CreateOrderRequest request) {
        log.info("create_order customer={}", request.customerName());
        try {
            Order order = processOrder(request);
            log.info("order_created id={} customer={}", order.id(), request.customerName());
            return order;
        } catch (Exception ex) {
            log.error("create_order_failed customer={}", request.customerName(), ex);
            throw ex;
        }
    }
}
```

## Pagination và Sorting

```java
// Controller
@GetMapping
ResponseEntity<Page<ProductResponse>> list(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size,
    @RequestParam(defaultValue = "createdAt") String sortBy,
    @RequestParam(defaultValue = "desc") String direction) {

    Sort sort = direction.equalsIgnoreCase("desc")
        ? Sort.by(sortBy).descending()
        : Sort.by(sortBy).ascending();

    PageRequest pageable = PageRequest.of(page, size, sort);
    return ResponseEntity.ok(productService.list(pageable).map(ProductResponse::from));
}
```

## Request Logging Filter

```java
@Component
public class RequestLoggingFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
        FilterChain filterChain) throws ServletException, IOException {
        long start = System.currentTimeMillis();
        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - start;
            log.info("req method={} uri={} status={} durationMs={}",
                request.getMethod(), request.getRequestURI(),
                response.getStatus(), duration);
        }
    }
}
```

## Production Defaults

- Prefer constructor injection, avoid field injection
- Enable `spring.mvc.problemdetails.enabled=true` cho RFC 7807 errors (Spring Boot 3+)
- Configure HikariCP pool sizes, set timeouts
- Use `@Transactional(readOnly = true)` cho queries
- Enforce null-safety với `@NonNull` và `Optional`

**Remember**: Keep controllers thin, services focused, repositories simple, errors handled centrally.
