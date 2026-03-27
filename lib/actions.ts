'use server';

import { auth } from './auth';
import { prisma } from './prisma';
import { olympiadSchema, OlympiadFormValues, organizerSchema, OrganizerFormValues } from './zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .substring(0, 80) + "-" + Date.now().toString(36);
}

async function requireUser() {
  const session = await auth();
  if (!session?.user?.email) throw new Error('Nejste prihlaseni.');
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error('Uzivatel nebyl nalezen.');
  return user;
}

// ─── Olympiad CRUD ───────────────────────────────────────────────

export async function createOlympiad(data: OlympiadFormValues) {
  const user = await requireUser();
  const parsed = olympiadSchema.parse(data);
  const slug = generateSlug(parsed.title);

  await prisma.olympiad.create({
    data: {
      title: parsed.title,
      slug,
      description: parsed.description || null,
      content: parsed.content || null,
      edition: parsed.edition || null,
      schoolYear: parsed.schoolYear || null,
      competitionType: parsed.competitionType || null,
      targetAudience: parsed.targetAudience || null,
      districtRoundDate: parsed.districtRoundDate || null,
      regionalRoundDate: parsed.regionalRoundDate || null,
      nationalRoundDate: parsed.nationalRoundDate || null,
      internationalRound: parsed.internationalRound,
      locationName: parsed.locationName || null,
      locationAddress: parsed.locationAddress || null,
      contactPerson: parsed.contactPerson || null,
      contactEmail: parsed.contactEmail || null,
      contactPhone: parsed.contactPhone || null,
      workplaceName: parsed.workplaceName || null,
      workplaceAddress: parsed.workplaceAddress || null,
      website: parsed.website || null,
      resultsUrl: parsed.resultsUrl || null,
      registrationUrl: parsed.registrationUrl || null,
      eventStatus: parsed.eventStatus,
      publishStatus: parsed.publishStatus,
      msmtSupported: parsed.msmtSupported,
      rvpDescription: parsed.rvpDescription || null,
      registrationDeadline: parsed.registrationDeadline ? new Date(parsed.registrationDeadline) : null,
      coverImage: parsed.coverImage || null,
      authorId: user.id,
      organizerId: parsed.organizerId || null,
      categories: {
        connect: parsed.categories.map((id) => ({ id })),
      },
      media: {
        create: [
          ...(parsed.gallery || []).map(g => ({ url: g.url, name: g.name, fileType: 'IMAGE', purpose: 'GALLERY' })),
          ...(parsed.resultFiles || []).map(r => ({ url: r.url, name: r.name, fileType: 'PDF', purpose: 'RESULT' })),
          ...(parsed.attachments || []).map(a => ({ url: a.url, name: a.name, fileType: 'PDF', purpose: 'ATTACHMENT' })),
        ],
      },
    },
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/olympiads');
  revalidatePath('/olympiady');
  redirect('/dashboard/olympiads');
}

export async function updateOlympiad(id: string, data: OlympiadFormValues) {
  const user = await requireUser();

  const existing = await prisma.olympiad.findFirst({
    where: { id, authorId: user.id },
    include: { media: true },
  });
  if (!existing) throw new Error('Zaznam nebyl nalezen.');

  const parsed = olympiadSchema.parse(data);
  const slug = generateSlug(parsed.title);

  // Delete old media and re-create
  await prisma.media.deleteMany({ where: { olympiadId: id } });

  await prisma.olympiad.update({
    where: { id },
    data: {
      title: parsed.title,
      slug,
      description: parsed.description || null,
      content: parsed.content || null,
      edition: parsed.edition || null,
      schoolYear: parsed.schoolYear || null,
      competitionType: parsed.competitionType || null,
      targetAudience: parsed.targetAudience || null,
      districtRoundDate: parsed.districtRoundDate || null,
      regionalRoundDate: parsed.regionalRoundDate || null,
      nationalRoundDate: parsed.nationalRoundDate || null,
      internationalRound: parsed.internationalRound,
      locationName: parsed.locationName || null,
      locationAddress: parsed.locationAddress || null,
      contactPerson: parsed.contactPerson || null,
      contactEmail: parsed.contactEmail || null,
      contactPhone: parsed.contactPhone || null,
      workplaceName: parsed.workplaceName || null,
      workplaceAddress: parsed.workplaceAddress || null,
      website: parsed.website || null,
      resultsUrl: parsed.resultsUrl || null,
      registrationUrl: parsed.registrationUrl || null,
      eventStatus: parsed.eventStatus,
      publishStatus: parsed.publishStatus,
      msmtSupported: parsed.msmtSupported,
      rvpDescription: parsed.rvpDescription || null,
      registrationDeadline: parsed.registrationDeadline ? new Date(parsed.registrationDeadline) : null,
      coverImage: parsed.coverImage || null,
      organizerId: parsed.organizerId || null,
      categories: {
        set: parsed.categories.map((catId) => ({ id: catId })),
      },
      media: {
        create: [
          ...(parsed.gallery || []).map(g => ({ url: g.url, name: g.name, fileType: 'IMAGE', purpose: 'GALLERY' })),
          ...(parsed.resultFiles || []).map(r => ({ url: r.url, name: r.name, fileType: 'PDF', purpose: 'RESULT' })),
          ...(parsed.attachments || []).map(a => ({ url: a.url, name: a.name, fileType: 'PDF', purpose: 'ATTACHMENT' })),
        ],
      },
    },
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/olympiads');
  revalidatePath('/olympiady');
  redirect('/dashboard/olympiads');
}

export async function deleteOlympiad(id: string) {
  const user = await requireUser();
  await prisma.olympiad.deleteMany({
    where: { id, authorId: user.id },
  });
  revalidatePath('/dashboard/olympiads');
  revalidatePath('/olympiady');
}

export async function togglePublishStatus(id: string, currentStatus: string) {
  const user = await requireUser();
  const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
  await prisma.olympiad.updateMany({
    where: { id, authorId: user.id },
    data: {
      publishStatus: newStatus,
      publishDate: newStatus === 'PUBLISHED' ? new Date() : null,
    },
  });
  revalidatePath('/dashboard/olympiads');
  revalidatePath('/olympiady');
}

export async function updateEventStatus(id: string, newStatus: string) {
  const user = await requireUser();
  await prisma.olympiad.updateMany({
    where: { id, authorId: user.id },
    data: { eventStatus: newStatus },
  });
  revalidatePath('/dashboard/olympiads');
  revalidatePath('/olympiady');
}

// ─── Organizer CRUD ──────────────────────────────────────────────

export async function createOrganizer(data: OrganizerFormValues) {
  await requireUser();
  const parsed = organizerSchema.parse(data);

  const organizer = await prisma.organizer.create({
    data: {
      name: parsed.name,
      type: parsed.type,
      address: parsed.address || null,
      website: parsed.website || null,
      email: parsed.email || null,
      phone: parsed.phone || null,
      description: parsed.description || null,
    },
  });

  revalidatePath('/dashboard/organizers');
  return organizer;
}

export async function updateOrganizer(id: string, data: OrganizerFormValues) {
  await requireUser();
  const parsed = organizerSchema.parse(data);

  await prisma.organizer.update({
    where: { id },
    data: {
      name: parsed.name,
      type: parsed.type,
      address: parsed.address || null,
      website: parsed.website || null,
      email: parsed.email || null,
      phone: parsed.phone || null,
      description: parsed.description || null,
    },
  });

  revalidatePath('/dashboard/organizers');
}

export async function deleteOrganizer(id: string) {
  await requireUser();

  const count = await prisma.olympiad.count({ where: { organizerId: id } });
  if (count > 0) throw new Error(`Organizator ma ${count} pripojenych soutezi. Nejdrive je odpojte.`);

  await prisma.organizer.delete({ where: { id } });
  revalidatePath('/dashboard/organizers');
}
