# ERPiE

Webová aplikace pro správu zákazníků, produktů, objednávek, faktur a uživatelů. Projekt slouží jako demonstrační mini ERP systém.

## Technologie

**Backend**
- ASP.NET Core Web API (.NET 10)
- Entity Framework Core + Pomelo MySQL driver
- ASP.NET Core Identity (Autentizace a autorizace)
- MySQL databáze

**Frontend**
- React + Vite (JavaScript)
- Bootstrap 5
- Bootstrap Icons

## Funkce

### Autentizace
- [x] Přihlašování uživatelů
- [x] Správa uživatelských účtů (v sekci Nastavení -> Uživatelé)

### Zákazníci
- [x] Seznam zákazníků
- [x] Přidání zákazníka
- [x] Úprava zákazníka

### Produkty
- [x] Seznam produktů se stavem skladu
- [x] Přidání produktu
- [x] Úprava produktu

### Objednávky
- [x] Seznam objednávek
- [x] Vytvoření objednávky (výběr zákazníka, produktů, dopravy a platby)
- [x] Automatické odečtení skladu po vytvoření objednávky
- [x] Změna stavu objednávky (New → Processing → Shipped → Completed)

### Faktury
- [x] Seznam faktur
- [x] Vytvoření faktury z objednávky
- [x] Export faktury do PDF (v řešení)

## Struktura projektu

```
MiniERP/
├── MiniERP.Server/           # ASP.NET Core backend
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── CustomerController.cs
│   │   ├── ProductsController.cs
│   │   ├── OrderController.cs
│   │   └── InvoiceController.cs
│   ├── Models/
│   │   ├── User.cs
│   │   ├── Customer.cs
│   │   ├── Products.cs
│   │   ├── Order.cs
│   │   └── Invoice.cs
│   ├── Data/
│   │   └── AppDbContext.cs
│   └── Program.cs
└── minierp.client/           # React frontend
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
        │   └── Users.jsx
        └── App.jsx
```

## Spuštění projektu

### Požadavky
- .NET 10 SDK
- Node.js
- MySQL server

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
| GET | `/api/customers` | Seznam zákazníků |
| POST | `/api/customers` | Přidání zákazníka |
| GET | `/api/products` | Seznam produktů |
| POST | `/api/products` | Přidání produktu |
| GET | `/api/orders` | Seznam objednávek |
| POST | `/api/orders` | Vytvoření objednávky |
| GET | `/api/invoices` | Seznam faktur |
| GET | `/api/auth/users` | Seznam uživatelů |


## Stav projektu

Projekt je aktivně vyvíjen jako ukázka ERP systému. 
