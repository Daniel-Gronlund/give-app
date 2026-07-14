import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { Star, ShieldCheck, Check, User, MapPin, Bike, Home as HomeIcon, Wrench, Laptop } from "lucide-react";
import { db } from "../firebase";
import AvailabilityCalendar from "../components/AvailabilityCalendar";
import { fetchBookingsForItem } from "../lib/bookings";
import { linesToList } from "../lib/dates";
import { useAuth } from "../contexts/AuthContext";

const CATEGORY_ICON = { Cykel: Bike, Boende: HomeIcon, Verktyg: Wrench, Elektronik: Laptop };

export default function ItemLanding({ itemId, onBack, onBook, onEdit }) {
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState("oversikt");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([getDoc(doc(db, "items", itemId)), fetchBookingsForItem(itemId)])
      .then(([snap, bk]) => {
        if (snap.exists()) setItem({ id: snap.id, ...snap.data() });
        setBookings(bk);
      })
      .catch((err) => setError("Kunde inte läsa objektet: " + err.message))
      .finally(() => setLoading(false));
  }, [itemId]);

  if (loading) return <div className="max-w-2xl mx-auto px-5 py-8 text-sm text-inkSoft">Laddar…</div>;
  if (error) return <div className="max-w-2xl mx-auto px-5 py-8 text-sm text-terracotta">{error}</div>;
  if (!item) return <div className="max-w-2xl mx-auto px-5 py-8 text-sm text-inkSoft">Objektet hittades inte.</div>;

  const Icon = CATEGORY_ICON[item.category] || Bike;
  const isOwner = user?.uid === item.ownerId;
  const checklistItems = linesToList(item.checklist);

  const TABS = [
    { key: "oversikt", label: "Översikt", icon: Star },
    { key: "instruktioner", label: "Instruktioner", icon: ShieldCheck },
    { key: "checklista", label: "Checklista", icon: Check },
    { key: "kontakt", label: "Kontakt", icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ paddingBottom: 76 }}>
      <div className="max-w-2xl w-full mx-auto px-5 pt-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-sm text-inkSoft">← Tillbaka</button>
          {isOwner && (
            <button onClick={onEdit} className="text-sm font-medium text-pine">Redigera landningssida</button>
          )}
        </div>

        <div className="h-44 rounded-xl overflow-hidden flex items-center justify-center mb-5 bg-pine">
          {item.image ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" /> : <Icon size={44} className="text-white/80" />}
        </div>

        <div className="flex items-center gap-1.5 text-xs mb-2 text-inkSoft">
          <Icon size={13} /> {item.category}
        </div>
        <h1 className="font-display text-2xl font-semibold mb-2 text-ink">{item.title}</h1>
        <div className="flex items-center gap-4 text-sm mb-6 flex-wrap text-inkSoft">
          <span className="flex items-center gap-1"><MapPin size={13} /> {item.location}</span>
          <span className="flex items-center gap-1"><User size={13} /> {item.ownerName}</span>
          <span className="font-display font-semibold text-ink">{item.price} kr / {item.unit}</span>
        </div>

        {tab === "oversikt" && (
          <div className="flex flex-col gap-6">
            <p className="text-sm leading-relaxed text-ink">{item.desc}</p>
            <AvailabilityCalendar bookings={bookings} blockedDates={item.blockedDates || []} />
            <button onClick={onBook} className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white bg-pine">
              Boka
            </button>
          </div>
        )}

        {tab === "instruktioner" && (
          <div className="rounded-xl p-5 border border-line bg-white">
            <h3 className="font-semibold text-sm mb-3 text-ink">Instruktioner</h3>
            {item.instructions ? (
              <p className="text-sm leading-relaxed whitespace-pre-line text-ink">{item.instructions}</p>
            ) : (
              <p className="text-sm text-inkSoft">Ägaren har inte lagt till några instruktioner än.</p>
            )}
          </div>
        )}

        {tab === "checklista" && (
          <div className="rounded-xl p-5 border border-line bg-white">
            <h3 className="font-semibold text-sm mb-3 text-ink">Checklista</h3>
            {checklistItems.length > 0 ? (
              <ul className="flex flex-col gap-2.5">
                {checklistItems.map((li, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink">
                    <Check size={15} className="text-pine mt-0.5 flex-shrink-0" />
                    {li}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-inkSoft">Ingen checklista tillagd än.</p>
            )}
          </div>
        )}

        {tab === "kontakt" && (
          <div className="rounded-xl p-5 flex flex-col gap-3 border border-line bg-white">
            <h3 className="font-semibold text-sm text-ink">Kontakt</h3>
            <div className="flex items-center gap-2 text-sm text-ink">
              <User size={14} className="text-inkSoft" /> {item.ownerName}
            </div>
            <p className="text-sm text-ink">{item.contactInfo || "Ingen kontaktinfo tillagd än."}</p>
            <p className="text-xs mt-1 flex items-start gap-1.5 text-inkSoft">
              <ShieldCheck size={13} className="flex-shrink-0 mt-0.5" /> Håll kontakten inom plattformen fram tills överlämningen är bekräftad, för din trygghet.
            </p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-line bg-white">
        <div className="max-w-2xl mx-auto grid grid-cols-4">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${active ? "text-pine" : "text-inkSoft"}`}
              >
                <t.icon size={18} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
