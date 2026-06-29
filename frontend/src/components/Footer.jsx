// Footer — SokoMoja

function Footer() {
  return (
    <footer className="sm-footer py-4">
      <div className="container-fluid px-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">

          <div className="sm-logo">Soko<span>Moja</span></div>

          <div className="d-flex flex-wrap gap-4">
            {["About", "Contact", "Terms", "Privacy"].map((link) => (
              <span key={link} className="text-muted" style={{ fontSize: "0.82rem", cursor: "pointer" }}>
                {link}
              </span>
            ))}
          </div>

          <span style={{ fontSize: "0.82rem", color: "#3B6D11" }}>
            © 2026 SokoMoja — Connecting Kenyan farmers directly
          </span>

        </div>
      </div>
    </footer>
  );
}

export default Footer;
