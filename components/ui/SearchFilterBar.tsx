'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';

type Category = { id: string; name: string; slug: string };

interface SearchFilterBarProps {
  categories: Category[];
  competitionTypes?: string[];
  showEventStatus?: boolean;
}

export default function SearchFilterBar({ categories, competitionTypes = [], showEventStatus = true }: SearchFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const eventStatus = searchParams.get('eventStatus') || '';
  const compType = searchParams.get('type') || '';
  const intl = searchParams.get('international') === '1';

  const [localQ, setLocalQ] = useState(q);
  const [localCategory, setLocalCategory] = useState(category);
  const [localEventStatus, setLocalEventStatus] = useState(eventStatus);
  const [localCompType, setLocalCompType] = useState(compType);
  const [localIntl, setLocalIntl] = useState(intl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (localQ) params.set('q', localQ);
    if (localCategory) params.set('category', localCategory);
    if (localEventStatus) params.set('eventStatus', localEventStatus);
    if (localCompType) params.set('type', localCompType);
    if (localIntl) params.set('international', '1');
    const view = searchParams.get('view');
    if (view) params.set('view', view);
    router.push(`/olympiady?${params.toString()}`);
  };

  const handleClear = () => {
    setLocalQ('');
    setLocalCategory('');
    setLocalEventStatus('');
    setLocalCompType('');
    setLocalIntl(false);
    const view = searchParams.get('view');
    router.push(view ? `/olympiady?view=${view}` : '/olympiady');
  };

  return (
    <div className="filter-bar">
      <Form onSubmit={handleSubmit}>
        <Row className="g-2 align-items-end">
          <Col md={3}>
            <Form.Control
              type="text"
              placeholder="Hledat podle nazvu..."
              value={localQ}
              onChange={e => setLocalQ(e.target.value)}
              size="sm"
            />
          </Col>
          <Col md={2}>
            <Form.Select size="sm" value={localCategory} onChange={e => setLocalCategory(e.target.value)}>
              <option value="">Vsechny kategorie</option>
              {categories.map(c => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </Form.Select>
          </Col>
          {showEventStatus && (
            <Col md={2}>
              <Form.Select size="sm" value={localEventStatus} onChange={e => setLocalEventStatus(e.target.value)}>
                <option value="">Vsechny stavy</option>
                <option value="NADCHAZEJICI">Nadchazejici</option>
                <option value="PROBIHAJICI">Probihajici</option>
                <option value="DOKONCENA">Dokoncena</option>
                <option value="ZRUSENA">Zrusena</option>
              </Form.Select>
            </Col>
          )}
          {competitionTypes.length > 0 && (
            <Col md={2}>
              <Form.Select size="sm" value={localCompType} onChange={e => setLocalCompType(e.target.value)}>
                <option value="">Vsechny typy</option>
                {competitionTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Form.Select>
            </Col>
          )}
          <Col md="auto">
            <Form.Check
              type="checkbox"
              label="Mezinarodni"
              checked={localIntl}
              onChange={e => setLocalIntl(e.target.checked)}
              className="small"
            />
          </Col>
          <Col md="auto" className="d-flex gap-2">
            <Button type="submit" variant="primary" size="sm">Filtrovat</Button>
            <Button type="button" variant="outline-secondary" size="sm" onClick={handleClear}>Zrusit</Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
