import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Badge } from 'react-bootstrap';
import { redirect } from 'next/navigation';
import DashboardActionButtons from '@/components/ui/DashboardActionButtons';
import { EventStatusBadge, PublishStatusBadge } from '@/components/ui/StatusBadge';

export default async function OlympiadsListPage() {
  const session = await auth();
  if (!session?.user?.email) redirect('/login');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect('/login');

  const olympiads = await prisma.olympiad.findMany({
    where: { authorId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      categories: true,
      organizer: { select: { name: true } },
    },
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold mb-0">Moje souteze</h1>
        <Link href="/dashboard/olympiads/create" className="btn btn-primary btn-sm">
          Nova soutez
        </Link>
      </div>

      <div className="card-custom overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover table-custom mb-0">
            <thead>
              <tr>
                <th>Nazev</th>
                <th>Organizator</th>
                <th>Stav akce</th>
                <th>Publikace</th>
                <th>Kategorie</th>
                <th>Rocnik</th>
                <th>Upraveno</th>
                <th>Akce</th>
              </tr>
            </thead>
            <tbody>
              {olympiads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    Zatim jste nevytvorili zadnou soutez.
                  </td>
                </tr>
              ) : (
                olympiads.map(ol => (
                  <tr key={ol.id}>
                    <td>
                      <strong>{ol.title}</strong>
                      <br />
                      <small className="text-muted">/{ol.slug}</small>
                    </td>
                    <td className="small">{ol.organizer?.name || '-'}</td>
                    <td><EventStatusBadge status={ol.eventStatus} /></td>
                    <td><PublishStatusBadge status={ol.publishStatus} /></td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {ol.categories.slice(0, 2).map(c => (
                          <Badge key={c.id} bg="primary" className="small">{c.name}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="small">{ol.edition ? `${ol.edition}.` : '-'}</td>
                    <td className="small text-muted">{new Date(ol.updatedAt).toLocaleDateString('cs-CZ')}</td>
                    <td>
                      <DashboardActionButtons
                        id={ol.id}
                        currentPublishStatus={ol.publishStatus}
                        currentEventStatus={ol.eventStatus}
                      />
                    </td>
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
