import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { createItem, updateItem } from "../lib/items";
import { uploadItemImage } from "../lib/storage";
import AvailabilityCalendar from "../components/AvailabilityCalendar";

const CATEGORIES = ["Cykel", "Boende", "Verktyg", "Elektronik"];

export default function AddItem({ onCreated, onBack }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    category: "Cykel",
    price: "",
    unit: "dag",
    location: "",
    desc: "",
  });
  const [blockedDates, setBlockedDates] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function toggleBlockedDate(iso) {
    setBlockedDates((prev) => (prev.includes(iso) ? prev.filter((d) => d !== iso) : [...prev, iso]));
  }

  async function handleSubmit() {
    setError("");
    if (!form.title.trim() || !form.price || !form.location.trim()) {
      setError("Fyll i titel, pris och plats innan du publicerar.");
      return;
    }
    setSaving(true);
    try {
      const id = await createItem(
        {
          ...form,
          price: Number(form.price),
          image: null,
          blockedDates,
          landingPageEnabled: false,
          instructions: "",
          checklist: "",
          contactInfo: "",
        },
        user.uid,
        user.displayName || user.email
      );
      if (imageFile) {
        const url = await uploadItemImage(imageFile, user.uid);
        await updateItem(id, { image: url });
      }
      onCreated?.();
    } catch (err) {
      console.error(err);
      setError("Kunde inte spara objektet. Försök igen.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full rounded-lg px-3.5 py-2.5 text-sm outline-none border border-line bg-white";

  return (
    <div className="max-w-lg mx-auto px-5 py-8">
      <button onClick={onBack} className="text-sm text-inkSoft mb-6">← Tillbaka</button>
      <h1 className="font-display text-2xl font-semibold mb-1 text-ink">Lägg upp ett objekt</h1>
      <p className="text-sm mb-6 text-inkSoft">Beskriv vad du vill låna ut eller hyra ut.</p>

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-medium block mb-1.5">Bild</label>
          <label className="w-full h-32 flex flex-col items-center justify-center gap-2 rounded-lg cursor-pointer overflow-hidden border border-line bg-white">
            {imagePreview ? (
              <img src={imagePreview} alt="Förhandsvisning" className="w-full h-full object-cover" />
            ) : (
              <>
                <Plus size={20} className="text-inkSoft" />
                <span className="text-xs text-inkSoft">Ladda upp en bild</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </div>

        <div>
          <label className="text-xs font-medium block mb-1.5">Titel *</label>
          <input value={form.title} onChange={update("title")} placeholder="T.ex. Elcykel, Cannondale" className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium block mb-1.5">Kategori</label>
            <select value={form.category} onChange={update("category")} className={inputClass}>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5">Period</label>
            <select value={form.unit} onChange={update("unit")} className={inputClass}>
              <option value="dag">per dag</option>
              <option value="natt">per natt</option>
              <option value="timme">per timme</option>
              <option value="vecka">per vecka</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium block mb-1.5">Pris (kr) *</label>
            <input value={form.price} onChange={update("price")} type="number" min="0" placeholder="120" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5">Plats *</label>
            <input value={form.location} onChange={update("location")} placeholder="Stadsdel, stad" className={inputClass} />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium block mb-1.5">Beskrivning</label>
          <textarea value={form.desc} onChange={update("desc")} rows={4} placeholder="Skick, vad som ingår, hämtning eller leverans…" className={inputClass + " resize-none"} />
        </div>

        <div>
          <label className="text-xs font-medium block mb-1.5">Blockera datum (valfritt)</label>
          <p className="text-xs mb-2 text-inkSoft">Klicka på dagar då objektet inte går att låna eller hyra, t.ex. när du själv använder det.</p>
          <AvailabilityCalendar
            title="Din tillgänglighet"
            mode="toggle"
            blockedDates={blockedDates}
            onToggleDay={toggleBlockedDate}
            unavailableLabel="Blockerad"
          />
        </div>

        {error && (
          <div className="text-sm font-medium px-4 py-3 rounded-lg text-terracotta bg-terracotta/10 border border-terracotta/30">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white bg-pine disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Publicera annons
        </button>
      </div>
    </div>
  );
}
