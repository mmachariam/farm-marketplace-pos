// ReportDownloadButtons — shared by AdminReports + FarmerReports.
// Disables itself mid-download and reports success/failure via callbacks so
// the page can show a toast, matching the "disable while generating /
// success toast on start" requirement for every report's download buttons.

import { useState } from "react";

export default function ReportDownloadButtons({ onDownload, disabled }) {
  const [downloading, setDownloading] = useState(null);

  async function handle(format) {
    setDownloading(format);
    try {
      await onDownload(format);
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="d-flex gap-2">
      <button
        className="btn btn-outline-success btn-sm d-flex align-items-center gap-2"
        onClick={() => handle("pdf")}
        disabled={disabled || downloading !== null}
      >
        {downloading === "pdf" ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-file-earmark-pdf"></i>}
        Download PDF
      </button>
      <button
        className="btn btn-outline-success btn-sm d-flex align-items-center gap-2"
        onClick={() => handle("xlsx")}
        disabled={disabled || downloading !== null}
      >
        {downloading === "xlsx" ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-file-earmark-excel"></i>}
        Download Excel
      </button>
    </div>
  );
}
