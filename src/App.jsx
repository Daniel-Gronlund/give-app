import { useState } from "react";
import { Package, LogOut, MessageCircle } from "lucide-react";
import { useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Explore from "./pages/Explore";
import ItemDetail from "./pages/ItemDetail";
import AddItem from "./pages/AddItem";
import Profile from "./pages/Profile";
import BookingForm from "./pages/BookingForm";
import BookingDetail from "./pages/BookingDetail";
import ItemLanding from "./pages/ItemLanding";
import LandingEditor from "./pages/LandingEditor";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { getOrCreateConversation } from "./lib/chat";

export default function App() {
  const { user, loading, logout } = useAuth();
  const [view, setView] = useState("explore");
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // full item doc, needed by BookingForm
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <p className="text-sm text-inkSoft">Laddar…</p>
      </div>
    );
  }

  if (!user) return <Login />;

  function openItem(id) {
    setSelectedItemId(id);
    setView("itemDetail");
  }

  async function openBookingForm() {
    const snap = await getDoc(doc(db, "items", selectedItemId));
    if (snap.exists()) setSelectedItem({ id: snap.id, ...snap.data() });
    setView("bookingForm");
  }

  function onBooked(bookingId) {
    setSelectedBookingId(bookingId);
    setView("booking");
  }

  function openLandingSmart(itemId, enabled) {
    setSelectedItemId(itemId);
    setView(enabled ? "landing" : "landingEdit");
  }

  function openLandingView(itemId) {
    setSelectedItemId(itemId);
    setView("landing");
  }

  async function handleContactOwner(item) {
    const conversationId = await getOrCreateConversation({
      itemId: item.id,
      itemTitle: item.title,
      itemImage: item.image,
      currentUser: user,
      otherUserId: item.ownerId,
      otherUserName: item.ownerName,
    });
    setSelectedConversationId(conversationId);
    setView("chat");
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-5 py-3.5">
          <button onClick={() => setView("explore")} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center bg-pine">
              <Package size={16} color="#fff" />
            </div>
            <span className="font-display text-lg font-semibold text-ink">Kvitto</span>
          </button>
          <nav className="flex items-center gap-6">
            <button onClick={() => setView("explore")} className="text-sm font-medium text-inkSoft">Utforska</button>
            <button onClick={() => setView("profile")} className="text-sm font-medium text-inkSoft">Min sida</button>
            <button onClick={() => setView("messages")} className="text-inkSoft" title="Meddelanden">
              <MessageCircle size={18} />
            </button>
            <button onClick={logout} className="text-inkSoft"><LogOut size={18} /></button>
          </nav>
        </div>
      </div>

      {view === "explore" && <Explore onOpenItem={openItem} />}

      {view === "itemDetail" && selectedItemId && (
        <ItemDetail
          itemId={selectedItemId}
          onBack={() => setView("explore")}
          onBook={openBookingForm}
          onOpenLanding={(enabled) => openLandingSmart(selectedItemId, enabled)}
          onContactOwner={handleContactOwner}
        />
      )}

      {view === "bookingForm" && selectedItem && (
        <BookingForm item={selectedItem} onBack={() => setView("itemDetail")} onBooked={onBooked} />
      )}

      {view === "booking" && selectedBookingId && (
        <BookingDetail bookingId={selectedBookingId} onBack={() => setView("profile")} />
      )}

      {view === "landing" && selectedItemId && (
        <ItemLanding
          itemId={selectedItemId}
          onBack={() => setView("profile")}
          onBook={openBookingForm}
          onEdit={() => setView("landingEdit")}
        />
      )}

      {view === "landingEdit" && selectedItemId && (
        <LandingEditor
          itemId={selectedItemId}
          onBack={() => setView("profile")}
          onSaved={() => setView("landing")}
        />
      )}

      {view === "addItem" && (
        <AddItem onCreated={() => setView("profile")} onBack={() => setView("profile")} />
      )}

      {view === "profile" && (
        <Profile
          onAddItem={() => setView("addItem")}
          onOpenItem={openItem}
          onOpenLanding={openLandingSmart}
          onViewLanding={openLandingView}
          onOpenBooking={(id) => {
            setSelectedBookingId(id);
            setView("booking");
          }}
        />
      )}

      {view === "messages" && (
        <Messages
          onOpenChat={(id) => {
            setSelectedConversationId(id);
            setView("chat");
          }}
        />
      )}

      {view === "chat" && selectedConversationId && (
        <Chat conversationId={selectedConversationId} onBack={() => setView("messages")} />
      )}
    </div>
  );
}
