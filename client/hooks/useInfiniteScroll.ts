import { useEffect, useRef, useCallback } from "react";
import { useMessageStore } from "@/store/useMessage";
import { getMessages } from "@/api/getMessages";

interface UseInfiniteScrollProps {
  sessionId: string;
  enabled: boolean;
}

export const useInfiniteScroll = ({
  sessionId,
  enabled,
}: UseInfiniteScrollProps) => {
  const {
    messages,
    hasMore,
    isLoading,
    loadMoreMessages,
    setLoading,
    currentOffset,
  } = useMessageStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (!enabled || isLoadingRef.current || !hasMore || isLoading) {
      return;
    }

    isLoadingRef.current = true;
    setLoading(true);

    try {
      console.log(`📜 Loading more messages... (offset: ${currentOffset})`);
      const response = await getMessages(sessionId, 20, currentOffset);

      if (response.status === "success" && response.data.messages) {
        const newMessages = response.data.messages;
        const totalCount = response.data.pagination?.total || 0;
        const hasMoreMessages = currentOffset + newMessages.length < totalCount;

        loadMoreMessages(newMessages, hasMoreMessages);
        console.log(
          `✅ Loaded ${newMessages.length} more messages (hasMore: ${hasMoreMessages})`
        );
      }
    } catch (error) {
      console.error("Failed to load more messages:", error);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [
    sessionId,
    currentOffset,
    hasMore,
    isLoading,
    enabled,
    loadMoreMessages,
    setLoading,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    const handleScroll = () => {
      // Check if scrolled to top
      if (container.scrollTop === 0 && hasMore && !isLoading) {
        const previousScrollHeight = container.scrollHeight;

        loadMore().then(() => {
          // Maintain scroll position after loading
          requestAnimationFrame(() => {
            if (container) {
              const newScrollHeight = container.scrollHeight;
              container.scrollTop = newScrollHeight - previousScrollHeight;
            }
          });
        });
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [loadMore, hasMore, isLoading, enabled]);

  return {
    containerRef,
    loadMore,
    hasMore,
    isLoading,
  };
};
