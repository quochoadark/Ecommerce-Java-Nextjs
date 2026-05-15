---
name: springboot-verification
description: Verification loop for Spring Boot projects before PRs and deployments.
origin: ECC
---

# Spring Boot Verification Loop

Run **before PRs**, after major changes, và pre-deploy.

## Phase 1: Build

```bash
mvn -T 4 clean verify -DskipTests
# If build fails, STOP and fix.
```

## Phase 2: Static Analysis

```bash
mvn -T 4 spotbugs:check pmd:check checkstyle:check
```

## Phase 3: Tests + Coverage

```bash
mvn -T 4 test
mvn jacoco:report   # verify 80%+ line coverage
```

## Phase 4: Security Scan

```bash
# Dependency CVEs
mvn org.owasp:dependency-check-maven:check

# Secrets in source
grep -rn "password\s*=\s*\"" src/ --include="*.java" --include="*.yml"
grep -rn "sk-\|api_key\|secret" src/ --include="*.java" --include="*.yml"

# Bad practices
grep -rn "System\.out\.print" src/main/ --include="*.java"
grep -rn "e\.getMessage()" src/main/ --include="*.java"
grep -rn "allowedOrigins.*\*" src/main/ --include="*.java"
```

## Phase 5: Format

```bash
mvn spotless:apply   # if using Spotless plugin
```

## Phase 6: Diff Review

```bash
git diff --stat
git diff
```

**Checklist:**
- [ ] No debugging logs left (`System.out`, unguarded `log.debug`)
- [ ] Meaningful HTTP status codes
- [ ] Transactions and validation where needed
- [ ] Config changes documented

## Output Template

```
VERIFICATION REPORT
===================
Build:     [PASS/FAIL]
Static:    [PASS/FAIL] (spotbugs/pmd/checkstyle)
Tests:     [PASS/FAIL] (X/Y passed, Z% coverage)
Security:  [PASS/FAIL] (CVE findings: N)
Diff:      [X files changed]

Overall:   [READY / NOT READY]
```

**Remember**: Fast feedback beats late surprises. Treat warnings as defects.
