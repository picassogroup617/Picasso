# Infrastructure Layer

Concrete implementations of domain interfaces.

- `repositories/` — Prisma-backed implementations of `IUserRepository`, `ICategoryRepository`, etc.
- `storage/` — `CloudinaryImageUploader` implementing `IImageUploader`.
- `email/` — `ResendEmailNotifier` implementing `IEmailNotifier`.
- `auth/` — Auth.js config, password hashing, session helpers.

**Rule:** Swapping providers (e.g., Cloudinary → S3) should only require changes here, not in `application/` or `domain/`.
