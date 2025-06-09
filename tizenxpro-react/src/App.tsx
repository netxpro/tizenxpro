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
// import { Toaster } from "@/components/ui/sonner";
// import { toast } from "sonner";
import type { Setting, Platform } from "@/types/settings";
import About from "@/pages/About";

export default function App() {
  const [mode, setMode] = useState<NavigationMode>("sidebar");
  const [activePath, setActivePath] = useState("/");
  const [focusIndex, setFocusIndex] = useState(0);
  const [lastSidebarIndex, setLastSidebarIndex] = useState(0);
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [setting, setSetting] = useState<Setting>(
    () => (localStorage.getItem("setting") as Setting) || "straight"
  );
  const [platform, setPlatform] = useState<Platform["id"]>(
    () => (localStorage.getItem("platform") as Platform["id"]) || "xhamster"
  );

  useEffect(() => {
    localStorage.setItem("setting", setting);
  }, [setting]);

  useEffect(() => {
    localStorage.setItem("platform", platform);
  }, [platform]);

  // Debug: Sonner-Toast for key-inputs
  // useEffect(() => {
  //   const handler = (e: KeyboardEvent) => {
  //     toast(`Taste: ${e.key}`, {
  //       description: `Code: ${e.code} | Content-Mode: ${mode}`, //Alt: ${e.altKey} | Ctrl: ${e.ctrlKey} | Shift: ${e.shiftKey} | Meta: ${e.metaKey}
  //       duration: 2500,
  //     });
  //   };
  //   window.addEventListener("keydown", handler);
  //   return () => window.removeEventListener("keydown", handler);
  // }, []);

  // const showPlayerControls = () => setShowControls(true);

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
        // onPlayPause={togglePlay}
        // onSeek={seek}
      />
      <div className="flex flex-col h-screen w-screen">
        {/* Navbar oben */}
        <SidebarProvider>
          <nav className="w-full flex flex-row items-center border-b bg-card px-4 py-2">
            <AppSidebar
              activePath={activePath}
              onSelect={setActivePath}
              onSearchClick={() => {
                setMode("popup");
                setSearchOpen(true);
              }}
              mode={mode}
              searchOpen={searchOpen}
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
        {/* Content darunter */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Home setting={setting} platform={platform} />} />
            <Route path="/search" element={<Home setting={setting} platform={platform} />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/settings" element={<Settings setting={setting} setSetting={setSetting} platform={platform} setPlatform={setPlatform} />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/player/:id"
              element={
                <PlayerView setMode={setMode} />
              }
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
      {/* <Toaster richColors position="top-right" /> */}
    </Router>
  );
}
