# Mohit Industries — Production Deployment & Database Migration Guide

This guide details the procedures for database migration, schema initialization, connection pooling setup, and database seeding when deploying the application to production (e.g., Vercel and Neon PostgreSQL).

---

## 1. Database Connection Pooling Concepts

Serverless environments like Vercel open and close database connections rapidly, which can quickly exhaust PostgreSQL's connection limits. To resolve this, Neon provides two types of endpoints:

1. **Pooled Connection URL (`DATABASE_URL`):**
   * Configured to point to Neon's connection pooler endpoint (hostname usually ends with `-pooler`).
   * Used for standard application queries in Next.js Server Actions and Route Handlers.
   * Keeps connections active and pools them across serverless function invocations.

2. **Direct Connection URL (`DIRECT_URL`):**
   * Configured to point directly to the database instance.
   * Used for administrative commands and schema migrations (`prisma migrate`).
   * *Note:* Connection poolers do not support schema migrations because Prisma needs to lock system tables and execute transactions that cannot be pooled.

---

## 2. Prerequisites & Configuration

Before deploying, ensure the following environment variables are configured in your production hosting environment (e.g., Vercel Project Settings → Environment Variables):

```bash
# Neon Transaction Pooler URL (usually ends with -pooler)
DATABASE_URL="postgresql://user:password@ep-cool-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Direct Neon Host URL (for migrations)
DIRECT_URL="postgresql://user:password@ep-cool.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

In [`schema.prisma`](file:///c:/Users/abhay/OneDrive/Desktop/mohit%20industruies/prisma/schema.prisma), the datasource block must declare both:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## 3. Step-by-Step Deployment Workflow

When pushing changes or setting up a new production database, follow this sequence:

### Step A: Generate Prisma Client
Generates the localized type-safe database client representing the latest schema definitions. This should run in your build step before building the Next.js bundle.

```bash
npx prisma generate
```

### Step B: Deploy Schema Migrations
Applies all pending migrations from the `prisma/migrations` folder to the target database.
* **Why `migrate deploy`?** Unlike `migrate dev`, `migrate deploy` applies migrations safely in production without resetting the database or prompting for interactive input.
* **Note:** This automatically utilizes `DIRECT_URL` to circumvent the transaction pooler restriction.

```bash
npx prisma migrate deploy
```

### Step C: Seed Default Production Data
Seeds initial essential data into the database (such as roles: `ADMIN`, `EDITOR`, `VIEWER`, along with default authorization permissions and critical system settings).

```bash
npx prisma db seed
```

---

## 4. Automation in CI/CD or Build Command

To automate this on Vercel, combine these steps into your project's custom build command in Vercel settings under **Build & Development Settings**:

* **Framework Preset:** Next.js
* **Build Command:**
  ```bash
  npx prisma generate && npx prisma migrate deploy && npx prisma db seed && next build
  ```

---

## 5. Troubleshooting & FAQ

#### The migration command fails with a "Transaction query is not supported" error
* **Reason:** You are attempting to run `npx prisma migrate deploy` using a connection pooler URL in `DATABASE_URL` without defining `DIRECT_URL`.
* **Fix:** Ensure `DIRECT_URL` is set in the environment and `directUrl = env("DIRECT_URL")` is present in your `schema.prisma`.

#### Does `prisma db seed` overwrite existing product or user data?
* **Reason:** The seed script is designed to be idempotent. It checks if roles (`ADMIN`, `EDITOR`, `VIEWER`) and settings already exist before inserting them. It will not delete or overwrite your active products or inquiries.
