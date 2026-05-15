---
name: java-coding-standards
description: Java 17+ coding standards for Spring Boot services.
origin: ECC
---

# Java Coding Standards

## Core Principles
- Prefer clarity over cleverness
- Immutable by default; minimize shared mutable state
- Fail fast with meaningful exceptions
- Consistent naming and package structure

## Naming
```java
public class ProductService {}          // Classes: PascalCase
public record ProductDto(Long id) {}    // Records: PascalCase
private final ProductRepository repo;   // Fields: camelCase
private static final int MAX_SIZE = 100; // Constants: UPPER_SNAKE_CASE
// Packages: com.ecommerce.backend_ecommerce.product
```

## Immutability
```java
// Prefer records for DTOs
public record ProductDto(Long id, String name, BigDecimal price) {}

// Final fields, defensive copy
public List<LineItem> getItems() { return List.copyOf(items); }
```

## Optional Usage
```java
// Return Optional from finder methods
Optional<Product> product = repo.findBySlug(slug);

// Map/flatMap, never get() without isPresent()
return product.map(ProductResponse::from)
    .orElseThrow(() -> new ProductNotFoundException(slug));
```

## Streams
```java
// Short pipelines (3-4 ops), method references
List<String> names = products.stream()
    .filter(p -> p.getStock() > 0)
    .map(Product::getName)
    .toList();
```

## Exceptions
```java
// Domain-specific unchecked exceptions
public class ProductNotFoundException extends RuntimeException {
    public ProductNotFoundException(Long id) {
        super("Product not found: id=" + id);
    }
}
```

## Project Structure
```
src/main/java/com/ecommerce/backend_ecommerce/
  {module}/
    controller/  service/  repository/  domain/  dto/
src/main/resources/
  application.properties
src/test/java/...   (mirrors main structure)
```

## Code Smells to Avoid
- Long parameter lists → use DTOs/builders
- Deep nesting → early returns
- Magic numbers → named constants
- Static mutable state → dependency injection
- Silent catch blocks → log and rethrow

## Logging
```java
private static final Logger log = LoggerFactory.getLogger(ProductService.class);
log.info("fetch_product id={}", id);
log.error("product_fetch_failed id={}", id, ex);
```
