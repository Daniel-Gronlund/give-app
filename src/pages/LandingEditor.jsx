import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { db } from "../firebase";
import { updateItem } from "../lib/items";

export default function LandingEditor({ itemId, onBack, onSaved }) {
  const [item, setItem] = useState(null);
  const [instructions, setInstructions] = useState("");
  const [checklist, setChecklist] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getDoc(doc(db, "items", itemId))
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setItem({ id: snap.id, ...data });
          setInstructions(data.instructions || "");
          setChecklist(data.checklist || "");
          setContactInfo(data.contactInfo || "");
        }
      })
      .catch((err) => setError("Kunde inte läsa objektet: " + err.message))
      .finally(() => setLoading(false));
  }, [itemId]);

  async function handleSave() {
    setSaving(true);
    try {
      await updateItem(itemId, { instructions, checklist, contactInfo, landingPageEnabled: true });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="max-w-lg mx-auto px-5 py-8 text-sm text-inkSoft">Laddar…</div>;
  if (error) return <div className="max-w-lg mx-auto px-5 py-8 text-sm text-terracotta">{error}</div>;
  if (!item) return <div className="max-w-lg mx-auto px-5 py-8 text-sm text-inkSoft">Objektet hittades inte.</div>;

  const inputClass = "w-full rounded-lg px-3.5 py-2.5 text-sm outline-none border border-line bg-white resize-none";

  return (
    <div className="max-w-lg mx-auto px-5 py-8">
      <button onClick={onBack} className="text-sm text-inkSoft mb-6">← Tillbaka</button>

      <h1 className="font-display text-2xl font-semibold mb-1 text-ink">
        {item.landingPageEnabled ? "Redigera landningssida" : "Lägg till landningssida"}
      </h1>
      <p className="text-sm mb-6 text-inkSoft">
        Ge <span className="font-medium">{item.title}</span> en egen sida med instruktioner, checklista och kontaktinfo.
      </p>

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-medium block mb-1.5">Instruktioner</label>
          <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={4} placeholder="T.ex. var nyckeln finns, hur man låser upp, koder…" className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1.5">Checklista</label>
          <textarea
            value={checklist}
            onChange={(e) => setChecklist(e.target.value)}
            rows={4}
            placeholder={"En rad per punkt, t.ex.\nKontrollera att däcken är pumpade\nTa med hjälmen"}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1.5">Kontaktinfo</label>
          <input value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} placeholder="Telefon eller e-post" className={inputClass + " resize-none"} />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white bg-pine disabled:opacity-50"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {item.landingPageEnabled ? "Spara ändringar" : "Skapa landningssida"}
        </button>
      </div>
    </div>
  );
}
