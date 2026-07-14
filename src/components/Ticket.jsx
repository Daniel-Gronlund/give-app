import { CheckCircle2, Circle } from "lucide-react";

export function StatusTimeline({ status }) {
  const steps = [
    { key: "pending", label: "Bokad" },
    { key: "handedOver", label: "Överlämnad" },
    { key: "active", label: "Pågår" },
    { key: "returned", label: "Återlämnad" },
  ];
  const order = steps.findIndex((s) => s.key === status);
  return (
    <div className="flex items-center w-full">
      {steps.map((s, i) => (
        <div key={s.key} className="contents">
          <div className="flex flex-col items-center gap-1" style={{ minWidth: 64 }}>
            {i <= order ? <CheckCircle2 size={20} className="text-pine" /> : <Circle size={20} className="text-line" />}
            <span className={`text-[11px] text-center ${i <= order ? "text-ink" : "text-inkSoft"}`}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 -mt-4 ${i < order ? "bg-pine" : "bg-line"}`} style={{ height: 2 }} />
          )}
        </div>
      ))}
    </div>
  );
}

export function Perforation() {
  return (
    <div
      className="w-full h-4 my-1"
      style={{
        backgroundImage: "radial-gradient(circle, #F5F1E7 3px, transparent 3.5px)",
        backgroundSize: "16px 16px",
        backgroundPosition: "center",
      }}
    />
  );
}

export function Stamp({ label = "BEKRÄFTAD" }) {
  return (
    <div className="absolute -rotate-12 border-4 rounded-lg px-3 py-1 text-xs font-black tracking-widest select-none border-terracotta text-terracotta font-mono">
      {label}
    </div>
  );
}
