import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, TrendingUp, Clock, BarChart3, MessageSquare, Lock } from "lucide-react";

export const Route = createFileRoute("/_app/ai")({
  component: AiPage,
});

function AiPage() {
  return (
    <div>
      <div className="px-5 pt-12 pb-8 text-primary-foreground rounded-b-3xl" style={{ background: "var(--gradient-hero)" }}>
        <div className="flex items-center justify-between">
          <Link to="/home" className="size-10 rounded-full bg-white/10 grid place-items-center">
            <ArrowLeft className="size-5" />
          </Link>
          <p className="font-semibold">AI Assistant</p>
          <span className="size-10" />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-white/15 grid place-items-center">
            <Sparkles className="size-6" />
          </div>
          <div>
            <p className="text-lg font-bold">Skydew AI</p>
            <p className="text-xs opacity-80">Your attendance co-pilot</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Today's insights</h2>
        <InsightCard icon={TrendingUp} title="Attendance summary"
          body="86% present so far. Strong morning arrivals between 7:30–7:55 AM." />
        <InsightCard icon={Clock} title="Late arrival patterns"
          body="3 late arrivals concentrated in JSS 3C. Slight uptick on Mondays." />
        <InsightCard icon={BarChart3} title="Weekly trends"
          body="Average week-on-week presence up 4%. Teacher punctuality stable." />
        <InsightCard icon={MessageSquare} title="Ask the assistant"
          body="Try: ‘Show students with 3+ late marks this week.’" cta="Open chat" />
      </div>

      <div className="px-5 mt-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Coming soon</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            "Attendance prediction",
            "Absentee trends",
            "Classroom analysis",
            "Teacher intelligence",
          ].map(t => (
            <div key={t} className="rounded-2xl bg-card border border-dashed border-border p-4">
              <Lock className="size-5 text-muted-foreground" />
              <p className="text-sm font-semibold mt-2">{t}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Coming soon</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InsightCard({ icon: Icon, title, body, cta }: { icon: any; title: string; body: string; cta?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
          <Icon className="size-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{body}</p>
          {cta && <button className="text-xs font-semibold text-primary mt-2">{cta} →</button>}
        </div>
      </div>
    </div>
  );
}
