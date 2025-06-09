import {
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Home, Layers, Settings, Search, Info } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Search", isSearch: true, icon: Search },
  { title: "Category", url: "/categories", icon: Layers },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "About", url: "/about", icon: Info },
];

export function AppSidebar({
  activePath,
  onSelect,
  onSearchClick,
  mode,
  searchOpen,
}: {
  activePath: string,
  onSelect: (url: string) => void,
  onSearchClick?: () => void,
  mode: string,
  searchOpen: boolean,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const currentCategory = params.get("category");
  const currentQuery = params.get("query");
  const [categoryLabel, setCategoryLabel] = useState<string | null>(null);

  useEffect(() => {
    if (currentCategory) {
      fetch("/data/categories.json")
        .then(res => res.json())
        .then((cats) => {
          const found = cats.find((cat: any) => cat.name === currentCategory);
          setCategoryLabel(found ? found.name : currentCategory);
        })
        .catch(() => setCategoryLabel(currentCategory));
    } else {
      setCategoryLabel(null);
    }
  }, [currentCategory]);

  // Hilfsfunktion: Ist das Item aktiv?
  const isActive = (item: typeof items[0]) => {
    if (item.isSearch) return (searchOpen && mode === "popup") || (!!currentQuery && mode === "content");
    if (item.url === "/") return (activePath === "/" || activePath === "") && mode === "content";
    return activePath === item.url && mode === "content";
  };

  return (
    <ul className="flex flex-row gap-2 w-full">
      {items.map((item) => {
        const active = isActive(item);

        // Dynamischer Titel für Home
        let homeTitle = "Home";
        if (item.title === "Home") {
          if (currentQuery) {
            homeTitle = `searched for "${currentQuery}"`;
          } else if (categoryLabel) {
            // homeTitle = `Home – category "${categoryLabel}"`;
          }
        }

        return (
          <li key={item.title}>
            <SidebarMenuButton asChild>
              {item.isSearch ? (
                <button
                  type="button"
                  data-focusable-sidebar
                  tabIndex={0}
                  onClick={() => onSearchClick?.()}
                  className={`flex items-center px-4 py-2 rounded-md transition-colors
                    ${active ? "text-orange-500 font-bold bg-orange-50" : "hover:bg-muted"}
                  `}
                  aria-label="Open search"
                >
                  <item.icon className={`w-7 h-7 `} />
                  <span className="text-lg font-semibold ml-2">
                    {item.title}
                    {/* {item.isSearch && currentQuery && (
                      <span className="ml-2 text-orange-500">"{currentQuery}"</span>
                    )} */}
                  </span>
                </button>
              ) : (
                <a
                  data-focusable-sidebar
                  tabIndex={0}
                  href={item.url}
                  aria-current={active ? "page" : undefined}
                  onClick={e => {
                    e.preventDefault();
                    if (item.url) {
                      onSelect(item.url);
                      navigate(item.url);
                    }
                  }}
                  className={`flex items-center px-4 py-2 rounded-md transition-colors
                    ${active ? "text-orange-500 font-bold bg-orange-50" : "hover:bg-muted"}
                  `}
                >
                  <item.icon className={`w-7 h-7 ${active ? "text-orange-500" : ""}`} />
                  <span className="text-lg font-semibold ml-2">
                    {item.title === "Home" ? homeTitle : item.title}
                    {item.title === "Category" && categoryLabel && (
                      <span className="ml-2 text-orange-500">"{categoryLabel}"</span>
                    )}
                  </span>
                </a>
              )}
            </SidebarMenuButton>
          </li>
        );
      })}
    </ul>
  );
}