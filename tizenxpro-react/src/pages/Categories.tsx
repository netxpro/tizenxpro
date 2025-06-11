import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { UserSettings } from "@/types/userSettings";
import { getApiUrl } from "@/utils/apiUrl";

interface Category {
  id: string;
  name: string;
  image?: string;
  url: string;
  source: string;
}

export default function Categories({ settings }: { settings: UserSettings }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  const platform = settings.platform;
  const API_BASE = getApiUrl();

  useEffect(() => {
    fetch(`${API_BASE}/${platform}/categories`)
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data.categories) ? data.categories : []))
      .catch(() => setCategories([]));
  }, [platform, API_BASE]);

  const handleClick = (cat: Category) => {
    navigate(`/?category=${encodeURIComponent(cat.id)}`);
  };

  return (
    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {categories.map((cat) => (
        <button
          key={cat.id}
          className="relative group rounded-lg overflow-hidden shadow border bg-background h-32 w-full flex items-end focus:outline-none"
          onClick={() => handleClick(cat)}
          data-focusable-content
          style={{ minWidth: 0 }}
        >
          {cat.image && (
            <img
              src={cat.image}
              // alt={cat.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
              draggable={false}
            />
          )}
          <div className="relative z-10 w-full bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
            <span className="text-white font-semibold text-lg drop-shadow">{cat.name}</span>
          </div>
        </button>
      ))}
    </div>
  );
}