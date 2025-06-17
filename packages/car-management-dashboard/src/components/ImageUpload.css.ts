import { style } from "@vanilla-extract/css";

export const uploadStyles = {
  container: style({
    position: "relative",
    width: "150px",
    height: "150px",
    border: "2px dashed #ccc",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    overflow: "hidden",
    transition: "border-color 0.3s",
    ":hover": {
      borderColor: "#888",
    },
  }),
  imagePreview: style({
    width: "100%",
    height: "100%",
    objectFit: "cover",
  }),
  placeholder: style({
    textAlign: "center",
    color: "#888",
  }),
  input: style({
    display: "none",
  }),
  progressOverlay: style({
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
  }),
};
