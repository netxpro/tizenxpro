import type { RefObject } from "react";
import type { Subtitle } from "@/types/playerTypes";
import SubtitleOverlay from "@/components/player/subtitleOverlay";

type Props = {
  videoRef: RefObject<HTMLVideoElement | null>;
  videoSrc: string | null;
  selectedSubtitle: Subtitle | null;
  setIsBuffering: (b: boolean) => void;
  setIsPlaying: (b: boolean) => void;
  setCenterSymbol: (s: "play" | "pause" | null) => void;
};

export default function PlayerVideo({
  videoRef,
  videoSrc,
  selectedSubtitle,
  setIsBuffering,
  setIsPlaying,
  setCenterSymbol,
}: Props) {
  return (
    <div id="player" style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <video
        ref={videoRef}
        id="video"
        autoPlay
        style={{
          width: "100vw",
          height: "100vh",
          objectFit: "contain",
          position: "absolute",
          top: 0,
          left: 0,
        }}
        tabIndex={0}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlay={() => setIsBuffering(false)}
        onPlay={() => {
          setIsPlaying(true);
          setCenterSymbol("play");
          setTimeout(() => setCenterSymbol(null), 1200);
        }}
        onPause={() => {
          setIsPlaying(false);
          setCenterSymbol("pause");
          setTimeout(() => setCenterSymbol(null), 1200);
        }}
      >
        {videoSrc && (
          <source src={videoSrc} type="video/mp4" />
        )}
      </video>
      <SubtitleOverlay videoRef={videoRef} subtitleUrl={selectedSubtitle?.url} />
    </div>
  );
}