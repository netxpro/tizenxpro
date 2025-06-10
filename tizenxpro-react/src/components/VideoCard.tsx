import { useNavigate } from "react-router-dom";

export interface Video {
  id: string;
  title: string;
  thumbnail: { src: string };
  views?: string;
  duration?: string;
  source?: string;
  [key: string]: any;
}

export default function VideoCard({ video }: { video: Video }) {
  const navigate = useNavigate();

  const handleClick = () => {
    localStorage.setItem("currentVideo", JSON.stringify(video));
    navigate(`/player/${video.id}`, { state: { video } });
  };

  return (
    <div
      className="video-card-minimal w-full border border-border bg-card text-card-foreground shadow-sm flex flex-col gap-0 rounded-lg py-0 h-auto cursor-pointer focus:outline-2 focus:outline-sky-400"
      data-focusable-content
      tabIndex={0}
      onClick={handleClick}
      style={{
        minHeight: 220,
        outline: "none",
        transition: "box-shadow 0.1s",
      }}
    >
      <div style={{ position: "relative" }}>
        <img
          src={video.thumbnail?.src}
          // alt={video.title}
          className="w-full h-36 object-cover rounded-t-xl"
          draggable={false}
          loading="lazy"
          style={{
            width: "100%",
            height: 144,
            objectFit: "cover",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
        {video.duration && (
          <span
            className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-0.5 text-xs rounded"
            style={{
              background: "rgba(0,0,0,0.8)",
              color: "#fff",
              borderRadius: 4,
              padding: "4px 8px 6px 8px",
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            {video.duration}
          </span>
        )}
      </div>
      <div className="px-3 py-2 flex-1 flex flex-col justify-between">
        <h3
          className="text-sm font-semibold line-clamp-2"
          style={{
            fontSize: 18,
            fontWeight: 600,
            lineHeight: "1.3",
            marginBottom: 4,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {video.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 justify-end text-right">
          {video.source && (
            <span
              className="badge"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid #fff2",
                borderRadius: 4,
                padding: "2px 8px 4px 8px",
                color: "#fff",
                fontSize: 16,
              }}
            >
              {video.source}
            </span>
          )}
          {video.views && (
            <span
              className="badge"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid #fff2",
                borderRadius: 4,
                padding: "2px 8px 4px 8px",
                color: "#fff",
                fontSize: 16,
              }}
            >
              {video.views}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}