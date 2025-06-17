import { style } from "@vanilla-extract/css";

export const multiUploadStyles = {
  container: style({
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
  }),
  item: style({
    position: "relative",
  }),
  deleteButton: style({
    position: "absolute",
    top: "-10px",
    right: "-10px",
    background: "red",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: "14px",
  }),
  addButton: style({
    width: "150px",
    height: "150px",
  }),
};
