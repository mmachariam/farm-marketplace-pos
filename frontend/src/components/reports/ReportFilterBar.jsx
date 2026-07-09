// ReportFilterBar — shared by AdminReports + FarmerReports
// Renders the 6 date-filter presets (Today / Last 7 Days / Last 30 Days /
// This Month / This Year / Custom Range) plus an optional extra-filter slot
// (e.g. the farmer Sales Report's Online/Offline/Combined source picker).

const PRESETS = [
  { value: "today",        label: "Today" },
  { value: "last_7_days",  label: "Last 7 Days" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "this_month",   label: "This Month" },
  { value: "this_year",    label: "This Year" },
  { value: "custom",       label: "Custom Range" },
];

export default function ReportFilterBar({
  period, setPeriod,
  dateFrom, setDateFrom,
  dateTo, setDateTo,
  onApply, applying,
  extra,
}) {
  return (
    <div className="dash-table-wrap sm-fade-in" style={{ padding: "20px", marginBottom: "20px" }}>
      <div className="d-flex flex-wrap gap-2 mb-3">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            className={`btn btn-sm ${period === p.value ? "btn-success" : "btn-outline-secondary"}`}
            onClick={() => setPeriod(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {period === "custom" && (
        <div className="row g-3 mb-3" style={{ maxWidth: 420 }}>
          <div className="col-6">
            <div className="form-group mb-0">
              <label htmlFor="reportDateFrom">From</label>
              <input id="reportDateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
          </div>
          <div className="col-6">
            <div className="form-group mb-0">
              <label htmlFor="reportDateTo">To</label>
              <input id="reportDateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {extra}

      <button
        className="btn btn-success d-flex align-items-center gap-2"
        onClick={onApply}
        disabled={applying || (period === "custom" && (!dateFrom || !dateTo))}
      >
        {applying ? (
          <><span className="spinner-border spinner-border-sm"></span>Loading...</>
        ) : (
          <><i className="bi bi-arrow-repeat"></i> Generate report</>
        )}
      </button>
    </div>
  );
}
