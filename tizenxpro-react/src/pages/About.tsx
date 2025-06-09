import { useEffect, useState } from "react";

declare global {
  interface Window {
    NativeShell?: {
      AppHost?: {
        appName: () => string;
        appVersion: () => string;
        deviceName: () => string;
        deviceId: () => string;
        screen?: () => { width: number; height: number };
      };
    };
  }
}

export default function About() {
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  useEffect(() => {
    // Infos from tizen.js
    if (window.NativeShell?.AppHost) {
      setDeviceInfo({
        appName: window.NativeShell.AppHost.appName(),
        appVersion: window.NativeShell.AppHost.appVersion(),
        deviceName: window.NativeShell.AppHost.deviceName(),
        deviceId: window.NativeShell.AppHost.deviceId(),
        screen: window.NativeShell.AppHost.screen?.(),
      });
    }
  }, []);

  return (
    <div className="p-8 max-w-xl mx-auto text-center">
      <img src="/img/logo_land.png" alt="App Logo" className="mx-auto mb-6 w-48" />
      <h2 className="text-2xl font-bold mb-2">tizenxpro</h2>
      <div className="mb-2">A open-source video browser for Samsung Smart TVs.</div>
      <div className="my-6 text-left text-sm space-y-1">
        {deviceInfo ? (
          <>
            <div><b>App Name:</b> {deviceInfo.appName}</div>
            <div><b>App Version:</b> {import.meta.env.VITE_APP_VERSION}</div>
            {/* <div><b>Device ID:</b> {deviceInfo.deviceId}</div> */}
            {deviceInfo.screen && (
              <div>
                <b>Resolution:</b> {deviceInfo.screen.width} × {deviceInfo.screen.height}
              </div>
            )}
            <div>
              <b>User Agent:</b> {navigator.userAgent}
            </div>
          </>
        ) : (
          <div className="text-gray-400">No Tizen device info available.</div>
        )}
      </div>
      <div className="mt-6">
        <a
          href="https://github.com/propani/tizenxpro"
          className="text-blue-400 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Source on GitHub
        </a>
      </div>
      <div className="text-xs text-gray-400 mt-8">Made with ❤️ by propani.</div>
    </div>
  );
}