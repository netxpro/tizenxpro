import { useParams, useLocation } from "react-router-dom";
import { usePlayerLogic } from "@/components/player/playerLogic";
import PlayerVideo from "@/components/player/playerVideo";
import PlayerControls from "@/components/player/playerControls";
import type { UserSettings } from "@/types/userSettings";
import type { NavigationMode } from "@/types/navigationMode";
import { useState, useEffect } from "react";
import { Play, Pause } from "lucide-react"; 


export default function PlayerView({
  settings,
  setMode,
}: {
  settings: UserSettings;
  setMode?: (mode: NavigationMode) => void;
}) {
  const { id } = useParams();
  const location = useLocation();
  const [isBuffering, setIsBuffering] = useState(false);
  const [overlayTimeout, setOverlayTimeout] = useState<NodeJS.Timeout | null>(null);
  const [centerSymbol, setCenterSymbol] = useState<"play" | "pause" | null>(null);

  // All player state and logic is handled in this custom hook
  const player = usePlayerLogic(settings, location, id);

  useEffect(() => {
    if (isBuffering) {
      player.setShowControls(true);
      if (overlayTimeout) clearTimeout(overlayTimeout);
    } else if (player.showControls) {
      if (overlayTimeout) clearTimeout(overlayTimeout);
      setOverlayTimeout(setTimeout(() => player.setShowControls(false), 2000));
    }
    // eslint-disable-next-line
  }, [isBuffering]);

  // Set mode to "player" on mount, cleanup sets it to "content"
  useEffect(() => {
    setMode?.("player");
    return () => setMode?.("content");
  }, [setMode]);

  // Loading and error states
  if (!player.video) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white">
        ❌ Video not found
      </div>
    );
  }
  if (player.isLoading || !player.videoSrc) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white">
        <div className="absolute inset-0 flex items-center justify-center z-60 pointer-events-none">
          <div
            className="w-20 h-20 border-8 border-white border-t-orange-400 rounded-full animate-spin"
            style={{
              zIndex: 60,
            }}
          />
        </div>
      </div>
    );
  }

  // Main player UI
  return (
    <div
      ref={player.playerWrapperRef}
      className="fixed inset-0 z-50 bg-black text-white overflow-hidden flex items-center justify-center"
      tabIndex={0}
      onMouseMove={() => player.setShowControls(true)}
      onClick={() => player.setShowControls(true)}
    >
      {/* Overlay-Hintergrund */}
      {(player.showControls || !player.isPlaying) && (
        <div className="absolute inset-0 bg-black/70 z-40 transition-opacity duration-300" />
      )}

      {/* Top bar */}
      {(player.showControls || !player.isPlaying) && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 text-xl font-bold bg-black/70 px-4 py-2 rounded shadow-lg border-2 border-orange-500 text-orange-200">
          {player.video?.title || "Video"} - {player.video?.source || "unknown source"}
        </div>
      )}

      {/* Video und Untertitel */}
      <PlayerVideo
        videoRef={player.videoRef}
        videoSrc={player.videoSrc}
        selectedSubtitle={player.selectedSubtitle}
        setIsPlaying={player.setIsPlaying}
        setIsBuffering={setIsBuffering}
        setCenterSymbol={setCenterSymbol} // <--- NEU!
      />

      {/* Buffering Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center z-60 pointer-events-none">
          <div
            className="w-20 h-20 border-8 border-white border-t-orange-400 rounded-full animate-spin"
            style={{
              zIndex: 60,
            }}
          />
        </div>
      )}

      {/* Center Play/Pause Symbol */}
      {centerSymbol && (
        <div className="absolute inset-0 flex items-center justify-center z-60 pointer-events-none"
        style={{
              zIndex: 60,
            }}>
          {centerSymbol === "play" ? (
            <Play className="w-32 h-32 text-white drop-shadow-lg" style={{ filter: "drop-shadow(0 0 16px #000)" }} />
          ) : (
            <Pause className="w-32 h-32 text-white drop-shadow-lg" style={{ filter: "drop-shadow(0 0 16px #000)" }} />
          )}
        </div>
      )}

      {/* Controls */}
      {(player.showControls || !player.isPlaying) && (
        <PlayerControls
          isPlaying={player.isPlaying}
          currentTime={player.currentTime}
          duration={player.duration}
          subtitles={player.subtitles}
          selectedSubtitle={player.selectedSubtitle}
          setSelectedSubtitle={player.setSelectedSubtitle}
          videoSources={player.videoSources}
          selectedSource={player.selectedSource}
          handleQualityChange={player.handleQualityChange}
          showQualityMenu={player.showQualityMenu}
          setShowQualityMenu={player.setShowQualityMenu}
          showSubtitleMenu={player.showSubtitleMenu}
          setShowSubtitleMenu={player.setShowSubtitleMenu}
          formatTime={player.formatTime}
        />
      )}
    </div>
  );
}