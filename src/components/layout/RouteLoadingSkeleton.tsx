interface RouteLoadingSkeletonProps {
  variant?: "overview" | "channel" | "article" | "canvas";
}

function LoadingBlock({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`site-loading-block ${className}`} />;
}

export function RouteLoadingSkeleton({
  variant = "overview",
}: RouteLoadingSkeletonProps) {
  return (
    <div
      className="site-loading-shell"
      data-variant={variant}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">页面加载中</span>

      {variant === "overview" && (
        <div className="site-loading-frame">
          <LoadingBlock className="site-loading-kicker" />
          <LoadingBlock className="site-loading-title" />
          <LoadingBlock className="site-loading-copy site-loading-copy--wide" />
          <LoadingBlock className="site-loading-copy site-loading-copy--short" />
          <div className="site-loading-card-grid">
            <LoadingBlock className="site-loading-card" />
            <LoadingBlock className="site-loading-card" />
            <LoadingBlock className="site-loading-card" />
          </div>
        </div>
      )}

      {variant === "channel" && (
        <div className="site-loading-frame site-loading-channel">
          <div className="site-loading-channel-copy">
            <LoadingBlock className="site-loading-kicker" />
            <LoadingBlock className="site-loading-display" />
            <LoadingBlock className="site-loading-copy site-loading-copy--wide" />
            <LoadingBlock className="site-loading-copy" />
            <LoadingBlock className="site-loading-copy site-loading-copy--short" />
          </div>
          <LoadingBlock className="site-loading-channel-media" />
        </div>
      )}

      {variant === "article" && (
        <div className="site-loading-frame">
          <LoadingBlock className="site-loading-breadcrumb" />
          <div className="site-loading-article">
            <div>
              <LoadingBlock className="site-loading-display" />
              <LoadingBlock className="site-loading-display site-loading-display--short" />
              <LoadingBlock className="site-loading-copy site-loading-copy--wide" />
              <LoadingBlock className="site-loading-copy" />
            </div>
            <div className="site-loading-article-meta">
              <LoadingBlock className="site-loading-copy" />
              <LoadingBlock className="site-loading-copy" />
              <LoadingBlock className="site-loading-copy site-loading-copy--short" />
            </div>
          </div>
          <div className="site-loading-article-body">
            <LoadingBlock className="site-loading-copy" />
            <LoadingBlock className="site-loading-copy site-loading-copy--wide" />
            <LoadingBlock className="site-loading-copy" />
          </div>
        </div>
      )}

      {variant === "canvas" && (
        <div className="site-loading-frame">
          <div className="site-loading-canvas-header">
            <div>
              <LoadingBlock className="site-loading-kicker" />
              <LoadingBlock className="site-loading-title" />
            </div>
            <div className="site-loading-canvas-filters">
              <LoadingBlock />
              <LoadingBlock />
              <LoadingBlock />
            </div>
          </div>
          <div className="site-loading-canvas-grid">
            <LoadingBlock />
            <LoadingBlock />
            <LoadingBlock />
            <LoadingBlock />
            <LoadingBlock />
            <LoadingBlock />
          </div>
        </div>
      )}
    </div>
  );
}
