import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, User, Bell, Globe, ShieldCheck, LogOut, CloudUpload, MessageSquare, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_app/more")({ component: MorePage });

function MorePage() {
  const nav = useNavigate();
  const role = typeof window !== "undefined" ? localStorage.getItem("eduvest_role") : "teacher";
  const email = typeof window !== "undefined" ? localStorage.getItem("eduvest_user") : "";

  const logout = () => {
    localStorage.removeItem("eduvest_auth");
    nav({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="px-5 pt-12 pb-5 bg-card border-b border-border flex items-center justify-between">
        <Link to="/home" className="size-10 grid place-items-center"><ArrowLeft className="size-5" /></Link>
        <h1 className="font-bold">More</h1>
        <span className="size-10" />
      </header>

      <div className="px-5 pt-5">
        <div className="rounded-2xl bg-navy text-primary-foreground p-5 flex items-center gap-4">
          <div className="size-14 rounded-full bg-white/15 grid place-items-center">
            <User className="size-7" />
          </div>
          <div>
            <p className="font-bold">{email || "Teacher"}</p>
            <p className="text-xs opacity-80 capitalize">{role}</p>
            <p className="text-xs opacity-80 mt-0.5">EduVest School · Workspace EN</p>
          </div>
        </div>

        <Section title="Notifications">
          <Row icon={Bell} title="Parent alerts" sub="No Gate Entry · Classroom Absence" />
          <Row icon={MessageSquare} title="WhatsApp delivery" sub="Placeholder · activates when configured" />
        </Section>

        <Section title="Sync & Workspace">
          <Row icon={CloudUpload} title="Sync now" sub="All records up to date" />
          <Row icon={Globe} title="Language & Workspace" sub="English · French" />
        </Section>

        <Section title="Security">
          <Row icon={ShieldCheck} title="Device validation" sub="This device is authorized" tone="primary" />
        </Section>

        <button onClick={logout} className="mt-6 w-full h-12 rounded-2xl border-2 border-destructive text-destructive font-bold flex items-center justify-center gap-2">
          <LogOut className="size-5" /> Sign out
        </button>

        <p className="text-center text-[11px] text-muted-foreground mt-6">EduVest Attendance · v1.0 MVP</p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{title}</h2>
      <div className="rounded-2xl bg-card border border-border divide-y divide-border">{children}</div>
    </div>
  );
}
function Row({ icon: Icon, title, sub, tone }: any) {
  return (
    <div className="p-4 flex items-center gap-3">
      <div className={`size-9 rounded-xl grid place-items-center ${tone === "primary" ? "bg-primary/15 text-primary" : "bg-accent text-navy"}`}>
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-[11px] text-muted-foreground">{sub}</p>
      </div>
      <ChevronRight className="size-4 text-muted-foreground" />
    </div>
  );
}
