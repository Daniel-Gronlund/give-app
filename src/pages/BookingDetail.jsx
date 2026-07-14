import { useEffect, useState } from "react";
import { CheckCircle2, ChevronRight, Fingerprint, QrCode, ShieldCheck } from "lucide-react";
import { StatusTimeline, Perforation, Stamp } from "../components/Ticket";
import PseudoQR from "../components/PseudoQR";
import { fetchBooking, updateBooking } from "../lib/bookings";
import { formatSv } from "../lib/dates";

export default function BookingDetail({ bookingId, onBack }) {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [methodChoice, setMethodChoice] = useState(null);
  const [bankIdStage, setBankIdStage] = useState(null);

  async function reload() {
    try {
      const b = await fetchBooking(bookingId);
      setBooking(b);
    } catch (err) {
      setError("Kunde inte läsa bokningen: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, [bookingId]);

  async function confirmHandover(method) {
    if (method === "bankid") {
      setBankIdStage("waiting");
      await new Promise((r) => setTimeout(r, 1400));
    }
    await updateBooking(bookingId, {
      status: "handedOver",
      handoverAt: new Date().toLocaleString("sv-SE"),
      handoverMethod: method,
    });
    setBankIdStage(null);
    setMethodChoice(null);
    reload();
  }

  async function startLoan() {
    await updateBooking(bookingId, { status: "active" });
    reload();
  }

  async function confirmReturn(method) {
    if (method === "bankid") {
      setBankIdStage("waiting");
      await new Promise((r) => setTimeout(r, 1400));
    }
    await updateBooking(bookingId, {
      status: "returned",
      returnAt: new Date().toLocaleString("sv-SE"),
    });
    setBankIdStage(null);
    setMethodChoice(null);
    reload();
  }

  if (loading) return <div className="max-w-xl mx-auto px-5 py-8 text-sm text-inkSoft">Laddar…</div>;
  if (error) return <div className="max-w-xl mx-auto px-5 py-8 text-sm text-terracotta">{error}</div>;
  if (!booking) return <div className="max-w-xl mx-auto px-5 py-8 text-sm text-inkSoft">Bokningen hittades inte.</div>;

  return (
    <div className="max-w-xl mx-auto px-5 py-8">
      <button onClick={onBack} className="text-sm text-inkSoft mb-6">← Tillbaka</button>

      <div className="mb-7">
        <StatusTimeline status={booking.status} />
      </div>

      <div className="rounded-2xl overflow-hidden mb-6 border border-line bg-white">
        <div className="p-5 flex items-center gap-3">
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate text-ink">{booking.itemTitle}</div>
            <div className="text-xs text-inkSoft">{booking.ownerName} → {booking.borrowerName}</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-[10px] uppercase tracking-wider text-inkSoft">Bokning</div>
            <div className="font-mono text-sm font-semibold text-ink">#{booking.code}</div>
          </div>
        </div>

        <div className="px-5 pb-1">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-wider mb-1 text-inkSoft">Hämtas</div>
              <div className="text-sm font-semibold font-mono text-ink">{formatSv(new Date(booking.rawStart))}</div>
            </div>
            <ChevronRight size={16} className="text-inkSoft mt-4 flex-shrink-0" />
            <div className="flex-1 text-right">
              <div className="text-[10px] uppercase tracking-wider mb-1 text-inkSoft">Tillbaka senast</div>
              <div className="text-sm font-semibold font-mono text-ink">{formatSv(new Date(booking.rawEnd))}</div>
            </div>
          </div>
        </div>

        <div className="px-5"><Perforation /></div>

        <div className="p-5 pt-2 relative">
          {booking.status === "pending" && (
            <HandoverPanel
              title="Bekräfta överlämning"
              subtitle="När ni möts, bekräfta att objektet lämnats över."
              code={`handover-${booking.id}`}
              methodChoice={methodChoice}
              setMethodChoice={setMethodChoice}
              onQr={() => confirmHandover("qr")}
              onBankId={() => confirmHandover("bankid")}
              bankIdStage={bankIdStage}
            />
          )}

          {booking.status === "handedOver" && (
            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold mb-1 text-pine">
                    <CheckCircle2 size={16} /> Överlämning bekräftad
                  </div>
                  <div className="text-xs font-mono text-inkSoft">
                    {booking.handoverAt} · via {booking.handoverMethod === "bankid" ? "Mobilt BankID" : "QR-kod"}
                  </div>
                </div>
                <Stamp label="MOTTAGET" />
              </div>
              <div className="mt-5">
                <button onClick={startLoan} className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white bg-pine">
                  Starta lån
                </button>
              </div>
            </div>
          )}

          {booking.status === "active" && (
            <HandoverPanel
              title="Bekräfta återlämning"
              subtitle="När objektet lämnas tillbaka, bekräfta mottagandet."
              code={`return-${booking.id}`}
              methodChoice={methodChoice}
              setMethodChoice={setMethodChoice}
              onQr={() => confirmReturn("qr")}
              onBankId={() => confirmReturn("bankid")}
              bankIdStage={bankIdStage}
            />
          )}

          {booking.status === "returned" && (
            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold mb-1 text-pine">
                    <CheckCircle2 size={16} /> Lånet avslutat
                  </div>
                  <div className="text-xs text-inkSoft">
                    <div className="font-mono">Överlämnad: {booking.handoverAt}</div>
                    <div className="font-mono">Återlämnad: {booking.returnAt}</div>
                  </div>
                </div>
                <Stamp label="AVSLUTAD" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs px-1 text-inkSoft">
        <ShieldCheck size={14} className="flex-shrink-0 mt-0.5" />
        <p>Varje bekräftelse tidsstämplas och sparas i Firestore som ett digitalt kvitto som båda parter kan se.</p>
      </div>
    </div>
  );
}

function HandoverPanel({ title, subtitle, code, methodChoice, setMethodChoice, onQr, onBankId, bankIdStage }) {
  return (
    <div>
      <h3 className="font-semibold text-sm mb-1 text-ink">{title}</h3>
      <p className="text-xs mb-4 text-inkSoft">{subtitle}</p>

      {!methodChoice && (
        <div className="flex gap-3">
          <button onClick={() => setMethodChoice("qr")} className="flex-1 rounded-lg p-4 flex flex-col items-center gap-2 text-center border border-line">
            <QrCode size={22} className="text-pine" />
            <span className="text-xs font-medium">Visa QR-kod</span>
          </button>
          <button onClick={() => setMethodChoice("bankid")} className="flex-1 rounded-lg p-4 flex flex-col items-center gap-2 text-center border border-line">
            <Fingerprint size={22} className="text-pine" />
            <span className="text-xs font-medium">Mobilt BankID</span>
          </button>
        </div>
      )}

      {methodChoice === "qr" && (
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="p-3 rounded-lg border border-line bg-white">
            <PseudoQR seed={code} />
          </div>
          <p className="text-xs text-inkSoft">Giltig i 10 minuter · Låt motparten skanna koden i sin app</p>
          <button onClick={onQr} className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-amber text-pineDark">
            Simulera att koden skannats
          </button>
          <button onClick={() => setMethodChoice(null)} className="text-xs text-inkSoft">Välj annan metod</button>
        </div>
      )}

      {methodChoice === "bankid" && (
        <div className="flex flex-col items-center gap-4 py-4">
          {bankIdStage === "waiting" ? (
            <>
              <div className="w-12 h-12 rounded-full flex items-center justify-center animate-pulse bg-sage">
                <Fingerprint size={22} className="text-pineDark" />
              </div>
              <p className="text-sm font-medium">Väntar på signering i BankID-appen…</p>
            </>
          ) : (
            <>
              <Fingerprint size={30} className="text-pine" />
              <p className="text-xs text-center text-inkSoft">Båda parter signerar med Mobilt BankID för att skapa ett juridiskt spårbart kvitto.</p>
              <button onClick={onBankId} className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-amber text-pineDark">
                Signera med BankID
              </button>
              <button onClick={() => setMethodChoice(null)} className="text-xs text-inkSoft">Välj annan metod</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
