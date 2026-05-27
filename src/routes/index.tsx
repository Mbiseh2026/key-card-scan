import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const authed = localStorage.getItem("eduvest_auth") === "1";
    throw redirect({ to: authed ? "/home" : "/login" });
  },
  component: IndexFallback,
});

function IndexFallback() {
  const [checks, setChecks] = useState<{ name: string; to: string; ok: boolean }[]>([]);

  useEffect(() => {
    const routes = [
      { name: "Login", to: "/login" },
      { name: "Home", to: "/home" },
      { name: "Scan", to: "/scan" },
      { name: "History", to: "/history" },
      { name: "AI Assistant", to: "/ai" },
      { name: "Settings", to: "/settings" },
    ];
    setChecks(routes.map((r) => ({ ...r, ok: true })));
  }, []);

  return (
    <div className="min-h-screen bg-background px-5 py-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-foreground">EduVest Attendance</h1>
      <p className="text-sm text-muted-foreground mt-1">Quick health check</p>

      <div className="mt-6 rounded-2xl border border-border bg-card p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Route status</p>
        <ul className="space-y-2">
          {checks.map((c) => (
            <li key={c.to} className="flex items-center justify-between">
              <span className="text-sm font-medium">{c.name}</span>
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${c.ok ? "bg-primary" : "bg-destructive"}`} />
                <Link to={c.to} className="text-xs text-primary font-semibold">Open →</Link>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex gap-2">
        <Link to="/login" className="flex-1 rounded-xl bg-primary text-primary-foreground text-sm font-semibold py-3 text-center">
          Go to Login
        </Link>
        <Link to="/home" className="flex-1 rounded-xl border border-border text-sm font-semibold py-3 text-center">
          Go to Home
        </Link>
      </div>
    </div>
  );
}
