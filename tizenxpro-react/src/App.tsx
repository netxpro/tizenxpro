import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Home from "@/pages/Home";
import Categories from "@/pages/Categories";
import PlayerView from "@/pages/PlayerView";
import Settings from "@/pages/Settings";
import { ExitDialog } from "@/components/ExitDialog";
import type { NavigationMode } from "@/types/navigationMode";
import { NavigationManager } from "@/components/NavigationManager";
import { SearchDialog } from "@/components/SearchDialog";
import About from "@/pages/About";
import type { UserSettings } from "@/types/userSettings";

export default function App() {
  const [mode, setMode] = useState<NavigationMode>("sidebar");
  const [activePath, setActivePath] = useState("/");
  const [focusIndex, setFocusIndex] = useState(0);
  const [lastSidebarIndex, setLastSidebarIndex] = useState(0);
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("settings") || '{"platform":"xhamster"}'
      );
    } catch {
      return { platform: "xhamster" };
    }
  });

  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings));
  }, [settings]);

  return (
    <Router>
      <NavigationManager
        mode={mode}
        setMode={setMode}
        focusIndex={focusIndex}
        setFocusIndex={setFocusIndex}
        lastSidebarIndex={lastSidebarIndex}
        setLastSidebarIndex={setLastSidebarIndex}
        setShowExitPrompt={setShowExitPrompt}
      />
      <div className="flex flex-col h-screen w-screen">
        {/* Navbar */}
        <SidebarProvider>
          <nav className="w-full flex flex-row items-center border-b bg-card px-4 py-3">
            <AppSidebar
              activePath={activePath}
              onSelect={setActivePath}
              onSearchClick={() => {
                setMode("popup");
                setSearchOpen(true);
              }}
              mode={mode}
              searchOpen={searchOpen}
              settings={settings}
            />
            <SearchDialog
              open={searchOpen}
              onClose={() => {
                setSearchOpen(false);
                setMode("content");
              }}
            />
          </nav>
        </SidebarProvider>
        {/* Content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route
              path="/"
              element={<Home settings={settings} />}
            />
            <Route
              path="/search"
              element={<Home settings={settings} />}
            />
            <Route path="/categories" element={<Categories settings={settings} />} />
            <Route
              path="/settings"
              element={
                <Settings
                  settings={settings}
                  setSettings={setSettings}
                />
              }
            />
            <Route path="/about" element={<About />} />
            <Route
              path="/player/:id"
              element={<PlayerView settings={settings} />}
            />
          </Routes>
        </main>
      </div>
      <ExitDialog
        open={showExitPrompt}
        onCancel={() => {
          setShowExitPrompt(false);
          setMode("sidebar");
        }}
        onExit={() => {
          window.close();
          setShowExitPrompt(false);
          setMode("sidebar");
        }}
      />
    </Router>
  );
}
