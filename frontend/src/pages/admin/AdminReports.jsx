// AdminReports — SokoMoja
// Live report viewer (Zone Performance / User Activity / Top Selling
// Products) with the 6 shared date-filter presets, real PDF/Excel
// downloads, and a history log of previously generated/exported reports.
//
// GET  /api/admin/reports/zone-performance | user-activity | top-products
// GET  /api/admin/reports/export?type=&period=&format=pdf|xlsx
// GET  /api/admin/reports              (history list)

import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import PaginationBar from "../../components/PaginationBar";
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
  { value: "zone-performance", label: "Zone Performance",      icon: "bi-geo-alt",        endpoint: "/admin/reports/zone-performance" },
  { value: "user-activity",    label: "User Activity",          icon: "bi-people",         endpoint: "/admin/reports/user-activity" },
  { value: "top-products",     label: "Top Selling Products",   icon: "bi-graph-up-arrow", endpoint: "/admin/reports/top-products" },
];

const LABEL_TO_TYPE = {
  "Zone performance":      "zone-performance",
  "User activity":         "user-activity",
  "Top selling products":  "top-products",
};

function AdminReports() {
  const navItems = [
    { label: "Overview",  icon: "bi-grid-1x2",          path: "/admin/overview",  active: false },
    { label: "Users",     icon: "bi-people",            path: "/admin/users",     active: false },
    { label: "Zones",     icon: "bi-geo-alt",           path: "/admin/zones",     active: false },
    { label: "Reports",   icon: "bi-file-earmark-text", path: "/admin/reports",   active: true  },
    { label: "Profile",   icon: "bi-person-circle",     path: "/admin/profile",   active: false },
  ];

  const [reportType, setReportType] = useState("zone-performance");
  const [period,     setPeriod]     = useState("last_30_days");
  const [dateFrom,   setDateFrom]   = useState("");
  const [dateTo,     setDateTo]     = useState("");

  const [report,     setReport]     = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [toast,      setToast]      = useState(null);

  // Report history
  const [history,      setHistory]      = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [lastPage,     setLastPage]     = useState(1);
  const [total,        setTotal]        = useState(0);
  const [perPage,      setPerPage]      = useState(15);
  const [rowDownloading, setRowDownloading] = useState(null); // "reportId:format"

  useEffect(() => {
    fetchHistory(currentPage);
  }, [currentPage]);

  async function fetchHistory(page = 1) {
    try {
      setHistoryLoading(true);
      setHistoryError("");
      const res = await apiRequest(`/admin/reports?page=${page}`);
      const paginated = res.data;
      setHistory(paginated.data ?? []);
      setLastPage(paginated.last_page ?? 1);
      setTotal(paginated.total ?? 0);
      setPerPage(paginated.per_page ?? 15);
    } catch (err) {
      setHistoryError(err.message || "Failed to load report history.");
    } finally {
      setHistoryLoading(false);
    }
  }

  function periodParams() {
    const params = new URLSearchParams({ period });
    if (period === "custom") {
      params.set("date_from", dateFrom);
      params.set("date_to", dateTo);
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
      await apiDownload(`/admin/reports/export?${params.toString()}`, `${type.label}.${format}`);
      setToast({ message: `${type.label} ${format.toUpperCase()} download started.`, type: "success" });
      fetchHistory(1);
      setCurrentPage(1);
    } catch (err) {
      setToast({ message: err.message || "Download failed.", type: "error" });
    }
  }

  async function handleHistoryDownload(row, format) {
    const type = LABEL_TO_TYPE[row.report_type];
    if (!type) {
      setToast({ message: "Unknown report type for this history entry.", type: "error" });
      return;
    }

    const key = `${row.report_id}:${format}`;
    setRowDownloading(key);
    try {
      const params = new URLSearchParams({
        type,
        format,
        period: row.parameters?.period || "last_30_days",
      });
      if (row.parameters?.date_from) params.set("date_from", row.parameters.date_from);
      if (row.parameters?.date_to) params.set("date_to", row.parameters.date_to);

      await apiDownload(`/admin/reports/export?${params.toString()}`, `${row.report_type}.${format}`);
      setToast({ message: `${row.report_type} ${format.toUpperCase()} download started.`, type: "success" });
    } catch (err) {
      setToast({ message: err.message || "Download failed.", type: "error" });
    } finally {
      setRowDownloading(null);
    }
  }

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

      {/* Report history */}
      <h6 className="mt-5 mb-3 text-muted">Report History</h6>

      {historyLoading && <PageLoader text="Loading history..." />}
      {historyError && <div className="dash-error"><i className="bi bi-exclamation-triangle-fill me-1"></i>{historyError}</div>}

      {!historyLoading && !historyError && history.length === 0 && (
        <div className="sm-empty sm-fade-in">
          <div className="sm-empty-icon"><i className="bi bi-clock-history"></i></div>
          <div className="sm-empty-title">No reports downloaded yet</div>
          <p className="sm-empty-text">Every PDF/Excel export you generate above will be logged here.</p>
        </div>
      )}

      {!historyLoading && !historyError && history.length > 0 && (
        <div className="card border-0 shadow-sm sm-fade-in">
          <div className="table-responsive">
            <table className="table table-hover align-middle table-striped-columns mb-0">
              <caption className="visually-hidden">Generated reports</caption>
              <thead>
                <tr>
                  <th scope="col">Report</th>
                  <th scope="col">Generated</th>
                  <th scope="col">By</th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.report_id}>
                    <td>{row.report_type}</td>
                    <td>{row.generated_date ? new Date(row.generated_date).toLocaleString("en-KE") : "—"}</td>
                    <td>{row.generated_by}</td>
                    <td>
                      <div className="d-flex gap-2 justify-content-end">
                        <button
                          className="btn btn-link btn-sm text-success p-0"
                          disabled={rowDownloading === `${row.report_id}:pdf`}
                          onClick={() => handleHistoryDownload(row, "pdf")}
                        >
                          {rowDownloading === `${row.report_id}:pdf` ? <span className="spinner-border spinner-border-sm"></span> : "PDF"}
                        </button>
                        <button
                          className="btn btn-link btn-sm text-success p-0"
                          disabled={rowDownloading === `${row.report_id}:xlsx`}
                          onClick={() => handleHistoryDownload(row, "xlsx")}
                        >
                          {rowDownloading === `${row.report_id}:xlsx` ? <span className="spinner-border spinner-border-sm"></span> : "Excel"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!historyError && total > 0 && (
        <PaginationBar
          page={currentPage}
          lastPage={lastPage}
          total={total}
          perPage={perPage}
          loading={historyLoading}
          onChange={(p) => setCurrentPage(p)}
        />
      )}

    </DashboardLayout>
  );
}

export default AdminReports;
