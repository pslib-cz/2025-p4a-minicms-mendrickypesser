'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { olympiadSchema, OlympiadFormValues } from '@/lib/zod';
import { createOlympiad } from '@/lib/actions';
import { Form, Button, Row, Col, Card, Spinner } from 'react-bootstrap';
import TiptapEditor from '@/components/ui/TiptapEditor';
import { useState, useTransition } from 'react';

type CategoryInfo = { id: string; name: string };
type OrganizerInfo = { id: string; name: string; type: string };

interface Props {
  categories: CategoryInfo[];
  organizers: OrganizerInfo[];
}

export default function CreateOlympiadForm({ categories, organizers }: Props) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isUploadingResults, setIsUploadingResults] = useState(false);
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<OlympiadFormValues>({
    resolver: zodResolver(olympiadSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      content: '',
      edition: null,
      schoolYear: '2025/2026',
      competitionType: '',
      targetAudience: '',
      districtRoundDate: '',
      regionalRoundDate: '',
      nationalRoundDate: '',
      internationalRound: false,
      locationName: '',
      locationAddress: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      workplaceName: '',
      workplaceAddress: '',
      website: '',
      resultsUrl: '',
      registrationUrl: '',
      eventStatus: 'NADCHAZEJICI',
      publishStatus: 'DRAFT',
      msmtSupported: false,
      rvpDescription: '',
      organizerId: '',
      categories: [],
      coverImage: null,
      gallery: [],
      resultFiles: [],
      attachments: [],
      registrationDeadline: '',
    },
  });

  const onSubmit = (data: OlympiadFormValues) => {
    setServerError(null);
    startTransition(async () => {
      try { await createOlympiad(data); }
      catch (error: any) { setServerError(error.message || 'Doslo k chybe pri ukladani.'); }
    });
  };

  const uploadFile = async (file: File): Promise<{ url: string; name: string } | null> => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error();
      const data = await res.json();
      return { url: data.url, name: file.name };
    } catch { return null; }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    const result = await uploadFile(file);
    if (result) setValue('coverImage', result.url);
    else alert('Chyba pri nahravani obrazku');
    setIsUploadingCover(false);
  };

  const handleMultiUpload = async (
    e: React.ChangeEvent<any>,
    field: 'gallery' | 'resultFiles' | 'attachments',
    setLoading: (v: boolean) => void,
  ) => {
    const files = e.target.files as FileList | null;
    if (!files || files.length === 0) return;
    setLoading(true);
    const current = watch(field) || [];
    const newItems = [...current];
    for (let i = 0; i < files.length; i++) {
      const result = await uploadFile(files[i]);
      if (result) newItems.push(result);
    }
    setValue(field, newItems);
    setLoading(false);
    e.target.value = '';
  };

  const removeFromList = (field: 'gallery' | 'resultFiles' | 'attachments', index: number) => {
    const current = watch(field) || [];
    setValue(field, current.filter((_, i) => i !== index));
  };

  const isUploading = isUploadingCover || isUploadingGallery || isUploadingResults || isUploadingDocs;

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Row>
        {/* Main column */}
        <Col lg={8}>
          {/* Basic info */}
          <Card className="card-custom mb-4">
            <Card.Header className="bg-body-tertiary fw-bold border-bottom-0 pt-3">Zakladni informace</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Nazev souteze *</Form.Label>
                <Form.Control type="text" {...register('title')} isInvalid={!!errors.title} />
                <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Strucna anotace</Form.Label>
                <Form.Control as="textarea" rows={3} {...register('description')} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Podrobny popis / propozice</Form.Label>
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => <TiptapEditor value={field.value || ''} onChange={field.onChange} />}
                />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Edition & type */}
          <Card className="card-custom mb-4">
            <Card.Header className="bg-body-tertiary fw-bold border-bottom-0 pt-3">Rocnik a typ</Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Rocnik (cislo)</Form.Label>
                    <Form.Control type="number" {...register('edition', { setValueAs: v => v === '' || v === null || v === undefined ? null : Number(v) })} isInvalid={!!errors.edition} />
                    <Form.Control.Feedback type="invalid">{errors.edition?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Skolni rok</Form.Label>
                    <Form.Control type="text" {...register('schoolYear')} placeholder="2025/2026" />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Typ souteze</Form.Label>
                    <Form.Control type="text" {...register('competitionType')} placeholder="oborova, projektova..." />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Cilova skupina</Form.Label>
                    <Form.Control type="text" {...register('targetAudience')} placeholder="ZS, SS, ZS+SS" />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3 pt-4">
                    <Form.Check type="checkbox" label="Podpora MSMT" {...register('msmtSupported')} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3 pt-4">
                    <Form.Check type="checkbox" label="Mezinarodni" {...register('internationalRound')} />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Popis navaznosti na RVP</Form.Label>
                <Form.Control as="textarea" rows={2} {...register('rvpDescription')} />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Organizer & contact */}
          <Card className="card-custom mb-4">
            <Card.Header className="bg-body-tertiary fw-bold border-bottom-0 pt-3">Organizator a kontakt</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Organizator</Form.Label>
                <Form.Select {...register('organizerId')}>
                  <option value="">-- Vyberte organizatora --</option>
                  {organizers.map(o => (
                    <option key={o.id} value={o.id}>{o.name} ({o.type})</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Kontaktni osoba</Form.Label>
                    <Form.Control type="text" {...register('contactPerson')} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" {...register('contactEmail')} isInvalid={!!errors.contactEmail} />
                    <Form.Control.Feedback type="invalid">{errors.contactEmail?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Telefon</Form.Label>
                    <Form.Control type="text" {...register('contactPhone')} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nazev pracoviste</Form.Label>
                    <Form.Control type="text" {...register('workplaceName')} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Adresa pracoviste</Form.Label>
                    <Form.Control type="text" {...register('workplaceAddress')} />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Round dates */}
          <Card className="card-custom mb-4">
            <Card.Header className="bg-body-tertiary fw-bold border-bottom-0 pt-3">Terminy kol</Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Okresni kolo</Form.Label>
                    <Form.Control type="text" {...register('districtRoundDate')} placeholder="unor 2026" />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Krajske kolo</Form.Label>
                    <Form.Control type="text" {...register('regionalRoundDate')} placeholder="brezen 2026" />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Ustredni kolo</Form.Label>
                    <Form.Control type="text" {...register('nationalRoundDate')} placeholder="duben 2026" />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Uzaverka registrace</Form.Label>
                    <Form.Control type="datetime-local" {...register('registrationDeadline')} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Odkaz na registraci</Form.Label>
                    <Form.Control type="url" {...register('registrationUrl')} isInvalid={!!errors.registrationUrl} />
                    <Form.Control.Feedback type="invalid">{errors.registrationUrl?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Location & links */}
          <Card className="card-custom mb-4">
            <Card.Header className="bg-body-tertiary fw-bold border-bottom-0 pt-3">Misto konani a odkazy</Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Misto konani</Form.Label>
                    <Form.Control type="text" {...register('locationName')} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Adresa</Form.Label>
                    <Form.Control type="text" {...register('locationAddress')} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Web souteze</Form.Label>
                    <Form.Control type="url" {...register('website')} isInvalid={!!errors.website} />
                    <Form.Control.Feedback type="invalid">{errors.website?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Odkaz na vysledky</Form.Label>
                    <Form.Control type="url" {...register('resultsUrl')} isInvalid={!!errors.resultsUrl} />
                    <Form.Control.Feedback type="invalid">{errors.resultsUrl?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          {/* Media */}
          <Card className="card-custom mb-4">
            <Card.Header className="bg-body-tertiary fw-bold border-bottom-0 pt-3">Media a soubory</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Nahledovy obrazek</Form.Label>
                <div className="d-flex align-items-center gap-2">
                  <Form.Control type="file" accept="image/*" onChange={handleCoverUpload} disabled={isUploadingCover} size="sm" />
                  {isUploadingCover && <Spinner animation="border" size="sm" variant="primary" />}
                </div>
                {watch('coverImage') && <div className="mt-1 text-success small">Nahrano</div>}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Galerie (fotky z akce)</Form.Label>
                <div className="d-flex align-items-center gap-2">
                  <Form.Control type="file" accept="image/*" multiple onChange={e => handleMultiUpload(e, 'gallery', setIsUploadingGallery)} disabled={isUploadingGallery} size="sm" />
                  {isUploadingGallery && <Spinner animation="border" size="sm" variant="primary" />}
                </div>
                {(watch('gallery') || []).map((g, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center mt-1">
                    <span className="small text-muted text-truncate">{g.name}</span>
                    <Button variant="link" size="sm" className="text-danger p-0" onClick={() => removeFromList('gallery', i)}>x</Button>
                  </div>
                ))}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Vysledky (soubory)</Form.Label>
                <div className="d-flex align-items-center gap-2">
                  <Form.Control type="file" accept=".pdf,.xlsx,.xls,.csv,.doc,.docx" multiple onChange={e => handleMultiUpload(e, 'resultFiles', setIsUploadingResults)} disabled={isUploadingResults} size="sm" />
                  {isUploadingResults && <Spinner animation="border" size="sm" variant="primary" />}
                </div>
                {(watch('resultFiles') || []).map((r, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center mt-1">
                    <span className="small text-muted text-truncate">{r.name}</span>
                    <Button variant="link" size="sm" className="text-danger p-0" onClick={() => removeFromList('resultFiles', i)}>x</Button>
                  </div>
                ))}
              </Form.Group>

              <Form.Group className="mb-0">
                <Form.Label className="small fw-bold">Prilohy (dokumenty)</Form.Label>
                <div className="d-flex align-items-center gap-2">
                  <Form.Control type="file" multiple onChange={e => handleMultiUpload(e, 'attachments', setIsUploadingDocs)} disabled={isUploadingDocs} size="sm" />
                  {isUploadingDocs && <Spinner animation="border" size="sm" variant="primary" />}
                </div>
                {(watch('attachments') || []).map((a, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center mt-1">
                    <span className="small text-muted text-truncate">{a.name}</span>
                    <Button variant="link" size="sm" className="text-danger p-0" onClick={() => removeFromList('attachments', i)}>x</Button>
                  </div>
                ))}
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Status & publish */}
          <Card className="card-custom mb-4">
            <Card.Header className="bg-body-tertiary fw-bold border-bottom-0 pt-3">Stav a publikace</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Stav akce</Form.Label>
                <Form.Select {...register('eventStatus')}>
                  <option value="NADCHAZEJICI">Nadchazejici</option>
                  <option value="PROBIHAJICI">Probihajici</option>
                  <option value="DOKONCENA">Dokoncena</option>
                  <option value="ZRUSENA">Zrusena</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Publikace</Form.Label>
                <Form.Select {...register('publishStatus')}>
                  <option value="DRAFT">Koncept</option>
                  <option value="PUBLISHED">Publikovano</option>
                </Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Categories */}
          <Card className="card-custom mb-4">
            <Card.Header className="bg-body-tertiary fw-bold border-bottom-0 pt-3">Kategorie *</Card.Header>
            <Card.Body>
              {categories.map(cat => (
                <Form.Check
                  key={cat.id}
                  type="checkbox"
                  id={`cat-${cat.id}`}
                  label={cat.name}
                  value={cat.id}
                  {...register('categories')}
                  className="mb-1"
                />
              ))}
              {errors.categories && <div className="text-danger mt-1 small">{errors.categories.message}</div>}
            </Card.Body>
          </Card>

          {/* Submit */}
          {serverError && <div className="alert alert-danger p-2 small">{serverError}</div>}
          <Button type="submit" variant="primary" className="w-100 py-2 fw-bold" disabled={isPending || isUploading}>
            {isPending ? 'Ukladam...' : 'Vytvorit soutez'}
          </Button>
        </Col>
      </Row>
    </Form>
  );
}
