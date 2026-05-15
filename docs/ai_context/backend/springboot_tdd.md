---
name: springboot-tdd
description: Test-driven development for Spring Boot using JUnit 5, Mockito, MockMvc, Testcontainers, and JaCoCo.
origin: ECC
---

# Spring Boot TDD Workflow

TDD guidance cho Spring Boot services với 80%+ coverage (unit + integration).

## When to Use

- New features hoặc endpoints
- Bug fixes hoặc refactors
- Adding data access logic hoặc security rules

## Workflow

1. Write tests first (they should **fail**)
2. Implement minimal code to **pass**
3. **Refactor** with tests green
4. Enforce **coverage** (JaCoCo 80%+)

## Unit Tests (JUnit 5 + Mockito)

```java
@ExtendWith(MockitoExtension.class)
class ProductServiceTest {
    @Mock ProductRepository repo;
    @InjectMocks ProductService service;

    @Test
    @DisplayName("findById returns product when exists")
    void findById_existingProduct_returnsProduct() {
        // Arrange
        var product = new ProductEntity(1L, "Phone", BigDecimal.valueOf(999));
        when(repo.findById(1L)).thenReturn(Optional.of(product));

        // Act
        var result = service.findById(1L);

        // Assert
        assertThat(result.name()).isEqualTo("Phone");
        verify(repo).findById(1L);
    }

    @Test
    @DisplayName("findById throws when not found")
    void findById_missingProduct_throws() {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(99L))
            .isInstanceOf(ProductNotFoundException.class)
            .hasMessageContaining("99");
    }

    @ParameterizedTest
    @CsvSource({
        "100.00, 10, 90.00",
        "50.00, 0, 50.00",
        "200.00, 25, 150.00"
    })
    @DisplayName("discount applied correctly")
    void applyDiscount(BigDecimal price, int pct, BigDecimal expected) {
        assertThat(PricingUtils.discount(price, pct)).isEqualByComparingTo(expected);
    }
}
```

## Web Layer Tests (MockMvc)

```java
@WebMvcTest(ProductController.class)
@WithMockUser(roles = "USER")
class ProductControllerTest {
    @Autowired MockMvc mockMvc;
    @MockBean ProductService productService;

    @Test
    @DisplayName("GET /api/products returns 200 with list")
    void getProducts_returnsOk() throws Exception {
        when(productService.list(any())).thenReturn(Page.empty());

        mockMvc.perform(get("/api/products"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("POST /api/products with valid body returns 201")
    void createProduct_validBody_returns201() throws Exception {
        var response = new ProductResponse(1L, "Phone", BigDecimal.valueOf(999), "Electronics");
        when(productService.create(any())).thenReturn(response);

        mockMvc.perform(post("/api/products")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"name":"Phone","description":"Smartphone","price":999.00,"category":"Electronics","stock":10}
            """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name").value("Phone"));
    }

    @Test
    @DisplayName("POST /api/products with invalid body returns 400")
    void createProduct_missingName_returns400() throws Exception {
        mockMvc.perform(post("/api/products")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""{"name":"","price":999.00}"""))
            .andExpect(status().isBadRequest());
    }
}
```

## Integration Tests (SpringBootTest)

```java
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProductIntegrationTest {
    @Autowired MockMvc mockMvc;

    @Test
    @DisplayName("Full create product flow")
    void createProduct_fullFlow_returnsCreatedProduct() throws Exception {
        mockMvc.perform(post("/api/products")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "name": "Test Phone",
                  "description": "A test smartphone",
                  "price": 599.00,
                  "category": "Electronics",
                  "stock": 50
                }
            """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").isNumber())
            .andExpect(jsonPath("$.name").value("Test Phone"));
    }
}
```

## Persistence Tests (DataJpaTest + Testcontainers)

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class ProductRepositoryTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired ProductRepository repo;

    @Test
    void savesAndFinds() {
        var entity = new ProductEntity();
        entity.setName("Test");
        entity.setPrice(BigDecimal.valueOf(99.99));
        repo.save(entity);

        var found = repo.findById(entity.getId());
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Test");
    }
}
```

## Coverage (JaCoCo)

Maven snippet trong `pom.xml`:
```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.14</version>
    <executions>
        <execution>
            <goals><goal>prepare-agent</goal></goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>verify</phase>
            <goals><goal>report</goal></goals>
        </execution>
        <execution>
            <id>check</id>
            <goals><goal>check</goal></goals>
            <configuration>
                <rules>
                    <rule>
                        <limits>
                            <limit>
                                <counter>LINE</counter>
                                <value>COVEREDRATIO</value>
                                <minimum>0.80</minimum>
                            </limit>
                        </limits>
                    </rule>
                </rules>
            </configuration>
        </execution>
    </executions>
</plugin>
```

## Assertions Best Practices

```java
// GOOD: AssertJ fluent
assertThat(result).isNotNull();
assertThat(result.name()).isEqualTo("Phone");
assertThat(result.price()).isEqualByComparingTo(BigDecimal.valueOf(999));

// GOOD: Exception assertions
assertThatThrownBy(() -> service.findById(99L))
    .isInstanceOf(ProductNotFoundException.class)
    .hasMessageContaining("99");

// For JSON responses in MockMvc
.andExpect(jsonPath("$.data.name").value("Phone"))
.andExpect(jsonPath("$.success").value(true))
```

## CI Commands

```bash
# Maven
mvn -T 4 test
mvn verify  # includes JaCoCo check

# Quick feedback loop
mvn -T 4 test -Dtest=ProductServiceTest
```

**Remember**: Keep tests fast, isolated, and deterministic. Test behavior, not implementation details.
