import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface VirtualListProps<T> {
  items: T[];
  estimateSize: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
  /** Minimum number of items before enabling virtual scrolling */
  threshold?: number;
  /** Maximum height of the virtual container (px) */
  maxHeight?: number;
  getItemKey?: (item: T, index: number) => string | number;
}

/**
 * Generic virtual scrolling list.
 * Only activates when items exceed the threshold (default 20).
 * Below the threshold, renders all items normally for simplicity.
 */
export function VirtualList<T>({
  items,
  estimateSize,
  renderItem,
  className = "",
  overscan = 5,
  threshold = 20,
  maxHeight = 600,
  getItemKey,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  // Below threshold: render normally without virtualization
  if (items.length <= threshold) {
    return (
      <div className={className}>
        {items.map((item, index) => (
          <div key={getItemKey ? getItemKey(item, index) : index}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={className}
      style={{ maxHeight, overflow: "auto" }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const item = items[virtualRow.index];
          return (
            <div
              key={getItemKey ? getItemKey(item, virtualRow.index) : virtualRow.index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {renderItem(item, virtualRow.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
