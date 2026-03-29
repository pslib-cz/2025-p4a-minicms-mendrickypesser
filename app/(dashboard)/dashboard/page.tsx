import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { EventStatusBadge, PublishStatusBadge } from '@/components/ui/StatusBadge';

export default async function DashboardOverview() {
  const session = await auth();
  if (!session?.user?.email) redirect('/login');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect('/login');

  const [total, published, drafts, upcoming, completed, cancelled, recent] = await Promise.all([
    prisma.olympiad.count({ where: { authorId: user.id } }),
    prisma.olympiad.count({ where: { authorId: user.id, publishStatus: 'PUBLISHED' } }),
    prisma.olympiad.count({ where: { authorId: user.id, publishStatus: 'DRAFT' } }),
    prisma.olympiad.count({ where: { authorId: user.id, eventStatus: 'NADCHAZEJICI' } }),
    prisma.olympiad.count({ where: { authorId: user.id, eventStatus: 'DOKONCENA' } }),
    prisma.olympiad.count({ where: { authorId: user.id, eventStatus: 'ZRUSENA' } }),
    prisma.olympiad.findMany({
      where: { authorId: user.id },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: { categories: true },
    }),
  ]);

  return (
    <div>
      <h1 className="fw-bold mb-4">Prehled</h1>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Celkem soutezi', value: total, color: 'var(--primary)' },
          { label: 'Publikovano', value: published, color: '#198754' },
          { label: 'Koncepty', value: drafts, color: '#ffc107' },
          { label: 'Nadchazejici', value: upcoming, color: '#0d6efd' },
          { label: 'Dokoncene', value: completed, color: '#6c757d' },
          { label: 'Zrusene', value: cancelled, color: '#dc3545' },
        ].map((stat: any) => (
          <div key={stat.label} className="col-6 col-md-4 col-lg-2">
            <div className="stats-card">
              <div className="stats-number" style={{ color: stat.color }}>{stat.value}</div>
              <div className="stats-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="d-flex gap-2 mb-4">
        <Link href="/dashboard/olympiads/create" className="btn btn-primary btn-sm">Nova soutez</Link>
        <Link href="/dashboard/olympiads" className="btn btn-outline-primary btn-sm">Vsechny souteze</Link>
        <Link href="/dashboard/organizers" className="btn btn-outline-secondary btn-sm">Organizatori</Link>
      </div>

      {/* Recent activity */}
      <div className="card-custom">
        <div className="p-3 border-bottom" style={{ backgroundColor: 'var(--bg-light)' }}>
          <h2 className="h6 fw-bold mb-0">Posledni aktivita</h2>
        </div>
        {recent.length === 0 ? (
          <div className="p-4 text-center text-muted">
            Zatim jste nevytvorili zadnou soutez.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Nazev</th>
                  <th>Stav akce</th>
                  <th>Publikace</th>
                  <th>Posledni uprava</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recent.map((ol: any) => (
                  <tr key={ol.id}>
                    <td className="fw-bold">{ol.title}</td>
                    <td><EventStatusBadge status={ol.eventStatus} /></td>
                    <td><PublishStatusBadge status={ol.publishStatus} /></td>
                    <td className="text-muted small">{new Date(ol.updatedAt).toLocaleDateString('cs-CZ')}</td>
                    <td>
                      <Link href={`/dashboard/olympiads/${ol.id}/edit`} className="btn btn-outline-primary btn-sm">
                        Upravit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
