# DOVR Agency Shopify App

A Shopify embedded app that gives DOVR's retail clients a dashboard inside their Shopify Admin showing their account status, active services, account manager contact info, and a support form.

---

## Tech Stack

- **Framework**: Remix (via `@shopify/shopify-app-remix`)
- **UI**: Shopify Polaris + App Bridge
- **Database**: PostgreSQL + Prisma ORM
- **Session Storage**: `@shopify/shopify-app-session-storage-prisma`
- **Email**: Nodemailer (SMTP)
- **Deployment**: Render (recommended)

---

## Project Structure

```
dovr-app/
├── app/
│   ├── routes/
│   │   ├── _index.tsx          # Root redirect / login
│   │   ├── auth.tsx            # OAuth entry
│   │   ├── auth.$.tsx          # OAuth callback catch-all
│   │   ├── app.tsx             # Polaris AppProvider layout shell
│   │   ├── app._index.tsx      # ★ Main dashboard (retailer sees this)
│   │   ├── app.support.tsx     # ★ Support contact form
│   │   └── app.admin.tsx       # ★ Agency admin panel (manage store data)
│   ├── models/
│   │   ├── storeAccount.server.ts   # DB helpers for StoreAccount
│   │   └── mail.server.ts           # Nodemailer email sender
│   ├── db.server.ts            # Prisma client singleton
│   ├── shopify.server.ts       # Shopify app config + auth
│   └── root.tsx                # HTML shell
├── prisma/
│   ├── schema.prisma           # Session + StoreAccount models
│   └── migrations/             # SQL migrations
├── shopify.app.toml            # Shopify CLI configuration
├── vite.config.ts
└── .env.example
```

---

## Local Development Setup

### 1. Prerequisites

- Node.js >= 18.20
- A [Shopify Partner account](https://partners.shopify.com)
- A development store
- PostgreSQL running locally (or use a free [Neon](https://neon.tech) / [Supabase](https://supabase.com) database)

### 2. Create the Shopify App

1. Go to your [Shopify Partner Dashboard](https://partners.shopify.com)
2. Click **Apps → Create app → Create app manually**
3. Name it `DOVR Agency App`
4. Copy the **API key** and **API secret key**

### 3. Clone and Install

```bash
git clone <your-repo>
cd dovr-app
npm install
```

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_APP_URL=https://your-tunnel-url  # set by CLI during dev
SCOPES=read_products,write_products,read_collections,write_collections,read_orders,read_customers
DATABASE_URL=postgresql://user:pass@localhost:5432/dovr_app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@yourdomain.com
SMTP_PASS=your_app_password
SUPPORT_EMAIL=support@youragency.com
ADMIN_SECRET=choose-a-strong-secret
```

### 5. Set Up the Database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Update shopify.app.toml

Replace `YOUR_SHOPIFY_API_KEY` with your actual API key.

### 7. Run the App

```bash
npm run dev
```

The Shopify CLI will open a tunnel, update your app URL, and prompt you to install on your dev store.

---

## Deploying to Render

### 1. Create a PostgreSQL Database on Render

1. Go to [render.com](https://render.com) → **New → PostgreSQL**
2. Name: `dovr-app-db`
3. Copy the **Internal Database URL** (use this as `DATABASE_URL`)

### 2. Create a Web Service on Render

1. **New → Web Service** → connect your GitHub repo
2. Settings:
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run setup`
   - **Start Command**: `npm run start`
   - **Node version**: 18 or higher

### 3. Add Environment Variables on Render

Add all variables from `.env.example` with production values.

For `SHOPIFY_APP_URL`, use your Render service URL: `https://dovr-app.onrender.com`

### 4. Update Shopify App URLs

In your Shopify Partner Dashboard → App setup:

- **App URL**: `https://dovr-app.onrender.com`
- **Allowed redirection URLs**:
  ```
  https://dovr-app.onrender.com/auth/callback
  https://dovr-app.onrender.com/auth/shopify/callback
  https://dovr-app.onrender.com/api/auth/callback
  ```

### 5. Deploy

Push to your main branch — Render auto-deploys.

---

## Using the Admin Panel

The admin panel at `/app/admin` lets DOVR staff configure each retailer's dashboard.

1. Install the app on a retailer's store
2. Open the app → navigate to `/app/admin`
3. Enter the store domain (e.g. `retailer.myshopify.com`) and click **Load Store**
4. Enter your `ADMIN_SECRET` and fill in:
   - Plan name + start date
   - Account Manager details
   - Active services (checkboxes)
   - Client portal URL
5. Click **Save Changes**

The retailer will immediately see the updated data on their dashboard.

---

## Email Setup (Gmail)

For Gmail SMTP:

1. Enable **2-Step Verification** on your Google account
2. Go to **Google Account → Security → App passwords**
3. Generate an app password for "Mail"
4. Use that as `SMTP_PASS` (not your regular Gmail password)

For other providers (SendGrid, Resend, Mailgun), update `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS` accordingly.

---

## App Listing (Shopify Partner Dashboard)

For unlisted distribution (install via direct link):

1. Partner Dashboard → **Your App → Distribution**
2. Choose **Custom distribution** (unlisted)
3. Add your branding: logo (512×512 PNG), description, screenshots
4. Share the install URL with retailers: `https://your-app.onrender.com?shop=STORENAME.myshopify.com`

---

## Scopes

The app requests these OAuth scopes:

| Scope | Access |
|---|---|
| `read_products` | Read product data |
| `write_products` | Modify products |
| `read_collections` | Read collections |
| `write_collections` | Modify collections |
| `read_orders` | Read orders |
| `read_customers` | Read customer data |

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `SHOPIFY_API_KEY` | ✅ | From Partner Dashboard |
| `SHOPIFY_API_SECRET` | ✅ | From Partner Dashboard |
| `SHOPIFY_APP_URL` | ✅ | Your deployed app URL |
| `SCOPES` | ✅ | Comma-separated OAuth scopes |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SMTP_HOST` | ✅ | SMTP server host |
| `SMTP_PORT` | ✅ | SMTP port (587 for TLS) |
| `SMTP_USER` | ✅ | SMTP username/email |
| `SMTP_PASS` | ✅ | SMTP password/app password |
| `SUPPORT_EMAIL` | ✅ | Where support emails are sent |
| `ADMIN_SECRET` | ✅ | Protects the /app/admin route |
| `SHOP_CUSTOM_DOMAIN` | ❌ | Custom domain (if not .myshopify.com) |
