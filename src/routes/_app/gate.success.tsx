import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGateRecords, getPerson, getClass } from "@/lib/data";

export const Route = createFileRoute("/_app/gate/success")({
  validateSearch: (s: Record<string, unknown>) => ({ id: String(s.id ?? "") }),
  component: SuccessPage,
});

function SuccessPage() {
  const { id } = Route.useSearch();
  const nav = useNavigate();
  const rec = getGateRecords().find(r => r.id === id);
  const person = rec ? getPerson(rec.personId) : null;
  const cls = person?.classId ? getClass(person.classId) : null;

  if (!rec || !person) {
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center">
        <div>
          <p>Record not found.</p>
          <Link to="/gate" className="text-primary font-semibold">Back to scanner</Link>
        </div>
      </div>
    );
  }

  const time = new Date(rec.time);
  const timeStr = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = time.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
  const tone = rec.status === "late" ? "warning" : "primary";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="px-5 pt-12 pb-5 bg-card border-b border-border flex items-center justify-between">
        <Link to="/gate" className="size-10 grid place-items-center"><ArrowLeft className="size-5" /></Link>
        <h1 className="font-bold">Attendance Confirmed</h1>
        <span className="size-10" />
      </header>

      <div className="flex-1 px-6 pt-10 text-center flex flex-col items-center">
        <div className={`size-28 rounded-full grid place-items-center ${tone === "warning" ? "bg-warning/20" : "bg-primary/15"}`}>
          <Check className={`size-14 ${tone === "warning" ? "text-warning-foreground" : "text-primary"}`} strokeWidth={3} />
        </div>
        <h2 className="text-2xl font-extrabold mt-6">{person.name}</h2>
        <p className="text-muted-foreground mt-1">
          {person.kind === "student" ? cls?.name : "Teacher"}
        </p>
        <span className={`inline-block mt-4 px-4 py-1.5 rounded-full text-xs font-bold ${
          rec.status === "late" ? "bg-warning/20 text-warning-foreground" : "bg-primary/15 text-primary"
        }`}>
          Marked as {rec.status === "late" ? "Late Gate Entry" : "Present"}
        </span>
        <p className="mt-4 text-sm text-muted-foreground">{timeStr} · {dateStr}</p>
      </div>

      <div className="p-6 space-y-3">
        <Button onClick={() => nav({ to: "/gate" })} className="w-full h-14 text-base font-semibold rounded-2xl">
          <ScanLine className="mr-2" /> Scan Next
        </Button>
        <Button variant="outline" onClick={() => nav({ to: "/timetable" })} className="w-full h-14 text-base font-semibold rounded-2xl">
          Switch to Class Mode
        </Button>
      </div>
    </div>
  );
}
