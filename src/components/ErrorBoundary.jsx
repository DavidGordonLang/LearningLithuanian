// src/components/ErrorBoundary.jsx
import React from "react";
import { trackError } from "../services/analytics";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    try {
      trackError(error, {
        source: "react_error_boundary",
        componentStack: info?.componentStack || "",
      }, { app_version: this.props.appVersion });
    } catch {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3">
            <div className="text-lg font-semibold">Something went wrong</div>
            <div className="text-sm text-zinc-400">
              Žodis hit an error. Try refreshing the page. If it keeps happening,
              let David know.
            </div>
            <button
              className="bg-emerald-500 text-black rounded-full px-5 py-2 font-semibold"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}