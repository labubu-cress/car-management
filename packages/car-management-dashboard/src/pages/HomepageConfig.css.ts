import { style } from "@vanilla-extract/css";

const spacing = {
  s: '4px',
  m: '8px',
  l: '16px',
};

export const homepageConfigStyles = {
  container: style({
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
  }),

  header: style({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  }),

  title: style({
    fontSize: "24px",
    fontWeight: "600",
    color: "#111827",
  }),

  form: style({
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "24px",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
    display: 'grid',
    gap: spacing.m,
  }),

  fieldset: style({
    border: "none",
    padding: 0,
    margin: 0,
    display: 'grid',
    gap: spacing.m,
  }),

  bannerTypeSelector: style({
    display: 'flex',
    gap: spacing.l,
    alignItems: 'center',
    marginBottom: spacing.m,
  }),

  bannerLabel: style({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.s,
    cursor: 'pointer',
  }),

  actions: style({
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "32px",
    paddingTop: "24px",
    borderTop: "1px solid #e5e7eb",
  }),

  submitButton: style({
    padding: "10px 20px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    ":hover": {
      backgroundColor: "#2563eb",
    },
    ":disabled": {
      opacity: "0.5",
      cursor: "not-allowed",
    },
  }),

  cancelButton: style({
    padding: "10px 20px",
    backgroundColor: "#e5e7eb",
    color: "#374151",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    ":hover": {
      backgroundColor: "#d1d5db",
    },
  }),
};
