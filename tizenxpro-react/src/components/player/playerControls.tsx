import { Button } from "@/components/ui/button";
// import { Play, Pause } from "lucide-react";
import type { VideoSource, Subtitle } from "@/types/playerTypes";
import { useEffect, useState } from "react";
import { proxify } from "./playerUtils";
import type { UserSettings } from "@/types/userSettings";


type Props = {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  subtitles: Subtitle[];
  selectedSubtitle: Subtitle | null;
  setSelectedSubtitle: (s: Subtitle | null) => void;
  videoSources: VideoSource[];
  selectedSource: VideoSource | null;
  handleQualityChange: (src: VideoSource) => void;
  showQualityMenu: boolean;
  setShowQualityMenu: (v: boolean) => void;
  showSubtitleMenu: boolean;
  setShowSubtitleMenu: (v: boolean) => void;
  formatTime: (t: number) => string;
  settings: UserSettings;
};

export default function PlayerControls({
  // isPlaying,
  currentTime,
  duration,
  subtitles,
  selectedSubtitle,
  setSelectedSubtitle,
  videoSources,
  selectedSource,
  handleQualityChange,
  showQualityMenu,
  setShowQualityMenu,
  showSubtitleMenu,
  setShowSubtitleMenu,
  formatTime,
  settings,
}: Props) {
  const [buffered, setBuffered] = useState(0);

  useEffect(() => {
    const video = document.getElementById("video") as HTMLVideoElement | null;
    if (!video) return;
    const updateBuffer = () => {
      if (video.buffered.length) {
        const end = video.buffered.end(video.buffered.length - 1);
        setBuffered((end / video.duration) * 100);
      }
    };
    video.addEventListener("progress", updateBuffer);
    video.addEventListener("timeupdate", updateBuffer);
    return () => {
      video.removeEventListener("progress", updateBuffer);
      video.removeEventListener("timeupdate", updateBuffer);
    };
  }, []);

  return (
    <div className="absolute bottom-0 left-0 w-full flex flex-col items-center pb-16 pt-32 transition-opacity duration-300 z-50">
      {/* Subtitle/Quality Menüs */}
      <div className="flex gap-8 mb-8">
        {/* Subtitle selection */}
        {subtitles.length > 0 && (
          <div className="relative">
            <Button
              className="bg-orange-500 text-white px-8 py-4 rounded shadow font-bold text-2xl"
              style={{ border: "2px solid #fff" }}
              onClick={() => setShowSubtitleMenu(!showSubtitleMenu)}
            >
              Captions: {selectedSubtitle ? selectedSubtitle.label : "Off"}
            </Button>
            {showSubtitleMenu && (
              <div className="absolute left-0 mt-2 bg-white text-orange-700 rounded shadow z-50 font-bold text-xl">
                {subtitles.map((sub) => (
                  <div
                    key={sub.lang}
                    className={`px-6 py-3 cursor-pointer hover:bg-orange-100 ${selectedSubtitle?.lang === sub.lang ? "bg-orange-200" : ""}`}
                    onClick={() => {
                      setSelectedSubtitle({
                        ...sub,
                        url: proxify(settings, sub.url)
                      });
                      setShowSubtitleMenu(false);
                    }}
                  >
                    {sub.label}
                  </div>
                ))}
                <div
                  className={`px-6 py-3 cursor-pointer hover:bg-orange-100 ${!selectedSubtitle ? "bg-orange-200" : ""}`}
                  onClick={() => {
                    setSelectedSubtitle(null);
                    setShowSubtitleMenu(false);
                  }}
                >
                  Off
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quality selection */}
        {videoSources.length > 1 && (
          <div className="relative">
            <Button
              className="bg-orange-500 text-white px-8 py-4 rounded shadow font-bold text-2xl"
              style={{ border: "2px solid #fff" }}
              onClick={() => setShowQualityMenu(!showQualityMenu)}
            >
              Quality: {selectedSource?.quality}p
            </Button>
            {showQualityMenu && (
              <div className="absolute left-0 mt-2 bg-white text-orange-700 rounded shadow z-50 font-bold text-xl">
                {videoSources.map((src) => (
                  <div
                    key={src.quality}
                    className={`px-6 py-3 cursor-pointer hover:bg-orange-100 ${selectedSource?.quality === src.quality ? "bg-orange-200" : ""}`}
                    onClick={() => {
                      handleQualityChange(src);
                      setShowQualityMenu(false);
                    }}
                  >
                    {src.quality}p
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Progressbar */}
      <div className="flex items-center w-full max-w-5xl px-8 mb-8 relative">
        <span
          className="font-mono w-20 text-right"
          style={{
            fontSize: "24px",
            color: "white",
            textShadow: "0 0 1px orange, 0 0 2px orange, 0 0 0.5px orange",
            fontWeight: "bold",
          }}
        >
          {formatTime(currentTime)}
        </span>
        <div className="relative flex-1 mx-8 h-6 rounded bg-gray-600 overflow-hidden shadow-lg">
          {/* Buffer */}
          <div
            className="absolute left-0 top-0 h-full bg-orange-200/60"
            style={{ width: `${buffered}%`, zIndex: 1 }}
          />
          {/* Progress */}
          <div
            className="absolute left-0 top-0 h-full bg-orange-500"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%`, zIndex: 2 }}
          />
        </div>
        <span
          className="font-mono w-20 text-left"
          style={{
            fontSize: "24px",
            color: "white",
            textShadow: "0 0 1px orange, 0 0 2px orange, 0 0 0.5px orange",
            fontWeight: "bold",
          }}
        >
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}