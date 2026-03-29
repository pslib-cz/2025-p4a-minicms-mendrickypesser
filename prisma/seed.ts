import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"
import * as dotenv from "dotenv"
import { readFileSync } from "fs"
import { join } from "path"

dotenv.config()

const url = process.env.DATABASE_URL || "file:./dev.db"
let prisma: PrismaClient

if (url.startsWith("file:") || url.startsWith("libsql:")) {
  const adapter = new PrismaLibSql({ url })
  prisma = new PrismaClient({ adapter })
} else {
  const pool = new Pool({ connectionString: url, ssl: true })
  const adapter = new PrismaPg(pool)
  prisma = new PrismaClient({ adapter })
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .substring(0, 80)
}

function parseCsv(filePath: string): string[][] {
  let raw = readFileSync(filePath, "utf-8")
  // Strip UTF-8 BOM
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1)

  const lines = raw.split(/\r?\n/)
  const rows: string[][] = []

  for (let i = 2; i < lines.length; i++) { // skip title row + header row
    const line = lines[i].trim()
    if (!line || line.replace(/;/g, "").trim() === "") continue

    // Simple semicolon split — handle quoted fields
    const fields: string[] = []
    let current = ""
    let inQuotes = false
    for (let j = 0; j < line.length; j++) {
      const ch = line[j]
      if (ch === '"') {
        inQuotes = !inQuotes
      } else if (ch === ";" && !inQuotes) {
        fields.push(current.trim())
        current = ""
      } else {
        current += ch
      }
    }
    fields.push(current.trim())

    // Only include rows that have at least a title
    if (fields[0] && fields[0].length > 1) {
      rows.push(fields)
    }
  }

  return rows
}

function guessOrganizerType(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes("univerzit") || lower.includes("fakulta") || lower.includes("vysok")) return "UNIVERZITA"
  if (lower.includes("gymnázi") || lower.includes("škol") || lower.includes("stred") || lower.includes("střed")) return "SKOLA"
  if (lower.includes("z. s.") || lower.includes("z.s.") || lower.includes("spolek") || lower.includes("asociac") || lower.includes("sdružení")) return "NEZISKOVKA"
  if (lower.includes("s. r. o.") || lower.includes("s.r.o.") || lower.includes("a. s.") || lower.includes("a.s.")) return "FIRMA"
  if (lower.includes("jednota") || lower.includes("mensa") || lower.includes("svaz")) return "NEZISKOVKA"
  return "JINE"
}

// Category assignment based on competition name keywords
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Matematika": ["matematik", "math", "pražská střela"],
  "Fyzika": ["fyzik", "fyzikální", "dopplerova vlna"],
  "Chemie": ["chemi", "chemik", "chemická", "chemicko"],
  "Biologie": ["biolog", "přírodopis", "přírodověd", "ekolog"],
  "Informatika": ["informati", "programo", "programát", "baltie", "kyber", "it ", "ict", "digitál"],
  "Robotika": ["robot", "vex", "lego", "roborave", "first"],
  "Dějepis": ["dějepis", "histori"],
  "Jazyky": ["jazyk", "anglick", "německ", "francouz", "česk", "český", "latin", "španěl", "konverzac", "literár", "montaigne", "esej"],
  "Zeměpis": ["zeměpis", "geograf"],
  "Umění": ["umění", "uměl", "výtvarn", "hudeb", "zpěv", "píseň", "divadl", "film", "foto", "kresl"],
  "Technika": ["techni", "staveb", "konstruk", "stroj", "elektr", "stavebn", "řemesl", "svařo"],
  "Ekonomie": ["ekonom", "podnik", "finance", "účetn", "ekotým", "obchod"],
  "Sport": ["sport", "atletik", "gymnasti", "pohyb", "turistik", "orientač"],
  "Přírodní vědy": ["přírodověd", "věděck", "science", "expo", "amavet", "stem"],
  "Projektové soutěže": ["projekt", "innomind", "cimf", "tvořiv", "tvorb"],
  "Společenské vědy": ["společ", "občan", "filosof", "psycholog", "sociál", "práv"],
  "Zdravotnictví": ["zdravot", "první pomoc", "zdravověd"],
}

function assignCategories(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase()
  const matched: string[] = []

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      matched.push(category)
    }
  }

  return matched.length > 0 ? matched : ["Ostatní"]
}

async function main() {
  console.log("Seeding database...")

  // 1. Create admin user
  const adminPassword = process.env.ADMIN_PASSWORD || "Heslo123" // Výchozí pouze pro lokální testování
  const hashedPassword = await bcrypt.hash(adminPassword, 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@olympiady.cz" },
    update: {
      password: hashedPassword,
    },
    create: {
      email: "admin@olympiady.cz",
      name: "Hlavni Koordinator",
      password: hashedPassword,
      role: "ADMIN",
    },
  })
  console.log("Admin created:", admin.email)

  // 2. Create categories
  const allCategoryNames = [...Object.keys(CATEGORY_KEYWORDS), "Ostatní"]
  const categoryMap: Record<string, string> = {}

  for (const name of allCategoryNames) {
    const slug = generateSlug(name)
    const cat = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    })
    categoryMap[name] = cat.id
    console.log("Category:", cat.name)
  }

  // 3. Parse CSV
  const csvPath = join(process.cwd(), "nformativni_seznam_soutezi_MSMT_pro_skolni_rok_2025_2026_3_a(List1).csv")
  
  try {
    if (!readFileSync(csvPath)) throw new Error("CSV file not found")
  } catch (e) {
    console.error(" Kritická chyba: CSV soubor s daty nebyl nalezen v rootu projektu!")
    console.log("Cesta:", csvPath)
    process.exit(1)
  }

  const rows = parseCsv(csvPath)
  console.log(`Parsed ${rows.length} competitions from CSV`)

  // 4. Create organizers (deduplicated)
  const organizerMap: Record<string, string> = {}
  const uniqueOrganizers = new Map<string, string[]>() // name -> first row with that org

  for (const row of rows) {
    const orgName = row[1]
    if (orgName && !uniqueOrganizers.has(orgName)) {
      uniqueOrganizers.set(orgName, row)
    }
  }

  for (const [orgName, row] of uniqueOrganizers) {
    const org = await prisma.organizer.upsert({
      where: { name: orgName },
      update: {},
      create: {
        name: orgName,
        type: guessOrganizerType(orgName),
        email: row[13] || null,
        phone: row[12] || null,
        address: row[15] || null,
        website: row[16] || null,
      },
    })
    organizerMap[orgName] = org.id
  }
  console.log(`Created ${uniqueOrganizers.size} organizers`)

  // 5. Create olympiads from CSV rows
  const usedSlugs = new Set<string>()
  let created = 0

  for (const row of rows) {
    const title = row[0]
    if (!title) continue

    let slug = generateSlug(title)
    if (usedSlugs.has(slug)) {
      slug = slug + "-" + Date.now().toString(36)
    }
    usedSlugs.add(slug)

    const orgName = row[1] || ""
    const description = row[2] || ""
    const editionStr = row[3] || ""
    const edition = parseInt(editionStr) || null
    const competitionType = row[4] || null
    const districtRoundDate = row[5] && row[5] !== "x" ? row[5] : null
    const regionalRoundDate = row[6] && row[6] !== "x" ? row[6] : null
    const nationalRoundDate = row[7] && row[7] !== "x" ? row[7] : null
    const internationalRound = (row[8] || "").toLowerCase() === "ano"
    const msmtSupported = (row[9] || "").toLowerCase() === "ano"
    const rvpDescription = row[10] || null
    const contactPerson = row[11] || null
    const contactPhone = row[12] || null
    const contactEmail = row[13] || null
    const workplaceName = row[14] || null
    const workplaceAddress = row[15] || null
    const website = row[16] || null

    const categoryNames = assignCategories(title, description)
    const categoryConnections = categoryNames
      .filter(n => categoryMap[n])
      .map(n => ({ id: categoryMap[n] }))

    try {
      await prisma.olympiad.upsert({
        where: { slug },
        update: {
          title,
          description: description.substring(0, 500) || null,
          content: description || null,
          edition,
          schoolYear: "2025/2026",
          competitionType,
          districtRoundDate,
          regionalRoundDate,
          nationalRoundDate,
          internationalRound,
          contactPerson,
          contactEmail,
          contactPhone,
          workplaceName,
          workplaceAddress,
          website,
          msmtSupported,
          rvpDescription,
          eventStatus: "NADCHAZEJICI",
          publishStatus: "PUBLISHED",
          authorId: admin.id,
          organizerId: orgName && organizerMap[orgName] ? organizerMap[orgName] : null,
          categories: {
            set: categoryConnections.length > 0
              ? categoryConnections
              : [{ id: categoryMap["Ostatní"] }],
          },
        },
        create: {
          title,
          slug,
          description: description.substring(0, 500) || null,
          content: description || null,
          edition,
          schoolYear: "2025/2026",
          competitionType,
          districtRoundDate,
          regionalRoundDate,
          nationalRoundDate,
          internationalRound,
          contactPerson,
          contactEmail,
          contactPhone,
          workplaceName,
          workplaceAddress,
          website,
          msmtSupported,
          rvpDescription,
          eventStatus: "NADCHAZEJICI",
          publishStatus: "PUBLISHED",
          authorId: admin.id,
          organizerId: orgName && organizerMap[orgName] ? organizerMap[orgName] : null,
          categories: {
            connect: categoryConnections.length > 0
              ? categoryConnections
              : [{ id: categoryMap["Ostatní"] }],
          },
        },
      })
      created++
    } catch (e: any) {
      console.error(`Failed to handle: ${title} — ${e.message}`)
    }
  }

  console.log(`Created ${created} olympiads`)
  console.log("Seeding complete!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
