---
name: database-migrations
description: Database migration best practices for zero-downtime schema changes with Flyway/Liquibase.
origin: ECC
---

# Database Migration Patterns

Safe, reversible database schema changes for production systems.

## When to Activate
- Creating or altering database tables/entities
- Adding/removing columns or indexes
- Running data migrations (backfill, transform)
- Planning zero-downtime schema changes

## Core Principles
1. **Every change is a migration** — never alter production DBs manually
2. **Forward-only in production** — rollbacks use new forward migrations
3. **Schema and data migrations are separate** — never mix DDL and DML
4. **Migrations are immutable once deployed** — never edit deployed migrations

## Flyway (Spring Boot)

```yaml
# application.properties
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-on-migrate=true
```

```
src/main/resources/db/migration/
  V1__init_schema.sql
  V2__add_products_table.sql
  V3__add_product_category.sql
```

## SQL Migration Patterns

### Adding a Column Safely
```sql
-- GOOD: Nullable column, no lock
ALTER TABLE products ADD COLUMN image_url TEXT;

-- GOOD: With default (Postgres 11+ is instant)
ALTER TABLE products ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- BAD: NOT NULL without default on existing table (locks/rewrites)
ALTER TABLE products ADD COLUMN category TEXT NOT NULL; -- NEVER on large table
```

### Adding an Index Without Downtime
```sql
-- BAD: Blocks writes on large tables
CREATE INDEX idx_products_name ON products (name);

-- GOOD: Non-blocking
CREATE INDEX CONCURRENTLY idx_products_name ON products (name);
-- Note: Cannot run inside transaction block
```

### Renaming a Column (Zero-Downtime — Expand-Contract)
```sql
-- Step 1: Add new column
ALTER TABLE products ADD COLUMN product_name TEXT;

-- Step 2: Backfill data (separate migration)
UPDATE products SET product_name = name WHERE product_name IS NULL;

-- Step 3: Update app code to use new column, then deploy

-- Step 4: Drop old column (separate migration, after deploy)
ALTER TABLE products DROP COLUMN name;
```

### Large Data Migrations (Batching)
```sql
-- BAD: Updates all rows in one transaction (locks table)
UPDATE products SET normalized_name = LOWER(name);

-- GOOD: Batch update
DO $$
DECLARE
  batch_size INT := 10000;
  rows_updated INT;
BEGIN
  LOOP
    UPDATE products
    SET normalized_name = LOWER(name)
    WHERE id IN (
      SELECT id FROM products
      WHERE normalized_name IS NULL
      LIMIT batch_size
      FOR UPDATE SKIP LOCKED
    );
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    EXIT WHEN rows_updated = 0;
    COMMIT;
  END LOOP;
END $$;
```

## Zero-Downtime Strategy (Expand-Contract)

```
Phase 1: EXPAND
  - Add new column/table (nullable or with default)
  - App writes to BOTH old and new
  - Backfill existing data

Phase 2: MIGRATE
  - App reads from NEW, writes to BOTH
  - Verify data consistency

Phase 3: CONTRACT
  - App only uses NEW
  - Drop old column in separate migration
```

## Migration Safety Checklist

- [ ] No full table locks on large tables (use CONCURRENT ops)
- [ ] New NOT NULL columns have defaults or are added nullable first
- [ ] Indexes created CONCURRENTLY (not inline with ALTER on large tables)
- [ ] Data backfill is a separate migration from schema change
- [ ] Tested against production-sized data
- [ ] Rollback plan documented

## Anti-Patterns

| Anti-Pattern | Better Approach |
|-------------|-----------------|
| Manual SQL in production | Always use migration files |
| Editing deployed migrations | Create new migration instead |
| NOT NULL without default | Add nullable, backfill, then add constraint |
| Inline index on large table | `CREATE INDEX CONCURRENTLY` |
| Schema + data in one migration | Separate migrations |
| Dropping column before removing code | Remove code first |
