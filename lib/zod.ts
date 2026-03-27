import { z } from "zod";

const optionalUrl = z.union([z.literal(''), z.string().url('Zadejte platnou URL adresu')]).optional().nullable();
const optionalEmail = z.union([z.literal(''), z.string().email('Zadejte platnou emailovou adresu')]).optional().nullable();

export const olympiadSchema = z.object({
  // Core
  title: z.string().min(3, "Nazev musi mit alespon 3 znaky."),
  description: z.string().optional().nullable(),
  content: z.string().optional().nullable(),

  // Edition & classification
  edition: z.number().int().positive().optional().nullable(),
  schoolYear: z.string().optional().nullable(),
  competitionType: z.string().optional().nullable(),
  targetAudience: z.string().optional().nullable(),

  // Round dates (Czech text)
  districtRoundDate: z.string().optional().nullable(),
  regionalRoundDate: z.string().optional().nullable(),
  nationalRoundDate: z.string().optional().nullable(),
  internationalRound: z.boolean().default(false),

  // Location
  locationName: z.string().optional().nullable(),
  locationAddress: z.string().optional().nullable(),

  // Contact
  contactPerson: z.string().optional().nullable(),
  contactEmail: optionalEmail,
  contactPhone: z.string().optional().nullable(),
  workplaceName: z.string().optional().nullable(),
  workplaceAddress: z.string().optional().nullable(),

  // Web & links
  website: optionalUrl,
  resultsUrl: optionalUrl,
  registrationUrl: optionalUrl,

  // Status
  eventStatus: z.enum(["NADCHAZEJICI", "PROBIHAJICI", "DOKONCENA", "ZRUSENA"]).default("NADCHAZEJICI"),
  publishStatus: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),

  // MSMT
  msmtSupported: z.boolean().default(false),
  rvpDescription: z.string().optional().nullable(),

  // Relations
  organizerId: z.string().optional().nullable(),
  categories: z.array(z.string()).min(1, "Vyberte alespon jednu kategorii"),

  // Media
  coverImage: z.string().optional().nullable(),
  gallery: z.array(z.object({ url: z.string(), name: z.string() })).optional().nullable(),
  resultFiles: z.array(z.object({ url: z.string(), name: z.string() })).optional().nullable(),
  attachments: z.array(z.object({ url: z.string(), name: z.string() })).optional().nullable(),

  // Dates
  registrationDeadline: z.string().optional().nullable(),
});

export type OlympiadFormValues = z.infer<typeof olympiadSchema>;

export const organizerSchema = z.object({
  name: z.string().min(2, "Nazev musi mit alespon 2 znaky."),
  type: z.enum(["OSOBA", "SKOLA", "NEZISKOVKA", "UNIVERZITA", "FIRMA", "JINE"]).default("JINE"),
  address: z.string().optional().nullable(),
  website: optionalUrl,
  email: optionalEmail,
  phone: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export type OrganizerFormValues = z.infer<typeof organizerSchema>;
