import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { EventStatusBadge } from '@/components/ui/StatusBadge';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default async function Home() {
  const [totalCount, categoryCount, organizerCount, upcoming] = await Promise.all([
    prisma.olympiad.count({ where: { publishStatus: 'PUBLISHED' } }),
    prisma.category.count(),
    prisma.organizer.count(),
    prisma.olympiad.findMany({
      where: { publishStatus: 'PUBLISHED', eventStatus: 'NADCHAZEJICI' },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        categories: true,
        organizer: { select: { name: true } },
      },
    }),
  ]);

  return (
    <>
      <div className="position-absolute top-0 end-0 p-3 p-md-4 z-3">
        <ThemeToggle className="btn-sm btn-outline-light" />
      </div>
      {/* Hero */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <h1>Skolni souteze a olympiady</h1>
              <p className="lead mt-3 mb-4">
                Kompletni prehled soutezi ze seznamu MSMT pro skolni rok 2025/2026.
                Propozice, terminy kol, kontakty na organizatory a vysledky na jednom miste.
              </p>
              <div className="d-flex gap-3">
                <Link href="/olympiady" className="btn btn-primary btn-lg px-4">
                  Prozkoumat souteze
                </Link>
                <Link href="/login" className="btn btn-outline-light btn-lg px-4">
                  Prihlaseni
                </Link>
              </div>
            </div>
            <div className="col-lg-5 d-none d-lg-block text-end">
              <div className="d-flex gap-4 justify-content-end mt-4">
                <div className="stats-card" style={{ background: 'rgba(255,255,255,0.1)', border: 'none' }}>
                  <div className="stats-number" style={{ color: '#fff' }}>{totalCount}</div>
                  <div className="stats-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Soutezi</div>
                </div>
                <div className="stats-card" style={{ background: 'rgba(255,255,255,0.1)', border: 'none' }}>
                  <div className="stats-number" style={{ color: '#fff' }}>{categoryCount}</div>
                  <div className="stats-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Kategorii</div>
                </div>
                <div className="stats-card" style={{ background: 'rgba(255,255,255,0.1)', border: 'none' }}>
                  <div className="stats-number" style={{ color: '#fff' }}>{organizerCount}</div>
                  <div className="stats-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Organizatoru</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-5" style={{ backgroundColor: 'var(--bg-light)' }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card-custom p-4 h-100">
                <h3 className="h5 fw-bold mb-2">Vsechno na jednom miste</h3>
                <p className="text-muted mb-0">
                  Propozice, terminy vsech kol, misto konani i kontakty na organizatory.
                  Ke kazde soutezi najdete vse potrebne.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card-custom p-4 h-100">
                <h3 className="h5 fw-bold mb-2">Oficialni seznam MSMT</h3>
                <p className="text-muted mb-0">
                  Data vychazeji z informativniho seznamu soutezi MSMT pro skolni rok 2025/2026.
                  Pravidelne aktualizovane udaje.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card-custom p-4 h-100">
                <h3 className="h5 fw-bold mb-2">Prehledny archiv</h3>
                <p className="text-muted mb-0">
                  Po skonceni souteze zustavaji vysledky a materialy pro dalsi rocniky.
                  Muzete se podivat, co se resilo loni.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming competitions */}
      {upcoming.length > 0 && (
        <section className="py-5">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold mb-0">Nadchazejici souteze</h2>
              <Link href="/olympiady?eventStatus=NADCHAZEJICI" className="btn btn-outline-primary btn-sm">
                Zobrazit vse
              </Link>
            </div>
            <div className="row g-4">
              {upcoming.map(ol => (
                <div key={ol.id} className="col-md-6 col-lg-4">
                  <div className="card-custom card-custom-clickable h-100 d-flex flex-column">
                    <div className="p-4 flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <EventStatusBadge status={ol.eventStatus} />
                        {ol.internationalRound && (
                          <span className="badge bg-warning text-dark">Mezinarodni</span>
                        )}
                      </div>
                      <h5 className="fw-bold mt-2 mb-1">
                        <Link href={`/olympiady/${ol.slug}`} className="text-decoration-none" style={{ color: 'var(--text-dark)' }}>
                          {ol.title}
                        </Link>
                      </h5>
                      {ol.organizer && (
                        <p className="text-muted small mb-2">{ol.organizer.name}</p>
                      )}
                      {ol.edition && (
                        <span className="text-muted small">{ol.edition}. rocnik</span>
                      )}
                      <div className="mt-2 d-flex flex-wrap gap-1">
                        {ol.categories.slice(0, 3).map(c => (
                          <span key={c.id} className="badge bg-primary small">{c.name}</span>
                        ))}
                      </div>
                    </div>
                    <div className="px-4 pb-3 pt-0">
                      <Link href={`/olympiady/${ol.slug}`} className="btn btn-primary btn-sm w-100">
                        Detail souteze
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
