import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 select-none">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gray-100 shadow-2xl text-center space-y-5 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-0.5 rounded-full">
                System Recovery
              </span>
              <h2 className="text-2xl font-black text-gray-900 mt-2">
                Kuch Galat Ho Gaya
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Server connection ya unexpected glitch ke karan yeh page load nahi ho saka. Kripya page ko refresh karein ya home par jayein.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Dobara Koshish Karein</span>
              </button>

              <button
                onClick={this.handleReload}
                className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-1.5 shadow-md hover:opacity-95 transition cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home Page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}