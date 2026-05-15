---
name: springboot-security
description: Spring Security best practices for authn/authz, JWT, validation, CSRF, secrets, headers, rate limiting in Java Spring Boot.
origin: ECC
---

# Spring Boot Security

## When to Activate

- Adding authentication (JWT, OAuth2, session-based)
- Implementing authorization (`@PreAuthorize`, role-based access)
- Validating user input (Bean Validation, custom validators)
- Configuring CORS, CSRF, or security headers
- Managing secrets (environment variables, Vault)
- Adding rate limiting or brute-force protection

## Authentication (JWT)

```java
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
        FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            Authentication auth = jwtService.authenticate(token);
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        chain.doFilter(request, response);
    }
}
```

## Authorization

```java
// Enable method-level security in config
@EnableMethodSecurity

// In controllers
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public List<UserDto> listUsers() {
        return userService.findAll();
    }

    @PreAuthorize("@authz.isOwner(#id, authentication)")
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

## Input Validation

```java
// DTO with constraints
public record CreateUserDto(
    @NotBlank @Size(max = 100) String name,
    @NotBlank @Email String email,
    @NotBlank @Size(min = 8, max = 100) String password
) {}

// Controller with @Valid
@PostMapping("/users")
public ResponseEntity<UserDto> createUser(@Valid @RequestBody CreateUserDto dto) {
    return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(dto));
}
```

## SQL Injection Prevention

```java
// BAD: String concatenation
@Query(value = "SELECT * FROM users WHERE name = '" + name + "'", nativeQuery = true)

// GOOD: Parameterized
@Query(value = "SELECT * FROM users WHERE name = :name", nativeQuery = true)
List<User> findByName(@Param("name") String name);

// BEST: Spring Data derived query (auto-parameterized)
List<User> findByEmailAndEnabledTrue(String email);
```

## Password Encoding

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);  // cost factor 12
}

// In service
public User register(CreateUserDto dto) {
    String hashedPassword = passwordEncoder.encode(dto.password());
    return userRepository.save(new User(dto.email(), hashedPassword));
}
```

## Security Filter Chain Configuration

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
        .csrf(csrf -> csrf.disable())  // Stateless JWT API
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/api/public/**").permitAll()
            .anyRequest().authenticated()
        )
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
        .headers(headers -> headers
            .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'"))
            .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
            .xssProtection(Customizer.withDefaults())
        )
        .build();
}
```

## CORS Configuration

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of(
        "http://localhost:3000",           // dev
        "https://webbanhang.com"           // production
    ));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH"));
    config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    config.setAllowCredentials(true);
    config.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", config);
    return source;
}
```

## Secrets Management

```yaml
# BAD: Hardcoded in application.yml
spring:
  datasource:
    password: mySecretPassword123

# GOOD: Environment variable placeholder
spring:
  datasource:
    password: ${DB_PASSWORD}
  security:
    jwt:
      secret: ${JWT_SECRET}
      expiration: ${JWT_EXPIRATION_MS:86400000}
```

```java
// GOOD: Load from env in Java
String jwtSecret = System.getenv("JWT_SECRET");
Objects.requireNonNull(jwtSecret, "JWT_SECRET must be set");
```

## Rate Limiting (Bucket4j)

```java
@Component
public class RateLimitFilter extends OncePerRequestFilter {
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    private Bucket createBucket() {
        return Bucket.builder()
            .addLimit(Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1))))
            .build();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
        FilterChain chain) throws ServletException, IOException {
        String clientIp = request.getRemoteAddr();
        Bucket bucket = buckets.computeIfAbsent(clientIp, k -> createBucket());

        if (bucket.tryConsume(1)) {
            chain.doFilter(request, response);
        } else {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.getWriter().write("{\"error\": \"Rate limit exceeded\"}");
        }
    }
}
```

## Dependency Security

```bash
# Dependency CVEs scan
mvn org.owasp:dependency-check-maven:check

# Secrets in source
grep -rn "password\s*=\s*\"" src/ --include="*.java" --include="*.yml"
```

## Logging và PII

```java
// NEVER log passwords, tokens, or PII
log.info("User login attempt: email={}", email);  // GOOD
log.info("User login: email={} password={}", email, password);  // NEVER!

// Redact sensitive fields in structured logging
log.info("Payment processed: orderId={} amount={}", orderId, amount);
// NOT: log.info("Payment: card={}", cardNumber);
```

## Pre-Release Security Checklist

- [ ] Auth tokens validated and expired correctly
- [ ] Authorization guards on every sensitive endpoint
- [ ] All inputs validated with `@Valid`
- [ ] No string-concatenated SQL
- [ ] CSRF disabled (stateless JWT) or enabled correctly
- [ ] Secrets externalized via environment variables
- [ ] Security headers configured
- [ ] Rate limiting on auth endpoints
- [ ] Dependencies scanned (OWASP Dependency Check)
- [ ] Logs free of sensitive data (no passwords, tokens, PAN)

**Remember**: Deny by default, validate all inputs, principle of least privilege, secure-by-configuration.
