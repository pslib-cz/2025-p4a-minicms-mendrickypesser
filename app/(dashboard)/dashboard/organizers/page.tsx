import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Badge } from 'react-bootstrap';
import OrganizerManager from '@/components/forms/OrganizerForm';

export default async function OrganizersPage() {
  const session = await auth();
  if (!session?.user?.email) redirect('/login');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.role === 'USER') redirect('/dashboard');

  const organizers = await prisma.organizer.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { olympiads: true } },
    },
  });

  return (
    <div>
      <h1 className="fw-bold mb-4">Organizatori</h1>

      <OrganizerManager />

      <div className="card-custom overflow-hidden mt-4">
        <div className="table-responsive">
          <table className="table table-hover table-custom mb-0">
            <thead>
              <tr>
                <th>Nazev</th>
                <th>Typ</th>
                <th>Email</th>
                <th>Telefon</th>
                <th>Adresa</th>
                <th>Web</th>
                <th>Soutezi</th>
              </tr>
            </thead>
            <tbody>
              {organizers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">Zadni organizatori.</td>
                </tr>
              ) : (
                organizers.map((org: any) => (
                  <tr key={org.id}>
                    <td className="fw-bold">{org.name}</td>
                    <td><Badge className="bg-secondary">{org.type}</Badge></td>
                    <td className="small">{org.email || '-'}</td>
                    <td className="small">{org.phone || '-'}</td>
                    <td className="small text-truncate" style={{ maxWidth: '200px' }}>{org.address || '-'}</td>
                    <td className="small">
                      {org.website ? (
                        <a href={org.website.startsWith('http') ? org.website : `https://${org.website}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                          {org.website}
                        </a>
                      ) : '-'}
                    </td>
                    <td><Badge className="bg-primary">{org._count.olympiads}</Badge></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
