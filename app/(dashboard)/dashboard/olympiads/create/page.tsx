import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CreateOlympiadForm from '@/components/forms/CreateOlympiadForm';

export default async function CreateOlympiadPage() {
  const session = await auth();
  if (!session?.user?.email) redirect('/login');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.role === 'USER') redirect('/dashboard');

  const [categories, organizers] = await Promise.all([
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.organizer.findMany({ select: { id: true, name: true, type: true }, orderBy: { name: 'asc' } }),
  ]);

  return (
    <div>
      <h1 className="fw-bold mb-4">Nova soutez</h1>
      <CreateOlympiadForm categories={categories} organizers={organizers} />
    </div>
  );
}
