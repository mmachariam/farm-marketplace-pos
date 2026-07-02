// AdminReports — SokoMoja
// Admin generates and views paginated reports.
// GET  /api/admin/reports?page=N
// POST /api/admin/reports

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import PaginationBar from "../../components/PaginationBar";
import { apiRequest } from "../../utils/api";

function EmptyState({ icon, title, text, btnLabel, btnTo, btnAction }) {
  return (
    <div className="sm-empty sm-fade-in">
      <div className="sm-empty-icon">
        <i className={`bi ${icon}`}></i>
      </div>
      <div className="sm-empty-title">{title}</div>
      <p className="sm-empty-text">{text}</p>
      {btnTo && (
        <Link to={btnTo} className="btn btn-success btn-sm px-4">
          {btnLabel}
        </Link>
      )}
      {btnAction && (
        <button className="btn btn-success btn-sm px-4" onClick={btnAction}>
          {btnLabel}
        </button>
      )}
    </div>
  );
}

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

function AdminReports() {
  const navItems = [
    { label: "Overview",  icon: "bi-grid-1x2",          path: "/admin/overview",  active: false },
    { label: "Users",     icon: "bi-people",            path: "/admin/users",     active: false },
    { label: "Zones",     icon: "bi-geo-alt",           path: "/admin/zones",     active: false },
    { label: "Reports",   icon: "bi-file-earmark-text", path: "/admin/reports",   active: true  },
    { label: "Profile",   icon: "bi-person-circle",     path: "/admin/profile",   active: false },
  ];

  const [reports,     setReports]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage,    setLastPage]    = useState(1);
  const [total,       setTotal]       = useState(0);
  const [perPage,     setPerPage]     = useState(15);

  const [reportType,  setReportType]  = useState("Sales summary");
  const [dateFrom,    setDateFrom]    = useState("");
  const [dateTo,      setDateTo]      = useState("");
  const [generating,  setGenerating]  = useState(false);
  const [successMsg,  setSuccessMsg]  = useState("");

  useEffect(() => {
    fetchReports(currentPage);
  }, [currentPage]);

  async function fetchReports(page = 1) {
    try {
      setLoading(true);
      setError("");
      const res = await apiRequest(`/admin/reports?page=${page}`);

      // res.data = Laravel paginator (through()); res.data.data = items array
      const paginated = res.data;
      setReports(paginated.data    ?? []);
      setLastPage(paginated.last_page ?? 1);
      setTotal(paginated.total    ?? 0);
      setPerPage(paginated.per_page ?? 15);
    } catch (err) {
      setError(err.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }

  const handleGenerate = async () => {
    setGenerating(true);
    setSuccessMsg("");
    try {
      const res = await apiRequest("/admin/reports", "POST", {
        report_type: reportType,
        parameters:  { date_from: dateFrom || null, date_to: dateTo || null },
      });

      // Refresh page 1 so the new report appears at the top
      if (currentPage === 1) {
        fetchReports(1);
      } else {
        setCurrentPage(1);
      }

      setSuccessMsg(`Report "${res.data?.report_type}" generated successfully.`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      alert(`Failed to generate report: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <DashboardLayout title="Reports" navItems={navItems}>

      {/* Generate report form */}
      <div className="dash-table-wrap" style={{ padding: "20px", marginBottom: "20px" }}>

        {successMsg && (
          <div className="alert alert-success py-2 small mb-3">
            <i className="bi bi-check-circle-fill me-1"></i>{successMsg}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", alignItems: "end" }}>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="reportType">Report type</label>
            <select id="reportType" value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option>Sales summary</option>
              <option>Inventory</option>
              <option>User activity</option>
              <option>Zone performance</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="dateFrom">From</label>
            <input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="dateTo">To</label>
            <input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>

        </div>

        <button
          className="btn btn-success mt-3 d-flex align-items-center gap-2"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <><span className="spinner-border spinner-border-sm me-2"></span>Generating...</>
          ) : (
            <><i className="bi bi-plus-circle"></i> Generate report</>
          )}
        </button>
      </div>

      {/* Report history */}
      {loading && <PageLoader text="Loading reports..." />}

      {error && (
        <div className="dash-error">
          <i className="bi bi-exclamation-triangle-fill me-1"></i>{error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && reports.length === 0 && (
        <EmptyState
          icon="bi-file-earmark-bar-graph"
          title="No reports generated yet"
          text="Generate your first report to view marketplace analytics and summaries."
        />
      )}

      {/* Reports table */}
      {!loading && !error && reports.length > 0 && (
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
                {reports.map((report) => (
                  <tr key={report.report_id}>
                    <td>{report.report_type}</td>
                    <td>
                      {report.generated_date
                        ? new Date(report.generated_date).toLocaleDateString("en-KE")
                        : "—"}
                    </td>
                    <td>{report.generated_by}</td>
                    <td>
                      <button
                        className="btn btn-link btn-sm text-success p-0 d-flex align-items-center gap-1"
                        onClick={() => alert("Download coming soon")}
                      >
                        <i className="bi bi-download"></i> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!error && total > 0 && (
        <PaginationBar
          page={currentPage}
          lastPage={lastPage}
          total={total}
          perPage={perPage}
          loading={loading}
          onChange={(p) => setCurrentPage(p)}
        />
      )}

    </DashboardLayout>
  );
}

export default AdminReports;
