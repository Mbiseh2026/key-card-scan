import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Settings, Zap, CheckCircle2, XCircle, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALL_PEOPLE, scanGate, type ScanResult } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/gate")({ component: GatePage });

type Mode = "qr" | "nfc" | "rfid";

function GatePage() {
  const [mode, setMode] = useState<Mode>("qr");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    if (!result?.ok) return;
    const t = setTimeout(() => {
      nav({ to: "/gate/success", search: { id: result.record.id } });
    }, 600);
    return () => clearTimeout(t);
  }, [result, nav]);

  const simulate = () => {
    if (mode !== "qr") return;
    setScanning(true); setResult(null);
    setTimeout(() => {
      const tokens = ALL_PEOPLE.map(p => p.id);
      const token = Math.random() < 0.08 ? "INVALID" : tokens[Math.floor(Math.random() * tokens.length)];
      setResult(scanGate(token));
      setScanning(false);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="px-5 pt-12 pb-5 bg-card border-b border-border flex items-center justify-between">
        <Link to="/home" className="size-10 grid place-items-center"><ArrowLeft className="size-5" /></Link>
        <h1 className="font-bold">Gate Mode</h1>
        <button className="size-10 grid place-items-center text-muted-foreground"><Settings className="size-5" /></button>
      </header>

      <div className="px-5 pt-4">
        <div className="rounded-2xl bg-muted p-1 grid grid-cols-3 gap-1">
          <Tab active={mode === "qr"} onClick={() => setMode("qr")} label="QR Code" />
          <Tab disabled label="NFC Card" onClick={() => setMode("nfc")} active={mode === "nfc"} />
          <Tab disabled label="RFID" onClick={() => setMode("rfid")} active={mode === "rfid"} />
        </div>

        {mode === "qr" ? <Viewfinder scanning={scanning} /> : <DisabledPanel label={mode.toUpperCase()} />}

        {mode === "qr" && (
          <>
            <Button onClick={simulate} disabled={scanning} className="w-full h-14 mt-5 text-base font-semibold rounded-2xl">
              <Zap className="mr-2" />
              {scanning ? "Scanning…" : "Simulate Scan"}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center mt-2">
              Cards carry only a secure ID token. No personal data on the card.
            </p>
          </>
        )}

        {result && !result.ok && (
          <div className="mt-4 rounded-2xl border-2 border-destructive bg-destructive/5 p-4 flex items-center gap-3 animate-in fade-in">
            <div className="size-12 rounded-full bg-destructive grid place-items-center text-destructive-foreground">
              <XCircle className="size-6" />
            </div>
            <div>
              <p className="font-bold text-destructive">
                {result.reason === "duplicate" ? "Already scanned today" : "Invalid card"}
              </p>
              <p className="text-xs text-muted-foreground">Try again or call a supervisor.</p>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-24 inset-x-0 max-w-md mx-auto px-5">
        <div className="rounded-full bg-card border border-border px-4 py-2 flex items-center justify-between text-xs">
          <span className="font-semibold">📍 Gate 1</span>
          <span className="flex items-center gap-1 text-primary"><Wifi className="size-3" /> Online</span>
        </div>
      </div>
    </div>
  );
}

function Tab({ active, disabled, onClick, label }: any) {
  return (
    <button onClick={disabled ? undefined : onClick}
      className={cn(
        "rounded-xl py-2.5 text-xs font-semibold relative",
        active && !disabled && "bg-primary text-primary-foreground shadow-card",
        !active && !disabled && "text-foreground",
        disabled && "text-muted-foreground/60",
      )}>
      {label}
      {disabled && <span className="block text-[8px] font-medium opacity-70 mt-0.5">Coming soon</span>}
    </button>
  );
}

function Viewfinder({ scanning }: { scanning: boolean }) {
  return (
    <>
      <div className="mt-5 aspect-square rounded-3xl bg-card border border-border relative overflow-hidden grid place-items-center">
        {(["tl", "tr", "bl", "br"] as const).map(c => (
          <span key={c} className={cn(
            "absolute size-12 border-primary",
            c === "tl" && "top-4 left-4 border-t-4 border-l-4 rounded-tl-xl",
            c === "tr" && "top-4 right-4 border-t-4 border-r-4 rounded-tr-xl",
            c === "bl" && "bottom-4 left-4 border-b-4 border-l-4 rounded-bl-xl",
            c === "br" && "bottom-4 right-4 border-b-4 border-r-4 rounded-br-xl",
          )} />
        ))}
        <div className="size-44 rounded-xl bg-[repeating-conic-gradient(#1e3a8a_0_25%,transparent_0_50%)] [background-size:14px_14px] opacity-90" />
        {scanning && <div className="absolute left-8 right-8 top-1/2 h-1 bg-primary shadow-[0_0_24px_var(--primary)] animate-pulse" />}
        {!scanning && <CheckCircle2 className="absolute top-1/2 -translate-y-1/2 size-0 opacity-0" />}
      </div>
      <p className="text-center mt-4 font-bold">Scan student card QR code</p>
      <p className="text-center text-xs text-muted-foreground mt-1">Position the QR code within the frame</p>
    </>
  );
}

function DisabledPanel({ label }: { label: string }) {
  return (
    <div className="mt-5 aspect-square rounded-3xl bg-card border border-border grid place-items-center text-center px-10">
      <div>
        <div className="size-20 mx-auto rounded-full bg-accent grid place-items-center text-navy text-3xl font-bold">{label[0]}</div>
        <p className="mt-4 font-bold">{label} not available</p>
        <p className="text-xs text-muted-foreground mt-1">This option will be activated in a future update.</p>
      </div>
    </div>
  );
}
