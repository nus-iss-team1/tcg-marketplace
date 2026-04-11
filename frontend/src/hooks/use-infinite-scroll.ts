import { useEffect, useRef } from "react";

export function useInfiniteScroll(
  onLoadMore: () => void,
  enabled: boolean,
  resetKey?: string
) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  });

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMoreRef.current();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [resetKey, enabled]);

  return sentinelRef;
}
