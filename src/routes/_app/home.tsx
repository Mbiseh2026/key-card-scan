import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ScanLine, History, Sparkles, Settings, Users, GraduationCap, Clock, CloudUpload, Bell } from "lucide-react";
import { todayStats } from "@/lib/attendance-store";

export const Route = createFileRoute("/_app/home")({
  component: HomePage,
});

function useStats() {
  const [stats, setStats] = useState(() => ({ total: 0, studentsPresent: 0, teachersPresent: 0, late: 0, pendingSync: 0 }));
  useEffect(() => {
    const refresh = () => setStats(todayStats());
    refresh();
    window.addEventListener("attendance-changed", refresh);
    window.addEventListener("online", refresh);
    return () => {
      window.removeEventListener("attendance-changed", refresh);
      window.removeEventListener("online", refresh);
    };
  }, []);
  return stats;
}

const dateLong = () => new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

function HomePage() {
  const stats = useStats();
  const school = typeof window !== "undefined" ? localStorage.getItem("eduvest_school") ?? "EDV-001" : "";

  return (
    <div>
      <header className="px-5 pt-12 pb-20 text-primary-foreground rounded-b-[2rem]" style={{ background: "var(--gradient-hero)" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest opacity-80">School · {school}</p>
            <h1 className="text-2xl font-bold mt-1">Good morning 👋</h1>
            <p className="text-sm opacity-90 mt-0.5">{dateLong()}</p>
          </div>
          <button className="size-10 rounded-full bg-white/15 backdrop-blur grid place-items-center relative">
            <Bell className="size-5" />
            {stats.late > 0 && <span className="absolute top-1 right-1 size-2 rounded-full bg-warning" />}
          </button>
        </div>

        <div className="mt-6 rounded-2xl bg-white/15 backdrop-blur p-4 border border-white/20">
          <p className="text-xs uppercase tracking-wider opacity-80">Today's attendance</p>
          <div className="flex items-end justify-between mt-1">
            <p className="text-4xl font-extrabold">{stats.total}</p>
            <p className="text-xs opacity-80">scans recorded</p>
          </div>
        </div>
      </header>

      <section className="px-5 -mt-12 grid grid-cols-2 gap-3">
        <StatCard icon={GraduationCap} label="Students Present" value={stats.studentsPresent} tone="primary" />
        <StatCard icon={Users} label="Teachers Present" value={stats.teachersPresent} tone="navy" />
        <StatCard icon={Clock} label="Late Today" value={stats.late} tone="warning" />
        <StatCard icon={CloudUpload} label="Pending Sync" value={stats.pendingSync} tone="muted" />
      </section>

      <section className="px-5 mt-7">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickAction to="/scan" icon={ScanLine} label="Scan Attendance" featured />
          <QuickAction to="/history" icon={History} label="History" />
          <QuickAction to="/ai" icon={Sparkles} label="AI Assistant" />
          <QuickAction to="/settings" icon={Settings} label="Settings" />
        </div>
      </section>

      <section className="px-5 mt-7">
        <div className="rounded-2xl border border-border bg-card p-4 flex items-start gap-3">
          <div className="size-10 rounded-xl bg-accent grid place-items-center text-navy">
            <Sparkles className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">AI insight</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Average arrival time today is 7:58 AM — {stats.late} late arrivals so far. Tap AI for the full pattern.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number; tone: "primary" | "navy" | "warning" | "muted" }) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    navy: "bg-navy/10 text-navy",
    warning: "bg-warning/15 text-warning-foreground",
    muted: "bg-muted text-muted-foreground",
  } as const;
  return (
    <div className="rounded-2xl bg-card border border-border p-4 shadow-card">
      <div className={`size-9 rounded-xl grid place-items-center ${tones[tone]}`}>
        <Icon className="size-5" />
      </div>
      <p className="text-2xl font-extrabold mt-3">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function QuickAction({ to, icon: Icon, label, featured }: { to: string; icon: any; label: string; featured?: boolean }) {
  return (
    <Link to={to} className={`rounded-2xl p-4 flex flex-col gap-3 border transition active:scale-[0.98] ${
      featured ? "text-primary-foreground border-transparent shadow-elevated" : "bg-card border-border text-foreground"
    }`} style={featured ? { background: "var(--gradient-primary)" } : undefined}>
      <Icon className="size-6" />
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  );
}
