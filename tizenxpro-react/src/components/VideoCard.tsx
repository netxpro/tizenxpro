import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default function VideoCard({ video }: { video: Video}) {
  const navigate = useNavigate();

  const handleClick = () => {
    localStorage.setItem("currentVideo", JSON.stringify(video));
    navigate(`/player/${video.id}`, { state: { video } });
  };

  return (
    <Card
      className="w-full border border-border bg-card text-card-foreground shadow-sm transition-none flex flex-col gap-0 rounded-lg py-0 h-auto"
      data-focusable-content
      tabIndex={0}
      onClick={handleClick}
    >
      <div className="relative">
        <img
          src={
            video.thumbnail.src
              .replace(/(thumb-\d+x\d+|thumb-\d+p)/, "thumb-640x480")
          }
          className="w-full h-36 object-cover rounded-t-xl"
          draggable={false}
          loading="lazy"
        />
        <div className="absolute bottom-2 right-2 flex gap-2">
          {video.duration && (
            <Badge variant="secondary" className="bg-black/80 text-white px-2 py-0.5 text-xs">
              {video.duration}
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="px-3 py-2 flex-1 flex flex-col justify-between">
        <h3 className="text-sm font-semibold line-clamp-2">{video.title}</h3>
        <div className="flex items-center gap-2 mt-1 justify-end text-right">
          {video.source && (
            <Badge variant="outline" className="text-xs">{video.source}</Badge>
          )}
          {video.views && (
            <Badge variant="outline" className="text-xs">{video.views}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}