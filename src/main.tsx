import React from "react";
import ReactDOM from "react-dom/client";
import App, { type Page, type Variant } from "./App";
import "./styles.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const variant: Variant = rootElement.dataset.variant === "sales" ? "sales" : "base";
const page: Page =
  rootElement.dataset.page === "account"
    ? "account"
    : rootElement.dataset.page === "terms"
      ? "terms"
      : rootElement.dataset.page === "privacy"
        ? "privacy"
        : "home";

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App variant={variant} page={page} />
  </React.StrictMode>
);
