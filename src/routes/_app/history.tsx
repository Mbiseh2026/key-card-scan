import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { CLASSES, getGateRecords, getPerson, rollCallStatus, todayStats } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/history")({ component: HistoryPage });

function HistoryPage() {
  const [classFilter, setClassFilter] = useState<string>("all");
  const stats = todayStats();
  const records = getGateRecords().slice(0, 30);
  const rollCall = rollCallStatus();
  const filtered = useMemo(() => records.filter(r => {
    if (classFilter === "all") return true;
    const p = getPerson(r.personId);
    return p?.classId === classFilter;
  }), [records, classFilter]);

  const dateStr = new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-background">
      <header className="px-5 pt-12 pb-5 bg-card border-b border-border flex items-center justify-between">
        <Link to="/home" className="size-10 grid place-items-center"><ArrowLeft className="size-5" /></Link>
        <h1 className="font-bold">Attendance History</h1>
        <button className="size-10 grid place-items-center text-muted-foreground"><Calendar className="size-5" /></button>
      </header>

      <div className="px-5 pt-4">
        <div className="rounded-2xl bg-card border border-border p-2 flex items-center justify-between">
          <button className="size-9 rounded-xl bg-muted grid place-items-center"><ChevronLeft className="size-4" /></button>
          <p className="text-sm font-semibold">{dateStr}</p>
          <button className="size-9 rounded-xl bg-muted grid place-items-center"><ChevronRight className="size-4" /></button>
        </div>

        <div className="mt-3 rounded-2xl bg-card border border-border grid grid-cols-4 divide-x divide-border overflow-hidden">
          <Cell value={stats.present} label="Present" c="text-primary" />
          <Cell value={stats.absent} label="Absent" c="text-destructive" />
          <Cell value={stats.late} label="Late" c="text-warning-foreground" />
          <Cell value={stats.excused} label="Excused" c="text-muted-foreground" />
        </div>

        <h2 className="text-sm font-bold mt-6 mb-2">Filter by class</h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Pill active={classFilter === "all"} onClick={() => setClassFilter("all")}>All</Pill>
          {CLASSES.map(c => (
            <Pill key={c.id} active={classFilter === c.id} onClick={() => setClassFilter(c.id)}>{c.name}</Pill>
          ))}
        </div>

        <h2 className="text-sm font-bold mt-6 mb-2">Roll Call Status</h2>
        <div className="rounded-2xl bg-card border border-border divide-y divide-border">
          {rollCall.map(({ slot, completed }) => {
            const cls = CLASSES.find(c => c.id === slot.classId)!;
            return (
              <div key={slot.id} className="p-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-sm">{cls.name} · {slot.subject}</p>
                  <p className="text-[11px] text-muted-foreground">{slot.start} – {slot.end}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                  completed ? "bg-primary/15 text-primary" : "bg-destructive/10 text-destructive"
                }`}>
                  {completed ? "✓ COMPLETED" : "⚠ PENDING"}
                </span>
              </div>
            );
          })}
        </div>

        <h2 className="text-sm font-bold mt-6 mb-2">Gate Activity</h2>
        <div className="rounded-2xl bg-card border border-border divide-y divide-border">
          {filtered.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No records.</p>}
          {filtered.map(r => {
            const p = getPerson(r.personId);
            if (!p) return null;
            const time = new Date(r.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            return (
              <div key={r.id} className="p-3 flex items-center gap-3">
                <div className="size-10 rounded-full bg-accent grid place-items-center text-xl">{p.photo}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground">Arrived at {r.gate}</p>
                </div>
                <p className="text-xs font-semibold">{time}</p>
              </div>
            );
          })}
        </div>

        <button className="mt-5 w-full rounded-2xl border border-border bg-card py-3 text-sm font-semibold flex items-center justify-center gap-2 text-muted-foreground">
          <Download className="size-4" /> Export (coming soon)
        </button>
      </div>
    </div>
  );
}

function Cell({ value, label, c }: { value: number; label: string; c: string }) {
  return (
    <div className="py-3 text-center">
      <p className={`text-2xl font-extrabold ${c}`}>{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
function Pill({ active, onClick, children }: any) {
  return (
    <button onClick={onClick} className={cn(
      "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold border",
      active ? "bg-navy text-primary-foreground border-navy" : "bg-card text-muted-foreground border-border"
    )}>{children}</button>
  );
}
