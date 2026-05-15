# Backend Rules — Java / Spring Boot

> **Scope**: Áp dụng cho tất cả Java code trong `backend/backend-ecommerce/`
> **Tổng hợp từ**: `coding-style.md`, `patterns.md`, `security.md`, `testing.md`, `hooks.md`

---

## 1. Java Coding Style

> Applies to `**/*.java`

### Formatting

- **google-java-format** hoặc **Checkstyle** (Google/Sun style) để enforce
- One public top-level type per file
- Consistent indent: **4 spaces** (Spring Boot convention)
- Member order: constants → fields → constructors → public methods → protected → private

### Immutability

Prefer `record` for value types (Java 16+). Mark fields `final` by default:

```java
// GOOD — immutable value type
public record OrderSummary(Long id, String customerName, BigDecimal total) {}

// GOOD — final fields, defensive copy
public class Order {
    private final Long id;
    private final List<LineItem> items;

    public List<LineItem> getItems() {
        return List.copyOf(items);  // defensive copy
    }
}
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Classes, Records, Enums | `PascalCase` | `OrderService`, `OrderSummary` |
| Methods, fields, params | `camelCase` | `findById`, `customerName` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_PAGE_SIZE` |
| Packages | all lowercase, reverse domain | `com.ecommerce.backend_ecommerce.order` |

### Modern Java Features (Java 17+)

```java
// Records for DTOs
public record CreateOrderRequest(@NotBlank String customerName, @NotNull BigDecimal amount) {}

// Pattern matching instanceof
if (shape instanceof Circle c) {
    return Math.PI * c.radius() * c.radius();
}

// Switch expression
String label = switch (status) {
    case ACTIVE -> "Active";
    case SUSPENDED -> "Suspended";
    case CLOSED -> "Closed";
};

// Text blocks for SQL/JSON
String sql = """
    SELECT * FROM orders
    WHERE status = :status
    ORDER BY created_at DESC
    """;
```

### Optional Usage

```java
// GOOD — orElseThrow
return repository.findById(id)
    .map(ResponseDto::from)
    .orElseThrow(() -> new OrderNotFoundException(id));

// BAD — never use Optional as field or parameter
public void process(Optional<String> name) {}  // WRONG
```

### Error Handling

```java
// Domain-specific unchecked exceptions
public class OrderNotFoundException extends RuntimeException {
    public OrderNotFoundException(Long id) {
        super("Order not found: id=" + id);
    }
}

// Service level — catch only what you can handle
try {
    return orderService.findById(id);
} catch (OrderNotFoundException ex) {
    log.warn("Order not found: id={}", id);
    return ApiResponse.error("Resource not found");
} catch (Exception ex) {
    log.error("Unexpected error processing order id={}", id, ex);
    return ApiResponse.error("Internal server error");
}
```

### Streams

```java
// GOOD — short pipeline (max 3-4 ops), method references
List<String> names = orders.stream()
    .filter(o -> o.getStatus() == ACTIVE)
    .map(Order::getCustomerName)
    .toList();

// AVOID complex nested streams — prefer loops for clarity
```

---

## 2. Design Patterns

### Repository Pattern

```java
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    Optional<Order> findById(Long id);
    List<Order> findByStatus(OrderStatus status);
}
```

### Service Layer

```java
@Service
public class OrderService {
    private final OrderRepository orderRepository;

    // Constructor injection — ALWAYS
    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Transactional
    public OrderSummary placeOrder(CreateOrderRequest request) {
        var order = Order.from(request);
        var saved = orderRepository.save(order);
        return OrderSummary.from(saved);
    }
}
```

### Constructor Injection (MUST)

```java
// GOOD — testable, immutable
public class NotificationService {
    private final EmailSender emailSender;

    public NotificationService(EmailSender emailSender) {
        this.emailSender = emailSender;
    }
}

// BAD — field injection, avoid
public class NotificationService {
    @Autowired  // NEVER do this
    private EmailSender emailSender;
}
```

### DTO Mapping

```java
// Use records for DTOs, map at controller/service boundaries
public record OrderResponse(Long id, String customer, BigDecimal total) {
    public static OrderResponse from(Order order) {
        return new OrderResponse(order.getId(), order.getCustomerName(), order.getTotal());
    }
}
```

### API Response Envelope

```java
public record ApiResponse<T>(boolean success, T data, String error) {
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, null);
    }
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, null, message);
    }
}
```

---

## 3. Security Rules

> Applies to `**/*.java`

### Secrets Management — HARD RULE

```java
// BAD — NEVER hardcode secrets
private static final String API_KEY = "sk-abc123...";

// GOOD — environment variable
String apiKey = System.getenv("PAYMENT_API_KEY");
Objects.requireNonNull(apiKey, "PAYMENT_API_KEY must be set");
```

### SQL Injection Prevention

```java
// BAD — string concatenation = SQL injection
String sql = "SELECT * FROM orders WHERE name = '" + name + "'";

// GOOD — JPQL with named parameter
@Query("SELECT o FROM Order o WHERE o.customerName = :name")
List<Order> findByName(@Param("name") String name);

// GOOD — Spring Data derived query (auto-parameterized)
List<Order> findByCustomerNameAndStatus(String name, OrderStatus status);
```

### Input Validation

```java
// Always validate at system boundaries
public record CreateOrderRequest(
    @NotBlank @Size(max = 100) String customerName,
    @NotNull @DecimalMin("0.01") BigDecimal amount
) {}

@PostMapping("/orders")
public ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(orderService.create(request));
}
```

### Authentication & Authorization

- Never implement custom crypto — use established libraries
- Store passwords with **BCrypt** (cost 12) or Argon2, never MD5/SHA1
- Enforce authorization at service boundaries with `@PreAuthorize`
- Clear sensitive data from logs — never log passwords, tokens, or PII

### Error Messages (Security)

```java
// Log detail server-side, return generic message to client
log.error("Unexpected error: orderId={}", id, ex);
return ApiResponse.error("Internal server error");  // never expose ex.getMessage()
```

---

## 4. Testing Rules

### Test Framework Stack

- **JUnit 5** — `@Test`, `@ParameterizedTest`, `@Nested`, `@DisplayName`
- **AssertJ** — `assertThat(result).isEqualTo(expected)`
- **Mockito** — mocking dependencies
- **Testcontainers** — integration tests with real databases

### Test Organization

```
src/test/java/com/ecommerce/backend_ecommerce/
  {module}/
    service/           # Unit tests for service layer
    controller/        # Web layer / API tests (@WebMvcTest)
    repository/        # Data access tests (@DataJpaTest)
    integration/       # Cross-layer integration tests
```

### Unit Test Pattern (AAA)

```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    @Mock private OrderRepository orderRepository;
    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(orderRepository);
    }

    @Test
    @DisplayName("findById returns order when exists")
    void findById_existingOrder_returnsOrder() {
        // Arrange
        var order = new Order(1L, "Alice", BigDecimal.TEN);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        // Act
        var result = orderService.findById(1L);

        // Assert
        assertThat(result.customerName()).isEqualTo("Alice");
        verify(orderRepository).findById(1L);
    }
}
```

### Test Naming Convention

- Method name: `methodName_scenario_expectedBehavior()`
- Use `@DisplayName("human-readable description")` for reports

### Coverage Target

- **80%+** line coverage (JaCoCo)
- Focus on service and domain logic
- Skip trivial getters/config classes

---

## 5. Hooks (PostToolUse)

Configure in `~/.claude/settings.json` hoặc `.claude/settings.local.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "google-java-format --replace $FILE_PATH",
        "description": "Auto-format Java files"
      },
      {
        "matcher": "Write|Edit",
        "command": "./mvnw compile -q",
        "description": "Verify compilation after changes"
      }
    ]
  }
}
```

**Files**: `.java`, `pom.xml`, `build.gradle`, `build.gradle.kts`
