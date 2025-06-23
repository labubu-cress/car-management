import { style } from "@vanilla-extract/css";

export const container = style({
  padding: "20px",
});

export const header = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
});

export const formStyles = {
  submitButton: style({
    padding: "10px 20px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "16px",
    ":hover": {
      backgroundColor: "#2563eb",
    },
    ":disabled": {
      opacity: "0.5",
      cursor: "not-allowed",
    },
  }),
};

export const tableStyles = {
  iconImage: style({
    width: "50px",
    height: "50px",
    objectFit: "cover",
    borderRadius: "4px",
  }),
};
