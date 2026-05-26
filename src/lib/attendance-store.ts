// Lightweight in-memory + localStorage attendance store (MVP placeholder)
export type AttendanceRole = "student" | "teacher";
export type AttendanceStatus = "present" | "late" | "absent";

export interface AttendanceRecord {
  id: string;
  token: string;
  name: string;
  role: AttendanceRole;
  classOrDept: string;
  photo?: string;
  time: string; // ISO
  status: AttendanceStatus;
  method: "qr" | "nfc" | "rfid";
  synced: boolean;
}

// Fake roster keyed by secure token. NO PII on the card itself — backend resolves.
export const ROSTER: Record<string, Omit<AttendanceRecord, "id" | "time" | "status" | "method" | "synced" | "token">> = {
  EVT_STU_001: { name: "Amaka Obi", role: "student", classOrDept: "JSS 2A", photo: "👧" },
  EVT_STU_002: { name: "Chinedu Okafor", role: "student", classOrDept: "SSS 1B", photo: "👦" },
  EVT_STU_003: { name: "Fatima Bello", role: "student", classOrDept: "JSS 3C", photo: "👧" },
  EVT_STU_004: { name: "Tunde Adewale", role: "student", classOrDept: "SSS 2A", photo: "👦" },
  EVT_TCH_001: { name: "Mrs. Adaeze Nwosu", role: "teacher", classOrDept: "Mathematics", photo: "👩‍🏫" },
  EVT_TCH_002: { name: "Mr. Samuel Eze", role: "teacher", classOrDept: "Physics", photo: "👨‍🏫" },
};

const KEY = "eduvest_attendance_v1";
const SEED_KEY = "eduvest_attendance_seeded_v1";

function read(): AttendanceRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function write(records: AttendanceRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(records));
  window.dispatchEvent(new CustomEvent("attendance-changed"));
}

function seedIfEmpty() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(SEED_KEY)) return;
  const today = new Date();
  const mk = (h: number, m: number, token: string, status: AttendanceStatus): AttendanceRecord => {
    const d = new Date(today); d.setHours(h, m, 0, 0);
    return {
      id: crypto.randomUUID(), token, ...ROSTER[token],
      time: d.toISOString(), status, method: "qr", synced: true,
    };
  };
  write([
    mk(7, 42, "EVT_STU_001", "present"),
    mk(7, 55, "EVT_TCH_001", "present"),
    mk(8, 5, "EVT_STU_002", "present"),
    mk(8, 22, "EVT_STU_003", "late"),
  ]);
  localStorage.setItem(SEED_KEY, "1");
}

export function getAttendance(): AttendanceRecord[] {
  seedIfEmpty();
  return read().sort((a, b) => b.time.localeCompare(a.time));
}

export type ScanResult =
  | { ok: true; record: AttendanceRecord }
  | { ok: false; reason: "invalid" | "duplicate" | "inactive" };

export function recordScan(token: string, method: "qr" | "nfc" | "rfid"): ScanResult {
  const profile = ROSTER[token];
  if (!profile) return { ok: false, reason: "invalid" };
  const all = read();
  const today = new Date().toDateString();
  const dupe = all.find(r => r.token === token && new Date(r.time).toDateString() === today);
  if (dupe) return { ok: false, reason: "duplicate" };

  const now = new Date();
  const lateThreshold = new Date(now); lateThreshold.setHours(8, 0, 0, 0);
  const status: AttendanceStatus = now > lateThreshold && profile.role === "student" ? "late" : "present";
  const online = typeof navigator !== "undefined" ? navigator.onLine : true;

  const rec: AttendanceRecord = {
    id: crypto.randomUUID(), token, ...profile,
    time: now.toISOString(), status, method, synced: online,
  };
  write([rec, ...all]);
  return { ok: true, record: rec };
}

export function syncPending() {
  const all = read();
  write(all.map(r => ({ ...r, synced: true })));
}

export function todayStats() {
  const records = getAttendance();
  const today = new Date().toDateString();
  const t = records.filter(r => new Date(r.time).toDateString() === today);
  return {
    total: t.length,
    studentsPresent: t.filter(r => r.role === "student" && r.status !== "absent").length,
    teachersPresent: t.filter(r => r.role === "teacher" && r.status !== "absent").length,
    late: t.filter(r => r.status === "late").length,
    pendingSync: records.filter(r => !r.synced).length,
  };
}
