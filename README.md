# Picasso

A catalog/showcase website with a public site and an admin panel (`/picassoadd`) to manage categories, products, site content, and quote requests.

## Tech Stack

- **Next.js 15** (App Router) + **TypeScript** + **React 19**
- **Tailwind CSS** for styling (white / light-gray / bright-yellow theme)
- **PostgreSQL** via **Neon** (free tier) + **Prisma** ORM
- **Auth.js (NextAuth v5)** with role-based access (Admin / Editor / Viewer)
- **Cloudinary** for image storage (free tier)
- **Resend** for email notifications (free tier)
- **Google Maps Embed** for location
- **Vercel** for hosting

## Architecture

Clean layered architecture following **SOLID** principles:

```
src/
├── app/              Next.js routes (presentation)
├── components/       UI components (ui / public / admin)
├── domain/           Entities, schemas, interfaces (no deps)
├── application/      Services / use-cases (depend on domain only)
├── infrastructure/   Prisma, Cloudinary, Resend, Auth implementations
└── lib/              Cross-cutting helpers (utils, env, DI container)
```

## Local Setup (will be needed after Phase 1)

1. `npm install`
2. Copy `.env.example` → `.env.local` and fill in values
3. `npm run dev` and open http://localhost:3000

## Project Status

- ✅ Phase 1: Foundation (scaffolding, theme, folder structure)
- ✅ Phase 2: Database & Auth
- ✅ Phase 3: Admin Panel (Picassoadd)
- ✅ Phase 4: Public Site
- ✅ Phase 5: Integrations (Cloudinary, SMTP/Nodemailer, Maps, SEO)
- ✅ Phase 6: Polish & Deploy

