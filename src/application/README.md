# Application Layer

Business use-cases and orchestration. Services here depend only on **interfaces** from `domain/`, never on concrete infrastructure.

- `services/` — `CategoryService`, `ProductService`, `QuoteService`, `UserService`, `SiteContentService`.

**Rule:** Inject dependencies via constructor; never `new` a concrete repository or third-party SDK here.
