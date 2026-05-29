import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TIMETABLE, getClass, studentsOfClass, saveClassAttendance, getClassRecord, type ClassStatus } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/class/$classId")({
  validateSearch: (s: Record<string, unknown>) => ({ slotId: String(s.slotId ?? "") }),
  component: ClassPage,
});

const FILTERS = [
  { key: "all", label: "All" },
  { key: "present", label: "Present" },
  { key: "absent", label: "Absent" },
  { key: "late", label: "Late" },
  { key: "excused", label: "Excuse" },
] as const;

function ClassPage() {
  const { classId } = Route.useParams();
  const { slotId } = Route.useSearch();
  const nav = useNavigate();
  const cls = getClass(classId);
  const slot = TIMETABLE.find(t => t.id === slotId);
  const students = studentsOfClass(classId);
  const teacherId = typeof window !== "undefined" ? localStorage.getItem("eduvest_teacherId") ?? "T001" : "T001";
  const today = new Date().toISOString().slice(0, 10);
  const existing = getClassRecord(classId, slotId, today);

  const [marks, setMarks] = useState<Record<string, ClassStatus>>(() => {
    const init: Record<string, ClassStatus> = {};
    students.forEach(s => { init[s.id] = existing?.marks[s.id] ?? "present"; });
    return init;
  });
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [saved, setSaved] = useState(false);

  const counts = useMemo(() => ({
    all: students.length,
    present: students.filter(s => marks[s.id] === "present").length,
    absent: students.filter(s => marks[s.id] === "absent").length,
    late: students.filter(s => marks[s.id] === "late").length,
    excused: students.filter(s => marks[s.id] === "excused").length,
  }), [marks, students]);

  const visible = students.filter(s => filter === "all" || marks[s.id] === filter);

  const set = (id: string, st: ClassStatus) => setMarks(m => ({ ...m, [id]: m[id] === st ? "present" : st }));

  const save = () => {
    saveClassAttendance({ classId, teacherId, date: today, slotId, marks });
    setSaved(true);
    setTimeout(() => nav({ to: "/timetable" }), 800);
  };

  if (!cls || !slot) return <div className="p-6">Class not found.</div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-5 pt-12 pb-4 bg-card border-b border-border flex items-center justify-between">
        <Link to="/timetable" className="size-10 grid place-items-center"><ArrowLeft className="size-5" /></Link>
        <div className="text-center">
          <h1 className="font-bold leading-tight">Class Attendance</h1>
          <p className="text-[11px] text-muted-foreground">{cls.name} · {slot.subject}</p>
        </div>
        <span className="size-10" />
      </header>

      <div className="px-5 pt-4">
        <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1 scrollbar-none">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold border",
                filter === f.key
                  ? "bg-navy text-primary-foreground border-navy"
                  : "bg-card text-muted-foreground border-border"
              )}>
              {f.label} ({counts[f.key]})
            </button>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground mt-3">
          Everyone is Present by default. Tap a button only for students who are Absent, Late, or Excused.
        </p>

        <div className="mt-3 space-y-2">
          {visible.map(s => {
            const st = marks[s.id];
            return (
              <div key={s.id} className="rounded-2xl bg-card border border-border p-3 flex items-center gap-3">
                <div className="size-11 rounded-full bg-accent grid place-items-center text-2xl">{s.photo}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{s.name}</p>
                  <p className={cn(
                    "text-[11px] font-semibold",
                    st === "present" && "text-primary",
                    st === "absent" && "text-destructive",
                    st === "late" && "text-warning-foreground",
                    st === "excused" && "text-navy",
                  )}>
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <MarkBtn label="A" tone="destructive" active={st === "absent"} onClick={() => set(s.id, "absent")} />
                  <MarkBtn label="L" tone="warning" active={st === "late"} onClick={() => set(s.id, "late")} />
                  <MarkBtn label="E" tone="navy" active={st === "excused"} onClick={() => set(s.id, "excused")} />
                </div>
              </div>
            );
          })}
          {visible.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-10">No students in this filter.</p>
          )}
        </div>
      </div>

      <div className="fixed bottom-20 inset-x-0 max-w-md mx-auto px-5">
        <Button onClick={save} className="w-full h-14 rounded-2xl text-base font-bold shadow-elevated">
          {saved ? <><Check className="mr-2" /> Saved</> : "Save Attendance"}
        </Button>
      </div>
    </div>
  );
}

function MarkBtn({ label, tone, active, onClick }: { label: string; tone: "destructive" | "warning" | "navy"; active: boolean; onClick: () => void }) {
  const tones: Record<typeof tone, string> = {
    destructive: active ? "bg-destructive text-destructive-foreground" : "bg-destructive/10 text-destructive",
    warning: active ? "bg-warning text-warning-foreground" : "bg-warning/15 text-warning-foreground",
    navy: active ? "bg-navy text-navy-foreground" : "bg-navy/10 text-navy",
  };
  return (
    <button onClick={onClick} className={cn("size-10 rounded-xl font-bold text-sm grid place-items-center", tones[tone])}>
      {label}
    </button>
  );
}
