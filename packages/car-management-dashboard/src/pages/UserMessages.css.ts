import { style } from "@vanilla-extract/css";

export const pagination = style({
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  marginTop: "24px",
  gap: "16px",
});

export const filterGroup = style({
  display: "flex",
  gap: "16px",
  marginBottom: "24px",
});

export const button = style({
  padding: "4px 12px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  cursor: "pointer",
  fontSize: "14px",
  ":disabled": {
    opacity: 0.5,
    cursor: "not-allowed",
  },
});

export const solidButton = style({
  backgroundColor: "var(--accent-9)",
  color: "white",
  border: "none",
});

export const softButton = style({
  backgroundColor: "var(--accent-3)",
  color: "var(--accent-11)",
  border: "none",
});
