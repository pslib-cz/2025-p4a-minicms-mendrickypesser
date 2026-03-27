# Zadání: Next.js (App Router) Demo Aplikace

Cílem je vytvořit plnohodnotnou publikační webovou aplikaci demonstrující možnosti frameworku Next.js (App Router). Aplikace musí obsahovat veřejnou část, interní dashboard a vlastní API.

Aplikace bude sloužit jako platforma pro publikování obsahu (např. články, recenze, galerie, návody apod.). Každý uživatel spravuje pouze svůj vlastní obsah.

## Funkční požadavky

### Datový model
Použijte **Prisma ORM**.

Databáze musí obsahovat:

**Povinné entity:**
- `User` (řeší Auth knihovna)
- Entity hlavního obsahu (např. *Article / Review / Photo / Recipe…*)
- Entity pro kategorizaci (např. *Tag / Category / Gallery / Rating…*)

**Povinné vztahy:**
- alespoň jedna vazba **1:N** (např. `User` → `Articles`)
- alespoň jedna vazba **N:M** (např. `Article` ↔ `Tag`)

**Každý obsah musí obsahovat minimálně:**
- `title`
- `slug` (unikátní URL)
- `content` / `description`
- `createdAt`
- `updatedAt`
- `publishDate`

> [!NOTE]
> SQLite stačí pro lokální vývoj.  
> Při nasazení na Vercel je nutné použít PostgreSQL.

---

### Autentizace a identita
Je nutné implementovat přihlášení uživatelů pomocí hotového řešení (např. Auth.js / NextAuth).

**Požadavky:**
- pouze přihlášený uživatel může pracovat s dashboardem
- uživatel může vidět a upravovat pouze vlastní obsah
- API musí ověřovat session (nejen UI)

---

## Architektura aplikace

### Veřejná část (Public)
Veřejná část představuje klasický web zobrazující publikovaný obsah.

Musí být implementována pomocí **Server Components**.

**Povinné funkce:**
- seznam publikovaného obsahu
- detail obsahu (dynamic routes)
- vyhledávání podle title / textu
- filtrování podle tagů / kategorií
- stránkování

**SEO:**
- dynamické metadata (title, description)
- OpenGraph metadata
- canonical URL
- `sitemap.xml`
- `robots.txt`

### Dashboard (interní část)
Dashboard slouží pro správu vlastního obsahu. 

Musí být implementován pomocí **Client Components** a komunikovat s backendem přes Route Handlers (API).

**Použijte UI knihovnu (např.):**
- React Bootstrap
- PrimeReact
- Mantine
- Material UI
- Ant Design
- Fluent UI
- NextUI
- Carbon Design System

**Funkce dashboardu:**
- seznam vlastního obsahu (se stránkováním)
- vytvoření obsahu (s WYSIWYG editorem u článků)
- editace obsahu
- smazání obsahu
- změna statusu draft/published
- práce s tagy / kategoriemi
- formulářová validace

### API (Route Handlers)
Aplikace musí obsahovat vlastní API.

**Požadavky:**
- CRUD operace pro hlavní entitu
- kontrola přihlášení
- kontrola vlastnictví dat (user ownership)
- server-side validace vstupů

### Povinné Next.js funkce
Aplikace musí využívat alespoň **2 z následujících funkcí**:
- `revalidate` / ISR
- `next/image` optimalizace
- metadata - generované z obsahu
- dynamic routes
- server actions (volitelné)

---

## Objevitelská část

### Analytika
Zprovozněte alespoň jeden nástroj:
- Google Analytics
- Microsoft Clarity
- Matomo On-Premise
- jiný ekvivalent

> Stačí prokazatelně zaznamenat pageview. S ohledem na zpracovávaná data nezapomeňte uživatele požádat o souhlas se sledovacími cookies (např. *CookieConsent v3 Playground*). A ujistěte se, že aplikace funguje, i když je uživatel nepovolí.

### SEO kontrola
Proveďte Lighthouse audit a uložte si screenshot nebo poznámky k odstranění nedostatků.

### Nasazení
Aplikaci publikujte online (Vercel, sandbox nebo jiná platforma).

**Po nasazení zkonfigurujte analytické nástroje:**
- Google Search Console
- Bing Webmaster Tools

---

## Požadavky na dokumentaci a zprovoznitelnost
Repozitář musí obsahovat:
- Prisma migrace
- seed script s demo daty
- `.env.example`
- `README.md` obsahující:
  - popis aplikace
  - datový model
  - seznam funkcí
  - návod ke spuštění

---

## Hodnocení
1. Veřejná část + vzhled + Next.js funkce
2. Interní administrace + API
3. Nasazení a integrace analytických nástrojů