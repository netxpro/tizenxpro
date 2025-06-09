import { useEffect, useState } from "react";
import type { Platform, SettingsProps } from "@/types/settings";
import { settingOptions } from "@/types/settings"; // hier importieren
import { getApiUrl } from "@/utils/apiUrl";

export default function Settings({ setting, setSetting, platform, setPlatform }: SettingsProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const defaultApiUrl = import.meta.env.VITE_API_BASE;
  const [apiUrl, setApiUrl] = useState(getApiUrl());
  const API_BASE = getApiUrl() + "/platforms";
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [apiInput, setApiInput] = useState(apiUrl.replace(/\/api$/, ""));

  useEffect(() => {
    fetch(API_BASE)
      .then(res => res.json())
      .then(setPlatforms);
  }, []);

  const handleApiSave = () => {
    let url = apiInput.trim();
    if (url.toLowerCase() === "nx") {
      url = defaultApiUrl;
    } else {
      // /api anhängen, wenn nicht vorhanden
      if (!url.endsWith("/api")) url = url.replace(/\/+$/, "") + "/api";
    }
    setApiUrl(url);
    localStorage.setItem("apiUrl", url);
    setShowApiDialog(false);
    window.location.reload(); // App neu laden, damit überall die neue URL gilt
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>

      <label className="block mb-2 font-semibold">Orientation</label>
      <div className="flex gap-4 mb-6">
        {settingOptions.map(opt => (
          <button
            key={opt.value}
            className={`px-4 py-2 rounded font-medium border flex items-center gap-2
              ${setting === opt.value
                ? `bg-orange-500 text-white border-transparent`
                : "text-gray-700 bg-gray-200 border-gray-300 hover:bg-gray-300"}`}
            onClick={() => setSetting(opt.value)}
            tabIndex={0}
            data-focusable-content
            type="button"
          >
            <span>{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </div>

      <label className="block mb-2 font-semibold">Platform</label>
      <div className="flex gap-4 flex-wrap">
        {platforms.map(opt => (
          <button
            key={opt.id}
            className={`px-4 py-2 rounded font-medium border
              ${platform === opt.id
                ? "bg-orange-500 text-white border-transparent"
                : "text-gray-700 bg-gray-200 border-gray-300 hover:bg-gray-300"}`}
            onClick={() => setPlatform(opt.id)}
            tabIndex={0}
            data-focusable-content
            type="button"
            title={opt.comment}
          >
            {opt.label}
          </button>
        ))}
      </div>

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
              Type <b>nx</b> to reset to default ({defaultApiUrl})
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
