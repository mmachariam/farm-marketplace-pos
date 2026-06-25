// HowItWorks — SokoMoja
// Explains the marketplace flow for both buyers and farmers.
// NO grocery POS references — replaced with farmer inventory & offline sales.

function HowItWorks() {
  const steps = [
    {
      icon: "bi-person-check",
      title: "1. Create your account",
      desc: "Sign up as a buyer or verified farmer. Farmers are reviewed before listing.",
    },
    {
      icon: "bi-search",
      title: "2. Browse & order",
      desc: "Find fresh produce from verified farmers near you. Filter by category, region, or price.",
    },
    {
      icon: "bi-geo-alt",
      title: "3. Collect or get delivered",
      desc: "Pick up from a shared collection point in your zone, or arrange last-mile delivery.",
    },
    {
      icon: "bi-star",
      title: "4. Rate your farmer",
      desc: "Leave a review after receiving your order. Reviews help other buyers choose quality produce.",
    },
  ];

  const farmerFeatures = [
    { icon: "bi-box-seam", text: "Manage produce listings and inventory in one place" },
    { icon: "bi-receipt", text: "Record offline sales made at the farm gate" },
    { icon: "bi-graph-up-arrow", text: "View sales reports and earnings summaries" },
    { icon: "bi-calendar-check", text: "Set collection schedules for your pickup zone" },
  ];

  return (
    <section id="how-it-works" className="py-5 bg-white border-top">
      <div className="container-fluid px-4">

        <div className="sm-section-label">How it works</div>
        <h2 className="fw-bold mb-2">Simple from farm to table</h2>
        <p className="text-muted mb-4">Four steps, no brokers in between</p>

        <div className="row g-3 mb-5">
          {steps.map((step, i) => (
            <div className="col-sm-6 col-lg-3" key={i}>
              <div className="p-3 rounded-3 h-100" style={{ background: "var(--sm-bg)" }}>
                <div className="sm-how-icon">
                  <i className={`bi ${step.icon}`}></i>
                </div>
                <div className="fw-semibold mb-1" style={{ fontSize: "0.9rem" }}>{step.title}</div>
                <div className="text-muted" style={{ fontSize: "0.82rem", lineHeight: 1.6 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Farmer feature callout box */}
        <div className="rounded-3 p-4" style={{ background: "var(--sm-green-light)", border: "1px solid var(--sm-green-border)" }}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <i className="bi bi-flower2 text-success fs-5"></i>
            <span className="fw-bold" style={{ color: "#173404" }}>For farmers — all the tools you need</span>
          </div>
          <div className="row g-2">
            {farmerFeatures.map((f, i) => (
              <div className="col-sm-6" key={i}>
                <div className="d-flex align-items-start gap-2">
                  <i className={`bi ${f.icon} mt-1`} style={{ color: "var(--sm-green)", flexShrink: 0 }}></i>
                  <span style={{ fontSize: "0.85rem", color: "#3B6D11" }}>{f.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

export default HowItWorks;
