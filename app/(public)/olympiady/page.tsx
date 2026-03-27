import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Table, Badge, ButtonGroup, Row, Col } from 'react-bootstrap';
import SearchFilterBar from '@/components/ui/SearchFilterBar';
import PaginationControl from '@/components/ui/PaginationControl';
import { EventStatusBadge } from '@/components/ui/StatusBadge';

type SearchParams = {
  view?: string;
  q?: string;
  category?: string;
  eventStatus?: string;
  type?: string;
  international?: string;
  page?: string;
};

export default async function PublicOlympiadsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const isList = params.view === 'list';
  const q = params.q || '';
  const categorySlug = params.category || '';
  const eventStatus = params.eventStatus || '';
  const compType = params.type || '';
  const intl = params.international === '1';
  let currentPage = parseInt(params.page || '1', 10);
  if (isNaN(currentPage) || currentPage < 1) currentPage = 1;

  const take = 12;
  const skip = (currentPage - 1) * take;

  // Build query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = { publishStatus: 'PUBLISHED' };
  if (q) where.title = { contains: q };
  if (categorySlug) where.categories = { some: { slug: categorySlug } };
  if (eventStatus) where.eventStatus = eventStatus;
  if (compType) where.competitionType = compType;
  if (intl) where.internationalRound = true;

  const [olympiads, totalCount, categories, competitionTypes] = await Promise.all([
    prisma.olympiad.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        author: { select: { name: true } },
        categories: true,
        organizer: { select: { name: true } },
      },
    }),
    prisma.olympiad.count({ where }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.olympiad.findMany({
      where: { publishStatus: 'PUBLISHED', competitionType: { not: null } },
      select: { competitionType: true },
      distinct: ['competitionType'],
    }),
  ]);

  const totalPages = Math.ceil(totalCount / take);
  const types = competitionTypes.map(t => t.competitionType).filter(Boolean) as string[];

  const getViewUrl = (view: string) => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (categorySlug) p.set('category', categorySlug);
    if (eventStatus) p.set('eventStatus', eventStatus);
    if (compType) p.set('type', compType);
    if (intl) p.set('international', '1');
    if (currentPage > 1) p.set('page', currentPage.toString());
    p.set('view', view);
    return `/olympiady?${p.toString()}`;
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold mb-1">Souteze a olympiady</h1>
          <p className="text-muted mb-0">{totalCount} soutezi nalezeno</p>
        </div>
        <ButtonGroup>
          <Link href={getViewUrl('grid')} className={`btn btn-sm ${!isList ? 'btn-primary' : 'btn-outline-primary'}`}>
            Mrizka
          </Link>
          <Link href={getViewUrl('list')} className={`btn btn-sm ${isList ? 'btn-primary' : 'btn-outline-primary'}`}>
            Seznam
          </Link>
        </ButtonGroup>
      </div>

      <SearchFilterBar categories={categories} competitionTypes={types} />

      {olympiads.length === 0 && (
        <div className="text-center py-5">
          <p className="text-muted fs-5">Zadanym kriterium momentalne neodpovidaji zadne souteze.</p>
          <Link href="/olympiady" className="btn btn-outline-primary">Zobrazit vse</Link>
        </div>
      )}

      {/* Grid View */}
      {!isList && olympiads.length > 0 && (
        <Row xs={1} md={2} lg={3} className="g-4">
          {olympiads.map(ol => (
            <Col key={ol.id}>
              <div className="card-custom card-custom-clickable h-100 d-flex flex-column">
                <div className="p-4 flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <EventStatusBadge status={ol.eventStatus} />
                    {ol.internationalRound && (
                      <span className="badge bg-warning text-dark small">Mezinarodni</span>
                    )}
                  </div>
                  <h5 className="fw-bold mt-2 mb-1">
                    <Link href={`/olympiady/${ol.slug}`} className="text-decoration-none" style={{ color: 'var(--text-dark)' }}>
                      {ol.title}
                    </Link>
                  </h5>
                  {ol.organizer && (
                    <p className="text-muted small mb-1">{ol.organizer.name}</p>
                  )}
                  <div className="d-flex flex-wrap gap-1 mb-2">
                    {ol.edition && <span className="text-muted small me-2">{ol.edition}. rocnik</span>}
                    {ol.competitionType && <span className="text-muted small">{ol.competitionType}</span>}
                  </div>
                  <div className="d-flex flex-wrap gap-1 mb-2">
                    {ol.categories.slice(0, 3).map(c => (
                      <Badge key={c.id} bg="primary" className="small">{c.name}</Badge>
                    ))}
                  </div>
                  {ol.description && (
                    <p className="text-muted small text-truncate-3 mb-0">{ol.description}</p>
                  )}
                </div>
                <div className="px-4 pb-3">
                  <Link href={`/olympiady/${ol.slug}`} className="btn btn-primary btn-sm w-100">
                    Detail souteze
                  </Link>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}

      {/* List View */}
      {isList && olympiads.length > 0 && (
        <div className="card-custom overflow-hidden">
          <Table responsive hover className="table-custom mb-0">
            <thead>
              <tr>
                <th>Nazev</th>
                <th>Organizator</th>
                <th>Kategorie</th>
                <th>Rocnik</th>
                <th>Stav</th>
                <th>Mezinar.</th>
              </tr>
            </thead>
            <tbody>
              {olympiads.map(ol => (
                <tr key={ol.id}>
                  <td>
                    <Link href={`/olympiady/${ol.slug}`} className="text-decoration-none fw-bold" style={{ color: 'var(--text-dark)' }}>
                      {ol.title}
                    </Link>
                    {ol.competitionType && (
                      <div className="text-muted small">{ol.competitionType}</div>
                    )}
                  </td>
                  <td className="small">{ol.organizer?.name || '-'}</td>
                  <td>
                    <div className="d-flex gap-1 flex-wrap">
                      {ol.categories.slice(0, 2).map(c => (
                        <Badge key={c.id} bg="primary" className="small">{c.name}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="small">{ol.edition ? `${ol.edition}.` : '-'}</td>
                  <td><EventStatusBadge status={ol.eventStatus} /></td>
                  <td>{ol.internationalRound ? 'Ano' : '-'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <PaginationControl currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
