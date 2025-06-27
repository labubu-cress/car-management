import { colors } from "@/styles/theme.css";
import { style } from "@vanilla-extract/css";

export const container = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  padding: "20px",
});

export const loginBox = style({
  backgroundColor: colors.background,
  borderRadius: "12px",
  padding: "40px",
  width: "100%",
  maxWidth: "400px",
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
});

export const header = style({
  textAlign: "center",
  marginBottom: "32px",
});

export const title = style({
  fontSize: "28px",
  fontWeight: 700,
  color: colors.text,
  marginBottom: "8px",
});

export const subtitle = style({
  fontSize: "16px",
  color: colors.textSecondary,
});

export const form = style({
  display: "flex",
  flexDirection: "column",
  gap: "20px",
});

export const inputGroup = style({
  display: "flex",
  flexDirection: "column",
});

export const inputWrapper = style({
  position: "relative",
  display: "flex",
  alignItems: "center",
});

export const inputIcon = style({
  position: "absolute",
  left: "12px",
  color: colors.textSecondary,
  fontSize: "16px",
  zIndex: 1,
});

export const input = style({
  width: "100%",
  padding: "12px 12px 12px 40px",
  border: `2px solid ${colors.borderLight}`,
  borderRadius: "8px",
  fontSize: "16px",
  transition: "border-color 0.2s",
  backgroundColor: colors.background,
  ":focus": {
    borderColor: colors.primary,
    boxShadow: `0 0 0 3px ${colors.primary}20`,
  },
  ":disabled": {
    backgroundColor: colors.backgroundGray,
    cursor: "not-allowed",
  },
});

export const options = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "-8px",
  marginBottom: "8px",
});

export const checkboxLabel = style({
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  fontSize: "14px",
  color: colors.textSecondary,
});

export const checkbox = style({
  marginRight: "8px",
  width: "16px",
  height: "16px",
  accentColor: colors.primary,
});

export const error = style({
  color: colors.error,
  fontSize: "14px",
  textAlign: "center",
  padding: "8px",
  backgroundColor: "#fff2f0",
  border: `1px solid #ffccc7`,
  borderRadius: "6px",
});

export const submitButton = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  padding: "14px 24px",
  backgroundColor: colors.primary,
  color: colors.background,
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
  ":hover": {
    backgroundColor: colors.primaryHover,
    transform: "translateY(-1px)",
  },
  ":active": {
    backgroundColor: colors.primaryActive,
    transform: "translateY(0)",
  },
  ":disabled": {
    backgroundColor: colors.textDisabled,
    cursor: "not-allowed",
    transform: "none",
  },
});

export const buttonIcon = style({
  fontSize: "16px",
});
