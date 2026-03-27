'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Neplatný e-mail nebo heslo.');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Došlo k chybě při přihlašování.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={6} lg={4}>
          <div className="card-custom p-4">
            <h2 className="text-center mb-4">Přihlášení</h2>
            
            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleCredentialsSubmit}>
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
                  placeholder="********"
                  required
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100 mb-3"
                disabled={loading}
              >
                {loading ? 'Přihlašování...' : 'Přihlásit se pomocí e-mailu'}
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
              Přihlásit se přes GitHub
            </Button>

            <Button
              variant="outline-primary"
              className="w-100"
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            >
              Přihlásit se přes Google
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
