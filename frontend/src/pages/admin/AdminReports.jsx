// ===========================================
// ADMIN REPORTS PAGE
// Lets admin generate reports (sales, inventory, etc.)
// and view a history of previously generated reports.
//
// Maps to: reports table
//
// Data flow:
// - Fetch report history from GET /api/admin/reports
// - Generate new report → POST /api/admin/reports
//   { report_type, parameters: { date_from, date_to, ... } }
// ===========================================

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
  const [error, setError] = useState("");

  // ---- GENERATE REPORT FORM STATE ----
  const [reportType, setReportType] = useState("Sales summary");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [generating, setGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        setError("");

        // TODO: replace with real API call
        // const data = await apiRequest("/admin/reports");
        // setReports(data);

        // TEMPORARY sample data
        await new Promise((res) => setTimeout(res, 500));
        setReports([
          { report_id: 1, report_type: "Sales summary — May",   generated_date: "2026-06-01", generated_by: "Admin" },
          { report_id: 2, report_type: "Zone performance — Q2",  generated_date: "2026-05-28", generated_by: "Admin" },
        ]);

      } catch (err) {
        setError(err.message || "Failed to load reports.");
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  // ---- GENERATE REPORT ----
  const handleGenerate = async () => {
    setGenerating(true);
    setSuccessMsg("");

    try {
      // TODO: replace with real API call
      // const newReport = await apiRequest("/admin/reports", "POST", {
      //   report_type: reportType,
      //   parameters: { date_from: dateFrom, date_to: dateTo },
      // });
      // setReports((prev) => [newReport, ...prev]);

      // TEMPORARY: simulate generating a report
      await new Promise((res) => setTimeout(res, 1000));
      const newReport = {
        report_id: Date.now(),
        report_type: `${reportType}${dateFrom && dateTo ? ` (${dateFrom} – ${dateTo})` : ""}`,
        generated_date: new Date().toISOString().split("T")[0],
        generated_by: "Admin",
      };
      setReports((prev) => [newReport, ...prev]);
      setSuccessMsg("✅ Report generated successfully.");

    } catch (err) {
      alert(`Failed to generate report: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <DashboardLayout title="Reports" navItems={navItems}>

      {/* ---- GENERATE REPORT FORM ---- */}
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

      {/* ---- REPORT HISTORY ---- */}
      {loading && <div className="dash-loading">Loading reports…</div>}
      {error && <div className="dash-error">⚠️ {error}</div>}

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
                    <td>{report.generated_date}</td>
                    <td>{report.generated_by}</td>
                    <td>
                      {/* TODO: link to actual file download once backend generates files */}
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
