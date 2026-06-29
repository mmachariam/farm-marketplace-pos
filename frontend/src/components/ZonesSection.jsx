// ZonesSection — SokoMoja
// Shows collection zones. Later populated from GET /api/pickup-zones.

function ZonesSection() {
  const zones = [
    "Kiambu zone", "Nakuru zone", "Meru zone",
    "Nairobi CBD", "Eldoret zone", "Kisumu zone",
  ];

  return (
    <section className="py-5 border-top">
      <div className="container-fluid px-4">
        <div className="sm-section-label">Collection zones</div>
        <h2 className="fw-bold mb-2">We cover your region</h2>
        <p className="text-muted mb-4 small">
          Farmers in the same area share a single collection point —
          you pick up your order from there or we arrange last-mile delivery.
        </p>
        <div className="d-flex flex-wrap gap-2">
          {zones.map((zone) => (
            <span key={zone} className="sm-zone-pill">
              <i className="bi bi-geo-alt-fill"></i> {zone}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ZonesSection;
