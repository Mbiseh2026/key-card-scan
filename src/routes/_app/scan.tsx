import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ScanLine, Nfc, Radio, CheckCircle2, XCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROSTER, recordScan, type ScanResult } from "@/lib/attendance-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/scan")({
  component: ScanPage,
});

type Mode = "qr" | "nfc" | "rfid";

function ScanPage() {
  const [mode, setMode] = useState<Mode>("qr");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!result) return;
    const t = setTimeout(() => setResult(null), 4500);
    return () => clearTimeout(t);
  }, [result]);

  const simulateScan = () => {
    setScanning(true);
    setResult(null);
    const tokens = Object.keys(ROSTER);
    const random = Math.random() < 0.1 ? "INVALID_TOKEN" : tokens[Math.floor(Math.random() * tokens.length)];
    setTimeout(() => {
      const r = recordScan(random, mode);
      setResult(r);
      setScanning(false);
    }, 700);
  };

  return (
    <div className="min-h-screen">
      <div className="px-5 pt-12 pb-6 text-primary-foreground" style={{ background: "var(--gradient-navy)" }}>
        <div className="flex items-center justify-between">
          <Link to="/home" className="size-10 rounded-full bg-white/10 grid place-items-center">
            <ArrowLeft className="size-5" />
          </Link>
          <p className="text-sm font-semibold">Gate Attendance</p>
          <span className="size-10" />
        </div>

        <div className="mt-5 rounded-2xl bg-white/10 backdrop-blur p-1.5 grid grid-cols-3 gap-1">
          <TabBtn active={mode === "qr"} onClick={() => setMode("qr")} icon={ScanLine} label="QR" />
          <TabBtn active={mode === "nfc"} onClick={() => setMode("nfc")} icon={Nfc} label="NFC" />
          <TabBtn active={mode === "rfid"} onClick={() => setMode("rfid")} icon={Radio} label="RFID" />
        </div>
      </div>

      <div className="px-5 py-6">
        {mode === "qr" && <QrViewfinder scanning={scanning} />}
        {mode === "nfc" && <PlaceholderMode icon={Nfc} title="Hold card to phone" sub="Activate NFC and tap the student or teacher ID card on the back of the device." />}
        {mode === "rfid" && <PlaceholderMode icon={Radio} title="RFID reader ready" sub="Connect a USB or dedicated RFID reader to scan tags. Falls back to manual entry." />}

        <Button onClick={simulateScan} disabled={scanning} className="w-full h-14 text-base font-semibold mt-6">
          <Zap className="mr-2" />
          {scanning ? "Scanning…" : `Simulate ${mode.toUpperCase()} Scan`}
        </Button>

        <p className="text-[11px] text-muted-foreground text-center mt-3 px-4">
          Cards contain only a secure token (e.g. EVT_STU_001). No personal data is stored on the card.
        </p>

        {result && <ResultCard result={result} />}
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon: Icon, label }: any) {
  return (
    <button onClick={onClick} className={cn(
      "rounded-xl py-2.5 flex items-center justify-center gap-2 text-sm font-semibold transition",
      active ? "bg-primary text-primary-foreground shadow-elevated" : "text-white/80"
    )}>
      <Icon className="size-4" />{label}
    </button>
  );
}

function QrViewfinder({ scanning }: { scanning: boolean }) {
  return (
    <div className="aspect-square rounded-3xl bg-navy/95 relative overflow-hidden grid place-items-center">
      <div className="absolute inset-6 rounded-2xl border-2 border-dashed border-white/20" />
      {(["tl", "tr", "bl", "br"] as const).map(c => (
        <span key={c} className={cn(
          "absolute size-10 border-primary",
          c === "tl" && "top-4 left-4 border-t-4 border-l-4 rounded-tl-2xl",
          c === "tr" && "top-4 right-4 border-t-4 border-r-4 rounded-tr-2xl",
          c === "bl" && "bottom-4 left-4 border-b-4 border-l-4 rounded-bl-2xl",
          c === "br" && "bottom-4 right-4 border-b-4 border-r-4 rounded-br-2xl",
        )} />
      ))}
      {scanning && (
        <div className="absolute left-6 right-6 h-1 bg-primary shadow-[0_0_24px_var(--primary)] animate-pulse"
          style={{ top: "50%" }} />
      )}
      <div className="relative text-white/70 text-xs uppercase tracking-widest">
        {scanning ? "Reading…" : "Align QR within frame"}
      </div>
    </div>
  );
}

function PlaceholderMode({ icon: Icon, title, sub }: { icon: any; title: string; sub: string }) {
  return (
    <div className="aspect-square rounded-3xl bg-card border border-border grid place-items-center text-center px-8">
      <div>
        <div className="size-20 mx-auto rounded-full bg-accent grid place-items-center text-navy">
          <Icon className="size-10" />
        </div>
        <p className="mt-4 font-bold text-lg">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{sub}</p>
      </div>
    </div>
  );
}

function ResultCard({ result }: { result: ScanResult }) {
  if (!result.ok) {
    const labels = { invalid: "Invalid card", duplicate: "Already scanned today", inactive: "Inactive card" };
    return (
      <div className="mt-5 rounded-2xl border-2 border-destructive bg-destructive/5 p-4 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
        <div className="size-12 rounded-full bg-destructive grid place-items-center text-destructive-foreground">
          <XCircle className="size-6" />
        </div>
        <div>
          <p className="font-bold text-destructive">{labels[result.reason]}</p>
          <p className="text-xs text-muted-foreground">Ask the holder to verify their card.</p>
        </div>
      </div>
    );
  }
  const r = result.record;
  const time = new Date(r.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="mt-5 rounded-2xl border-2 border-primary bg-primary/5 p-4 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 shadow-elevated">
      <div className="size-14 rounded-2xl bg-primary grid place-items-center text-3xl">
        {r.photo}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-bold text-base">{r.name}</p>
          <CheckCircle2 className="size-4 text-primary" />
        </div>
        <p className="text-xs text-muted-foreground">{r.classOrDept} · {r.role}</p>
        <p className="text-xs mt-1">
          <span className={cn("font-semibold", r.status === "late" ? "text-warning-foreground" : "text-primary")}>
            {r.status === "late" ? "Late arrival" : "On time"}
          </span> · {time}
        </p>
      </div>
    </div>
  );
}
