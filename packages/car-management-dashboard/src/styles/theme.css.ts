import { style } from "@vanilla-extract/css";

// 颜色变量
export const colors = {
  primary: "#1890ff",
  primaryHover: "#40a9ff",
  primaryActive: "#096dd9",
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
  text: "#333333",
  textSecondary: "#666666",
  textDisabled: "#999999",
  border: "#d9d9d9",
  borderLight: "#f0f0f0",
  background: "#ffffff",
  backgroundGray: "#f5f5f5",
  backgroundDark: "#001529",
};

// 通用样式
export const card = style({
  backgroundColor: colors.background,
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  padding: "24px",
});

export const button = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 16px",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: 500,
  whiteSpace: "nowrap",
  transition: "all 0.2s",
  cursor: "pointer",
  border: "none",
  outline: "none",
});

export const buttonPrimary = style([
  button,
  {
    backgroundColor: colors.primary,
    color: colors.background,
    ":hover": {
      backgroundColor: colors.primaryHover,
    },
    ":active": {
      backgroundColor: colors.primaryActive,
    },
  },
]);

export const buttonSecondary = style([
  button,
  {
    backgroundColor: colors.background,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    ":hover": {
      borderColor: colors.primary,
      color: colors.primary,
    },
  },
]);

export const buttonDanger = style([
  button,
  {
    backgroundColor: colors.error,
    color: colors.background,
    ":hover": {
      backgroundColor: "#ff7875",
    },
  },
]);

export const input = style({
  width: "100%",
  padding: "8px 12px",
  border: `1px solid ${colors.border}`,
  borderRadius: "6px",
  fontSize: "14px",
  transition: "border-color 0.2s",
  ":focus": {
    borderColor: colors.primary,
    boxShadow: `0 0 0 2px ${colors.primary}20`,
  },
});

export const select = style([
  input,
  {
    cursor: "pointer",
    backgroundColor: colors.background,
  },
]);

export const textarea = style([
  input,
  {
    minHeight: "80px",
    resize: "vertical",
  },
]);

export const table = style({
  width: "100%",
  borderCollapse: "collapse",
  backgroundColor: colors.background,
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
});

export const tableHeader = style({
  backgroundColor: colors.backgroundGray,
  fontWeight: 600,
});

export const tableCell = style({
  padding: "12px 16px",
  borderBottom: `1px solid ${colors.borderLight}`,
  textAlign: "left",
});

export const tag = style({
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: "4px",
  fontSize: "12px",
  fontWeight: 500,
});

export const tagSuccess = style([
  tag,
  {
    backgroundColor: "#f6ffed",
    color: colors.success,
    border: `1px solid #b7eb8f`,
  },
]);

export const tagWarning = style([
  tag,
  {
    backgroundColor: "#fffbe6",
    color: colors.warning,
    border: `1px solid #ffe58f`,
  },
]);

export const tagError = style([
  tag,
  {
    backgroundColor: "#fff2f0",
    color: colors.error,
    border: `1px solid #ffccc7`,
  },
]);

export const modal = style({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
});

export const modalContent = style({
  backgroundColor: colors.background,
  borderRadius: "8px",
  padding: "24px",
  maxWidth: "600px",
  width: "90%",
  maxHeight: "80vh",
  overflow: "auto",
});

export const loading = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px",
  color: colors.textSecondary,
});
