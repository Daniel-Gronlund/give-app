import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { subscribeToConversation, subscribeToMessages, sendMessage } from "../lib/chat";

export default function Chat({ conversationId, onBack }) {
  const { user } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const unsubConvo = subscribeToConversation(conversationId, setConversation);
    const unsubMsgs = subscribeToMessages(conversationId, setMessages);
    return () => {
      unsubConvo();
      unsubMsgs();
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setText("");
    try {
      await sendMessage(conversationId, user.uid, trimmed);
    } finally {
      setSending(false);
    }
  }

  if (!conversation) return <div className="max-w-2xl mx-auto px-5 py-8 text-sm text-inkSoft">Laddar samtal…</div>;

  const otherUserId = conversation.participants.find((p) => p !== user.uid);
  const otherName = conversation.participantNames?.[otherUserId] || "Okänd";

  return (
    <div className="max-w-2xl mx-auto px-5 py-8 flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      <button onClick={onBack} className="text-sm text-inkSoft mb-4 flex-shrink-0">← Tillbaka</button>

      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-line flex-shrink-0">
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white bg-pine">
          {otherName.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <div className="font-semibold text-sm text-ink">{otherName}</div>
          <div className="text-xs text-inkSoft">om {conversation.itemTitle}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
        {messages.length === 0 && (
          <p className="text-sm text-inkSoft text-center mt-8">
            Inga meddelanden än — säg hej och fråga vad du vill veta om {conversation.itemTitle}.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === user.uid;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`rounded-2xl px-4 py-2 text-sm max-w-[75%] ${
                  mine ? "bg-pine text-white rounded-br-sm" : "bg-white border border-line text-ink rounded-bl-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 pt-4 flex-shrink-0">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Skriv ett meddelande…"
          className="flex-1 rounded-lg px-3.5 py-2.5 text-sm outline-none border border-line bg-white"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white bg-pine disabled:opacity-50 flex-shrink-0"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
