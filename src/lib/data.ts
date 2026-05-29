// EduVest Attendance — local data store (MVP, syncs to dashboard placeholder)
export type Role = "teacher" | "gate" | "supervisor" | "admin";
export type Section = "primary" | "secondary";
export type Lang = "en" | "fr";

export type Person = {
  id: string;          // QR token
  name: string;
  photo: string;       // emoji avatar (placeholder)
  classId?: string;    // students
  kind: "student" | "teacher" | "staff";
  parentEmail?: string;
  parentPhone?: string;
};

export type ClassRoom = {
  id: string;
  name: string;        // "Class 6A"
  level: Section;
  lang: Lang;
  teacherId: string;
};

export type TimetableSlot = {
  id: string;
  classId: string;
  teacherId: string;
  subject: string;
  start: string; // "08:00"
  end: string;   // "08:50"
  day: number;   // 0=Sun..6=Sat
};

export type GateStatus = "present" | "late" | "no_entry";
export type ClassStatus = "present" | "absent" | "late" | "left";

export type GateRecord = {
  id: string;
  personId: string;
  time: string;
  status: GateStatus;
  gate: string;
  synced: boolean;
};

export type ClassRecord = {
  id: string;
  classId: string;
  teacherId: string;
  date: string;          // yyyy-mm-dd
  slotId: string;
  status: "completed" | "pending";
  marks: Record<string, ClassStatus>; // studentId -> status
  savedAt?: string;
};

// ---------------------- SEED ----------------------
export const TEACHERS: Person[] = [
  { id: "T001", kind: "teacher", name: "Mr. Alex Mbeki", photo: "👨🏾‍🏫" },
  { id: "T002", kind: "teacher", name: "Mme. Claire Eyenga", photo: "👩🏾‍🏫" },
  { id: "T003", kind: "teacher", name: "Mr. Daniel Asong", photo: "🧑🏾‍🏫" },
];

export const CLASSES: ClassRoom[] = [
  { id: "C6A", name: "Class 6A", level: "primary", lang: "en", teacherId: "T001" },
  { id: "C3B", name: "Class 3B", level: "primary", lang: "en", teacherId: "T002" },
  { id: "CCM2", name: "CM2", level: "primary", lang: "fr", teacherId: "T003" },
];

const mkStudent = (id: string, name: string, classId: string, photo: string): Person => ({
  id, name, photo, classId, kind: "student",
  parentEmail: `parent.${id.toLowerCase()}@school.eduvest.app`,
  parentPhone: "+237 6xx xxx xxx",
});

export const STUDENTS: Person[] = [
  mkStudent("S001", "Marie Nguema", "C6A", "👧🏾"),
  mkStudent("S002", "Paul Nguema", "C6A", "👦🏾"),
  mkStudent("S003", "Chloe Abena", "C6A", "👧🏾"),
  mkStudent("S004", "Lucas Mbarga", "C6A", "👦🏾"),
  mkStudent("S005", "Sarah Eyenga", "C6A", "👧🏾"),
  mkStudent("S006", "James Asong", "C6A", "👦🏾"),
  mkStudent("S007", "Grace Foka", "C6A", "👧🏾"),
  mkStudent("S008", "Kevin Ondo", "C6A", "👦🏾"),
  mkStudent("S101", "Aïcha Bello", "C3B", "👧🏾"),
  mkStudent("S102", "Eric Kamga", "C3B", "👦🏾"),
  mkStudent("S103", "Linda Tabi", "C3B", "👧🏾"),
  mkStudent("S201", "Yannick Owona", "CCM2", "👦🏾"),
  mkStudent("S202", "Fatou Diop", "CCM2", "👧🏾"),
];

export const ALL_PEOPLE: Person[] = [...STUDENTS, ...TEACHERS];

const today = () => new Date();
const day = today().getDay();

export const TIMETABLE: TimetableSlot[] = [
  { id: "TT1", classId: "C6A", teacherId: "T001", subject: "Mathematics", start: "08:00", end: "08:50", day },
  { id: "TT2", classId: "C6A", teacherId: "T001", subject: "English", start: "09:00", end: "09:50", day },
  { id: "TT3", classId: "C3B", teacherId: "T002", subject: "Science", start: "10:00", end: "10:50", day },
  { id: "TT4", classId: "CCM2", teacherId: "T003", subject: "Français", start: "11:00", end: "11:50", day },
];

// ---------------------- STORAGE ----------------------
const GATE_KEY = "eduvest_gate_v2";
const CLASS_KEY = "eduvest_class_v2";
const SEED_KEY = "eduvest_seed_v2";

function readGate(): GateRecord[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(GATE_KEY) || "[]"); } catch { return []; }
}
function writeGate(r: GateRecord[]) {
  localStorage.setItem(GATE_KEY, JSON.stringify(r));
  window.dispatchEvent(new Event("eduvest-changed"));
}
function readClass(): ClassRecord[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(CLASS_KEY) || "[]"); } catch { return []; }
}
function writeClass(r: ClassRecord[]) {
  localStorage.setItem(CLASS_KEY, JSON.stringify(r));
  window.dispatchEvent(new Event("eduvest-changed"));
}

function seed() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(SEED_KEY)) return;
  const now = today();
  const at = (h: number, m: number) => { const d = new Date(now); d.setHours(h, m, 0, 0); return d.toISOString(); };
  const gate: GateRecord[] = [
    { id: crypto.randomUUID(), personId: "S001", time: at(7, 42), status: "present", gate: "Gate 1", synced: true },
    { id: crypto.randomUUID(), personId: "S002", time: at(7, 39), status: "present", gate: "Gate 1", synced: true },
    { id: crypto.randomUUID(), personId: "S003", time: at(7, 37), status: "present", gate: "Gate 1", synced: true },
    { id: crypto.randomUUID(), personId: "T001", time: at(7, 30), status: "present", gate: "Gate 1", synced: true },
    { id: crypto.randomUUID(), personId: "S005", time: at(8, 15), status: "late", gate: "Gate 1", synced: true },
  ];
  writeGate(gate);
  localStorage.setItem(SEED_KEY, "1");
}

// ---------------------- API ----------------------
export function getPerson(id: string) { return ALL_PEOPLE.find(p => p.id === id); }
export function getClass(id: string) { return CLASSES.find(c => c.id === id); }
export function studentsOfClass(classId: string) { return STUDENTS.filter(s => s.classId === classId); }
export function timetableForTeacher(teacherId: string) {
  return TIMETABLE.filter(t => t.teacherId === teacherId);
}

export function getGateRecords(): GateRecord[] {
  seed();
  return readGate().sort((a, b) => b.time.localeCompare(a.time));
}

export type ScanResult =
  | { ok: true; record: GateRecord; person: Person }
  | { ok: false; reason: "invalid" | "duplicate" };

export function scanGate(token: string, gate = "Gate 1"): ScanResult {
  const person = getPerson(token);
  if (!person) return { ok: false, reason: "invalid" };
  const all = readGate();
  const todayStr = new Date().toDateString();
  if (all.some(r => r.personId === token && new Date(r.time).toDateString() === todayStr)) {
    return { ok: false, reason: "duplicate" };
  }
  const now = new Date();
  const cutoff = new Date(now); cutoff.setHours(8, 0, 0, 0);
  const status: GateStatus = now > cutoff && person.kind === "student" ? "late" : "present";
  const rec: GateRecord = {
    id: crypto.randomUUID(), personId: token, time: now.toISOString(),
    status, gate, synced: typeof navigator !== "undefined" ? navigator.onLine : true,
  };
  writeGate([rec, ...all]);
  return { ok: true, record: rec, person };
}

export function getClassRecord(classId: string, slotId: string, date: string): ClassRecord | undefined {
  return readClass().find(r => r.classId === classId && r.slotId === slotId && r.date === date);
}

export function saveClassAttendance(rec: Omit<ClassRecord, "id" | "savedAt" | "status">): ClassRecord {
  const all = readClass();
  const existing = all.find(r => r.classId === rec.classId && r.slotId === rec.slotId && r.date === rec.date);
  const saved: ClassRecord = {
    id: existing?.id ?? crypto.randomUUID(),
    ...rec, status: "completed", savedAt: new Date().toISOString(),
  };
  const next = existing ? all.map(r => r.id === existing.id ? saved : r) : [saved, ...all];
  writeClass(next);
  return saved;
}

export function todayStats() {
  const records = getGateRecords();
  const t = records.filter(r => new Date(r.time).toDateString() === new Date().toDateString());
  const presentIds = new Set(t.filter(r => r.status !== "no_entry").map(r => r.personId));
  const studentTotal = STUDENTS.length;
  const presentStudents = STUDENTS.filter(s => presentIds.has(s.id)).length;
  return {
    present: presentStudents,
    absent: Math.max(0, studentTotal - presentStudents),
    late: t.filter(r => r.status === "late").length,
    excused: 0,
  };
}

export function rollCallStatus(date = new Date().toISOString().slice(0, 10)) {
  const records = readClass();
  return TIMETABLE.map(slot => {
    const r = records.find(x => x.classId === slot.classId && x.slotId === slot.id && x.date === date);
    return { slot, completed: !!r, record: r };
  });
}
