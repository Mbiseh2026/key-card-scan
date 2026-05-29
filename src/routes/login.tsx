import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({ component: LoginPage });

const ROLES = [
  { id: "teacher", label: "Teacher" },
  { id: "gate", label: "Gate Officer" },
  { id: "supervisor", label: "Supervisor" },
  { id: "admin", label: "School Admin" },
] as const;

function LoginPage() {
  const nav = useNavigate();
  const [role, setRole] = useState<string>("teacher");
  const [email, setEmail] = useState("teacher@eduvest.app");
  const [password, setPassword] = useState("demo");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("eduvest_auth", "1");
    localStorage.setItem("eduvest_role", role);
    localStorage.setItem("eduvest_user", email);
    localStorage.setItem("eduvest_teacherId", "T001");
    nav({ to: "/home" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="px-6 pt-16 pb-12 text-primary-foreground bg-navy">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-white/15 grid place-items-center">
            <GraduationCap className="size-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest opacity-80">EduVest</p>
            <h1 className="text-2xl font-bold">Attendance</h1>
          </div>
        </div>
        <p className="mt-6 text-sm opacity-90">Sign in with your school-issued account.</p>
      </div>

      <form onSubmit={submit} className="px-6 -mt-6 pb-10 flex-1">
        <div className="rounded-2xl bg-card border border-border shadow-card p-5 space-y-4">
          <div className="space-y-2">
            <Label>Role</Label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(r => (
                <button type="button" key={r.id} onClick={() => setRole(r.id)}
                  className={`text-xs font-semibold rounded-xl px-2 py-3 border ${
                    role === r.id ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground"
                  }`}>{r.label}</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full h-12 text-base font-semibold">Sign in</Button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" />
            Authorized users only. Synced with EduVest Dashboard.
          </div>
        </div>
      </form>
    </div>
  );
}
