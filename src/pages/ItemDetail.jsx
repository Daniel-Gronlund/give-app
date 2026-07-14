import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { MapPin, User, ShieldCheck, MessageCircle, Bike, Home as HomeIcon, Wrench, Laptop } from "lucide-react";
import { db } from "../firebase";
import AvailabilityCalendar from "../components/AvailabilityCalendar";
import { fetchBookingsForItem } from "../lib/bookings";
import { useAuth } from "../contexts/AuthContext";

const CATEGORY_ICON = { Cykel: Bike, Boende: HomeIcon, Verktyg: Wrench, Elektronik: Laptop };

export default function ItemDetail({ itemId, onBack, onBook, onOpenLanding, onContactOwner }) {
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [bookings, setBookings] = useState([]);
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

  if (loading) return <div className="max-w-3xl mx-auto px-5 py-8 text-sm text-inkSoft">Laddar…</div>;
  if (error) return <div className="max-w-3xl mx-auto px-5 py-8 text-sm text-terracotta">{error}</div>;
  if (!item) return <div className="max-w-3xl mx-auto px-5 py-8 text-sm text-inkSoft">Objektet hittades inte.</div>;

  const Icon = CATEGORY_ICON[item.category] || Bike;
  const isOwner = user?.uid === item.ownerId;

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <button onClick={onBack} className="text-sm text-inkSoft mb-6">← Tillbaka</button>

      <div className="h-56 rounded-xl overflow-hidden flex items-center justify-center mb-6 bg-pine">
        {item.image ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" /> : <Icon size={56} className="text-white/80" />}
      </div>

      <div className="flex items-center gap-1.5 text-xs mb-2 text-inkSoft">
        <Icon size={13} /> {item.category}
      </div>
      <h1 className="font-display text-2xl font-semibold mb-2 text-ink">{item.title}</h1>
      <div className="flex items-center gap-4 text-sm mb-6 text-inkSoft">
        <span className="flex items-center gap-1"><MapPin size={13} /> {item.location}</span>
        <span className="flex items-center gap-1"><User size={13} /> {item.ownerName}</span>
        {!isOwner && (
          <button onClick={() => onContactOwner(item)} className="flex items-center gap-1 text-pine font-medium">
            <MessageCircle size={13} /> Kontakta ägaren
          </button>
        )}
      </div>

      <p className="text-sm leading-relaxed mb-8 text-ink">{item.desc}</p>

      <AvailabilityCalendar bookings={bookings} blockedDates={item.blockedDates || []} />

      <div className="rounded-xl p-5 flex items-center justify-between mt-8 gap-3 flex-wrap border border-line bg-white">
        <div>
          <div className="font-display text-xl font-semibold text-ink">
            {item.price} kr <span className="text-sm font-normal text-inkSoft">/ {item.unit}</span>
          </div>
          <div className="text-xs mt-1 flex items-center gap-1 text-inkSoft">
            <ShieldCheck size={12} /> Överlämning bekräftas med QR-kod eller BankID
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onOpenLanding(item.landingPageEnabled)} className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-line text-pine">
            {item.landingPageEnabled ? "Mer info" : "Lägg till landningssida"}
          </button>
          <button onClick={onBook} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-pine">
            Boka
          </button>
        </div>
      </div>
    </div>
  );
}
