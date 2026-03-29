'use client';

import { Pagination, Spinner } from 'react-bootstrap';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
}

export default function PaginationControl({ currentPage, totalPages }: PaginationControlProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(
      <Pagination.Item
        key={i}
        active={i === currentPage}
        onClick={() => handlePageChange(i)}
        disabled={isPending}
      >
        {i}
      </Pagination.Item>
    );
  }

  return (
    <div className="d-flex justify-content-center mt-5 mb-2">
      <Pagination className="mb-0">
        <Pagination.First
          disabled={currentPage === 1 || isPending}
          onClick={() => handlePageChange(1)}
        />
        <Pagination.Prev
          disabled={currentPage === 1 || isPending}
          onClick={() => handlePageChange(currentPage - 1)}
        />
        {pages}
        <Pagination.Next
          disabled={currentPage === totalPages || isPending}
          onClick={() => handlePageChange(currentPage + 1)}
        />
        <Pagination.Last
          disabled={currentPage === totalPages || isPending}
          onClick={() => handlePageChange(totalPages)}
        />
      </Pagination>
      {isPending && (
        <div className="ms-3 d-flex align-items-center text-muted small">
          <Spinner animation="border" size="sm" className="me-2" /> Naciítám...
        </div>
      )}
    </div>
  );
}
