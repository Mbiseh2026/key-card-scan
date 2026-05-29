import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Menu, ScanLine, ClipboardList, History, ChevronRight } from "lucide-react";
import { getGateRecords, getPerson, todayStats } from "@/lib/data";

export const Route = createFileRoute("/_app/home")({ component: HomePage });

function useLive<T>(fn: () => T): T {
  const [v, setV] = useState(fn);
  useEffect(() => {
    const refresh = () => setV(fn());
    refresh();
    window.addEventListener("eduvest-changed", refresh);
    return () => window.removeEventListener("eduvest-changed", refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return v;
}

const todayStr = new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

function HomePage() {
  const stats = useLive(todayStats);
  const feed = useLive(() => getGateRecords().slice(0, 4));

  return (
    <div className="pb-4">
      <header className="px-5 pt-12 pb-24 text-primary-foreground bg-navy rounded-b-[2rem]">
        <div className="flex items-center justify-between">
          <button className="size-10 rounded-full bg-white/10 grid place-items-center"><Menu className="size-5" /></button>
          <h1 className="text-lg font-bold">Attendance</h1>
          <button className="size-10 rounded-full bg-white/10 grid place-items-center relative">
            <Bell className="size-5" />
            {stats.late > 0 && <span className="absolute top-2 right-2 size-2 rounded-full bg-warning" />}
          </button>
        </div>

        <div className="mt-6 rounded-2xl bg-white/10 px-4 py-3 flex items-center justify-center gap-2">
          <span className="text-sm font-semibold">Today, {todayStr}</span>
        </div>

        <div className="mt-3 rounded-2xl bg-card text-foreground grid grid-cols-4 divide-x divide-border overflow-hidden">
          <Stat value={stats.present} label="Present" color="text-primary" />
          <Stat value={stats.absent} label="Absent" color="text-destructive" />
          <Stat value={stats.late} label="Late" color="text-warning-foreground" />
          <Stat value={stats.excused} label="Excused" color="text-muted-foreground" />
        </div>
      </header>

      <section className="px-5 -mt-14 grid grid-cols-2 gap-3">
        <ModeCard to="/gate" title="Gate Mode" sub="Mark attendance at the gate" cta="Open Scanner" featured icon={ScanLine} />
        <ModeCard to="/timetable" title="Class Mode" sub="Take attendance in classroom" cta="Open" icon={ClipboardList} />
      </section>

      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold">Live Feed</h2>
          <Link to="/history" className="text-xs font-semibold text-primary">View all</Link>
        </div>
        <div className="rounded-2xl bg-card border border-border divide-y divide-border">
          {feed.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No scans yet today.</p>}
          {feed.map(r => {
            const p = getPerson(r.personId);
            if (!p) return null;
            const time = new Date(r.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            return (
              <div key={r.id} className="flex items-center gap-3 p-3">
                <div className="size-11 rounded-full bg-accent grid place-items-center text-2xl">{p.photo}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.kind === "student" ? p.classId : "Teacher"}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                  r.status === "late" ? "bg-warning/20 text-warning-foreground" : "bg-primary/15 text-primary"
                }`}>{r.status === "late" ? "LATE" : "IN"}</span>
                <div className="text-right">
                  <p className="text-xs font-semibold">{time}</p>
                  <p className="text-[10px] text-muted-foreground">{r.gate}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-5 mt-5">
        <Link to="/history" className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3 active:scale-[0.99]">
          <div className="size-10 rounded-xl bg-accent grid place-items-center text-navy"><History className="size-5" /></div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Attendance History</p>
            <p className="text-xs text-muted-foreground">Daily reports & roll-call status</p>
          </div>
          <ChevronRight className="size-5 text-muted-foreground" />
        </Link>
      </section>
    </div>
  );
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="py-3 text-center">
      <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
      <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
    </div>
  );
}

function ModeCard({ to, title, sub, cta, featured, icon: Icon }: any) {
  return (
    <div className="rounded-2xl bg-card border border-border shadow-card p-4 flex flex-col">
      <div className="size-11 rounded-xl bg-accent grid place-items-center text-navy mx-auto">
        <Icon className="size-6" />
      </div>
      <p className="font-bold text-base text-center mt-3">{title}</p>
      <p className="text-[11px] text-muted-foreground text-center mt-1 leading-tight">{sub}</p>
      <Link to={to} className={`mt-3 rounded-xl py-2.5 text-xs font-semibold text-center ${
        featured ? "bg-primary text-primary-foreground" : "bg-accent text-navy"
      }`}>{cta}</Link>
    </div>
  );
}
