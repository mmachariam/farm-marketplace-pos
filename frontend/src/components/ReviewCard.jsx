// ReviewCard — SokoMoja
// Reusable component to display a single review with star rating.
// Used on the buyer order tracking page and farmer profile.
//
// Props:
//   reviewerName  — string
//   rating        — number 1–5
//   comment       — string
//   date          — string
//   productName   — string (optional)

function ReviewCard({ reviewerName, rating, comment, date, productName }) {
  return (
    <div className="sm-card p-3 mb-3">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div className="d-flex align-items-center gap-2">
          {/* Avatar circle with initial */}
          <div
            className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
            style={{ width: 32, height: 32, background: "var(--sm-green)", fontSize: 13, flexShrink: 0 }}
          >
            {reviewerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="fw-semibold" style={{ fontSize: "0.85rem" }}>{reviewerName}</div>
            {productName && (
              <div className="text-muted" style={{ fontSize: "0.72rem" }}>on {productName}</div>
            )}
          </div>
        </div>
        <span className="text-muted" style={{ fontSize: "0.75rem" }}>{date}</span>
      </div>

      {/* Star rating */}
      <div className="sm-stars mb-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? "" : "empty"}>★</span>
        ))}
        <span className="text-muted ms-1" style={{ fontSize: "0.72rem" }}>{rating}.0</span>
      </div>

      {/* Comment */}
      {comment && (
        <p className="text-muted mb-0" style={{ fontSize: "0.82rem", lineHeight: 1.6 }}>
          {comment}
        </p>
      )}
    </div>
  );
}

export default ReviewCard;
