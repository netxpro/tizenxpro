import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { proxify, formatTime } from "./playerUtils";
import type { VideoSource, Subtitle } from "@/types/playerTypes";
import type { UserSettings } from "@/types/userSettings";
import { getApiUrl } from "@/components/get"; 

export function usePlayerLogic(
  settings: UserSettings,
  location: any,
  id: string | undefined,
  setMode?: (mode: string) => void
) {
  const API_BASE = getApiUrl();
  const platform = settings.platform;

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerWrapperRef = useRef<HTMLDivElement>(null);

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

  // Load video and subtitle sources on mount or when id/location changes
  useEffect(() => {
    const loadVideo = async () => {
      setIsLoading(true);
      try {
        const passedVideo =
          location.state?.video ||
          JSON.parse(localStorage.getItem("currentVideo") || "null");
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

        const source = res.data?.source || {};
        const videoArr = source.videoArr || [];
        const subtitlesArr = source.subtitlesArr || [];

        setVideoSources(videoArr.map((src: VideoSource) => ({ ...src, url: src.url })));
        setSubtitles(subtitlesArr.map((sub: Subtitle) => ({ ...sub, url: sub.url })));
        // console.log("Video sources:", videoArr);
        console.log("Subtitles:", subtitlesArr);
        if (videoArr.length > 0) {
          setSelectedSource(videoArr[0]);
          setVideoSrc(proxify(settings, videoArr[0].url));
        } else {
          setVideoSrc(null);
        }

        if (subtitlesArr.length > 0) {
          const enSub = subtitlesArr.find((s: Subtitle) => s.lang === "en");
          const subtitleObj = enSub || subtitlesArr[0];
          if (subtitleObj) {
            console.log("Selected subtitle:", subtitleObj);
            setSelectedSubtitle({
              ...subtitleObj,
              url: proxify(settings, subtitleObj.url)
            });
          }
        }
      } catch (err) {
        setVideoSrc(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadVideo();
    // eslint-disable-next-line
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
    if (
      playerWrapperRef.current &&
      document.fullscreenElement !== playerWrapperRef.current
    ) {
      playerWrapperRef.current.requestFullscreen?.();
    }
  }, []);

  // Set navigation mode on mount/unmount
  useEffect(() => {
    setMode?.("player");
    return () => setMode?.("content");
  }, [setMode]);

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
      setVideoSrc(proxify(settings, src.url));
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = current;
          videoRef.current.play();
        }
      }, 500);
    }
  }

  // Activate .vtt subtitles programmatically (for custom controls)
  useEffect(() => {
    if (
      selectedSubtitle &&
      // selectedSubtitle.url.includes(".vtt") &&
      videoRef.current
    ) {
      const video = videoRef.current;
      setTimeout(() => {
        for (let i = 0; i < video.textTracks.length; i++) {
          const track = video.textTracks[i];
          if (
            track.language === selectedSubtitle.lang ||
            track.label === selectedSubtitle.label
          ) {
            track.mode = "showing";
          } else {
            track.mode = "disabled";
          }
        }
        console.log(selectedSubtitle);
      }, 500);
    }
  }, [selectedSubtitle, videoSrc]);

  return {
    videoRef,
    playerWrapperRef,
    video,
    videoSrc,
    isLoading,
    showControls,
    setShowControls,
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    videoSources,
    selectedSource,
    setSelectedSource,
    setVideoSrc,
    subtitles,
    selectedSubtitle,
    setSelectedSubtitle,
    setVideoSources,
    setSubtitles,
    setVideo,
    setIsLoading,
    showQualityMenu,
    setShowQualityMenu,
    showSubtitleMenu,
    setShowSubtitleMenu,
    handleQualityChange,
    formatTime,
  };
}