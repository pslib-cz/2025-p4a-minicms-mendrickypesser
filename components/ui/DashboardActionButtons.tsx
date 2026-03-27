'use client';

import { Button, Dropdown } from 'react-bootstrap';
import { deleteOlympiad, togglePublishStatus, updateEventStatus } from '@/lib/actions';
import { useTransition } from 'react';
import Link from 'next/link';

interface Props {
  id: string;
  currentPublishStatus: string;
  currentEventStatus: string;
}

const EVENT_STATUSES = [
  { value: 'NADCHAZEJICI', label: 'Nadchazejici' },
  { value: 'PROBIHAJICI', label: 'Probihajici' },
  { value: 'DOKONCENA', label: 'Dokoncena' },
  { value: 'ZRUSENA', label: 'Zrusena' },
];

export default function DashboardActionButtons({ id, currentPublishStatus, currentEventStatus }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (window.confirm('Opravdu chcete smazat tuto soutez? Akce je nevratna.')) {
      startTransition(async () => {
        try { await deleteOlympiad(id); } catch { alert('Chyba pri mazani.'); }
      });
    }
  };

  const handleTogglePublish = () => {
    startTransition(async () => {
      try { await togglePublishStatus(id, currentPublishStatus); } catch { alert('Chyba pri zmene statusu.'); }
    });
  };

  const handleEventStatus = (status: string) => {
    startTransition(async () => {
      try { await updateEventStatus(id, status); } catch { alert('Chyba pri zmene stavu.'); }
    });
  };

  return (
    <div className="d-flex gap-1 flex-wrap">
      <Link href={`/dashboard/olympiads/${id}/edit`} className={`btn btn-outline-primary btn-sm ${isPending ? 'disabled' : ''}`}>
        Upravit
      </Link>
      <Button variant={currentPublishStatus === 'PUBLISHED' ? 'outline-warning' : 'outline-success'} size="sm" onClick={handleTogglePublish} disabled={isPending}>
        {currentPublishStatus === 'PUBLISHED' ? 'Skryt' : 'Publikovat'}
      </Button>
      <Dropdown>
        <Dropdown.Toggle variant="outline-secondary" size="sm" disabled={isPending}>
          Stav
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {EVENT_STATUSES.map(s => (
            <Dropdown.Item
              key={s.value}
              active={currentEventStatus === s.value}
              onClick={() => handleEventStatus(s.value)}
            >
              {s.label}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
      <Button variant="outline-danger" size="sm" onClick={handleDelete} disabled={isPending}>
        Smazat
      </Button>
    </div>
  );
}
