import { useEffect, useRef } from "react";

export function useInfiniteScroll(
  onLoadMore: () => void,
  enabled: boolean
) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
    enabledRef.current = enabled;
  });

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && enabledRef.current) {
          onLoadMoreRef.current();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return sentinelRef;
}
