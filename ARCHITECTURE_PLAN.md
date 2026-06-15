# Next.js Enterprise Production Architecture Plan (Phase 3)

This architecture plan details the system structure, design patterns, database models, API routing layouts, subdomain middleware, and production deployment parameters for **Mohit Sales Corporation Pvt. Ltd.**.

---

## 1. Directory Structure Organization (Next.js 14+)

We structure the directory layout in `/src` to isolate core logic, components, APIs, and multi-language locales.

```text
src/
├── app/
│   ├── api/
│   │   ├── inquiries/
│   │   │   └── route.ts       # Enquiry submission endpoint (Prisma + SMTP nodemailer)
│   │   └── admin/
│   │       ├── products/      # Admin product CRUD handlers
│   │       └── categories/    # Admin category CRUD handlers
│   ├── [locale]/
│   │   ├── layout.tsx         # Multilingual layout wrapper (handles RTL/LTR base HTML, Outfit/Mukta fonts)
│   │   ├── page.tsx           # Localized Homepage
│   │   ├── about-us/
│   │   │   └── page.tsx       # Localized About us page
│   │   ├── contact-us/
│   │   │   └── page.tsx       # Localized Contact page
│   │   ├── pricelist/
│   │   │   └── page.tsx       # Downloads page
│   │   └── [...slug]/
│   │       └── page.tsx       # Catch-all dynamic routing for categorised products
│   ├── globals.css            # Root CSS file (Tailwind variables and main CSS imports)
│   └── error.tsx              # Error boundaries
├── components/                # Modular React layout elements
│   ├── ui/                    # Shadcn UI primitives
│   ├── Header.tsx             # Navbar layout with subdomain locale selector
│   ├── Footer.tsx             # Shared Footer with quick links
│   ├── BannerSlider.tsx       # Main desktop/mobile banners
│   ├── ProductSlider.tsx      # Carousel cards for products
│   └── HomeContactForm.tsx    # Forms with client-side captcha validation
├── lib/
│   ├── prisma.ts              # Prisma Client instance
│   └── get-dictionary.ts      # Dictionary selector matching locale
├── messages/                  # Translation assets (Phase 8)
│   ├── en.json                # English dictionary
│   ├── hi.json                # Hindi dictionary
│   ├── ar.json                # Arabic dictionary (RTL layout)
│   └── fr.json                # French dictionary
└── middleware.ts              # Subdomain locale rewriter middleware
```

---

## 2. Multilingual Subdomain Middleware (`middleware.ts`)

Next.js Middleware handles domain/subdomain language routing to ensure SEO indexing and visual language routing.

1. **Subdomain Identification**:
   - Middleware extracts the host header (e.g. `hi.mohitscpl.com` or `hi.localhost:3000`).
   - Split by dot `.` to check for valid subdomains (`en`, `hi`, `ar`, `fr`).
2. **Rewrite Logic**:
   - If path starts with `/api`, `/assets`, `/_next` or static files (matched by file extensions), request flows directly (`NextResponse.next()`).
   - If host has a valid subdomain segment, rewrite path internally to `/[locale]/[path]`. E.g., `hi.mohitscpl.com/about-us` rewrites to `/hi/about-us`.
   - If no valid subdomain segment exists, it routes to English `/en/[path]`.

---

## 3. Database Schema Layout (Prisma)

We utilize PostgreSQL with the following entities matching the schema requirements of Phase 7:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  roleId    String
  role      Role     @relation(fields: [roleId], references: [id])
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

model Role {
  id          String       @id @default(uuid())
  name        String       @unique // ADMIN, EDITOR, VIEWER
  description String?
  users       User[]
  permissions Permission[]
  createdAt   DateTime     @default(now())

  @@map("roles")
}

model Permission {
  id    String @id @default(uuid())
  name  String @unique // READ_DATA, WRITE_DATA, MANAGE_USERS
  roles Role[]

  @@map("permissions")
}

model Category {
  id        String     @id @default(uuid())
  slug      String     @unique
  nameKey   String // Translation key for multi-language naming
  parentId  String?
  parent    Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children  Category[] @relation("CategoryTree")
  products  Product[]
  sortOrder Int        @default(0)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@map("categories")
}

model Product {
  id            String    @id @default(uuid())
  slug          String    @unique
  categoryId    String?
  category      Category? @relation(fields: [categoryId], references: [id])
  imageSrc      String?
  titleKey      String // Translation key for titles
  descKey       String? // Translation key for descriptions
  featuresKey   String? // Translation key for bullet features
  datasheetLink String?
  isActive      Boolean   @default(true)
  sortOrder     Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@map("products")
}

model Inquiry {
  id        String   @id @default(uuid())
  name      String
  company   String
  email     String
  mobile    String
  message   String   @db.Text
  locale    String   @default("en")
  source    String   @default("website")
  status    String   @default("new")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("inquiries")
}

model Blog {
  id        String   @id @default(uuid())
  slug      String   @unique
  titleKey  String
  bodyKey   String   @db.Text
  imageSrc  String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("blogs")
}

model Settings {
  id        String   @id @default(uuid())
  key       String   @unique
  value     String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("settings")
}
```

---

## 4. Production Deployment & Process Control (Phase 13)

For production systems, we orchestrate deployment containers and proxy setups as follows:

1. **Docker Setup (`Dockerfile`)**:
   - Multistage node:18-alpine builder to cache packages and output compiled Next.js standalones.
2. **PM2 Execution**:
   - PM2 cluster mode instances configuration to utilize multi-core threads and handle traffic spikes.
3. **Nginx Reverse Proxy**:
   - Proxy redirects traffic from port 80/443 on host subdomains (e.g. `hi.mohitscpl.com`, `ar.mohitscpl.com`) down to the Next.js process port (3000). Passes headers: `X-Forwarded-Host`, `X-Forwarded-Proto`, and `Host`.
