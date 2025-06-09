import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { NavigationMode } from "@/types/navigationMode";

interface NavigationManagerProps {
  mode: NavigationMode;
  setMode: (mode: NavigationMode) => void;
  focusIndex: number;
  setFocusIndex: React.Dispatch<React.SetStateAction<number>>;
  lastSidebarIndex: number;
  setLastSidebarIndex: (i: number) => void;
  setShowExitPrompt: (open: boolean) => void;
}

export function NavigationManager({
  mode,
  setMode,
  focusIndex,
  setFocusIndex,
  lastSidebarIndex,
  setLastSidebarIndex,
  setShowExitPrompt,
}: NavigationManagerProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Fokussiert ein Element in einer Liste anhand eines Index
  const focusElement = (elements: HTMLElement[], index: number) => {
    if (!elements.length) return 0;
    const safeIndex = Math.max(0, Math.min(index, elements.length - 1));
    elements.forEach(el => el.classList.remove("focused"));
    const el = elements[safeIndex];
    el.classList.add("focused");
    el.focus();
    return safeIndex;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA";
      const navKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Tab", "Enter"];

      if (isInput && !navKeys.includes(e.key)) return;

      // Unterstütze Tizen Back-Taste (z. B. Fernbedienung oder Tastatur Escape/Backspace)
      const isSamsungBack =
        e.key === "BrowserBack" ||
        e.key === "Backspace" ||
        e.key === "Escape" ||
        e.key === "Exit" ||
        e.keyCode === 10009;

      // 🟥🟩🟨🟦 //TODO: Debug
      // switch (e.key) {
      //   case "ColorF0Red":
      //   case "r":
      //     console.log("🔴 Rote Taste gedrückt – könnte z.B. App resetten oder Devtools öffnen.");
      //     // [focusIndex]?.click();
      //     break;
      //   case "ColorF1Green":
      //   case "g":
      //     console.log("🟢 Grüne Taste gedrückt – z.B. Filter öffnen.");
      //     break;
      //   case "ColorF2Yellow":
      //   case "y":
      //     console.log("🟡 Gelbe Taste gedrückt – z.B. Info anzeigen.");
      //     break;
      //   case "ColorF3Blue":
      //   case "b":
      //     console.log("🔵 Blaue Taste gedrückt – z.B. Favoriten-Modus.");
      //     break;
      // }

      // === POPUP Navigation ===
      if (mode === "popup") {
        const elements = Array.from(document.querySelectorAll("[data-focusable-popup]")) as HTMLElement[];
        const columns = 1; // ggf. anpassen je nach Layout

        switch (e.key) {
          case "ArrowRight":
            setFocusIndex(i => focusElement(elements, i + 1));
            break;
          case "ArrowLeft":
            setFocusIndex(i => focusElement(elements, i - 1));
            break;
          case "ArrowDown":
            setFocusIndex(i => focusElement(elements, i + columns));
            break;
          case "ArrowUp":
            setFocusIndex(i => focusElement(elements, i - columns));
            break;
          case "Enter":
            elements[focusIndex]?.click();
            break;
          default:
            if (isSamsungBack) {
              setShowExitPrompt(false);
              setMode("sidebar");
            }
            break;
        }

        e.preventDefault();
        return;
      }

      // === SIDEBAR Navigation ===
      if (mode === "sidebar") {
        const elements = Array.from(document.querySelectorAll("[data-focusable-sidebar]")) as HTMLElement[];

        switch (e.key) {
          case "ArrowRight":
            setFocusIndex(i => focusElement(elements, i + 1));
            break;
          case "ArrowLeft":
            setFocusIndex(i => focusElement(elements, i - 1));
            break;
          case "Enter": 
          case "ColorF0Red":{
            const el = elements[focusIndex];
            el?.click();

            if (el?.getAttribute("aria-label") === "Open search") {
              setMode("popup");
            } else {
              setMode("content");
              setFocusIndex(() => 0);
            }
            break;
          }
          default:
            if (isSamsungBack) {
              setShowExitPrompt(true);
              setMode("popup");
            }
            break;
        }

        e.preventDefault();
        return;
      }

      // === CONTENT Navigation ===
      if (mode === "content") {
        const elements = Array.from(document.querySelectorAll("[data-focusable-content]")) as HTMLElement[];
        const columns = 5;

        switch (e.key) {
          case "ArrowRight":
            setFocusIndex(i => focusElement(elements, i + 1));
            break;
          case "ArrowLeft":
            setFocusIndex(i => focusElement(elements, i - 1));
            break;
          case "ArrowDown":
            setFocusIndex(i => focusElement(elements, i + columns));
            break;
          case "ArrowUp":
            setFocusIndex(i => focusElement(elements, i - columns));
            break;
          case "Enter":
            elements[focusIndex]?.click();
            break;
          default:
            if (isSamsungBack) {
              setMode("sidebar");
              setLastSidebarIndex(0);
              setFocusIndex(() => lastSidebarIndex);
            }
            break;
        }

        e.preventDefault();
        return;
      }

      // === PLAYER Navigation ===
      if (mode === "player") {
        window.dispatchEvent(new CustomEvent("player-show-controls"));

        if (isSamsungBack) {
          window.dispatchEvent(new CustomEvent("player-back"));
          navigate(-1); // Zurück zur vorherigen Route
          return;
        }

        switch (e.key) {
          case "ArrowRight":
            window.dispatchEvent(new CustomEvent("player-seek", { detail: 30 })); // 30 Sek. vorspulen
            break;
          case "ArrowLeft":
            window.dispatchEvent(new CustomEvent("player-seek", { detail: -15 })); // 15 Sek. zurück
            break;
          case "Enter":
            window.dispatchEvent(new CustomEvent("player-playpause"));
            break;
        }

        e.preventDefault();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, focusIndex, setFocusIndex, setMode, lastSidebarIndex, setLastSidebarIndex, setShowExitPrompt, navigate]);

  // Fokussiere korrektes Element nach Seiten- oder Moduswechsel
  useEffect(() => {
    document.querySelectorAll(".focused").forEach(el => el.classList.remove("focused"));

    let selector = "";
    if (mode === "sidebar") selector = "[data-focusable-sidebar]";
    else if (mode === "content") selector = "[data-focusable-content]";
    else if (mode === "popup") selector = "[data-focusable-popup]";
    else if (mode === "player") selector = "[data-focusable-player]";

    const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
    setFocusIndex(i => focusElement(elements, i));
  }, [mode, location.pathname]);

  return null;
}
