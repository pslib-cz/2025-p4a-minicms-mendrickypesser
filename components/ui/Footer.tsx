import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer-main mt-auto">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-4 mb-2 mb-md-0">
            <strong className="text-white">OlympCMS</strong>
            <span className="ms-2">Sprava skolnich soutezi</span>
          </div>
          <div className="col-md-4 text-md-center mb-2 mb-md-0">
            <Link href="/olympiady">Souteze</Link>
            <span className="mx-2">|</span>
            <Link href="/login">Prihlaseni</Link>
          </div>
          <div className="col-md-4 text-md-end">
            <span>MSMT seznam soutezi 2025/2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
