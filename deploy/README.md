# Publicering på alwaysdata Free

Status: Linux x64-paketet är byggt lokalt (cirka 115 MB); ingen publik deployment är verifierad ännu.

## Varför denna lösning?

Kontrollerat 2026-09-20: [alwaysdata Free](https://www.alwaysdata.com/en/offers/) erbjuder 1 GB lagring och 256 MB RAM för personligt bruk och en alwaysdata.net-adress. [Egna program](https://help.alwaysdata.com/en/docs/web-hosting/sites/http-servers/user-program/) kan köras bakom deras HTTPS-proxy. SQLite-filen ligger i kontots beständiga hemkatalog. Eftersom deras förinstallerade .NET endast är LTS levereras vår **.NET 9-runtime med paketet**. Linux-kompatibilitet måste slutverifieras på kontot före publicering.

[Render Free](https://render.com/docs/free) och [Koyeb Free](https://www.koyeb.com/docs/reference/instances) saknar beständig disk för denna SQLite-app. Oracle Always Free har beständig lagring men kräver normalt kortverifiering och tillgänglig serverkapacitet. Ingen betalplan har aktiverats.

Alwaysdata marknadsför registrering utan kort, men registreringssidan kan kräva kortverifiering mot missbruk. Avbryt i så fall; användaren måste själv godkänna nästa steg. Välj **Free**, inte en tidsbegränsad Plus-provperiod.

## Bygg lokalt

```bash
bash deploy/package.sh
```

Kräver Node 24, .NET SDK från global.json och Python 3 för att exkludera lokal konfiguration. Ladda endast upp innehållet i `artifacts/linux/` till `/home/KONTO/library/app/`. Varken källkod, node_modules, utvecklingsdatabas eller secrets ska laddas upp. Kör en enda API-process.

## Konfigurera kontot

1. Skapa `/home/KONTO/library/data/` utanför `app/wwwroot`. Ge endast kontoanvändaren läs-/skrivrättigheter. Den katalogen ska aldrig ersättas vid en koduppdatering.
2. Lägg följande miljövariabler i webbplatsens skyddade konfiguration (byt KONTO). Generera JWT-nyckeln med `openssl rand -base64 48`; lägg aldrig nyckeln i Git, README eller startkommandot.

```text
ASPNETCORE_ENVIRONMENT=Production
Jwt__Key=<slumpgenererad hemlighet>
ConnectionStrings__DefaultConnection=Data Source=/home/KONTO/library/data/library.db
AllowedHosts=KONTO.alwaysdata.net
```

3. Kör migrationen via SSH från `app` med **samma miljövariabler** tillgängliga i processen: `./Library.Api --migrate`. Webbplatsens miljövariabler gäller inte automatiskt i SSH. Kommandot applicerar befintliga EF-migrationer och avslutas. Det kräver ingen SDK på servern och går att köra igen. Migrationer körs aldrig automatiskt vid normal start.
4. Skapa Web > Sites av typen **User program**. Arbetskatalog: `/home/KONTO/library/app`. Kommando: `./Library.Api --urls "http://$IP:$PORT"`. Kontrollera exekveringsrättighet med `chmod u+x Library.Api` om uppladdningen tappat den.
5. Välj kontots `KONTO.alwaysdata.net`-adress, aktivera HTTPS-certifikat och **tvinga HTTP till HTTPS** i plattformen. TLS avslutas där; exponera inte Kestrel direkt. Aktivera HSTS först när HTTPS är verifierat.

.NET serverar Angular från `wwwroot`. `/api` går direkt till controllers på samma origin; ingen CORS-policy eller Angular-devproxy behövs. Okända API-sökvägar ger 404, och Angular-direktlänkar går till `index.html`.

## Uppdatering, migration och backup

Stoppa webbplatsen innan databasbackup eller migration. Kopiera SQLite-filen samt eventuella `-wal`/`-shm`-filer tillsammans när processen är stoppad, eller använd SQLite Online Backup. Spara en kopia utanför hostingkontot. Ersätt appfilerna, kör `--migrate` en gång och starta sedan webbplatsen. Använd inte `EnsureCreated` eller automatiska nedgraderingar. Vid fel: lämna webbplatsen stoppad och återställ kompatibel kod och databasbackup tillsammans.

Kontrollera ledig disk, inklusive loggar och backup; gratisplanen är begränsad. Radera aldrig datakatalogen vid omstart/deployment.

## Obligatoriskt innan länken lämnas in

Öppna den publika HTTPS-adressen och testa registrering/login, fem startcitat, CRUD, citatägarskap med två konton och direktlänkar till `/quotes` och `/books/new`. Kontrollera `/api/health`, HTTP→HTTPS och att data finns kvar efter en riktig omstart. Först då är appen publicerad och verifierad.
