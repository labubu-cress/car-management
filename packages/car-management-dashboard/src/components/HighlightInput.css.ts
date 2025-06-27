import { style } from "@vanilla-extract/css";

export const highlightInputStyles = {
  container: style({
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    padding: "8px",
    backgroundColor: "white",
    minHeight: "60px",
  }),

  highlight: style({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f4f6",
    borderRadius: "4px",
    padding: "8px 12px",
    marginBottom: "6px",
    border: "1px solid #e5e7eb",
  }),

  highlightContent: style({
    flex: "1",
    fontSize: "14px",
    color: "#374151",
    display: "flex",
    alignItems: "center",
  }),

  icon: style({
    width: "24px",
    height: "24px",
    marginRight: "8px",
    objectFit: "cover",
    borderRadius: "4px",
  }),

  removeButton: style({
    border: "none",
    background: "none",
    cursor: "pointer",
    padding: "4px",
    color: "#6b7280",
    borderRadius: "4px",
    ":hover": {
      color: "#ef4444",
      backgroundColor: "#fee2e2",
    },
  }),

  inputRow: style({
    display: "flex",
    gap: "8px",
    alignItems: "center",
  }),

  titleInput: style({
    flex: "2",
    padding: "6px 8px",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    fontSize: "14px",
    outline: "none",
    ":focus": {
      borderColor: "#3b82f6",
    },
  }),

  valueInput: style({
    flex: "1",
    display: "flex",
    alignItems: "center",
  }),

  addButton: style({
    padding: "6px 12px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    ":hover": {
      backgroundColor: "#2563eb",
    },
    ":disabled": {
      backgroundColor: "#9ca3af",
      cursor: "not-allowed",
    },
  }),
};
