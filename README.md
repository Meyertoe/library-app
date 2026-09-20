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

**Produktionsupplägg utan kodändring:** servera `frontend/dist/frontend/browser/` på webbplatsens HTTPS-origin. Låt samma webbservers reverse proxy vidarebefordra `/api/` till .NET-appen **med hela `/api/...`-sökvägen och Authorization-headern bevarade**. Övriga Angular-routes ska falla tillbaka till `index.html`; API-fel ska inte skickas till SPA-fallbacken.

Exempel: webbläsarens `/api/books` blir `https://din-domän/api/books`, och proxyn skickar det till `http://api:8080/api/books`. Angulars `proxy.conf.json` används inte i production. TLS/HTTPS-redirect och HSTS hanteras på den publika reverse proxyn; exponera inte intern HTTP direkt.

Detta är **same-origin**, så CORS behövs inte och är inte aktiverat. Om frontend i stället ska anropa ett API på en annan origin måste API-basadress och interceptorns tillåtna destination ändras, och backend måste få en CORS-policy för exakt frontend-origin med nödvändiga metoder och Authorization/Content-Type. Enbart CORS räcker inte med nuvarande relativa API-adresser.

Före deployment: välj värd, konfigurera HTTPS/reverse proxy, hemligheter och beständig SQLite-lagring med backup, applicera migrationer med produktionskonfiguration och testa direktlänkar samt API-anrop. Använd en API-instans med denna SQLite-lösning. Inget är deployat.

JWT lagras i localStorage enligt testkravet. Logout rensar lokal token; en redan utfärdad token gäller till expiration. CRUD skyddas på backend, och citatägaren hämtas alltid från JWT, aldrig från requestens UserId.
