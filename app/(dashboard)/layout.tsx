'use client';

import { Container, Row, Col, Nav, Navbar, Button } from 'react-bootstrap';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('olympcms-theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('olympcms-theme', nextTheme);
    document.documentElement.setAttribute('data-bs-theme', nextTheme);
  };

  const userRole = session?.user?.role;

  const navItems = [
    { href: '/dashboard', label: 'Prehled', exact: true },
    { href: '/dashboard/olympiads', label: 'Souteze', exact: false },
    { href: '/dashboard/olympiads/create', label: 'Nova soutez', exact: true },
    { href: '/dashboard/organizers', label: 'Organizatori', exact: false },
  ];

  if (userRole === 'ADMIN') {
    navItems.push({ href: '/dashboard/users', label: 'Uzivatele', exact: false });
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar className="navbar-main px-4 sticky-top" variant="dark">
        <Navbar.Brand as={Link} href="/dashboard" className="fw-bold">OlympCMS</Navbar.Brand>
        <Nav className="ms-auto d-flex align-items-center gap-2">
          <Link href="/olympiady" target="_blank" className="text-white text-decoration-none small me-2" style={{ opacity: 0.75 }}>
            Zobrazit web
          </Link>
          <Button variant="outline-light" size="sm" onClick={toggleTheme} className="border-0">
            {theme === 'light' ? 'Tmavy rezim' : 'Svetly rezim'}
          </Button>
          <Button variant="light" className="fw-bold text-primary" size="sm" onClick={() => signOut({ callbackUrl: '/login' })}>
            Odhlasit
          </Button>
        </Nav>
      </Navbar>

      <Container fluid className="flex-grow-1 d-flex p-0">
        <Row className="flex-grow-1 m-0 w-100">
          <Col md={3} lg={2} className="pt-4 px-2 border-end sidebar-nav">
            <Nav className="flex-column gap-1 w-100 px-3">
              {navItems.map((item: any) => (
                <Nav.Link
                  key={item.href}
                  as={Link}
                  href={item.href}
                  active={item.exact ? pathname === item.href : pathname === item.href || (pathname?.startsWith(item.href + '/') && item.href !== '/dashboard')}
                  className="mb-1"
                >
                  {item.label}
                </Nav.Link>
              ))}
            </Nav>
          </Col>

          <Col md={9} lg={10} className="p-4 bg-body-tertiary">
            {(userRole === 'ADMIN' || userRole === 'EDITOR') ? children : (
              <div className="text-center py-5">
                <div className="card-custom p-5 mx-auto" style={{ maxWidth: '600px' }}>
                  <h1 className="display-6 fw-bold mb-3 text-primary">Vítejte, {session?.user?.name || session?.user?.email}!</h1>
                  <p className="lead text-muted mb-4">
                    Váš účet byl úspěšně vytvořen a propojen s platformou OlympCMS.
                  </p>
                  <div className="alert alert-info border-0 shadow-sm mb-4">
                    <strong>Aktuálně nemáte oprávnění ke správě obsahu.</strong><br />
                    Požádejte prosím administrátora aplikace o přidělení role <strong>EDITOR</strong>.
                  </div>
                  <p className="small text-muted mb-0">
                    Jakmile vám budou práva přidělena, uvidíte zde přehled vašich soutěží a možnost vytvářet nové.
                  </p>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
