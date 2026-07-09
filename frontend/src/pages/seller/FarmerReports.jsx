// FarmerReports — SokoMoja
// Live report viewer (Inventory / Sales / Top Selling Products) scoped to
// the logged-in farmer's own products, with the 6 shared date-filter
// presets, a Sales Source filter (Online/Offline/Combined) for the Sales
// report, and real PDF/Excel downloads.
//
// GET /api/seller/reports/inventory | sales | top-products
// GET /api/seller/reports/export?type=&period=&format=pdf|xlsx&source=

import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Toast from "../../components/Toast";
import ReportFilterBar from "../../components/reports/ReportFilterBar";
import ReportView from "../../components/reports/ReportView";
import ReportDownloadButtons from "../../components/reports/ReportDownloadButtons";
import { apiRequest, apiDownload } from "../../utils/api";

function PageLoader({ text = "Loading..." }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3 sm-fade-in">
      <div className="spinner-border text-success" role="status" style={{ width: "2rem", height: "2rem" }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <span className="text-muted small">{text}</span>
    </div>
  );
}

const REPORT_TYPES = [
  { value: "inventory",    label: "Inventory Report",        icon: "bi-boxes",          endpoint: "/seller/reports/inventory" },
  { value: "sales",        label: "Sales Report",             icon: "bi-cash-coin",      endpoint: "/seller/reports/sales" },
  { value: "top-products", label: "Top Selling Products",     icon: "bi-graph-up-arrow", endpoint: "/seller/reports/top-products" },
];

const SOURCES = [
  { value: "online",   label: "Online Orders" },
  { value: "offline",  label: "Offline POS" },
  { value: "combined", label: "Combined" },
];

function FarmerReports() {
  const navItems = [
    { label: "Dashboard",  icon: "bi-speedometer2",      path: "/seller/dashboard",  active: false },
    { label: "Products",   icon: "bi-flower2",           path: "/seller/products",   active: false },
    { label: "Inventory",  icon: "bi-boxes",             path: "/seller/inventory",  active: false },
    { label: "Sales",      icon: "bi-receipt",           path: "/seller/sales",      active: false },
    { label: "Schedule",   icon: "bi-calendar-check",    path: "/seller/schedule",   active: false },
    { label: "Orders",     icon: "bi-box-seam",          path: "/seller/orders",     active: false },
    { label: "Reports",    icon: "bi-file-earmark-text", path: "/seller/reports",    active: true  },
    { label: "Profile",    icon: "bi-person-circle",     path: "/seller/profile",    active: false },
  ];

  const [reportType, setReportType] = useState("inventory");
  const [period,     setPeriod]     = useState("last_30_days");
  const [dateFrom,   setDateFrom]   = useState("");
  const [dateTo,     setDateTo]     = useState("");
  const [source,     setSource]     = useState("combined");

  const [report,  setReport]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [toast,   setToast]   = useState(null);

  function periodParams() {
    const params = new URLSearchParams({ period });
    if (period === "custom") {
      params.set("date_from", dateFrom);
      params.set("date_to", dateTo);
    }
    if (reportType === "sales") {
      params.set("source", source);
    }
    return params;
  }

  async function handleGenerate() {
    const type = REPORT_TYPES.find((t) => t.value === reportType);
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest(`${type.endpoint}?${periodParams().toString()}`);
      setReport(res.data);
    } catch (err) {
      setError(err.message || "Failed to load report.");
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(format) {
    const type = REPORT_TYPES.find((t) => t.value === reportType);
    const params = periodParams();
    params.set("type", reportType);
    params.set("format", format);

    try {
      await apiDownload(`/seller/reports/export?${params.toString()}`, `${type.label}.${format}`);
      setToast({ message: `${type.label} ${format.toUpperCase()} download started.`, type: "success" });
    } catch (err) {
      setToast({ message: err.message || "Download failed.", type: "error" });
    }
  }

  const sourcePicker = reportType === "sales" && (
    <div className="mb-3">
      <label className="d-block mb-2" style={{ fontSize: "0.82rem", fontWeight: 600 }}>Sales Source</label>
      <div className="d-flex flex-wrap gap-3">
        {SOURCES.map((s) => (
          <div className="form-check" key={s.value}>
            <input
              className="form-check-input"
              type="radio"
              name="salesSource"
              id={`source-${s.value}`}
              checked={source === s.value}
              onChange={() => setSource(s.value)}
            />
            <label className="form-check-label" htmlFor={`source-${s.value}`}>{s.label}</label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <DashboardLayout title="Reports" navItems={navItems}>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Report type tabs */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {REPORT_TYPES.map((t) => (
          <button
            key={t.value}
            className={`btn btn-sm d-flex align-items-center gap-2 ${reportType === t.value ? "btn-success" : "btn-outline-success"}`}
            onClick={() => { setReportType(t.value); setReport(null); }}
          >
            <i className={`bi ${t.icon}`}></i> {t.label}
          </button>
        ))}
      </div>

      <ReportFilterBar
        period={period} setPeriod={setPeriod}
        dateFrom={dateFrom} setDateFrom={setDateFrom}
        dateTo={dateTo} setDateTo={setDateTo}
        onApply={handleGenerate}
        applying={loading}
        extra={sourcePicker}
      />

      {loading && <PageLoader text="Generating report..." />}
      {error && <div className="dash-error"><i className="bi bi-exclamation-triangle-fill me-1"></i>{error}</div>}

      {!loading && !error && report && (
        <>
          <div className="d-flex justify-content-end mb-3">
            <ReportDownloadButtons onDownload={handleDownload} disabled={loading} />
          </div>
          <ReportView report={report} />
        </>
      )}

      {!loading && !error && !report && (
        <div className="sm-empty sm-fade-in">
          <div className="sm-empty-icon"><i className="bi bi-file-earmark-bar-graph"></i></div>
          <div className="sm-empty-title">No report generated yet</div>
          <p className="sm-empty-text">Choose a report type and date range above, then click "Generate report".</p>
        </div>
      )}

    </DashboardLayout>
  );
}

export default FarmerReports;
