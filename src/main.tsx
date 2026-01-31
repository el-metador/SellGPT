import React from "react";
import ReactDOM from "react-dom/client";
import App, { type Variant } from "./App";
import "./styles.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const variant: Variant = rootElement.dataset.variant === "sales" ? "sales" : "base";

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App variant={variant} />
  </React.StrictMode>
);
