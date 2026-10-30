# ERPiE
https://myminierp.runasp.net/
## Osobní školní projekt
Webová skladová aplikace určená pro **prodejce pneumatik**. Umožňuje správu adresáře firem, produktového katalogu pneumatik, skladových pohybů, dodacích listů, faktur a příjemek zboží.


## Technologie

**Backend**
- ASP.NET Core Web API (.NET 10)
- Entity Framework Core + Pomelo MySQL driver
- ASP.NET Core Identity (autentizace a autorizace)
- MySQL databáze

**Frontend**
- React + Vite (JavaScript)
- Bootstrap 5 + Bootstrap Icons

## Funkce

### Autentizace
- [x] Přihlašování uživatelů (JWT)
- [x] Role uživatelů (admin / uživatel / demo) — admin má přístup k editaci a mazání
- [x] Správa uživatelských účtů — vytváření nových uživatelů (`/api/user`), chráněno na backendu
  (`[Authorize(Roles = "admin")]`), takže endpoint smí volat jen admin, ne jen skrytím v menu
- [x] Data jsou oddělená per uživatel — viz sekce [Vlastnictví dat](#vlastnictví-dat) níže

### Adresář firem
- [x] Seznam firem s filtrováním dle názvu a IČO
- [x] Přidání a úprava firmy (název, adresa, kontakt, IČO)
- [x] Označení firmy jako dodavatele (slouží pro výběr v příjemkách)
- [x] Validace IČO — právě 8 číslic

### Produkty (pneumatiky)
- [x] Seznam produktů s filtrováním dle značky, rozměru a dezénu
- [x] Kategorie pneumatik: **Zimní** ❄, **Letní** ☀, **Celoroční** ☀❄ — s barevnými ikonami a filtrem v hlavičce tabulky
- [x] Atributy: značka, rozměr, dezén, index rychlosti (SI), index zátěže (LI), cena bez DPH
- [x] Přidání a úprava produktu

### Sklad
- [x] Přehled aktuálního stavu skladu (množství ks na skladě pro každý produkt)
- [x] Stav skladu se automaticky aktualizuje při příjemkách a dodacích listech
- [x] Barevné odlišení stavu: zelená (> 10 ks), žlutá (1–10 ks), červená (0 ks)

### Příjemky
- [x] Vytvoření příjemky: výběr dodavatele, datum příjmu, číslo faktury přijaté
- [x] Přidání libovolného počtu položek (produkt z katalogu, množství, cena bez DPH)
- [x] Automatický výpočet DPH 21 % a celkové ceny
- [x] Po uložení příjemky se produkty **automaticky naskladní** (přičtou se k zásobám)
- [x] Smazání příjemky odečte naskladněné množství zpět
- [x] Detail příjemky s rozpisem položek
- [x] **Import faktury z PDF (AI)** — nahrání PDF faktury od dodavatele, ze kterého AI model
  (Google Gemini) automaticky přečte dodavatele, datum, číslo faktury a položky. Přečtená data
  se spárují s existujícími dodavateli a produkty v databázi a po potvrzení předvyplní formulář
  příjemky. Nenalezené položky je potřeba doplnit ručně.

### Dodací listy
- [x] Vytvoření dodacího listu (výběr zákazníka, produktů, dopravy a platby)
- [x] Po vytvoření DL se produkty **automaticky odečtou ze skladu**
- [x] Zpětná synchronizace skladu pro DL vytvořené před zavedením skladu
- [x] Změna stavu DL (Nový → Zpracovává se → Dokončeno)
- [x] Smazání DL vrátí množství zpět na sklad

### Faktury
- [x] Seznam faktur s přehledem částek (bez DPH, DPH, s DPH)
- [x] Vytvoření faktury z dodacího listu
- [x] Změna stavu faktury (nezaplaceno / zaplaceno)

### Vlastnictví dat
Firmy (`Customer`) mají sloupec `OwnerId` (FK na `AspNetUsers`). Každý neadmin uživatel vidí a
upravuje jen firmy, které sám vytvořil — a v návaznosti na ně jen jejich faktury, dodací listy a
příjemky (vazba přes `CustomerId`/`SupplierId`). Admin vidí a upravuje vše bez omezení. Produktový
katalog a stav skladu zůstávají sdílené pro všechny uživatele. Filtrování řeší backend
(`OwnedEntityControllerBase` + kontrola v jednotlivých service metodách), frontend žádnou logiku
navíc neřeší — dostává už jen data, na která má přihlášený uživatel právo.

## Struktura projektu

```
MiniERP/
├── MiniERP.Server/               # ASP.NET Core backend
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── UserController.cs
│   │   ├── OwnedEntityControllerBase.cs   # sdílené CurrentUserId/IsAdmin pro filtrování dat
│   │   ├── CustomerController.cs
│   │   ├── ProductsController.cs
│   │   ├── OrderController.cs
│   │   ├── InvoiceController.cs
│   │   ├── WarehouseController.cs
│   │   └── ReceiptController.cs
│   ├── Models/
│   │   ├── User.cs
│   │   ├── Customer.cs                    # vč. OwnerId (FK na AspNetUsers)
│   │   ├── Product.cs
│   │   ├── Order.cs
│   │   ├── OrderItem.cs
│   │   ├── Invoice.cs
│   │   ├── InvoiceItem.cs
│   │   ├── WarehouseItem.cs
│   │   ├── Receipt.cs
│   │   └── ReceiptItem.cs
│   ├── DTOs/
│   ├── Services/
│   ├── Data/
│   │   └── AppDbContext.cs
│   └── Program.cs
└── minierp.client/               # React frontend
    └── src/
        ├── components/
        │   ├── Layout.jsx
        │   ├── Sidebar.jsx
        │   └── Navbar.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Customers.jsx
        │   ├── Products.jsx
        │   ├── Orders.jsx
        │   ├── Invoices.jsx
        │   ├── Warehouse.jsx
        │   ├── Receipts.jsx
        │   └── Users.jsx
        ├── services/
        ├── mappers/
        ├── dtos/
        └── App.jsx
```

## Spuštění projektu

### Požadavky
- .NET 10 SDK
- Node.js
- MySQL server
- (volitelné) API klíč pro Google Gemini — pro funkci "Import faktury z PDF" u příjemek,
  zdarma na [aistudio.google.com/apikey](https://aistudio.google.com/apikey), nastavený jako
  proměnná prostředí `GOOGLE_API_KEY`

### Backend

```bash
cd MiniERP.Server
dotnet restore
dotnet run
```

Backend běží na `https://localhost:7270`.

### Frontend

```bash
cd minierp.client
npm install
npm run dev
```

Frontend běží na `http://localhost:5173`.

## API endpointy

| Metoda | Endpoint | Popis |
|--------|----------|-------|
| POST | `/api/auth/login` | Přihlášení uživatele |
| GET/POST | `/api/user` | Seznam / vytvoření uživatele — **jen admin** (`[Authorize(Roles = "admin")]`) |
| GET/POST | `/api/customer` | Seznam / přidání firmy — filtrováno podle vlastníka (admin vidí vše) |
| GET | `/api/customer/ares/{ico}` | Načtení firmy z ARESu podle IČO |
| PUT/DELETE | `/api/customer/{id}` | Úprava / smazání firmy — jen vlastník nebo admin |
| GET/POST | `/api/products` | Seznam / přidání produktu (sdílené, bez filtrování) |
| PUT/DELETE | `/api/products/{id}` | Úprava / smazání produktu |
| GET/POST | `/api/order` | Seznam / vytvoření DL — filtrováno přes vlastníka navázané firmy |
| PUT | `/api/order/{id}/status` | Změna stavu DL |
| GET/POST | `/api/invoice` | Seznam / vytvoření faktury — filtrováno přes vlastníka navázané firmy |
| PUT | `/api/invoice/{id}/status` | Změna stavu faktury |
| GET | `/api/warehouse` | Stav skladu (sdílené, bez filtrování) |
| PUT/DELETE | `/api/warehouse/{id}` | Úprava / odebrání položky skladu |
| GET/POST | `/api/receipt` | Seznam / vytvoření příjemky — filtrováno přes vlastníka dodavatele |
| DELETE | `/api/receipt/{id}` | Smazání příjemky |
| POST | `/api/receipt/import-invoice` | Import PDF faktury přes AI — spárování dodavatelů se omezuje jen na vlastní |


