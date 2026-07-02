import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const icon = type === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill";
  const bg   = type === "success" ? "bg-success"           : "bg-danger";

  return (
    <div
      className={`toast show align-items-center text-white ${bg} border-0 sm-fade-in`}
      style={{
        position: "fixed", bottom: "1.5rem", right: "1.5rem",
        zIndex: 9999, minWidth: 280, boxShadow: "var(--sm-shadow-lg)",
        borderRadius: "var(--sm-radius)"
      }}
      role="alert"
    >
      <div className="d-flex">
        <div className="toast-body d-flex align-items-center gap-2">
          <i className={`bi ${icon} fs-6`}></i>
          <span style={{ fontSize: "0.875rem" }}>{message}</span>
        </div>
        <button
          type="button"
          className="btn-close btn-close-white me-2 m-auto"
          onClick={onClose}
        />
      </div>
    </div>
  );
}
