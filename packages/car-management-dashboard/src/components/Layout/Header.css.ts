import { style } from "@vanilla-extract/css";

const colors = {
  primary: "#1890ff",
  background: "#ffffff",
  text: "#333333",
  textSecondary: "#666666",
  border: "#d9d9d9",
  error: "#ff4d4f",
};

export const header = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 24px",
  height: "64px",
  backgroundColor: colors.background,
  borderBottom: `1px solid ${colors.border}`,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
});

export const left = style({
  display: "flex",
  alignItems: "center",
});

export const tenantSelector = style({
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 12px",
  backgroundColor: "#f5f5f5",
  borderRadius: "6px",
  border: `1px solid ${colors.border}`,
});

export const tenantIcon = style({
  color: colors.primary,
  fontSize: "16px",
});

export const selectWrapper = style({
  position: "relative",
  display: "flex",
  alignItems: "center",
});

export const tenantSelect = style({
  border: "none",
  backgroundColor: "transparent",
  fontSize: "14px",
  fontWeight: 500,
  color: colors.text,
  cursor: "pointer",
  outline: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
  appearance: "none",
  paddingRight: "24px",

  selectors: {
    "&:disabled": {
      cursor: "not-allowed",
      color: colors.textSecondary,
    },
  },
});

export const chevronIcon = style({
  position: "absolute",
  right: "8px",
  color: colors.textSecondary,
  fontSize: "12px",
  pointerEvents: "none",
});

export const right = style({
  display: "flex",
  alignItems: "center",
  gap: "16px",
});

export const userInfo = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
});

export const username = style({
  fontSize: "14px",
  fontWeight: 600,
  color: colors.text,
});

export const role = style({
  fontSize: "12px",
  color: colors.textSecondary,
});

export const logoutButton = style({
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "8px 16px",
  backgroundColor: colors.error,
  color: colors.background,
  border: "none",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
  ":hover": {
    backgroundColor: "#ff7875",
  },
});
