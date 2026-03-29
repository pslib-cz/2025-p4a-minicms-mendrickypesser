'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Hesla se neshodují.');
      return;
    }

    if (password.length < 6) {
      setError('Heslo musí mít alespoň 6 znaků.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Došlo k chybě při registraci.');
        setLoading(false);
        return;
      }

      // Auto-login after successful registration
      const signInRes = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        setError('Registrace proběhla, ale přihlášení selhalo. Zkuste se přihlásit ručně.');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Došlo k chybě při registraci.');
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={6} lg={4}>
          <div className="card-custom p-4">
            <h2 className="text-center mb-4">Registrace</h2>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="name">
                <Form.Label>Jméno</Form.Label>
                <Form.Control
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jan Novák"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="email">
                <Form.Label>E-mail</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Heslo</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Alespoň 6 znaků"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="confirmPassword">
                <Form.Label>Potvrzení hesla</Form.Label>
                <Form.Control
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Zopakujte heslo"
                  required
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100 mb-3"
                disabled={loading}
              >
                {loading ? 'Registrace...' : 'Zaregistrovat se'}
              </Button>
            </Form>

            <div className="d-flex align-items-center my-4">
              <div className="border-bottom flex-grow-1"></div>
              <span className="px-3 text-muted">nebo</span>
              <div className="border-bottom flex-grow-1"></div>
            </div>

            <Button
              variant="outline-secondary"
              className="w-100 mb-2"
              onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
            >
              Registrovat přes GitHub
            </Button>

            <Button
              variant="outline-primary"
              className="w-100 mb-3"
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            >
              Registrovat přes Google
            </Button>

            <div className="text-center">
              <small className="text-muted">
                Už máte účet?{' '}
                <Link href="/login" className="text-primary">
                  Přihlaste se
                </Link>
              </small>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
