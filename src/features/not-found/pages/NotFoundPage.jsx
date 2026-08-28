import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center theme-bg-page theme-text px-6 py-12 theme-selection">
      <div className="w-full max-w-md text-center rounded-[2rem] border theme-border theme-bg-surface-muted p-8 theme-card-shadow">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border theme-border-primary theme-bg-tint-strong">
          <AlertTriangle className="h-12 w-12 theme-text-primary" />
        </div>

        <h1 className="text-6xl font-extrabold theme-text">
          404
        </h1>

        <h2 className="mt-4 text-2xl font-semibold theme-text">
          Page Not Found
        </h2>

        <p className="mt-3 theme-text-muted">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl theme-bg-primary px-5 py-3 font-bold theme-text-on-primary theme-hover-bg-primary shadow-lg theme-shadow transition"
          >
            <Home size={18} />
            Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border theme-border px-5 py-3 font-bold theme-text-muted theme-hover-bg theme-hover-text transition"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
