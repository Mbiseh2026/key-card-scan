import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, School, Smartphone, CloudUpload, Globe, Lock, LogOut, Bell, ShieldCheck, ChevronRight } from "lucide-react";
import { syncPending, todayStats } from "@/lib/attendance-store";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const nav = useNavigate();
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const refresh = () => { setOnline(navigator.onLine); setPending(todayStats().pendingSync); };
    refresh();
    window.addEventListener("online", refresh);
    window.addEventListener("offline", refresh);
    window.addEventListener("attendance-changed", refresh);
    return () => {
      window.removeEventListener("online", refresh);
      window.removeEventListener("offline", refresh);
      window.removeEventListener("attendance-changed", refresh);
    };
  }, []);

  const school = typeof window !== "undefined" ? localStorage.getItem("eduvest_school") ?? "EDV-001" : "";
  const user = typeof window !== "undefined" ? localStorage.getItem("eduvest_user") ?? "" : "";
  const role = typeof window !== "undefined" ? localStorage.getItem("eduvest_role") ?? "gate" : "gate";

  const logout = () => {
    localStorage.removeItem("eduvest_auth");
    nav({ to: "/login" });
  };

  return (
    <div>
      <div className="px-5 pt-12 pb-6 text-primary-foreground rounded-b-3xl" style={{ background: "var(--gradient-navy)" }}>
        <div className="flex items-center justify-between">
          <Link to="/home" className="size-10 rounded-full bg-white/10 grid place-items-center">
            <ArrowLeft className="size-5" />
          </Link>
          <p className="font-semibold">Settings</p>
          <span className="size-10" />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="size-14 rounded-2xl bg-white/15 grid place-items-center text-2xl font-bold">
            {user.charAt(0).toUpperCase() || "E"}
          </div>
          <div className="min-w-0">
            <p className="font-bold truncate">{user || "EduVest user"}</p>
            <p className="text-xs opacity-80 capitalize">{role} · School {school}</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-3">
        <Section title="Status">
          <Row icon={School} label="School profile" value={school} />
          <Row icon={Smartphone} label="Device status" value={<Badge tone="primary">Authorized</Badge>} />
          <Row icon={CloudUpload} label="Sync status"
            value={
              <div className="flex items-center gap-2">
                <Badge tone={online ? "primary" : "warning"}>{online ? "Online" : "Offline"}</Badge>
                {pending > 0 && (
                  <button onClick={syncPending} className="text-xs font-semibold text-primary">
                    Sync {pending}
                  </button>
                )}
              </div>
            } />
        </Section>

        <Section title="Preferences">
          <Row icon={Globe} label="Language" value="English" />
          <Row icon={Bell} label="Notifications" value={<ChevronRight className="size-4 text-muted-foreground" />} />
          <Row icon={Lock} label="Permissions" value={<span className="text-xs text-muted-foreground">Placeholder</span>} />
        </Section>

        <Section title="Security">
          <Row icon={ShieldCheck} label="Device validation" value={<Badge tone="primary">Active</Badge>} />
          <Row icon={Lock} label="Scan token validation" value={<Badge tone="primary">Enabled</Badge>} />
        </Section>

        <button onClick={logout} className="w-full mt-2 rounded-2xl bg-destructive/10 text-destructive font-semibold py-3.5 flex items-center justify-center gap-2">
          <LogOut className="size-4" /> Sign out
        </button>

        <p className="text-center text-[11px] text-muted-foreground pt-3">EduVest Attendance · v1.0.0 (MVP)</p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1 mb-2">{title}</p>
      <div className="rounded-2xl bg-card border border-border divide-y divide-border overflow-hidden">{children}</div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="size-9 rounded-xl bg-accent grid place-items-center text-navy">
        <Icon className="size-4.5" />
      </div>
      <p className="text-sm font-medium flex-1">{label}</p>
      <div className="text-sm text-muted-foreground">{value}</div>
    </div>
  );
}

function Badge({ tone, children }: { tone: "primary" | "warning"; children: React.ReactNode }) {
  const cls = tone === "primary" ? "bg-primary/15 text-primary" : "bg-warning/20 text-warning-foreground";
  return <span className={`text-[11px] font-bold uppercase px-2 py-1 rounded-md ${cls}`}>{children}</span>;
}
