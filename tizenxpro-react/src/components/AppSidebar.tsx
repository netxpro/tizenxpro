import {
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Home, Layers, Settings, Search, Info } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getApiUrl } from "@/components/get";

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
  settings,
}: {
  activePath: string,
  onSelect: (url: string) => void,
  onSearchClick?: () => void,
  mode: string,
  searchOpen: boolean,
  settings: { platform: string; orientation?: string },
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const currentCategory = params.get("category");
  const currentQuery = params.get("query");
  const [categoryLabel, setCategoryLabel] = useState<string | null>(null);

  useEffect(() => {
    if (currentCategory) {
      const API_BASE = getApiUrl();
      fetch(`${API_BASE}/${settings.platform}/categories`)
        .then(res => res.json())
        .then((data) => {
          const cats = Array.isArray(data.categories) ? data.categories : [];
          const found = cats.find((cat: any) => cat.name === currentCategory);
          setCategoryLabel(found ? found.name : currentCategory);
        })
        .catch(() => setCategoryLabel(currentCategory));
    } else {
      setCategoryLabel(null);
    }
  }, [currentCategory, settings.platform]);

  const isActive = (item: typeof items[0]) => {
    if (item.isSearch) return (searchOpen && mode === "popup") || (!!currentQuery && mode === "content");
    if (item.url === "/") return (activePath === "/" || activePath === "") && mode === "content";
    return activePath === item.url && mode === "content";
  };

  return (
    <ul className="flex flex-row gap-2 w-full">
      {items.map((item) => {
        const active = isActive(item);

        let homeTitle = "Home";
        if (item.title === "Home") {
          if (currentQuery) {
            homeTitle = `searched for "${currentQuery}"`;
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
                  style={{ paddingBottom: "1.2rem" }}
                  onClick={() => onSearchClick?.()}
                  className={`flex items-center px-6 py-4 rounded-xl transition-colors
                    ${active ? "text-orange-500 font-bold bg-orange-50" : "hover:bg-muted"}
                  `}
                  aria-label="Open search"
                >
                  <item.icon className="w-20 h-20" style={{ width: 24, height: 24, paddingTop: 2 }} />
                  <span className="text-2xl font-semibold">
                    {item.title}
                  </span>
                </button>
              ) : (
                <a
                  data-focusable-sidebar
                  tabIndex={0}
                  href={item.url}
                  style={{ paddingBottom: "1.2rem" }}
                  aria-current={active ? "page" : undefined}
                  onClick={e => {
                    e.preventDefault();
                    if (item.url === "/categories" && currentCategory) {
                      const orientation = settings.orientation || "";
                      navigate(
                        `/category?name=${encodeURIComponent(currentCategory)}&orientation=${encodeURIComponent(orientation)}&page=1`
                      );
                    } else if (item.url) {
                      onSelect(item.url);
                      navigate(item.url);
                    }
                  }}
                  className={`flex items-center px-6 py-4 rounded-xl transition-colors
                    ${active ? "text-orange-500 font-bold bg-orange-50" : "hover:bg-muted"}
                  `}
                >
                  <item.icon className={`w-20 h-20 ${active ? "text-orange-500" : ""}`} style={{ width: 24, height: 24, paddingTop: 2 }} />
                  <span className="text-2xl font-semibold">
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