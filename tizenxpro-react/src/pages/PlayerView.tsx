import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause } from "lucide-react";
import type { NavigationMode } from "@/types/navigationMode";
import { getApiUrl } from "@/utils/apiUrl";
import Hls from "hls.js";
import type { UserSettings } from "@/types/userSettings";

const API_BASE = getApiUrl();

export default function PlayerView({
  settings,
  setMode,
}: {
  settings: UserSettings;
  setMode?: (mode: NavigationMode) => void;
}) {
  const platform = settings.platform;

  const videoRef = useRef<HTMLVideoElement>(null);
  const { id } = useParams();
  const location = useLocation();
  const [video, setVideo] = useState<any>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const playerWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadVideo = async () => {
      setIsLoading(true);
      try {
        const passedVideo = location.state?.video || JSON.parse(localStorage.getItem("currentVideo") || "null");
        if (!passedVideo) {
          setVideo(null);
          setVideoSrc(null);
          setIsLoading(false);
          return;
        }
        setVideo(passedVideo);
        const res = await axios.get(`${API_BASE}/${platform}/vidurl`, { 
          params: { url: passedVideo.url },
        });
        const directUrl = res.data?.directUrl;
        if (!directUrl) {
          setVideoSrc(null);
        } else {
          const finalUrl = `${API_BASE}/${platform}/proxy?url=${encodeURIComponent(directUrl)}`; 
          setVideoSrc(finalUrl);
        }
      } catch (err) {
        setVideoSrc(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadVideo();
  }, [id, location.state]);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const onTimeUpdate = () => setCurrentTime(videoEl.currentTime);
    const onLoadedMetadata = () => setDuration(videoEl.duration);

    videoEl.addEventListener("timeupdate", onTimeUpdate);
    videoEl.addEventListener("loadedmetadata", onLoadedMetadata);

    return () => {
      videoEl.removeEventListener("timeupdate", onTimeUpdate);
      videoEl.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, [videoSrc, videoRef]);

  useEffect(() => {
    if (!showControls) return;
    const timeout = setTimeout(() => setShowControls(false), 10000);
    return () => clearTimeout(timeout);
  }, [showControls]);

  useEffect(() => {
    const show = () => setShowControls(true);
    window.addEventListener("mousemove", show);
    window.addEventListener("click", show);
    return () => {
      window.removeEventListener("mousemove", show);
      window.removeEventListener("click", show);
    };
  }, [setShowControls]);

  useEffect(() => {
    if (playerWrapperRef.current && document.fullscreenElement !== playerWrapperRef.current) {
      playerWrapperRef.current.requestFullscreen?.();
    }
  }, []);

  useEffect(() => {
    setMode?.("player");
    return () => setMode?.("content");
  }, [setMode]);

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const showControls = () => setShowControls(true);
    const seek = (e: any) => {
      setShowControls(true);
      if (videoRef.current) videoRef.current.currentTime += e.detail;
    };
    const playPause = () => {
      setShowControls(true);
      if (videoRef.current) {
        if (videoRef.current.paused) videoRef.current.play();
        else videoRef.current.pause();
      }
    };
    window.addEventListener("player-show-controls", showControls);
    window.addEventListener("player-seek", seek);
    window.addEventListener("player-playpause", playPause);
    return () => {
      window.removeEventListener("player-show-controls", showControls);
      window.removeEventListener("player-seek", seek);
      window.removeEventListener("player-playpause", playPause);
    };
  }, []);

  useEffect(() => {
    if (!videoSrc || !videoRef.current) return;

    const video = videoRef.current;

    if (videoSrc.endsWith(".m3u8")) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          liveSyncDuration: 10,
          enableWorker: true,
        });
        hls.loadSource(videoSrc);
        hls.attachMedia(video);

        hls.on(Hls.Events.ERROR, (data) => {
          console.error("HLS error:", data);
        });

        // Clean up
        return () => {
          hls.destroy();
        };
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoSrc;
      }
    } else {
      video.src = videoSrc;
    }
  }, [videoSrc]);

  if (!video) {
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white">❌ Video not found</div>;
  }
  if (isLoading || !videoSrc) {
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white">⏳ Video is loading...</div>;
  }

  return (
    <div
      ref={playerWrapperRef}
      className="fixed inset-0 z-50 bg-black text-white overflow-hidden flex items-center justify-center"
      tabIndex={0}
      onMouseMove={() => setShowControls(true)}
      onClick={() => setShowControls(true)}
    >
      {/* back-Button */}
      {showControls && (
        <>
          {/* <Button
            size="icon"
            variant="ghost"
            className="absolute top-4 left-4 z-60 bg-black/60 hover:bg-black/80 rounded-full p-2 focus:outline-none"
            onClick={() => navigate(-1)}
            aria-label="back"
            tabIndex={0}
            data-focusable-player
          >
            <ArrowLeft className="w-7 h-7" />
          </Button> */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-60 text-xl font-bold bg-black/60 px-4 py-2 rounded">
            {video?.title || "Video"} - {video?.source || "unknown source"}
          </div>
        </>
      )}

      <video
        ref={videoRef}
        src={videoSrc}
        controls={false}
        autoPlay
        style={{ width: "100vw", height: "100vh", objectFit: "contain" }}
        tabIndex={0}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 w-full flex flex-col items-center pb-8 pt-24 transition-opacity duration-300">
          {/* Progressbar */}
          <div className="flex items-center w-full max-w-3xl px-4 mb-4">
            <span className="text-sm font-mono w-14 text-right">{formatTime(currentTime)}</span>
            <Progress
              value={duration ? (currentTime / duration) * 100 : 0}
              className="flex-1 mx-4 h-2"
            />
            <span className="text-sm font-mono w-14 text-left">{formatTime(duration)}</span>
          </div>
          {/* Buttons */}
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full bg-black/60 hover:bg-black/80"
              onClick={() => {
                if (videoRef.current) {
                  if (videoRef.current.paused) videoRef.current.play();
                  else videoRef.current.pause();
                }
              }}
              aria-label={isPlaying ? "Pause" : "Play"}
              // tabIndex={0}
              // data-focusable-player
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}