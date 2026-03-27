'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { organizerSchema, OrganizerFormValues } from '@/lib/zod';
import { createOrganizer } from '@/lib/actions';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function OrganizerManager() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<OrganizerFormValues>({
    resolver: zodResolver(organizerSchema) as any,
    defaultValues: {
      name: '',
      type: 'JINE',
      address: '',
      website: '',
      email: '',
      phone: '',
      description: '',
    },
  });

  const onSubmit = (data: OrganizerFormValues) => {
    setServerError(null);
    startTransition(async () => {
      try {
        await createOrganizer(data);
        reset();
        setShowForm(false);
        router.refresh();
      } catch (error: any) {
        setServerError(error.message || 'Chyba pri ukladani.');
      }
    });
  };

  if (!showForm) {
    return (
      <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
        Pridat organizatora
      </Button>
    );
  }

  return (
    <Card className="card-custom">
      <Card.Header className="bg-body-tertiary fw-bold border-bottom-0 pt-3">Novy organizator</Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nazev *</Form.Label>
                <Form.Control type="text" {...register('name')} isInvalid={!!errors.name} size="sm" />
                <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Typ</Form.Label>
                <Form.Select {...register('type')} size="sm">
                  <option value="OSOBA">Osoba</option>
                  <option value="SKOLA">Skola</option>
                  <option value="NEZISKOVKA">Neziskovka</option>
                  <option value="UNIVERZITA">Univerzita</option>
                  <option value="FIRMA">Firma</option>
                  <option value="JINE">Jine</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Telefon</Form.Label>
                <Form.Control type="text" {...register('phone')} size="sm" />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" {...register('email')} size="sm" />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Adresa</Form.Label>
                <Form.Control type="text" {...register('address')} size="sm" />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Web</Form.Label>
                <Form.Control type="url" {...register('website')} size="sm" />
              </Form.Group>
            </Col>
          </Row>
          {serverError && <div className="alert alert-danger p-2 small">{serverError}</div>}
          <div className="d-flex gap-2">
            <Button type="submit" variant="primary" size="sm" disabled={isPending}>
              {isPending ? 'Ukladam...' : 'Ulozit'}
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={() => { setShowForm(false); reset(); }}>
              Zrusit
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
