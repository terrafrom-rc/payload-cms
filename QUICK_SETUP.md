# Quick Setup Guide

## Prerequisites

- Node.js 20+
- pnpm
- Cloudflare account with **Workers Paid plan** ($5/month - required due to bundle size)

## Local Development Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start the development server

```bash
pnpm run dev
```

This uses Wrangler to simulate Cloudflare Workers locally with:
- Local SQLite database (stored in `.wrangler/state/`)
- Local R2 storage simulation

Visit http://localhost:3000/admin to access the admin panel.

### 3. Create a super admin user

```bash
pnpm run create-super-admin
```

## Initial deployment to Cloudflare

### 1. Authenticate with Cloudflare

**Option A: API Token (Recommended for CI/CD)**

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Create Custom Token with permissions:
   - Account > Workers Scripts > Edit
   - Account > D1 > Edit
   - Account > Workers R2 Storage > Edit
3. Set the environment variable:

```bash
export CLOUDFLARE_API_TOKEN="your-api-token-here"
```

**Option B: OAuth Login (Interactive)**

```bash
pnpm wrangler login
```

This opens a browser for OAuth authentication. Credentials are stored in `~/.wrangler/config/default.toml`.

### 2. Enable R2 Storage

Go to https://dash.cloudflare.com → R2 Object Storage → Enable R2

### 3. Create migrations (if starting fresh)

**Note:** This project already has migrations in `src/migrations/`. Only run this if you're starting completely fresh or need to create new migrations after schema changes.

```bash
pnpm payload migrate:create
```

### 4. Create Cloudflare resources

```bash
# Create D1 database
pnpm wrangler d1 create my-app

# Create R2 bucket
pnpm wrangler r2 bucket create my-app
```

Note: whether you want local dev to conenct to deployed cf resources is up to you...it doesn't matter which you choose we can change it anytime anyways

### 5. Update wrangler.jsonc (POSSIBLY OPTIONAL)
This step could be optional if you said Yes from "Would you like Wrangler to add it on your behalf? … yes" after you ran "pnpm wrangler {d1 or r2 bucket} create my-app"

Copy the `database_id` from the D1 creation output and update `wrangler.jsonc`:

```jsonc
"d1_databases": [
  {
    "binding": "D1",
    "database_id": "YOUR_DATABASE_ID_HERE",  // <-- hould be different from other cf resources bindings
    "database_name": "my-app",
    "remote": true
  }
]
```
```jsonc
"r2_buckets": [
  {
    "binding": "R2",   // <-- Should be different from other cf resources bindings
    "bucket_name": "my-app",
  }
]
```

### 6. Set PAYLOAD_SECRET

```bash
openssl rand -base64 32 | pnpm wrangler secret put PAYLOAD_SECRET
```

### 7. Deploy

```bash
CLOUDFLARE_ENV= pnpm run deploy
```

This will:
1. Run migrations on remote D1
2. Build the Next.js app with OpenNext
3. Deploy to Cloudflare Workers

Your app will be available at: `https://my-app.<your-subdomain>.workers.dev`

## Connecting Local Dev to Remote Cloudflare Resources

To develop locally but use the deployed Cloudflare D1/R2:

```bash
# Run migrations on remote
NODE_ENV=production pnpm payload migrate

# Start dev with remote bindings (experimental)
pnpm wrangler dev --remote
```

Note: This requires the database_id to be set in wrangler.jsonc.

## Environment Configuration

### Local Development
- Uses local SQLite and R2 simulation
- No Cloudflare account needed
- Data persists in `.wrangler/state/`

### Production
- Uses remote Cloudflare D1 and R2
- Requires paid Workers plan
- Set `NODE_ENV=production` for migrations

### Staging Environment (optional)

Uncomment the `env.staging` section in `wrangler.jsonc` and deploy:

```bash
CLOUDFLARE_ENV=staging pnpm run deploy
```

## Common Commands

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start local dev server |
| `pnpm run build` | Build Next.js app |
| `pnpm run deploy` | Deploy to Cloudflare |
| `pnpm payload migrate` | Run migrations |
| `pnpm payload migrate:create` | Create new migration |
| `pnpm wrangler login` | Authenticate with Cloudflare |
| `pnpm wrangler d1 execute my-app --remote --command "SELECT * FROM users"` | Query remote D1 |

## Troubleshooting

### "Worker exceeded size limit"
You need a paid Workers plan ($5/month). The Payload admin UI exceeds the 3MB free tier limit.

### "No such table" errors during build
Run migrations before building:
```bash
NODE_ENV=production pnpm payload migrate
```

### Network errors during deploy
Retry the deploy - this is usually a temporary Cloudflare API issue:
```bash
CLOUDFLARE_ENV= pnpm run deploy:app
```

### Authentication issues
Re-authenticate with Cloudflare:
```bash
pnpm wrangler logout
pnpm wrangler login
```

## How Wrangler Authentication Works

Wrangler supports two authentication methods:

### API Token (Recommended)
Set `CLOUDFLARE_API_TOKEN` environment variable. Best for:
- CI/CD pipelines
- Scripted deployments
- Team environments

### OAuth Login
Run `pnpm wrangler login` to authenticate via browser. Credentials are stored in `~/.wrangler/config/default.toml`. Best for:
- Local development
- Quick manual deployments

The API token takes precedence over OAuth credentials when both are available.
