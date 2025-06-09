import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Category {
  name: string;
  image?: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/data/categories.json")
      .then(res => res.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const handleClick = (categoryName: string) => {
    // Navigiere zu Home mit Kategorie als Query-Parameter
    navigate(`/?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {categories.map((cat) => (
        <Button
          key={cat.name}
          variant="outline"
          className="h-32 flex flex-col items-center justify-center gap-2 text-base"
          onClick={() => handleClick(cat.name)}
          data-focusable-content
        >
          {cat.image && <img src={cat.image} alt={cat.name} className="w-12 h-12 object-cover rounded-full mb-2" />}
          <span>{cat.name}</span>
        </Button>
      ))}
    </div>
  );
}