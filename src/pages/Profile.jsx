import { useEffect, useState } from "react";
import { Plus, LogOut, ShieldCheck, ChevronRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { fetchItemsByOwner } from "../lib/items";
import { fetchBookingsForUser } from "../lib/bookings";
import { formatSv } from "../lib/dates";

const STATUS_LABEL = {
  pending: "Väntar på överlämning",
  handedOver: "Överlämnad",
  active: "Pågående lån",
  returned: "Avslutad",
};

export default function Profile({ onAddItem, onOpenItem, onOpenLanding, onViewLanding, onOpenBooking }) {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("bookings");
  const [items, setItems] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [itemsError, setItemsError] = useState("");
  const [bookingsError, setBookingsError] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchItemsByOwner(user.uid)
      .then(setItems)
      .catch((err) => setItemsError("Kunde inte läsa dina annonser: " + err.message))
      .finally(() => setLoadingItems(false));
    fetchBookingsForUser(user.uid)
      .then(setBookings)
      .catch((err) => setBookingsError("Kunde inte läsa dina bokningar: " + err.message))
      .finally(() => setLoadingBookings(false));
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto px-5 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center font-display text-lg font-semibold text-white bg-pine">
            {(user.displayName || user.email || "?").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold text-ink">{user.displayName || user.email}</h1>
            <div className="flex items-center gap-1 text-xs mt-1 text-pine">
              <ShieldCheck size={13} /> Verifierad medlem
            </div>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-1.5 text-sm text-inkSoft">
          <LogOut size={16} /> Logga ut
        </button>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setTab("bookings")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border ${tab === "bookings" ? "bg-pine text-white border-pine" : "border-line text-inkSoft"}`}
        >
          Mina bokningar
        </button>
        <button
          onClick={() => setTab("items")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border ${tab === "items" ? "bg-pine text-white border-pine" : "border-line text-inkSoft"}`}
        >
          Mina annonser
        </button>
      </div>

      {tab === "items" && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={onAddItem} className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white bg-pine">
              <Plus size={16} /> Lägg till objekt
            </button>
          </div>
          {loadingItems ? (
            <p className="text-sm text-inkSoft">Laddar dina annonser…</p>
          ) : itemsError ? (
            <p className="text-sm text-terracotta">{itemsError}</p>
          ) : items.length === 0 ? (
            <div className="rounded-xl p-10 text-center border border-dashed border-line">
              <p className="text-sm text-inkSoft">Du har inga annonser än. Lägg upp ditt första objekt.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onOpenLanding(item.id, item.landingPageEnabled)}
                  className="rounded-xl p-4 flex items-center gap-3 text-left border border-line bg-white"
                >
                  <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-pine flex items-center justify-center">
                    {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm truncate text-ink">{item.title}</div>
                    <div className="text-xs text-inkSoft">{item.price} kr / {item.unit}</div>
                  </div>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                      item.landingPageEnabled ? "text-pine bg-pine/10" : "text-inkSoft bg-bg"
                    }`}
                  >
                    {item.landingPageEnabled ? "Landningssida" : "+ Landningssida"}
                  </span>
                  <ChevronRight size={16} className="text-inkSoft flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "bookings" && (
        <div>
          {loadingBookings ? (
            <p className="text-sm text-inkSoft">Laddar dina bokningar…</p>
          ) : bookingsError ? (
            <p className="text-sm text-terracotta">{bookingsError}</p>
          ) : bookings.length === 0 ? (
            <div className="rounded-xl p-10 text-center border border-dashed border-line">
              <p className="text-sm text-inkSoft">Du har inga bokningar än. Utforska plattformen för att hitta något att låna.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {bookings.map((b) => (
                <div key={b.id} className="rounded-xl p-4 flex items-center gap-3 border border-line bg-white">
                  <button onClick={() => onOpenBooking(b.id)} className="flex items-center gap-3 text-left flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-pine flex items-center justify-center">
                      {b.itemImage && <img src={b.itemImage} alt={b.itemTitle} className="w-full h-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm truncate text-ink">{b.itemTitle}</div>
                      <div className="text-xs font-mono text-inkSoft">#{b.code} · {formatSv(new Date(b.rawStart))}</div>
                    </div>
                  </button>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 text-inkSoft bg-bg">
                    {STATUS_LABEL[b.status]}
                  </span>
                  {b.itemLandingPageEnabled && (
                    <button onClick={() => onViewLanding(b.itemId)} className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 border border-line text-pine">
                      Landningssida
                    </button>
                  )}
                  <button onClick={() => onOpenBooking(b.id)} className="flex-shrink-0">
                    <ChevronRight size={16} className="text-inkSoft" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
