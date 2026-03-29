# OlympCMS - Publikační systém pro olympiády
## https://2025-p4a-minicms-mendrickypesser-fo.vercel.app/

Tento projekt je plnohodnotná publikační webová aplikace demonstrující široké možnosti frameworku **Next.js (App Router)**. Aplikace primárně slouží pro správu, prezentaci a katalogizaci školních ročníků, soutěží a olympiád z pohledu jednotlivých autorů/zástupců ročníků.

## Popis aplikace
Aplikace se dělí na tři logické části:
1. **Veřejná část:** Katalog s dynamickým listováním s možností filtrování, stránkování a detailním panelem k dané olympiádě.
2. **Dashboard:** Zabezpečená interní sekce postavená na React Bootstrapu určená pro administrátory k přidávání a editaci olympiád. Obsahuje rovněž TipTap editor.
3. **API (Akce, Route Handlery):** Skrze `server actions` probíhá zabezpečená práce a úprava konkrétních olympiád. O testy a autentizaci se stará moderní **NextAuth** (Auth.js) v kombinaci s Prismou.

## Datový model
Celý datový model běží nad knihovnou Prisma ORM. Oproti klasickým blogům je uzpůsoben pro specifické ročníky soutěží:

- **Auth blok (`User`, `Account`, `Session`)**: Standardní Auth.js model pro uživatele a oAuth přihlášení.
- **Olympiad (`Olympiad`)**: Hlavní tabulka pro publikovaný článek/ročník olympiády, je zde spoustu specializovaných kolonek pro kontakty a termíny okrskových a krajských kol.
- **Category (`Category`)**: Kategorie umožňující štítkování. (Vazba mezi Olympiad.categories a kategorií představuje vyžadovanou vazbu **N:M**).
- **Organizer (`Organizer`)**: Předkládá informace o tom, kdo soutěž zastřešuje.
- **Media (`Media`)**: Tabulka pro obrázky, blob média a PDF obálky (zastupuje vazbu **1:N** s tabulkou Olympiad).

## Seznam funkcí
- Zabezpečené přihlášení přes e-mail/OAuth (NextAuth.js).
- Možnost vkládat, mazat, editovat a provádět "Drafting" u vlastní ročníkové práce skrze dashboard pro administrátory.
- Stránkované, vyhledávatelné a libovolně filtrovatelné seznamy článků s parametry URL pro public space.
- Vercel Blob file systém pro vkládání a odeslání binárních fotek a dokumentů ze stránek do cloudu.
- Detailní SEO meta data s kanonizací rout. Zajištěné generování robotích konfiguračních souborů `robots.ts` a `sitemap.ts`.

## Návod ke spuštění 

**1. Potřebné závislosti a stažení repozitáře:**  
Vložte příkaz pro instalaci všech modulů ve vývojářské složce.  
```bash
npm install
```

**2. Příprava databáze (.env nastavení)**  
Pro spuštění SQLite nebo PostgreSQL si musíte připravit prostředí.  
Vytvořte soubor `.env` postavený primárně podle přiloženého vzoru `cp .env.example .env`. Pro lokální chod Vám postačí zakomentovaný příklad.

**3. Nasazení Tabulek, Inicializace a Spuštění seed.**  
Vygenerujete prázdné tabulky a nasypete demo data z `seed.ts`, což za vás vyhotoví tento spojený příkaz:  
```bash
npx prisma migrate dev --name init
```

**4. Start Vývoje**  
A to je vše! Spustěte lokální vývoj webového serveru portu `3000`.  
```bash
npm run dev
```
