import { useEffect, useState } from "react";
import { Clock, ChevronRight, ShieldCheck, Loader2 } from "lucide-react";
import AvailabilityCalendar from "../components/AvailabilityCalendar";
import { Perforation } from "../components/Ticket";
import { fetchBookingsForItem, createBooking } from "../lib/bookings";
import { formatSv } from "../lib/dates";
import { useAuth } from "../contexts/AuthContext";

export default function BookingForm({ item, onBack, onBooked }) {
  const { user } = useAuth();
  const [itemBookings, setItemBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnTime, setReturnTime] = useState("10:00");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBookingsForItem(item.id)
      .then(setItemBookings)
      .finally(() => setLoadingBookings(false));
  }, [item.id]);

  function handleSelectDay(iso) {
    if (!startDate || endDate) {
      setStartDate(iso);
      setEndDate(null);
      return;
    }
    if (iso < startDate) {
      setStartDate(iso);
      setEndDate(null);
      return;
    }
    setEndDate(iso);
  }

  const valid = Boolean(startDate && endDate && pickupTime && returnTime);
  const start = valid ? new Date(`${startDate}T${pickupTime}`) : null;
  const end = valid ? new Date(`${endDate}T${returnTime}`) : null;
  const durationOk = start && end && end.getTime() > start.getTime();

  async function handleConfirm() {
    setError("");
    if (!durationOk) {
      setError("Välj giltiga datum och tider innan du skickar bokningen.");
      return;
    }
    setSaving(true);
    try {
      const id = await createBooking({
        item,
        borrowerId: user.uid,
        borrowerName: user.displayName || user.email,
        start,
        end,
      });
      onBooked(id);
    } catch (err) {
      console.error(err);
      setError("Kunde inte skapa bokningen. Försök igen.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full rounded-lg px-3.5 py-2.5 text-sm outline-none border border-line bg-white";

  return (
    <div className="max-w-lg mx-auto px-5 py-8">
      <button onClick={onBack} className="text-sm text-inkSoft mb-6">← Tillbaka</button>

      <h1 className="font-display text-xl font-semibold mb-1 text-ink">Boka {item.title}</h1>
      <p className="text-xs mb-6 text-inkSoft">{item.price} kr / {item.unit} · {item.ownerName}</p>

      {loadingBookings ? (
        <p className="text-sm text-inkSoft">Laddar tillgänglighet…</p>
      ) : (
        <div className="flex flex-col gap-4 mb-4">
          <AvailabilityCalendar
            bookings={itemBookings}
            blockedDates={item.blockedDates || []}
            title="Välj dag för hämtning och återlämning"
            mode="range"
            selectedStart={startDate}
            selectedEnd={endDate}
            onSelectDay={handleSelectDay}
          />
          <p className="text-xs px-1 text-inkSoft">
            {!startDate
              ? "Klicka på en ledig dag för att välja hämtningsdatum."
              : !endDate
              ? "Klicka på samma dag igen för ett kort lån, eller en senare dag för återlämningsdatum."
              : "Klicka på en ny dag för att göra om ditt val."}
          </p>
        </div>
      )}

      <div className="rounded-xl p-5 flex flex-col gap-4 border border-line bg-white">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium block mb-1.5 flex items-center gap-1.5"><Clock size={13} /> Upphämtning</label>
            <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5 flex items-center gap-1.5"><Clock size={13} /> Återlämning</label>
            <input type="time" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} className={inputClass} />
          </div>
        </div>

        <Perforation />

        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-wider mb-1 text-inkSoft">Hämtas</div>
            <div className="text-sm font-semibold font-mono text-ink">{start ? formatSv(start) : "—"}</div>
          </div>
          <ChevronRight size={16} className="text-inkSoft mt-4 flex-shrink-0" />
          <div className="flex-1 text-right">
            <div className="text-[10px] uppercase tracking-wider mb-1 text-inkSoft">Tillbaka senast</div>
            <div className="text-sm font-semibold font-mono text-ink">{end ? formatSv(end) : "—"}</div>
          </div>
        </div>

        {start && end && !durationOk && (
          <p className="text-xs text-terracotta">Återlämningstiden måste vara efter hämtningstiden.</p>
        )}
        {error && (
          <div className="text-sm font-medium px-4 py-3 rounded-lg text-terracotta bg-terracotta/10 border border-terracotta/30">
            {error}
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={!valid || !durationOk || saving}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white bg-pine disabled:opacity-50"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          Skicka bokningsförfrågan
        </button>
      </div>

      <div className="flex items-start gap-2 text-xs px-1 mt-4 text-inkSoft">
        <ShieldCheck size={14} className="flex-shrink-0 mt-0.5" />
        <p>Tid och datum följer med bokningen och visas för {item.ownerName} tillsammans med QR-kod/BankID-bekräftelsen vid överlämning.</p>
      </div>
    </div>
  );
}
