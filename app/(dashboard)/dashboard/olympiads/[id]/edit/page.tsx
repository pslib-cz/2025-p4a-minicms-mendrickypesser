import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import EditOlympiadForm from '@/components/forms/EditOlympiadForm';

export default async function EditOlympiadPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) redirect('/login');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect('/login');

  const { id } = await params;

  const olympiad = await prisma.olympiad.findFirst({
    where: { id, authorId: user.id },
    include: { categories: true, media: true },
  });

  if (!olympiad) redirect('/dashboard/olympiads');

  const [categories, organizers] = await Promise.all([
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.organizer.findMany({ select: { id: true, name: true, type: true }, orderBy: { name: 'asc' } }),
  ]);

  const initialData = {
    id: olympiad.id,
    title: olympiad.title,
    description: olympiad.description,
    content: olympiad.content,
    edition: olympiad.edition,
    schoolYear: olympiad.schoolYear,
    competitionType: olympiad.competitionType,
    targetAudience: olympiad.targetAudience,
    districtRoundDate: olympiad.districtRoundDate,
    regionalRoundDate: olympiad.regionalRoundDate,
    nationalRoundDate: olympiad.nationalRoundDate,
    internationalRound: olympiad.internationalRound,
    locationName: olympiad.locationName,
    locationAddress: olympiad.locationAddress,
    contactPerson: olympiad.contactPerson,
    contactEmail: olympiad.contactEmail,
    contactPhone: olympiad.contactPhone,
    workplaceName: olympiad.workplaceName,
    workplaceAddress: olympiad.workplaceAddress,
    website: olympiad.website,
    resultsUrl: olympiad.resultsUrl,
    registrationUrl: olympiad.registrationUrl,
    eventStatus: olympiad.eventStatus as "NADCHAZEJICI" | "PROBIHAJICI" | "DOKONCENA" | "ZRUSENA",
    publishStatus: olympiad.publishStatus as "DRAFT" | "PUBLISHED",
    msmtSupported: olympiad.msmtSupported,
    rvpDescription: olympiad.rvpDescription,
    organizerId: olympiad.organizerId,
    categories: olympiad.categories.map(c => c.id),
    coverImage: olympiad.coverImage,
    gallery: olympiad.media.filter(m => m.purpose === 'GALLERY').map(m => ({ url: m.url, name: m.name || '' })),
    resultFiles: olympiad.media.filter(m => m.purpose === 'RESULT').map(m => ({ url: m.url, name: m.name || '' })),
    attachments: olympiad.media.filter(m => m.purpose === 'ATTACHMENT').map(m => ({ url: m.url, name: m.name || '' })),
    registrationDeadline: olympiad.registrationDeadline
      ? new Date(olympiad.registrationDeadline).toISOString().slice(0, 16)
      : null,
  };

  return (
    <div>
      <h1 className="fw-bold mb-4">Upravit soutez</h1>
      <EditOlympiadForm categories={categories} organizers={organizers} initialData={initialData} />
    </div>
  );
}
