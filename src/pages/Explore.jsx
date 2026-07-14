import { useEffect, useState } from "react";
import { MapPin, Search, Bike, Home as HomeIcon, Wrench, Laptop } from "lucide-react";
import { fetchItems } from "../lib/items";

const CATEGORY_ICON = { Cykel: Bike, Boende: HomeIcon, Verktyg: Wrench, Elektronik: Laptop };

export default function Explore({ onOpenItem }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Alla");

  useEffect(() => {
    fetchItems()
      .then(setItems)
      .catch((err) => setError("Kunde inte läsa objekt: " + err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((it) => {
    const matchCat = category === "Alla" || it.category === category;
    const matchQuery =
      query.trim() === "" ||
      it.title?.toLowerCase().includes(query.toLowerCase()) ||
      it.location?.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="max-w-5xl mx-auto px-5 py-8">
      <h1 className="font-display text-3xl font-semibold text-ink mb-1">Vad behöver du idag?</h1>
      <p className="text-sm text-inkSoft mb-6">Låna eller hyr av någon i din närhet.</p>

      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-line bg-white mb-4">
        <Search size={16} className="text-inkSoft" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sök efter objekt eller plats…"
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {["Alla", "Cykel", "Boende", "Verktyg", "Elektronik"].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
              category === cat ? "bg-pine text-white border-pine" : "border-line text-inkSoft"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-inkSoft">Laddar objekt…</p>
      ) : error ? (
        <p className="text-sm text-terracotta">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-inkSoft">Inga objekt hittades än. Bli först med att lägga upp något!</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const Icon = CATEGORY_ICON[item.category] || Bike;
            return (
              <button
                key={item.id}
                onClick={() => onOpenItem(item.id)}
                className="text-left rounded-xl overflow-hidden border border-line bg-white hover:-translate-y-0.5 transition-transform"
              >
                <div className="h-32 flex items-center justify-center bg-pine overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <Icon size={34} className="text-white/80" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1.5 text-ink">{item.title}</h3>
                  <div className="flex items-center gap-1 text-xs mb-2 text-inkSoft">
                    <MapPin size={12} /> {item.location}
                  </div>
                  <div className="font-display font-semibold text-base text-ink">
                    {item.price} kr <span className="text-xs font-normal text-inkSoft">/ {item.unit}</span>
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
