import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { GraduationCap } from "lucide-react";

export const Route = createFileRoute("/")({ component: IndexPage });

function IndexPage() {
  const nav = useNavigate();
  useEffect(() => {
    const authed = typeof window !== "undefined" && localStorage.getItem("eduvest_auth") === "1";
    nav({ to: authed ? "/home" : "/login", replace: true });
  }, [nav]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-navy text-primary-foreground">
      <div className="size-16 rounded-2xl bg-white/15 grid place-items-center mb-4">
        <GraduationCap className="size-8" />
      </div>
      <p className="text-xs uppercase tracking-widest opacity-80">EduVest</p>
      <h1 className="text-2xl font-bold mt-1">Attendance</h1>
      <p className="text-xs opacity-70 mt-6">Loading…</p>
    </div>
  );
}
