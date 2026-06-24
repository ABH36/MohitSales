# Deploying Mohit Industries to Easypanel — Step-by-Step Guide

This guide details how to deploy the Next.js frontend application and the PostgreSQL database into **Easypanel** (a Docker-based server control panel).

---

## Prerequisites

Before starting, make sure you have:
1. **Easypanel** installed and running on your VPS.
2. A **Domain Name** (e.g., `mohit.bdm.co.in`) pointed to your VPS IP address:
   - Create an **A Record** pointing to your server's IP.
3. Access to your git repository (GitHub, GitLab, etc.).

---

## Step 1: Set up the PostgreSQL Database in Easypanel

1. Open your **Easypanel Dashboard**.
2. Click on **Projects** and select or create a project (e.g., `mohit-sales`).
3. Click **Add Service** -> choose **Database** -> select **PostgreSQL**.
4. Set a name for the database service (e.g., `db`).
5. Once created, go to the **Environment** tab of the `db` service.
6. Note the database credentials:
   - **Host:** `db` (the service name acts as the hostname inside Easypanel's internal network)
   - **Port:** `5432`
   - **Username:** `postgres` (or as shown in the credentials)
   - **Password:** (copied from the dashboard)
   - **Database Name:** (default is usually `postgres` or `db`)
7. Formulate your internal connection string. It will look like this:
   ```bash
   postgresql://postgres:<PASSWORD>@db:5432/postgres?schema=public
   ```
   *(Replace `<PASSWORD>` with the actual password shown in the Easypanel database dashboard).*

---

## Step 2: Set up the Next.js Application in Easypanel

1. Inside the same project, click **Add Service** -> choose **App**.
2. Name the app service (e.g., `app`).
3. Configure the **Source** tab:
   - Select **Git**.
   - Enter your repository URL (e.g., `git@github.com:BDM-Group-Indore/MohitSales_Node.git` or HTTPS URL).
   - Set the branch to deploy (e.g., `testing` or `main`).
   - If your repository is private, configure your Github App integration or Deploy Keys.
4. Configure the **Build** tab:
   - Change **Build Method** from *Nixpacks* to **Dockerfile**.
   - Set the **Dockerfile Path** to `Dockerfile` (which is located at the root of the project).
   - Set the **Directory** to `/` (or leave it blank).
5. Configure the **Domains** tab:
   - Add your domain (e.g., `mohit.bdm.co.in`).
   - Easypanel will automatically route traffic and generate Let's Encrypt SSL certificates.
6. Configure the **Network** tab:
   - Set **Container Port** to `3000`. This maps traffic from port 80/443 to the port exposed by our Dockerfile.

---

## Step 3: Add Environment Variables

Go to the **Environment** tab of your `app` service and add the following variables:

| Variable Name | Value / Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Internal connection string from Step 1 | `postgresql://postgres:password@db:5432/postgres?schema=public` |
| `DIRECT_URL` | Same as `DATABASE_URL` | `postgresql://postgres:password@db:5432/postgres?schema=public` |
| `JWT_SECRET` | 32+ character random secret string | Use a generator to get a secure secret key |
| `NEXT_PUBLIC_SITE_URL` | Your public domain (with HTTPS) | `https://mohit.bdm.co.in` |
| `SECURE_COOKIE` | Enables HTTPS-only secure session cookies | `true` |
| `DISABLE_RATE_LIMITER`| Disables rate limiter API throttling | `false` |
| `SMTP_HOST` | SMTP server address | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_SECURE` | Use SSL/TLS | `false` (for port 587/STARTTLS) |
| `SMTP_USER` | Sending email address | `your-email@gmail.com` |
| `SMTP_PASS` | Gmail App Password (or SMTP password)| `your-gmail-app-password` |
| `SMTP_TO_INQUIRY` | Email to receive customer inquiries | `info@yourdomain.com` |
| `SMTP_TO_FEEDBACK` | Email to receive customer feedback | `info@yourdomain.com` |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary Cloud name for image hosting| `cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `api_key` |
| `CLOUDINARY_API_SECRET`| Cloudinary API Secret | `api_secret` |

*Click **Save** after entering all variables.*

---

## Step 4: Build and Deploy

1. In the top-right corner of the `app` page, click **Deploy**.
2. You can monitor progress under the **Deployments** tab.
3. The build will:
   - Install dependencies.
   - Compile the Next.js project.
   - Run `npx prisma db push` to synchronize the PostgreSQL database schema.
   - Start the web server on port `3000`.

---

## Step 5: Seeding the Database (First-Time Setup)

Once the application container is deployed and running, you need to populate the database with the initial configurations and product catalog.

1. Go to your `app` service page in Easypanel.
2. Select the **Console** (or **Terminal**) tab.
3. Execute the following commands in order:

   **A. Seed Roles, Permissions, Admin User, and Default Settings:**
   ```bash
   npx prisma db seed
   ```
   *Note: This creates the default admin user: `admin@mohitscpl.com` / Password: `Admin@2024!`*

   **B. Seed Product Catalog (using `content-export.json`):**
   ```bash
   node prisma/seed-products.js
   ```

   **C. Rebuild Category Hierarchy:**
   ```bash
   node scripts/rebuild-category-tree.js
   ```

   **D. Apply Formatting and Final Polish:**
   ```bash
   node prisma/fix-seeded-products.js
   ```

4. Go back to the **Overview** tab of the `app` and click **Restart** to ensure the Next.js server catches the seeded changes and starts caching properly.
