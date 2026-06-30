// AdminReports — SokoMoja
// Admin generates and views reports.
// GET  /api/admin/reports
// POST /api/admin/reports

import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { apiRequest } from "../../utils/api";

function AdminReports() {
  const navItems = [
    { label: "Overview",  icon: "bi-grid-1x2",          path: "/admin/overview",  active: false },
    { label: "Users",     icon: "bi-people",            path: "/admin/users",     active: false },
    { label: "Zones",     icon: "bi-geo-alt",           path: "/admin/zones",     active: false },
    { label: "Reports",   icon: "bi-file-earmark-text", path: "/admin/reports",   active: true  },
  ];

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const [reportType, setReportType] = useState("Sales summary");
  const [dateFrom, setDateFrom]     = useState("");
  const [dateTo, setDateTo]         = useState("");
  const [generating, setGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      setLoading(true);
      setError("");
      const res = await apiRequest("/admin/reports");
      setReports(res.data?.data ?? []);
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
      setReports((prev) => [res.data, ...prev]);
      setSuccessMsg("Report generated successfully.");
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
          <div style={{ background: "#EAF3DE", color: "#27500A", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>
            {successMsg}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", alignItems: "end" }}>

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
          className="dash-btn-add"
          style={{ background: "#1D9E75", color: "#fff", width: "auto", padding: "10px 24px", marginTop: "14px" }}
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? "Generating…" : "📄 Generate report"}
        </button>
      </div>

      {/* Report history */}
      {loading && <div className="dash-loading">Loading reports…</div>}
      {error   && <div className="dash-error">⚠️ {error}</div>}

      {!loading && !error && (
        reports.length === 0 ? (
          <div className="dash-empty-state">No reports generated yet.</div>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Generated</th>
                  <th>By</th>
                  <th></th>
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
                        style={{ border: "none", background: "none", color: "#1D9E75", cursor: "pointer", fontSize: "13px" }}
                        onClick={() => alert("Download coming soon")}
                      >
                        ⬇ Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

    </DashboardLayout>
  );
}

export default AdminReports;
