import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Search, CloudOff, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getAttendance, type AttendanceRecord } from "@/lib/attendance-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/history")({
  component: HistoryPage,
});

type Range = "today" | "weekly" | "monthly";

function HistoryPage() {
  const [range, setRange] = useState<Range>("today");
  const [q, setQ] = useState("");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const refresh = () => setRecords(getAttendance());
    refresh();
    window.addEventListener("attendance-changed", refresh);
    return () => window.removeEventListener("attendance-changed", refresh);
  }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now);
    if (range === "today") cutoff.setHours(0, 0, 0, 0);
    if (range === "weekly") cutoff.setDate(now.getDate() - 7);
    if (range === "monthly") cutoff.setMonth(now.getMonth() - 1);
    return records.filter(r => new Date(r.time) >= cutoff)
      .filter(r => !q || r.name.toLowerCase().includes(q.toLowerCase()) || r.classOrDept.toLowerCase().includes(q.toLowerCase()));
  }, [records, range, q]);

  return (
    <div>
      <div className="px-5 pt-12 pb-5 text-primary-foreground rounded-b-3xl" style={{ background: "var(--gradient-navy)" }}>
        <div className="flex items-center justify-between">
          <Link to="/home" className="size-10 rounded-full bg-white/10 grid place-items-center">
            <ArrowLeft className="size-5" />
          </Link>
          <p className="font-semibold">Attendance History</p>
          <span className="size-10" />
        </div>
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/60" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search student, teacher, class…"
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60" />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5 bg-white/10 p-1 rounded-xl">
          {(["today", "weekly", "monthly"] as Range[]).map(r => (
            <button key={r} onClick={() => setRange(r)} className={cn(
              "py-2 rounded-lg text-xs font-semibold capitalize transition",
              range === r ? "bg-primary text-primary-foreground" : "text-white/80"
            )}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">No records in this range.</div>
        ) : filtered.map(r => {
          const t = new Date(r.time);
          return (
            <div key={r.id} className="rounded-2xl bg-card border border-border p-3.5 flex items-center gap-3">
              <div className="size-11 rounded-xl bg-accent grid place-items-center text-2xl">{r.photo}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">{r.name}</p>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">{r.method}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{r.classOrDept} · {r.role}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase",
                    r.status === "late" ? "bg-warning/20 text-warning-foreground" : "bg-primary/15 text-primary"
                  )}>{r.status}</span>
                  {r.synced
                    ? <CheckCircle2 className="size-3.5 text-primary" />
                    : <CloudOff className="size-3.5 text-warning-foreground" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
