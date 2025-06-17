import { useEffect, useState, useRef, Suspense } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { VideoCardSkeleton } from "@/components/VideoCardSkeleton";
import type { Video } from "@/components/VideoCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import VideoCard from "@/components/VideoCard";
import { getApiUrl } from "@/components/get";
import type { UserSettings } from "@/types/userSettings";

export default function Home({ settings }: { settings: UserSettings }) {
  // State for API and local pagination
  const [apiPage, setApiPage] = useState(1); // Backend page
  const [localPage, setLocalPage] = useState(1); // Frontend page
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1); // For featured pagination
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const pageSize = 15;

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get("query") || "";
  const category = params.get("category") || "";

  const API_BASE = getApiUrl();
  const gridRef = useRef<HTMLDivElement>(null);

  const platform = settings.platform;
  const orientation = settings.orientation;

  // Helper to normalize API data
  const handleData = (data: any) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.videos)) return data.videos;
    if (
      data &&
      typeof data === "object" &&
      Object.keys(data).every((k) => !isNaN(Number(k)))
    ) {
      return Object.values(data);
    }
    if (data && typeof data === "object" && data.id) return [data];
    return [];
  };

  // Load featured videos if no category or query is set
  useEffect(() => {
    if (!category && !query) {
      setLoading(true);
      axios
        .get(
          `${API_BASE}/${platform}/featured?orientation=${orientation || ""}`
        )
        .then(({ data }) => {
          const vids = handleData(data);
          setVideos(vids);
        })
        .catch(() => {
          setVideos([]);
        })
        .finally(() => setLoading(false));
      setPage(1);
      return;
    }

    // Reset state when category or query changes
    setVideos([]);
    setPage(1);
    setHasMore(true);
  }, [category, query, settings, platform, orientation]);

  // Load videos for category or search
  useEffect(() => {
    if (!category && !query) return;
    setLoading(true);
    const url = category
      ? `${API_BASE}/${platform}/category?name=${encodeURIComponent(
          category
        )}&orientation=${orientation || ""}&page=${apiPage}`
      : `${API_BASE}/${platform}/search?query=${encodeURIComponent(
          query
        )}&orientation=${orientation || ""}&page=${apiPage}`;
    axios
      .get(url)
      .then(({ data }) => {
        setVideos(handleData(data));
        setLocalPage(1);
        setTotalPages(data.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [category, query, apiPage, settings, platform, orientation]);

  // Load more videos for infinite scroll or button
  const loadMore = () => {
    if (pagedVideos.length < videos.length) {
      setLocalPage((lp) => lp + 1);
    } else if (apiPage < totalPages) {
      setIsFetchingMore(true);
      setApiPage((ap) => ap + 1);
      setTimeout(() => setIsFetchingMore(false), 500);
    }
  };

  // Infinite scroll: load more when near bottom
  useEffect(() => {
    if (!category && !query) return;
    const handleScroll = () => {
      if (!gridRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        loadMore();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [category, query, page, hasMore, isFetchingMore]);

  // Keyboard navigation: load more on ArrowDown at end
  useEffect(() => {
    if (!category && !query) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        const cards = Array.from(
          document.querySelectorAll('[data-focusable-content]')
        );
        const active = document.activeElement;
        const idx = cards.indexOf(active as HTMLElement);
        if (idx === cards.length - 1 && hasMore && !isFetchingMore) {
          loadMore();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [videos, hasMore, isFetchingMore, category, query]);

  // Calculate paged videos for current view
  const pagedVideos = videos.slice(0, localPage * pageSize);
  const featuredPagedVideos = videos.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Helper for pagination range (with ellipsis)
  function getPaginationRange(page: number, totalPages: number, delta = 3) {
    const range = [];
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    range.push(1);
    if (left > 2) range.push("...");

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (right < totalPages - 1) range.push("...");
    if (totalPages > 1) range.push(totalPages);

    return range;
  }

  // Pagination range for featured or search/category
  const paginationRange = (!category && !query)
    ? getPaginationRange(page, Math.ceil(videos.length / pageSize))
    : getPaginationRange(page, totalPages);

  return (
    <div
      className="p-4 flex flex-col items-center"
      style={{ minHeight: "100vh" }}
    >
      {/* Video grid */}
      <div
        className="grid w-full max-w-10xl gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
        ref={gridRef}
      >
        {loading ? (
          // Show skeletons while loading
          Array.from({ length: pageSize }).map((_, i) => <VideoCardSkeleton key={i} />)
        ) : pagedVideos.length === 0 ? (
          // Show message if no videos found
          <div className="col-span-4 text-center text-muted-foreground py-12">
            No videos found.
          </div>
        ) : (
          <Suspense fallback={null}>
            {/* Featured: use featuredPagedVideos, else pagedVideos */}
            {!category && !query
              ? featuredPagedVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))
              : pagedVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
            {/* "Load More" indicator for infinite scroll */}
            {(category || query) && hasMore && (
              <div className="col-span-full flex justify-center py-4">
                {isFetchingMore ? (
                  <span className="text-muted-foreground">
                    Navigate down to load more
                  </span>
                ) : (
                  <button
                    className="px-4 py-2 rounded bg-muted text-muted-foreground"
                    onClick={loadMore}
                  >
                    {/* Load more */}
                  </button>
                )}
              </div>
            )}
          </Suspense>
        )}
      </div>
      {/* Pagination for featured */}
      {!category && !query && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                tabIndex={page <= 1 ? -1 : 0}
                aria-disabled={page <= 1}
                data-focusable-content
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) {
                    setPage(page - 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
              />
            </PaginationItem>
            {paginationRange.map((p, idx) =>
              p === "..." ? (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <span className="px-2 select-none">…</span>
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={page === p}
                    tabIndex={0}
                    data-focusable-content
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(Number(p));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                data-focusable-content
                tabIndex={page >= Math.ceil(videos.length / pageSize) ? -1 : 0}
                aria-disabled={page >= Math.ceil(videos.length / pageSize)}
                className={page >= Math.ceil(videos.length / pageSize) ? "pointer-events-none opacity-50" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  if (page < Math.ceil(videos.length / pageSize)) {
                    setPage(page + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* "Load more" and pagination for search/category */}
      {(category || query) && (
        <>
          {/* "Load more" button for local paging */}
          {pagedVideos.length < videos.length && (
            <div className="col-span-full flex justify-center py-4">
              {isFetchingMore ? (
                <span className="text-muted-foreground">Navigate down to load more</span>
              ) : (
                <button
                  className="px-4 py-2 rounded bg-muted text-muted-foreground"
                  onClick={loadMore}
                >
                  Load more
                </button>
              )}
            </div>
          )}

          {/* Pagination if all videos are loaded */}
          {pagedVideos.length >= videos.length && totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    tabIndex={apiPage <= 1 ? -1 : 0}
                    aria-disabled={apiPage <= 1}
                    data-focusable-content
                    className={apiPage <= 1 ? "pointer-events-none opacity-50" : ""}
                    onClick={(e) => {
                      e.preventDefault();
                      if (apiPage > 1) {
                        setApiPage(apiPage - 1);
                        setLocalPage(1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                  />
                </PaginationItem>
                {getPaginationRange(apiPage, totalPages).map((p, idx) =>
                  p === "..." ? (
                    <PaginationItem key={`ellipsis-${idx}`}>
                      <span className="px-2 select-none">…</span>
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={apiPage === p}
                        tabIndex={0}
                        data-focusable-content
                        onClick={(e) => {
                          e.preventDefault();
                          setApiPage(Number(p));
                          setLocalPage(1);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    data-focusable-content
                    tabIndex={apiPage >= totalPages ? -1 : 0}
                    aria-disabled={apiPage >= totalPages}
                    className={apiPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                    onClick={(e) => {
                      e.preventDefault();
                      if (apiPage < totalPages) {
                        setApiPage(apiPage + 1);
                        setLocalPage(1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}