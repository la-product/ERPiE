# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

MiniERP (ERPiE) is a web ERP application for a tire retailer: company directory, tire product
catalog, warehouse stock, receipts (goods-in from suppliers), delivery notes/orders, and invoices.
UI text and domain terminology are in **Czech** (e.g. "Faktura" = invoice, "Dodavatel" = supplier,
"Odběratel" = customer, "Příjemka" = goods receipt, "Dodací list"/"DL" = delivery note, "Sklad" =
warehouse). Match this Czech terminology in UI-facing strings and error messages.

- Backend: `MiniERP.Server/` — ASP.NET Core Web API (.NET 10), EF Core + Pomelo MySQL driver,
  ASP.NET Core Identity + JWT auth.
- Frontend: `minierp.client/` — React 19 + Vite, plain JS (no TypeScript), Bootstrap 5.
- Tests: `MiniERP.Tests/` — xUnit + FluentAssertions, references `MiniERP.Server` directly.

## Commands

### Backend (from `MiniERP.Server/`)

```bash
dotnet restore
dotnet run                      # dev server: https://localhost:7270 (http://localhost:5131)
dotnet build
```

EF Core migrations use the local `dotnet-ef` tool pinned in `dotnet-tools.json`:

```bash
dotnet tool restore
dotnet ef migrations add <Name>
dotnet ef migrations list
dotnet ef database update       # applies all pending migrations
```

### Tests (from `MiniERP.Tests/` or repo root with `-p`)

```bash
dotnet test
dotnet test --filter "FullyQualifiedName~CustomerMapperTests"   # single test class
dotnet test --filter "DisplayName~SomeSpecificTest"             # single test
```

### Frontend (from `minierp.client/`)

```bash
npm install
npm run dev     # dev server: http://localhost:5173
npm run build   # outputs into MiniERP.Server/wwwroot (see vite build target)
npm run lint
```

### Environment quirk

If `dotnet`/`dotnet ef` fail with something like `[.../host/fxr] does not exist`, the system
`dotnet` on `PATH` is a broken stub. Use the real SDK instead:
`export DOTNET_ROOT="$HOME/.dotnet"; export PATH="$HOME/.dotnet:$HOME/.dotnet/tools:$PATH"`.

### Required environment variables (backend)

`appsettings.json` embeds `${DB_PASSWORD}` and `${JWT_SECRET}` placeholders that `Program.cs`
substitutes manually at startup from the `DB_PASSWORD` and `JWT_SECRET` environment variables
(this is a hand-rolled substitution, not the standard ASP.NET env-var configuration provider).
Optionally set `GOOGLE_API_KEY` for the AI PDF invoice import feature (Google Gemini via the
`Google.GenAI` SDK). `appsettings.Development.json` is gitignored and holds real local values —
never put actual secrets in tracked files or in this CLAUDE.md.

## Backend architecture

Standard layered structure, repeated per entity — when adding a new entity/feature, replicate this
same set of files:

- `Models/` — EF entities.
- `DTOs/` — request/response DTOs per entity, usually `XxxDTO.cs` containing `XxxDTO`,
  `CreateXxxDTO`, `UpdateXxxDTO`, and sometimes `XxxDetailDTO` in one file.
- `Mappers/` — static classes (`XxxMapper.ToDto`, `ToEntity`, `ApplyUpdate`) that convert between
  entities and DTOs. There is no AutoMapper; mapping is hand-written and must be kept in sync
  manually — when a model field is added, update the DTO *and* every mapper method that touches it
  (this has been a recurring source of bugs, e.g. mismatched field names between entity/DTO/mapper).
- `Services/` — business logic, talk to `AppDbContext` directly (no repository interface layer).
  Registered as scoped services in `Program.cs`.
- `Controllers/` — thin, delegate straight to a service; `[Authorize]` is applied at the controller
  level (no role-based policies currently — `User.Role` exists but isn't enforced via
  `[Authorize(Roles=...)]` anywhere; the "admin"-only UI restriction for user management is
  client-side only in `Users.jsx`, and there's no backend user-management endpoint at all yet).
- `Data/AppDbContext.cs` — single `IdentityDbContext<User>`; relationship config beyond conventions
  (unique invoice number, `Invoice.Customer`/`Invoice.Supplier` both pointing at `Customer`, nullable
  `InvoiceItem.Product`) lives in `OnModelCreating`.
- `Migrations/` — apply schema changes here whenever a `Models/` entity changes; the app also calls
  `context.Database.EnsureCreated()` at startup, but new columns still require a real migration
  (`EnsureCreated` only creates the DB if it doesn't exist yet).

Domain notes:

- `Invoice.InvoiceNumber` is generated server-side in `InvoiceService` in format `RRRRXXX` (year +
  zero-padded sequence within that year, e.g. `2026003`); `InvoiceService.PreviewNextInvoiceNumber()`
  exposes the next number via `GET /api/invoice/next-number` for the frontend to display/prefill
  before creation. `VariableSymbol` defaults to the invoice number if left blank.
- `Customer` doubles as both customer and supplier — `Customer.IsSupplier` is the flag the frontend
  filters on for supplier pickers; there's no separate `Supplier` entity. Company data can be
  looked up by IČO via `AresService` (Czech company registry, ares.gov.cz) through
  `GET /api/customer/ares/{ico}`.
- `Receipt` import: `POST /api/receipt/import-invoice` uses `InvoiceImportService`
  (Google Gemini, model `gemini-2.5-flash`) to extract supplier/date/items from an uploaded PDF and
  fuzzy-matches them against existing customers/products (`MatchThreshold = 0.4`) before returning
  data to prefill the receipt form; unmatched items must be filled in manually by the user.
- Stock (`WarehouseItem`) is kept in sync automatically: receipts increase stock, orders/delivery
  notes decrease it, and deleting either reverses the adjustment. `OrderService.SyncWarehouse()`
  runs once at startup to backfill stock for orders created before warehouse tracking existed.

## Frontend architecture

- **No routing library is used for navigation** despite `react-router-dom` being a listed
  dependency — it isn't imported anywhere. `App.jsx` holds a single `activePage` string in state
  and a big `switch` that renders the matching page component; `Sidebar`/`Navbar` change pages by
  calling `setActivePage("Some Czech Label")`. Page identifiers are the Czech menu labels
  themselves (e.g. `"Seznam FV"`, `"Přidat FV"`), not URL paths.
- Page components take a `view` prop (`"list"` / `"add"`, sometimes `"edit"`) and branch internally
  rather than being separate route components — follow this pattern for new pages instead of
  introducing routing.
- Auth: JWT is stored in `localStorage` (`services/apiClient.js`); `authFetch()` wraps `fetch` to
  attach the `Authorization` header and, on a 401, clears the token and dispatches a window
  `"unauthorized"` event that `App.jsx` listens for to force logout/re-login.
- Per-entity structure mirrors the backend: `services/xxxService.js` (fetch calls),
  `dtos/xxxDTOs.js` (JSDoc typedefs only, no runtime code), `mappers/xxxMapper.js` (form ⇄ DTO
  shape conversion, e.g. `mapFormToCreateXxxDto`).
- `pages/Users.jsx` is a UI-only stub with hardcoded local state — it is not wired to any backend
  endpoint (none exists yet).
- Global styling/theme tokens (`--primary`, `--border`, etc.) and shared component classes
  (`.form-control`, `.card`, `.badge-*`, placeholder color) live in `src/index.css` on top of
  Bootstrap; prefer extending that file over inline styles for anything reusable across pages.
- Invoice print/PDF (`utils/invoicePrint.js`) shares one HTML-building function
  (`buildInvoiceBodyHtml`) between the browser print path (`printInvoice`, via a hidden iframe) and
  client-side PDF generation (`html2pdf.js`, via a temporary off-screen container appended to
  `document.body`) — keep both paths using that shared function rather than duplicating markup.
  Payment QR codes use `qr-platba-generator` + `qrcode`; note `qr-platba-generator` emits the
  variable/specific/constant symbol fields without the `X-` prefix required by the Czech QR-payment
  spec, so the generated string is patched (`*VS:` → `*X-VS:`, etc.) before rendering — keep that
  patch if you touch this code, or drop it if the upstream package fixes the bug.
