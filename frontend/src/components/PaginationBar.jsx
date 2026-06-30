// PaginationBar — SokoMoja
// Reusable Bootstrap 5 pagination bar with "Showing X–Y of Z results" text.
// Props:
//   page     — current page number (1-based)
//   lastPage — total number of pages
//   total    — total number of records
//   perPage  — items per page (used to compute from/to range)
//   loading  — shows a spinner in the page indicator while fetching
//   onChange — function(newPage) called when user clicks Prev / Next

export default function PaginationBar({ page, lastPage, total, perPage, loading, onChange }) {
  const from = total === 0 ? 0 : Math.min((page - 1) * perPage + 1, total);
  const to   = Math.min(page * perPage, total);

  return (
    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-4 pt-3 border-top">

      {/* "Showing X–Y of Z results" */}
      <span className="text-muted small">
        {loading ? (
          "Loading…"
        ) : total === 0 ? (
          "No results"
        ) : (
          <>
            Showing <strong>{from}–{to}</strong> of <strong>{total}</strong>{" "}
            result{total !== 1 ? "s" : ""}
          </>
        )}
      </span>

      {/* Navigation — only when more than one page exists */}
      {lastPage > 1 && (
        <nav aria-label="Page navigation">
          <ul className="pagination pagination-sm mb-0">

            <li className={`page-item${page <= 1 || loading ? " disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => onChange(page - 1)}
                disabled={page <= 1 || loading}
              >
                <i className="bi bi-chevron-left me-1"></i>Prev
              </button>
            </li>

            <li className="page-item disabled">
              <span className="page-link text-center" style={{ minWidth: 84 }}>
                {loading ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                ) : (
                  `${page} of ${lastPage}`
                )}
              </span>
            </li>

            <li className={`page-item${page >= lastPage || loading ? " disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => onChange(page + 1)}
                disabled={page >= lastPage || loading}
              >
                Next<i className="bi bi-chevron-right ms-1"></i>
              </button>
            </li>

          </ul>
        </nav>
      )}
    </div>
  );
}
