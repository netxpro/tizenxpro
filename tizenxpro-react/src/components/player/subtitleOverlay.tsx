import { useEffect, useState } from "react";
import subtitlesParser from "subtitles-parser-vtt";

function parseTimeToSeconds(time: string): number {
  const parts = time.split(":");
  let h = 0,
    m = 0,
    s = 0,
    ms = 0;
  if (parts.length === 3) {
    h = parseInt(parts[0]);
    m = parseInt(parts[1]);
    [s, ms] = parts[2].split(".").map(Number);
  } else if (parts.length === 2) {
    m = parseInt(parts[0]);
    [s, ms] = parts[1].split(".").map(Number);
  }
  return (
    h * 3600 +
    m * 60 +
    s +
    (ms ? ms / Math.pow(10, ms.toString().length) : 0)
  );
}

export default function SubtitleOverlay({
  videoRef,
  subtitleUrl,
}: {
  videoRef: any;
  subtitleUrl?: string;
}) {
  const [cues, setCues] = useState<any[]>([]);
  const [currentText, setCurrentText] = useState("");

  useEffect(() => {
    if (!subtitleUrl) return;
    fetch(subtitleUrl)
      .then(res => res.text())
      .then(vtt => {
        // format mm:ss.mmm to 00:mm:ss.mmm
        const fixedVtt = vtt.replace(
          /(^|\s)(\d{2}:\d{2}\.\d{3})/gm,
          (match, p1, p2) => {
            if (p1.match(/(\d{2}:)$/)) return match;
            return `${p1}00:${p2}`;
          }
        );
        const cues = subtitlesParser.fromVtt(fixedVtt);
        setCues(cues);
      });
  }, [subtitleUrl]);

  useEffect(() => {
    if (!videoRef.current) return;
    const interval = setInterval(() => {
      const time = videoRef.current.currentTime;
      const cue = cues.find(c => {
        const start = parseTimeToSeconds(c.startTime);
        const end = parseTimeToSeconds(c.endTime);
        return time >= start && time <= end;
      });
      setCurrentText(cue ? cue.text : "");
    }, 200);
    return () => clearInterval(interval);
  }, [cues, videoRef]);

  return (
    <div
        className="subtitle-overlay"
        dangerouslySetInnerHTML={{ __html: currentText.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&lt;b&gt;/g, "<b>").replace(/&lt;\/b&gt;/g, "</b>") }}
        />
  );
}