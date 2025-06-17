import { useEffect, useState } from "react";
import { getApiUrl } from "@/components/get";
import type { UserSettings } from "@/types/userSettings";

export default function Settings({ settings, setSettings }: {
  settings: UserSettings;
  setSettings: (s: UserSettings) => void;
}) {
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [apiUrl, setApiUrl] = useState(getApiUrl());
  const API_BASE = getApiUrl() + "/platforms";
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [apiInput, setApiInput] = useState(apiUrl.replace(/\/api$/, ""));

  useEffect(() => {
    fetch(API_BASE)
      .then(res => res.json())
      .then(data => setPlatforms(data));
  }, []);

  const currentPlatform = platforms.find((p: any) => p.id === settings.platform);
  const orientationOptions = currentPlatform?.settings?.orientation ?? ["straight"];

  const orientationLabel: Record<string, string> = {
    straight: "Straight",
    gay: "Gay",
    shemale: "Transgender",
  };
  const orientationIcon: Record<string, string> = {
    straight: "♀️‍♂️",
    gay: "♂️♂️",
    shemale: "⚧️",
  };

  const handleApiSave = () => {
    let url = apiInput.trim();
    if (url.toLowerCase() === "nx") {
      url = import.meta.env.VITE_API_BASE;
    } else {
      if (!url.endsWith("/api")) url = url.replace(/\/+$/, "") + "/api";
    }
    setApiUrl(url);
    localStorage.setItem("apiUrl", url);
    setShowApiDialog(false);
    window.location.reload();
  };

  return (
    <div className="p-8 max-w-xl mx-auto">

      {/* Plattform */}
      <h2 className="text-2xl font-bold mb-4">Platform</h2>
      <div className="flex gap-4 flex-wrap">
        {platforms.map(opt => (
          <button
            key={opt.id}
            className={`px-4 py-2 rounded font-medium border
              ${settings.platform === opt.id
                ? "bg-orange-500 text-white border-transparent"
                : "text-gray-700 bg-gray-200 border-gray-300 hover:bg-gray-300"}`}
            onClick={() => setSettings({ ...settings, platform: opt.id })}
            tabIndex={0}
            data-focusable-content
            type="button"
            title={opt.comment}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <br />
      {/* Orientation */}
      {Array.isArray(orientationOptions) && orientationOptions.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mb-4">Orientation</h2>
          <div className="flex gap-4 mb-6">
            {orientationOptions.map(opt => (
              <button
                key={opt}
                className={`px-4 py-2 rounded font-medium border flex items-center gap-2
                  ${settings.orientation === opt
                    ? `bg-orange-500 text-white border-transparent`
                    : "text-gray-700 bg-gray-200 border-gray-300 hover:bg-gray-300"}`}
                onClick={() => setSettings({ ...settings, orientation: opt })}
                tabIndex={0}
                data-focusable-content
                type="button"
              >
                <span>{orientationIcon[opt] || ""}</span>
                {orientationLabel[opt] || opt}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="mt-8 text-center">
        <div className="mb-2 text-sm text-gray-500">
          Backend Server URL:<br />
          <span className="font-mono">{apiUrl}</span>
        </div>
        <button
          className="px-4 py-2 rounded bg-orange-500 text-white"
          onClick={() => setShowApiDialog(true)}
          tabIndex={0}
          data-focusable-content
        >
          Change Server URL
        </button>
      </div>

      {showApiDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-2">Change Backend Server URL</h3>
            <input
              className="w-full border px-3 py-2 rounded mb-4"
              placeholder="Enter server address (e.g. 192.168.1.10:3001)"
              value={apiInput}
              onChange={e => setApiInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleApiSave(); }}
              autoFocus
              tabIndex={0}
              data-focusable-content
            />
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 rounded bg-gray-200" 
                onClick={() => setShowApiDialog(false)}
                tabIndex={0}
                data-focusable-content
              >
                Cancel
              </button>
              <button className="px-4 py-2 rounded bg-orange-500 text-white" 
                onClick={handleApiSave} 
                tabIndex={0}
                data-focusable-content
              >
                Save
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Type <b>nx</b> to reset to default ({import.meta.env.VITE_API_BASE})
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
