// src/main.jsx
// import "./pwa";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

createRoot(document.getElementById("root")).render(
  <ErrorBoundary appVersion="1.5.3-beta">
    <App />
  </ErrorBoundary>
);