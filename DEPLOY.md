# Picasso — Deployment Guide

End-to-end checklist for deploying Picasso to production on Vercel + Neon
+ Cloudinary, plus notes for self-hosted setups. Follow the steps top-to-bottom
the first time; later deploys only need steps **8–10**.

---

## 1. Prerequisites

| Service | Purpose | Free tier link |
|---|---|---|
| [Neon](https://neon.tech) | PostgreSQL (pooled + direct URLs) | yes |
| [Cloudinary](https://cloudinary.com) | Image storage + transformations | yes |
| [Vercel](https://vercel.com) | Hosting (Next.js) | yes |
| SMTP provider | Email notifications (Resend, SendGrid, Brevo, Gmail SMTP, …) | varies |
| GitHub | Source — Vercel deploys from a Git repo | yes |

Local prerequisites: Node 18.18+ (Node 20+ recommended), npm 10+.

---

## 2. Environment variables — quick reference

Legend: **R** = required, **O** = optional (feature degrades gracefully when
missing), **S** = seed-only (read once by `npm run db:seed`).

| Variable | Scope | Where read | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | R | `src/app/layout.tsx`, OG images, SMTP admin link | Public origin. `https://picassogroup.in` in prod. |
| `NEXT_PUBLIC_SITE_NAME` | R | metadata, footer, SMTP subject | Default `Picasso`. |
| `NEXT_PUBLIC_BRAND_TAGLINE` | R | metadata, OG images | Default `Crafting Excellence`. |
| `DATABASE_URL` | R | `src/lib/prisma.ts` (runtime) | **Pooled** Neon URL (port `…-pooler…`). |
| `DIRECT_URL` | R | `prisma.config.ts`, `prisma/seed.ts` | **Direct** Neon URL (no pooler). For migrations + seed only. |
| `AUTH_SECRET` | R | `next-auth` | Generate with `npx auth secret`. Min 32 random bytes. |
| `AUTH_TRUST_HOST` | R | `next-auth` | Set to `true` behind any proxy (Vercel, Nginx, Cloudflare). |
| `CLOUDINARY_CLOUD_NAME` | R | `src/infrastructure/uploads/cloudinary.ts` | From Cloudinary dashboard. |
| `CLOUDINARY_API_KEY` | R | same | |
| `CLOUDINARY_API_SECRET` | R | same | **Server-only** secret — never expose. |
| `CLOUDINARY_UPLOAD_FOLDER` | O | same | Default `picasso`. Root folder for all uploads. |
| `SMTP_HOST` | O | `createNotificationService.ts` | When any of HOST/FROM/NOTIFY_TO is missing, notifications no-op. |
| `SMTP_PORT` | O | same | Default `587`. Use `465` for SMTPS. |
| `SMTP_USER` | O | same | Optional — anonymous SMTP works for local relays. |
| `SMTP_PASS` | O | same | Server-only. |
| `SMTP_FROM` | O | same | Sender, e.g. `Picasso <noreply@picassogroup.in>`. |
| `QUOTE_NOTIFY_TO` | O | same | Recipient address for new-quote alerts. |
| `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL` | O | `src/components/public/MapEmbed.tsx` | Fallback only — admins can override via **Site Content → Map embed**. |
| `SEED_ADMIN_EMAIL` | S | `prisma/seed.ts` | First admin login. |
| `SEED_ADMIN_PASSWORD` | S | same | **Change immediately after first login.** |
| `SEED_ADMIN_NAME` | S | same | Default `Picasso Admin`. |

`.env.example` is the canonical template — keep it in sync with this table.

---

## 3. Neon — pooled vs direct URLs

Neon issues two connection strings per project; both are needed.

1. Create a project at <https://console.neon.tech>. Region close to your
   Vercel deployment (usually `us-east-1` / `eu-central-1`).
2. In **Dashboard → Connection Details**, copy **both** variants:
   - **Pooled** (host contains `-pooler`, port `5432`) → `DATABASE_URL`.
     Used by the running app via `PrismaPg` adapter (PgBouncer-safe).
   - **Direct** (no `-pooler` in host) → `DIRECT_URL`.
     Used by `prisma migrate deploy` and `prisma/seed.ts`. Migrations cannot
     run through PgBouncer (advisory locks, prepared statements).
3. Append `?sslmode=require` to both (Neon enforces TLS).
4. Verify locally: `npm run db:check` — prints `OK: Database connection succeeded.`

Example shape (do **not** commit real values):

```
DATABASE_URL="postgresql://user:pass@ep-foo-123-pooler.us-east-2.aws.neon.tech/picasso?sslmode=require"
DIRECT_URL ="postgresql://user:pass@ep-foo-123.us-east-2.aws.neon.tech/picasso?sslmode=require"
```

---

## 4. Cloudinary

1. Create a free account at <https://cloudinary.com>.
2. In **Dashboard → Account Details**, copy `Cloud name`, `API Key`, `API Secret`
   into the matching env vars.
3. Leave `CLOUDINARY_UPLOAD_FOLDER=picasso` (or pick another root folder — all
   product / category / hero images are nested beneath it).
4. The browser uploads directly to Cloudinary using a short-lived signature
   minted by `POST /api/uploads/cloudinary/signature` (admin-only). No image
   bytes pass through the Next.js server.

---

## 5. SMTP (quote notifications)

Optional but recommended in production — without it, quote submissions still
succeed but no email is sent.

- Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, and
  `QUOTE_NOTIFY_TO` together. If any of `SMTP_HOST` / `SMTP_FROM` /
  `QUOTE_NOTIFY_TO` is blank, the app falls back to a no-op notifier.
- For Gmail SMTP use an [App Password](https://myaccount.google.com/apppasswords),
  not your account password.
- For Resend / SendGrid / Brevo, use the SMTP relay credentials they provide
  (host + port + API-key-as-password).

---

## 6. Vercel project setup

1. Push the repo to GitHub.
2. In Vercel: **Add New… → Project → Import** the repo.
3. **Framework Preset**: Next.js (auto-detected). Leave Root Directory blank.
4. **Build & Output Settings**:
   - Build command: `npm run release` (runs `prisma migrate deploy && next build`).
   - Install command: leave default (`npm install` — runs `postinstall` →
     `prisma generate` automatically).
   - Output directory: leave default.
5. **Environment Variables**: add every **R** row from §2 to the
   `Production`, `Preview`, and `Development` scopes you need. Mark the
   server-only ones (`AUTH_SECRET`, `DATABASE_URL`, `DIRECT_URL`,
   `CLOUDINARY_API_SECRET`, `SMTP_PASS`) as **Sensitive**.
6. **Domains**: attach `picassogroup.in` (and `www.picassogroup.in`). Vercel
   issues the TLS cert automatically. Update `NEXT_PUBLIC_SITE_URL` to the
   final origin after the domain is live.
7. **Region**: pick a region close to your Neon region to minimise latency
   (e.g. both in `us-east-1`).

> Preview deployments share the **same** Neon database by default. To isolate
> previews, create a separate Neon branch and override `DATABASE_URL` /
> `DIRECT_URL` in the Preview scope.

---

## 7. First-time deploy

1. **Seed the production database** (one-time). With your local shell pointed
   at the production env vars:
   ```powershell
   npm run db:deploy   # applies all migrations via DIRECT_URL
   npm run db:seed     # creates the SEED_ADMIN_* user (idempotent)
   ```
   Alternatively run the seed from any machine that can reach `DIRECT_URL`.
2. Trigger the first Vercel deploy (push to `main` or click **Deploy**).
3. Visit `https://<your-domain>/picassoadd/login`, sign in with
   `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`, then immediately:
   - **Picassoadd → Profile** → change the password.
   - **Picassoadd → Users** → invite real users with appropriate roles
     (`ADMIN` / `EDITOR` / `VIEWER`).
   - **Picassoadd → Site Content** → fill hero, contacts, socials, address,
     map embed URL.

---

## 8. Subsequent deploys

Every push to `main` triggers Vercel's build, which runs `npm run release`:

```
prisma migrate deploy && next build
```

- New migrations apply automatically against `DIRECT_URL` before the build.
- If `prisma migrate deploy` fails (drift, missing migration), the deploy
  aborts before serving stale code — fix the migration, push again.
- No seed runs on redeploys (the seed is idempotent but is only invoked
  manually via `npm run db:seed`).

---

## 9. Post-deploy verification

| Check | How |
|---|---|
| Home renders | `GET /` returns 200 with hero content |
| Admin login | `/picassoadd/login` → sign in → land on `/picassoadd/dashboard` |
| Image upload | Admin → Products → New → upload an image (Cloudinary) |
| Quote email | Public → product → request a quote → email lands at `QUOTE_NOTIFY_TO` |
| OG previews | Paste a category/product URL into WhatsApp, LinkedIn, Slack |
| Sitemap | `GET /sitemap.xml` lists categories + products |
| robots | `GET /robots.txt` allows `/`, disallows `/picassoadd` |
| Map embed | Public footer/contact shows the configured map |

---

## 10. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `prisma migrate deploy` errors with `prepared statement…` | Using pooled URL for migrations | Ensure `DIRECT_URL` (no `-pooler`) is set in Vercel. |
| `Missing required environment variable: AUTH_SECRET` | Env var not set in Production scope | Add in Vercel → Settings → Environment Variables, redeploy. |
| Login redirects loop on a custom domain | `AUTH_TRUST_HOST` missing | Set `AUTH_TRUST_HOST=true`. |
| Image upload returns 500 | Cloudinary creds wrong/missing | Re-check `CLOUDINARY_*` values; secret has no surrounding whitespace. |
| Quote submitted but no email | SMTP env partially set | Fill **all** of `SMTP_HOST`, `SMTP_FROM`, `QUOTE_NOTIFY_TO` (and creds). |
| Map iframe is blank or refuses to load | URL not in allow-list | Use the `src` value from Google Maps → Share → Embed; must start with `https://www.google.com/maps/embed` or `https://maps.google.com/maps`. |
| OG image stale on social | CDN cached old image | Append `?v=2` to the URL once, or re-share. |

---

## 11. Rollback

Vercel keeps every previous deployment. To revert:

1. Vercel → Deployments → pick the last good deployment → **Promote to Production**.
2. If the bad deploy ran a schema migration, also restore the matching DB
   state from Neon's point-in-time recovery (Neon → Project → Restore).

---

Keep this file in sync with `.env.example` and `package.json` scripts whenever
new env vars or release steps are added.
