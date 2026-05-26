import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Home, ScanLine, History, Sparkles, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/scan", label: "Scan", icon: ScanLine, primary: true },
  { to: "/history", label: "History", icon: History },
  { to: "/ai", label: "AI", icon: Sparkles },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell() {
  const { location } = useRouterState();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pb-24 max-w-md mx-auto w-full">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur-lg">
        <div className="max-w-md mx-auto grid grid-cols-5 px-2 py-2 safe-bottom">
          {tabs.map(({ to, label, icon: Icon, primary }) => {
            const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
            if (primary) {
              return (
                <Link key={to} to={to} className="flex flex-col items-center justify-center -mt-6">
                  <span className="size-14 rounded-2xl grid place-items-center text-primary-foreground shadow-elevated"
                    style={{ background: "var(--gradient-primary)" }}>
                    <Icon className="size-7" />
                  </span>
                  <span className="text-[10px] mt-1 font-semibold text-foreground">{label}</span>
                </Link>
              );
            }
            return (
              <Link key={to} to={to} className={cn(
                "flex flex-col items-center justify-center gap-1 py-1 text-xs transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}>
                <Icon className="size-5" />
                <span className="font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
