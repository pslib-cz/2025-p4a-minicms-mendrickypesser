'use client';

import { useState, useEffect } from 'react';
import { Button, Container } from 'react-bootstrap';
import Script from 'next/script';

export default function CookieConsent() {
  const [consent, setConsent] = useState<string | null>(null);

  useEffect(() => {
    setConsent(localStorage.getItem('cookie_consent'));
  }, []);

  const showBanner = consent === null;
  const hasConsent = consent === 'granted';

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'granted');
    setConsent('granted');
  };

  const handleReject = () => {
    localStorage.setItem('cookie_consent', 'denied');
    setConsent('denied');
  };

  return (
    <>
      {hasConsent && (
        <Script id="ms-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "TEST_CLARITY_ID_123");
          `}
        </Script>
      )}

      {showBanner && (
        <div className="fixed-bottom text-white shadow-lg z-3 cookie-consent">
          <Container className="d-flex flex-column flex-md-row py-3 justify-content-between align-items-center gap-3">
            <div>
              <strong className="fs-5">Vaše soukromí je pro nás důležité.</strong>
              <p className="mb-3 mb-md-0 me-md-4">
        Používáme Microsoft Clarity, abychom viděli, kolik sem chodí lidí a co tu hledají. K tomu potřebujeme uložit statistické cookies. Můžete je povolit, nebo to odmítnout (web bude fungovat úplně normálně tak i tak).
      </p>
            </div>
            <div className="d-flex gap-2 shrink-0">
              <Button variant="outline-light" size="sm" onClick={handleReject}>Odmítnout</Button>
              <Button variant="primary" size="sm" onClick={handleAccept}>Přijmout cookies</Button>
            </div>
          </Container>
        </div>
      )}
    </>
  );
}
