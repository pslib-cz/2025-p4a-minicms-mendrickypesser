'use client';

import { Navbar, Container, Nav } from 'react-bootstrap';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Footer from '@/components/ui/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = (localStorage.getItem('olympcms-theme') as 'light' | 'dark') || 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-bs-theme', saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('olympcms-theme', next);
    document.documentElement.setAttribute('data-bs-theme', next);
  };

  return (
    <>
      <Navbar expand="lg" className="navbar-main sticky-top" variant="dark">
        <Container>
          <Navbar.Brand as={Link} href="/" className="fw-bold fs-5">
            OlympCMS
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="public-nav" />
          <Navbar.Collapse id="public-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} href="/" active={pathname === '/'}>
                Domov
              </Nav.Link>
              <Nav.Link as={Link} href="/olympiady" active={pathname?.startsWith('/olympiady')}>
                Souteze
              </Nav.Link>
            </Nav>
            <Nav className="d-flex align-items-center gap-2">
              <button
                className="btn btn-sm btn-outline-light border-0"
                onClick={toggleTheme}
                title={theme === 'light' ? 'Tmave tema' : 'Svetle tema'}
              >
                {theme === 'light' ? 'Tmavy rezim' : 'Svetly rezim'}
              </button>
              <Link href="/login" className="btn btn-primary btn-sm px-3">
                Prihlaseni
              </Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <main className="flex-grow-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
