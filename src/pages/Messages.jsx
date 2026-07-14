import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { fetchConversationsForUser } from "../lib/chat";

export default function Messages({ onOpenChat }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversationsForUser(user.uid)
      .then(setConversations)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <h1 className="font-display text-2xl font-semibold mb-6 text-ink">Meddelanden</h1>

      {loading ? (
        <p className="text-sm text-inkSoft">Laddar…</p>
      ) : conversations.length === 0 ? (
        <div className="rounded-xl p-10 text-center border border-dashed border-line">
          <p className="text-sm text-inkSoft">Inga samtal än. Kontakta en ägare från ett objekts sida för att komma igång.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {conversations.map((c) => {
            const participants = c.participants || [];
            const otherUserId = participants.find((p) => p !== user.uid);
            const otherName = c.participantNames?.[otherUserId] || "Okänd";
            return (
              <button
                key={c.id}
                onClick={() => onOpenChat(c.id)}
                className="rounded-xl p-4 flex items-center gap-3 text-left border border-line bg-white"
              >
                <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-pine flex items-center justify-center font-semibold text-white">
                  {c.itemImage ? (
                    <img src={c.itemImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    otherName.slice(0, 1).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm truncate text-ink">{otherName}</span>
                  </div>
                  <div className="text-xs truncate text-inkSoft">
                    {c.itemTitle} {c.lastMessage && `· ${c.lastMessage}`}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
