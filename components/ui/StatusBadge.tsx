'use client';

import { Badge } from 'react-bootstrap';

const EVENT_STATUS_MAP: Record<string, { label: string; className: string }> = {
  NADCHAZEJICI: { label: 'Nadchazejici', className: 'badge-nadchazejici' },
  PROBIHAJICI: { label: 'Probihajici', className: 'badge-probihajici' },
  DOKONCENA: { label: 'Dokoncena', className: 'badge-dokoncena' },
  ZRUSENA: { label: 'Zrusena', className: 'badge-zrusena' },
};

const PUBLISH_STATUS_MAP: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Koncept', className: 'badge-draft' },
  PUBLISHED: { label: 'Publikovano', className: 'badge-published' },
};

export function EventStatusBadge({ status }: { status: string }) {
  const config = EVENT_STATUS_MAP[status] || { label: status, className: 'bg-secondary' };
  return <Badge className={`${config.className} px-2 py-1`}>{config.label}</Badge>;
}

export function PublishStatusBadge({ status }: { status: string }) {
  const config = PUBLISH_STATUS_MAP[status] || { label: status, className: 'bg-secondary' };
  return <Badge className={`${config.className} px-2 py-1`}>{config.label}</Badge>;
}
