import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Badge } from 'react-bootstrap';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { EventStatusBadge } from '@/components/ui/StatusBadge';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const olympiad = await prisma.olympiad.findUnique({ where: { slug } });
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!olympiad) return { title: 'Nenalezeno' };

  return {
    title: olympiad.title,
    description: olympiad.description || 'Propozice a informace k soutezi',
    alternates: { canonical: `${baseUrl}/olympiady/${slug}` },
    openGraph: {
      title: olympiad.title,
      description: olympiad.description || '',
      url: `${baseUrl}/olympiady/${slug}`,
      type: 'article',
    },
  };
}

export default async function OlympiadDetailPage({ params }: Props) {
  const { slug } = await params;

  const olympiad = await prisma.olympiad.findUnique({
    where: { slug },
    include: {
      author: true,
      categories: true,
      media: true,
      organizer: true,
    },
  });

  if (!olympiad || olympiad.publishStatus !== 'PUBLISHED') notFound();

  const gallery = olympiad.media.filter((m: any) => m.purpose === 'GALLERY');
  const results = olympiad.media.filter((m: any) => m.purpose === 'RESULT');
  const attachments = olympiad.media.filter((m: any) => m.purpose === 'ATTACHMENT');

  const hasRounds = olympiad.districtRoundDate || olympiad.regionalRoundDate || olympiad.nationalRoundDate;
  const hasContact = olympiad.contactPerson || olympiad.contactEmail || olympiad.contactPhone;
  const hasLocation = olympiad.locationName || olympiad.locationAddress;

  return (
    <div className="container py-4">
      <Link href="/olympiady" className="btn btn-outline-secondary btn-sm mb-4">
        Zpet na seznam
      </Link>

      <article>
        {/* Header */}
        <header className="mb-4">
          <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
            <EventStatusBadge status={olympiad.eventStatus} />
            {olympiad.internationalRound && (
              <Badge className="bg-warning text-dark">Mezinarodni ucast</Badge>
            )}
            {olympiad.msmtSupported && (
              <Badge className="bg-success">Podpora MSMT</Badge>
            )}
          </div>
          <h1 className="fw-bold mb-2" style={{ fontSize: '2rem' }}>{olympiad.title}</h1>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {olympiad.categories.map((c: any) => (
              <Badge key={c.id} bg="primary" className="me-2">{c.name}</Badge>
            ))}
          </div>
          <div className="text-muted">
            Publikovano: {new Date(olympiad.createdAt).toLocaleDateString('cs-CZ')}
            {olympiad.author.name && <> | Autor: {olympiad.author.name}</>}
          </div>
        </header>

        {/* Cover image */}
        {olympiad.coverImage && (
          <div className="position-relative w-100 mb-4 rounded overflow-hidden" style={{ minHeight: '300px', backgroundColor: 'var(--bg-light)' }}>
            <Image src={olympiad.coverImage} alt={olympiad.title} fill className="object-fit-cover" />
          </div>
        )}

        <div className="row g-4">
          {/* Main content */}
          <div className="col-lg-8">
            {/* Description */}
            {olympiad.description && (
              <div className="card-custom p-4 mb-4">
                <p className="lead mb-0" style={{ borderLeft: '4px solid var(--primary)', paddingLeft: '1rem' }}>
                  {olympiad.description}
                </p>
              </div>
            )}

            {/* Rich text content */}
            {olympiad.content && (
              <div className="card-custom p-4 mb-4">
                <h2 className="h5 fw-bold mb-3">Podrobne informace</h2>
                <div className="tiptap-content" dangerouslySetInnerHTML={{ __html: olympiad.content }} />
              </div>
            )}

            {/* RVP Description */}
            {olympiad.rvpDescription && (
              <div className="card-custom p-4 mb-4">
                <h2 className="h5 fw-bold mb-3">Navaznost na RVP</h2>
                <p className="mb-0 text-muted">{olympiad.rvpDescription}</p>
              </div>
            )}

            {/* Gallery */}
            {gallery.length > 0 && (
              <div className="card-custom p-4 mb-4">
                <h2 className="h5 fw-bold mb-3">Galerie</h2>
                <div className="gallery-grid">
                  {gallery.map((m: any) => (
                    <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer">
                      <img src={m.url} alt={m.name || 'Fotografie'} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Result files */}
            {results.length > 0 && (
              <div className="card-custom p-4 mb-4">
                <h2 className="h5 fw-bold mb-3">Vysledky</h2>
                <div className="d-flex flex-column gap-2">
                  {results.map((m: any) => (
                    <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm text-start">
                      {m.name || 'Dokument'}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="card-custom p-4 mb-4">
                <h2 className="h5 fw-bold mb-3">Prilohy</h2>
                <div className="d-flex flex-column gap-2">
                  {attachments.map((m: any) => (
                    <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary btn-sm text-start">
                      {m.name || 'Priloha'}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            {/* Basic info */}
            <div className="card-custom p-4 mb-4">
              <h3 className="h6 fw-bold mb-3 text-uppercase" style={{ letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Zakladni udaje</h3>

              {olympiad.edition && (
                <div className="detail-section py-2">
                  <div className="detail-label">Rocnik</div>
                  <div className="detail-value">{olympiad.edition}.</div>
                </div>
              )}
              {olympiad.schoolYear && (
                <div className="detail-section py-2">
                  <div className="detail-label">Skolni rok</div>
                  <div className="detail-value">{olympiad.schoolYear}</div>
                </div>
              )}
              {olympiad.competitionType && (
                <div className="detail-section py-2">
                  <div className="detail-label">Typ souteze</div>
                  <div className="detail-value">{olympiad.competitionType}</div>
                </div>
              )}
              {olympiad.targetAudience && (
                <div className="detail-section py-2">
                  <div className="detail-label">Cilova skupina</div>
                  <div className="detail-value">{olympiad.targetAudience}</div>
                </div>
              )}
            </div>

            {/* Rounds */}
            {hasRounds && (
              <div className="card-custom p-4 mb-4">
                <h3 className="h6 fw-bold mb-3 text-uppercase" style={{ letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Terminy kol</h3>
                {olympiad.districtRoundDate && (
                  <div className="detail-section py-2">
                    <div className="detail-label">Okresni kolo</div>
                    <div className="detail-value">{olympiad.districtRoundDate}</div>
                  </div>
                )}
                {olympiad.regionalRoundDate && (
                  <div className="detail-section py-2">
                    <div className="detail-label">Krajske kolo</div>
                    <div className="detail-value">{olympiad.regionalRoundDate}</div>
                  </div>
                )}
                {olympiad.nationalRoundDate && (
                  <div className="detail-section py-2">
                    <div className="detail-label">Ustredni kolo</div>
                    <div className="detail-value">{olympiad.nationalRoundDate}</div>
                  </div>
                )}
                {olympiad.internationalRound && (
                  <div className="detail-section py-2">
                    <div className="detail-label">Mezinarodni nadstavba</div>
                    <div className="detail-value">Ano</div>
                  </div>
                )}
              </div>
            )}

            {/* Organizer */}
            {olympiad.organizer && (
              <div className="card-custom p-4 mb-4">
                <h3 className="h6 fw-bold mb-3 text-uppercase" style={{ letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Organizator</h3>
                <div className="detail-value fw-bold mb-1">{olympiad.organizer.name}</div>
                {olympiad.organizer.type && (
                  <Badge className="bg-secondary mb-2">{olympiad.organizer.type}</Badge>
                )}
                {olympiad.organizer.address && (
                  <div className="text-muted small">{olympiad.organizer.address}</div>
                )}
                {olympiad.organizer.website && (
                  <a href={olympiad.organizer.website.startsWith('http') ? olympiad.organizer.website : `https://${olympiad.organizer.website}`} target="_blank" rel="noopener noreferrer" className="small d-block mt-1" style={{ color: 'var(--primary)' }}>
                    {olympiad.organizer.website}
                  </a>
                )}
              </div>
            )}

            {/* Contact */}
            {hasContact && (
              <div className="card-custom p-4 mb-4">
                <h3 className="h6 fw-bold mb-3 text-uppercase" style={{ letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Kontakt</h3>
                {olympiad.contactPerson && (
                  <div className="detail-section py-2">
                    <div className="detail-label">Kontaktni osoba</div>
                    <div className="detail-value">{olympiad.contactPerson}</div>
                  </div>
                )}
                {olympiad.contactEmail && (
                  <div className="detail-section py-2">
                    <div className="detail-label">Email</div>
                    <a href={`mailto:${olympiad.contactEmail}`} className="detail-value" style={{ color: 'var(--primary)' }}>{olympiad.contactEmail}</a>
                  </div>
                )}
                {olympiad.contactPhone && (
                  <div className="detail-section py-2">
                    <div className="detail-label">Telefon</div>
                    <a href={`tel:${olympiad.contactPhone}`} className="detail-value" style={{ color: 'var(--primary)' }}>{olympiad.contactPhone}</a>
                  </div>
                )}
                {olympiad.workplaceName && (
                  <div className="detail-section py-2">
                    <div className="detail-label">Pracoviste</div>
                    <div className="detail-value">{olympiad.workplaceName}</div>
                  </div>
                )}
                {olympiad.workplaceAddress && (
                  <div className="detail-section py-2">
                    <div className="detail-label">Adresa pracoviste</div>
                    <div className="detail-value">{olympiad.workplaceAddress}</div>
                  </div>
                )}
              </div>
            )}

            {/* Location */}
            {hasLocation && (
              <div className="card-custom p-4 mb-4">
                <h3 className="h6 fw-bold mb-3 text-uppercase" style={{ letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Misto konani</h3>
                {olympiad.locationName && <div className="detail-value fw-bold">{olympiad.locationName}</div>}
                {olympiad.locationAddress && <div className="text-muted small">{olympiad.locationAddress}</div>}
              </div>
            )}

            {/* Links */}
            {(olympiad.website || olympiad.resultsUrl || olympiad.registrationUrl) && (
              <div className="card-custom p-4 mb-4">
                <h3 className="h6 fw-bold mb-3 text-uppercase" style={{ letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Odkazy</h3>
                <div className="d-flex flex-column gap-2">
                  {olympiad.website && (
                    <a href={olympiad.website.startsWith('http') ? olympiad.website : `https://${olympiad.website}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm text-start">
                      Web souteze
                    </a>
                  )}
                  {olympiad.resultsUrl && (
                    <a href={olympiad.resultsUrl.startsWith('http') ? olympiad.resultsUrl : `https://${olympiad.resultsUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm text-start">
                      Vysledky
                    </a>
                  )}
                  {olympiad.registrationUrl && (
                    <a href={olympiad.registrationUrl.startsWith('http') ? olympiad.registrationUrl : `https://${olympiad.registrationUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm text-start">
                      Registrace
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
