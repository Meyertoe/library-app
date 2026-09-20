# Library App

Ett fullstackprojekt för ett LIA-test. Frontend använder **Angular 20, TypeScript, Bootstrap 5.3 och Font Awesome**. Backend använder **.NET 9, C#, ASP.NET Core Web API, Entity Framework Core, SQLite och JWT**.

## Funktioner och struktur

- Registrering, login/logout, hashade lösenord och JWT-autentisering.
- Books CRUD med titel, författare och publiceringsdatum. Böcker delas av inloggade användare.
- Mina citat CRUD: fem startcitat vid registrering, endast ägaren får läsa eller ändra sina citat.
- Responsiva kort/formulär, hamburgermeny och light/dark mode som sparas efter refresh.
- `frontend/`: Angular-komponenter, services, routing, guard och JWT-interceptor.
- `backend/Library.Api/`: controllers, modeller, DTO:er, databas och EF-migrationer.

## Kör lokalt

Förutsättningar: Node.js 24, npm och .NET SDK **9.0.318** (låst i `global.json`).

Från projektroten, konfigurera först en lokal JWT-nyckel. Följande kommando genererar en ny nyckel utan att skriva ut den eller spara den i repositoryt (kräver OpenSSL):

```bash
openssl rand -base64 48 | tr -d '\n' | awk '{printf "{\"Jwt:Key\":\"%s\"}", $0}' | dotnet user-secrets set --project backend/Library.Api
```

Kör detta en gång per utvecklingsmiljö. Att byta nyckel ogiltigförklarar tidigare tokens. .NET User Secrets ligger utanför projektmappen och används endast i Development; det är inte en krypterad produktionshemlighetshanterare.

Starta backend:

```bash
dotnet tool restore
cd backend/Library.Api
dotnet restore
dotnet ef database update
dotnet run --launch-profile http
```

I en annan terminal från projektroten:

```bash
cd frontend
npm ci
npm start
```

Öppna **http://localhost:4200**. Backend kör på **http://localhost:5050**, och Angular vidarebefordrar `/api/**` via utvecklingsproxyn. Publik kontroll: `GET /api/health`. Stoppa servrarna med Ctrl+C.

SQLite skapas som `backend/Library.Api/library.db`. Migrationerna skapar tre startböcker. Registrering skapar fem korta Shakespeare-citat per användare; raderade citat återskapas inte vid login. Databasen ska inte committas.

## Bygg

```bash
dotnet build backend/Library.Api
npm --prefix frontend run build
```

## Verifiering inför inlämning

Sluttestat 2026-09-20 med Angulars produktionsbygge och .NET Release: registrering/login/logout, skyddade routes/API, Books och Quotes CRUD, fem startcitat och isolering mellan två användares citat. Alla åtta routes kontrollerades i ljust/mörkt tema vid 320, 375, 768 och 1440 px. Ett separat produktionspaket testades med en tillfällig SQLite-databas: migration från tom databas, upprepad migration, same-origin API, direktlänkar och bevarade data efter omstart. Publik HTTPS och värdens Linux-miljö återstår att verifiera efter kontoåtkomst.

## Konfiguration och produktion

Ingen signing secret finns i projektets konfigurationsfiler. Backend vägrar starta om nyckeln saknas eller är kortare än 32 byte. Använd en slumpgenererad nyckel, exempelvis 48 slumpbyte kodade som Base64, via driftplattformens hemlighetshantering.

| Miljövariabel | Användning |
|---|---|
| `ASPNETCORE_ENVIRONMENT=Production` | Produktionsläge; User Secrets läses inte |
| `Jwt__Key` | Obligatorisk signing secret i produktion |
| `Jwt__Issuer`, `Jwt__Audience` | Överstyr värdena `Library.Api` och `Library.Angular` vid behov |
| `Jwt__ExpiresMinutes` | Giltighetstid, standard 60 minuter |
| `ConnectionStrings__DefaultConnection` | Exempel: `Data Source=/data/library.db`; använd beständig, skrivbar lagring |
| `AllowedHosts` | Sätt till den/de hostnamn reverse proxyn vidarebefordrar |
| `ASPNETCORE_URLS` | Intern lyssningsadress enligt driftplattformen, exempelvis `http://0.0.0.0:8080` |

**Produktionspaket:** .NET serverar både API:t och Angulars byggda filer från `wwwroot`. Kör `bash deploy/package.sh` för ett fristående Linux x64-paket med .NET 9-runtime. Angulars relativa `/api`-adresser fungerar på samma HTTPS-origin utan CORS och utan utvecklingsproxy. Direktlänkar till Angular går till `index.html`; okända API-sökvägar ger 404.

Se [publiceringsinstruktionerna](deploy/README.md) för alwaysdata Free, beständig SQLite, hemligheter, HTTPS och backup. Publicering är ännu inte verifierad på ett hostingkonto; detta är inte en live-länk. Produktionsmigrationer körs uttryckligen med `./Library.Api --migrate` medan webbplatsen är stoppad, efter backup. Normal start ändrar inte databasschemat.

JWT lagras i localStorage enligt testkravet. Logout rensar lokal token; en redan utfärdad token gäller till expiration. CRUD skyddas på backend, och citatägaren hämtas alltid från JWT, aldrig från requestens UserId.
