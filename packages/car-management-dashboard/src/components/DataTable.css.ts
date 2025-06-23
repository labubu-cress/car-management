import { style } from "@vanilla-extract/css";

export const container = style({
  background: "white",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  overflow: "hidden",
});

export const header = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px 24px",
  borderBottom: "1px solid #f0f0f0",
});

export const title = style({
  margin: 0,
  fontSize: "18px",
  fontWeight: "600",
  color: "#333",
});

export const addButton = style({
  display: "flex",
  alignItems: "center",
  padding: "8px 16px",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  border: "none",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: "500",
  cursor: "pointer",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",

  ":hover": {
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
  },
});

export const buttonIcon = style({
  marginRight: "6px",
});

export const tableWrapper = style({
  overflowX: "auto",
});

export const table = style({
  width: "100%",
  borderCollapse: "collapse",
});

export const th = style({
  padding: "16px 24px",
  textAlign: "left",
  fontSize: "14px",
  fontWeight: "600",
  color: "#666",
  backgroundColor: "#fafafa",
  borderBottom: "1px solid #f0f0f0",
});

export const tr = style({
  transition: "background-color 0.2s ease",

  ":hover": {
    backgroundColor: "#f9f9f9",
  },
});

export const td = style({
  padding: "16px 24px",
  fontSize: "14px",
  color: "#333",
  borderBottom: "1px solid #f0f0f0",
  verticalAlign: "middle",
});

export const loadingCell = style({
  padding: "40px 24px",
  textAlign: "center",
  color: "#666",
  fontSize: "14px",
});

export const emptyCell = style({
  padding: "40px 24px",
  textAlign: "center",
  color: "#999",
  fontSize: "14px",
});

export const actions = style({
  display: "flex",
  alignItems: "center",
  gap: "8px",
});

export const actionButton = style({
  padding: "6px 12px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 500,
  transition: "background-color 0.2s ease, color 0.2s ease",
  backgroundColor: "#f0f2f5",
  color: "#333",
  whiteSpace: "nowrap",

  ":hover": {
    backgroundColor: "#e4e6e8",
  },
});

export const actionButtonDanger = style([
  actionButton,
  {
    backgroundColor: "#fff1f0",
    color: "#ff4d4f",
    ":hover": {
      backgroundColor: "#ffccc7",
    },
  },
]);

export const editButton = style({
  padding: "6px 8px",
  background: "#52c41a",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "12px",
  transition: "background-color 0.2s ease",

  ":hover": {
    backgroundColor: "#389e0d",
  },
});

export const deleteButton = style({
  padding: "6px 8px",
  background: "#ff4d4f",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "12px",
  transition: "background-color 0.2s ease",

  ":hover": {
    backgroundColor: "#cf1322",
  },
});
