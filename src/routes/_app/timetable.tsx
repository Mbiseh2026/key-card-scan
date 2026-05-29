import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { TIMETABLE, getClass, rollCallStatus } from "@/lib/data";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_app/timetable")({ component: TimetablePage });

function TimetablePage() {
  const teacherId = typeof window !== "undefined" ? localStorage.getItem("eduvest_teacherId") ?? "T001" : "T001";
  const [status, setStatus] = useState(() => rollCallStatus());

  useEffect(() => {
    const refresh = () => setStatus(rollCallStatus());
    refresh();
    window.addEventListener("eduvest-changed", refresh);
    return () => window.removeEventListener("eduvest-changed", refresh);
  }, []);

  const myClasses = TIMETABLE.filter(s => s.teacherId === teacherId);
  const completed = status.filter(s => s.completed).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="px-5 pt-12 pb-5 bg-card border-b border-border flex items-center justify-between">
        <Link to="/home" className="size-10 grid place-items-center"><ArrowLeft className="size-5" /></Link>
        <h1 className="font-bold">My Timetable</h1>
        <span className="size-10" />
      </header>

      <div className="px-5 pt-5">
        <div className="rounded-2xl bg-navy text-primary-foreground p-5">
          <p className="text-xs uppercase tracking-wider opacity-80">Roll Call Today</p>
          <p className="text-3xl font-extrabold mt-1">{completed} / {TIMETABLE.length}</p>
          <p className="text-xs opacity-80">classes completed</p>
        </div>

        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mt-6 mb-3">My Classes</h2>
        <div className="space-y-3">
          {myClasses.map(slot => {
            const cls = getClass(slot.classId)!;
            const s = status.find(x => x.slot.id === slot.id);
            const done = !!s?.completed;
            return (
              <Link key={slot.id} to="/class/$classId" params={{ classId: slot.classId }} search={{ slotId: slot.id }}
                className="block rounded-2xl bg-card border border-border p-4 active:scale-[0.99]">
                <div className="flex items-center gap-3">
                  <div className={`size-12 rounded-xl grid place-items-center ${done ? "bg-primary/15 text-primary" : "bg-warning/15 text-warning-foreground"}`}>
                    {done ? <CheckCircle2 className="size-6" /> : <AlertCircle className="size-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold">{cls.name} · {slot.subject}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="size-3" /> {slot.start} – {slot.end}
                    </p>
                    <p className={`text-[11px] font-bold mt-1 ${done ? "text-primary" : "text-warning-foreground"}`}>
                      {done ? "✓ Roll Call Completed" : "⚠ Pending Roll Call"}
                    </p>
                  </div>
                  <ChevronRight className="size-5 text-muted-foreground" />
                </div>
              </Link>
            );
          })}
        </div>

        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mt-7 mb-3">All Classes Today</h2>
        <div className="rounded-2xl bg-card border border-border divide-y divide-border">
          {status.map(({ slot, completed }) => {
            const cls = getClass(slot.classId)!;
            return (
              <div key={slot.id} className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{cls.name} · {slot.subject}</p>
                  <p className="text-[11px] text-muted-foreground">{slot.start} – {slot.end}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                  completed ? "bg-primary/15 text-primary" : "bg-destructive/10 text-destructive"
                }`}>{completed ? "DONE" : "PENDING"}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
