import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause } from "lucide-react";
import type { NavigationMode } from "@/types/navigationMode";
import { getApiUrl } from "@/utils/apiUrl";
import type { UserSettings } from "@/types/userSettings";

const API_BASE = getApiUrl();

type VideoSource = {
  quality: string;
  url: string;
  source?: string; // Added for clarity
};

type Subtitle = {
  lang: string;
  label: string;
  url: string;
};

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

  const [videoSources, setVideoSources] = useState<VideoSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<VideoSource | null>(null);

  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [selectedSubtitle, setSelectedSubtitle] = useState<Subtitle | null>(null);

  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);

  const playerWrapperRef = useRef<HTMLDivElement>(null);

  // ASS.js instance ref for cleanup
  const assInstance = useRef<any>(null);

  // Load video and subtitle sources on mount or when id/location changes
  useEffect(() => {
    const loadVideo = async () => {
      setIsLoading(true);
      try {
        // Try to get video from navigation state or localStorage
        const passedVideo = location.state?.video || JSON.parse(localStorage.getItem("currentVideo") || "null");
        if (!passedVideo) {
          setVideo(null);
          setVideoSrc(null);
          setIsLoading(false);
          return;
        }
        setVideo(passedVideo);

        // Fetch video and subtitle sources from backend
        const res = await axios.get(`${API_BASE}/${platform}/vidurl`, { 
          params: { url: passedVideo.url },
        });

        const source = res.data?.source || {};
        const videoArr = source.videoArr || [];
        const subtitlesArr = source.subtitlesArr || [];

        setVideoSources(videoArr.map((src: VideoSource) => ({
          ...src,
          url: src.url
        })));
        setSubtitles(subtitlesArr.map((sub: Subtitle) => ({
          ...sub,
          url: sub.url
        })));

        // Select first video source by default
        if (videoArr.length > 0) {
          setSelectedSource(videoArr[0]);
          setVideoSrc(proxify(videoArr[0].source, videoArr[0].url));
        } else {
          setVideoSrc(null);
        }

        // Select English subtitle by default, or first if not available
        if (subtitlesArr.length > 0) {
          const enSub = subtitlesArr.find((s: Subtitle) => s.lang === "en");
          setSelectedSubtitle(enSub || subtitlesArr[0]);
        }
      } catch (err) {
        setVideoSrc(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadVideo();
  }, [id, location.state]);

  // Update current time and duration
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

  // Hide controls after 10 seconds of inactivity
  useEffect(() => {
    if (!showControls) return;
    const timeout = setTimeout(() => setShowControls(false), 10000);
    return () => clearTimeout(timeout);
  }, [showControls]);

  // Show controls on mouse or click
  useEffect(() => {
    const show = () => setShowControls(true);
    window.addEventListener("mousemove", show);
    window.addEventListener("click", show);
    return () => {
      window.removeEventListener("mousemove", show);
      window.removeEventListener("click", show);
    };
  }, []);

  // Request fullscreen on mount
  useEffect(() => {
    if (playerWrapperRef.current && document.fullscreenElement !== playerWrapperRef.current) {
      playerWrapperRef.current.requestFullscreen?.();
    }
  }, []);

  // Set navigation mode on mount/unmount
  useEffect(() => {
    setMode?.("player");
    return () => setMode?.("content");
  }, [setMode]);

  // Format seconds to mm:ss
  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Keyboard and custom events for player controls
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

  // Handle video source changes (HLS, DASH, MP4, etc.)
  useEffect(() => {
    if (!videoSrc || !videoRef.current) return;

    const video = videoRef.current;

    // HLS
    if (videoSrc.endsWith(".m3u8")) {
      const script = document.createElement("script");
      script.src = "/data/hls.js";
      script.async = true;
      script.onload = () => {
        // @ts-ignore
        const Hls = window.Hls;
        if (Hls && Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(videoSrc);
          hls.attachMedia(video);

          hls.on(Hls.Events.ERROR, (data: any) => {
            console.error("HLS error:", data);
          });

          // Clean up
          return () => {
            hls.destroy();
          };
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = videoSrc;
        }
      };
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
    // DASH
    else if (videoSrc.endsWith(".mpd")) {
      const script = document.createElement("script");
      script.src = "/data/dash.all.min_v4.7.4.js";
      script.async = true;
      script.onload = () => {
        // @ts-ignore
        const dashjs = window.dashjs;
        if (dashjs && dashjs.MediaPlayer) {
          // @ts-ignore
          const player = dashjs.MediaPlayer().create();
          player.updateSettings({ debug: { logLevel: dashjs.Debug.LOG_LEVEL_NONE } });
          player.initialize(video, videoSrc, true);
        } else {
          video.src = videoSrc;
        }
      };
      document.body.appendChild(script);

      // Clean up Script
      return () => {
        document.body.removeChild(script);
      };
    }
    // MP4 or other direct sources
    else {
      video.src = videoSrc;
    }
  }, [videoSrc]);

  // Handle quality change (keep current time)
  function handleQualityChange(src: any) {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      setSelectedSource(src);
      setVideoSrc(proxify(src.source, src.url));
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = current;
          videoRef.current.play();
        }
      }, 500);
    }
  }

  // Proxy logic for sources (only use proxy for non-direct sources)
  function proxify(source: string, url: string) {
    // Add more platforms if needed
    if (source === "xhamster" || source === "hstream") {
      return url;
    }
    return `${API_BASE}/${platform}/proxy?url=${encodeURIComponent(url)}`;
  }

  // ASS.js subtitle overlay logic
  useEffect(() => {
    // Clean up previous instance
    if (assInstance.current) {
      assInstance.current.destroy();
      assInstance.current = null;
    }

    // Only for .ass subtitles
    if (
      selectedSubtitle &&
      selectedSubtitle.url &&
      selectedSubtitle.url.endsWith(".ass") &&
      videoRef.current
    ) {
      const loadAss = async () => {
        // @ts-ignore
        const ASS = window.ASS;
        if (!ASS) {
          // Dynamically load ASS.js if not already loaded
          const script = document.createElement("script");
          script.src = "/data/ass.global.min.js";
          script.async = true;
          script.onload = () => loadAss();
          document.body.appendChild(script);
          return;
        }
        // Fetch .ass file as text
        const content = await fetch(selectedSubtitle.url).then((res) => res.text());
        assInstance.current = new ASS(content, videoRef.current, {
          container: document.getElementById("ass-container"),
          resampling: "video_height",
          fonts: [
            "/fonts/OpenSans-Bold.ttf",
            "/fonts/OpenSans-BoldItalic.ttf",
            "/fonts/OpenSans-ExtraBold.ttf",
            "/fonts/OpenSans-ExtraBoldItalic.ttf",
            "/fonts/OpenSans-Italic.ttf",
            "/fonts/OpenSans-Light.ttf",
            "/fonts/OpenSans-LightItalic.ttf",
            "/fonts/OpenSans-Medium.ttf",
            "/fonts/OpenSans-MediumItalic.ttf",
            "/fonts/OpenSans-Regular.ttf",
            "/fonts/OpenSans-SemiBold.ttf",
            "/fonts/OpenSans-SemiBoldItalic.ttf",
            "/fonts/Figtree-ExtraBold.ttf",
            "/fonts/Figtree-Medium.ttf",
            "/fonts/Figtree-Regular.ttf",
          ],
          fallbackFont: "Figtree", // Use Open Sans or Figtree as fallback
        });
      };
      loadAss();
    }
    // Clean up on unmount or subtitle change
    return () => {
      if (assInstance.current) {
        assInstance.current.destroy();
        assInstance.current = null;
      }
    };
  }, [selectedSubtitle, videoSrc]);

  // Activate .vtt subtitles programmatically (for custom controls)
  useEffect(() => {
    if (
      selectedSubtitle &&
      selectedSubtitle.url.includes(".vtt") &&
      videoRef.current
    ) {
      const video = videoRef.current;
      // Wait for <track> to load
      setTimeout(() => {
        for (let i = 0; i < video.textTracks.length; i++) {
          const track = video.textTracks[i];
          // Enable only the selected language/label
          if (
            track.language === selectedSubtitle.lang ||
            track.label === selectedSubtitle.label
          ) {
            track.mode = "showing";
          } else {
            track.mode = "disabled";
          }
        }
      }, 500);
    }
  }, [selectedSubtitle, videoSrc]);

  // Render loading or error states
  if (!video) {
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white">❌ Video not found</div>;
  }
  if (isLoading || !videoSrc) {
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white">⏳ Video is loading...</div>;
  }

  // Main player UI
  return (
    <div
      ref={playerWrapperRef}
      className="fixed inset-0 z-50 bg-black text-white overflow-hidden flex items-center justify-center"
      tabIndex={0}
      onMouseMove={() => setShowControls(true)}
      onClick={() => setShowControls(true)}
    >
      {/* Top bar with video title */}
      {showControls && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-60 text-xl font-bold bg-black/60 px-4 py-2 rounded">
          {video?.title || "Video"} - {video?.source || "unknown source"}
        </div>
      )}

      {/* Video and subtitle overlay */}
      <div id="player" style={{ position: "relative", width: "100vw", height: "100vh" }}>
        <video
          ref={videoRef}
          id="video"
          controls={false}
          autoPlay
          style={{ width: "100vw", height: "100vh", objectFit: "contain", position: "absolute", top: 0, left: 0 }}
          tabIndex={0}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          {/* Native .vtt subtitles */}
          {selectedSubtitle && selectedSubtitle.url.includes(".vtt") && (
            <track
              kind="subtitles"
              src={selectedSubtitle.url}
              srcLang={selectedSubtitle.lang}
              label={selectedSubtitle.label}
              default
            />
          )}
        </video>
        {/* ASS.js overlay container */}
        <div id="ass-container" style={{ position: "absolute", top: 0, left: 0, width: "100vw", height: "100vh", pointerEvents: "none" }} />
      </div>

      {/* Player controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 w-full flex flex-col items-center pb-8 pt-24 transition-opacity duration-300">
          <div className="flex gap-4 mb-4">
            {/* Subtitle selection */}
            {subtitles.length > 0 && (
              <div className="relative">
                <Button
                  className="bg-pink-600 text-white px-4 py-2 rounded"
                  onClick={() => setShowSubtitleMenu((v) => !v)}
                >
                  Captions: {selectedSubtitle ? selectedSubtitle.label : "Off"}
                </Button>
                {showSubtitleMenu && (
                  <div className="absolute left-0 mt-2 bg-white text-black rounded shadow z-50">
                    {subtitles.map((sub: Subtitle) => (
                      <div
                        key={sub.lang}
                        className={`px-4 py-2 cursor-pointer ${selectedSubtitle?.lang === sub.lang ? "bg-pink-200" : ""}`}
                        onClick={() => {
                          setSelectedSubtitle(sub);
                          setShowSubtitleMenu(false);
                        }}
                      >
                        {sub.label}
                      </div>
                    ))}
                    <div
                      className={`px-4 py-2 cursor-pointer ${!selectedSubtitle ? "bg-pink-200" : ""}`}
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
                  className="bg-gray-200 text-black px-4 py-2 rounded"
                  onClick={() => setShowQualityMenu((v) => !v)}
                >
                  Quality: {selectedSource?.quality}p
                </Button>
                {showQualityMenu && (
                  <div className="absolute left-0 mt-2 bg-white text-black rounded shadow z-50">
                    {videoSources.map((src: VideoSource) => (
                      <div
                        key={src.quality}
                        className={`px-4 py-2 cursor-pointer ${selectedSource?.quality === src.quality ? "bg-gray-300" : ""}`}
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
          {/* Progress bar */}
          <div className="flex items-center w-full max-w-3xl px-4 mb-4">
            <span className="text-sm font-mono w-14 text-right">{formatTime(currentTime)}</span>
            <Progress
              value={duration ? (currentTime / duration) * 100 : 0}
              className="flex-1 mx-4 h-2"
            />
            <span className="text-sm font-mono w-14 text-left">{formatTime(duration)}</span>
          </div>
          {/* Play/Pause button */}
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
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}