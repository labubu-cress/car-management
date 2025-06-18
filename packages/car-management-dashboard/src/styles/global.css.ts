import { globalStyle } from "@vanilla-extract/css";

// 重置样式
globalStyle("*", {
  margin: 0,
  padding: 0,
  boxSizing: "border-box",
});

globalStyle("html, body", {
  height: "100%",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: "14px",
  lineHeight: 1.5,
  color: "#333",
  backgroundColor: "#f5f5f5",
});

globalStyle("#root", {
  height: "100%",
});

globalStyle("button", {
  cursor: "pointer",
  border: "none",
  outline: "none",
  fontFamily: "inherit",
});

globalStyle("input, textarea, select", {
  fontFamily: "inherit",
  fontSize: "inherit",
  outline: "none",
  padding: "8px 12px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  width: "100%",
});

globalStyle("select", {
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23666666' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.7rem center",
  backgroundSize: "1em",
  paddingRight: "2.5rem",
});

globalStyle("a", {
  textDecoration: "none",
  color: "inherit",
});

globalStyle("ul, ol", {
  listStyle: "none",
});

// 滚动条样式
globalStyle("::-webkit-scrollbar", {
  width: "6px",
  height: "6px",
});

globalStyle("::-webkit-scrollbar-track", {
  backgroundColor: "#f1f1f1",
});

globalStyle("::-webkit-scrollbar-thumb", {
  backgroundColor: "#c1c1c1",
  borderRadius: "3px",
});

globalStyle("::-webkit-scrollbar-thumb:hover", {
  backgroundColor: "#a8a8a8",
});
