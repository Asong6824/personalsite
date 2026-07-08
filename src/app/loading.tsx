export default function RootLoading() {
    return (
        <div className="site-loading-shell" aria-label="页面加载中">
            <div className="site-loading-frame">
                <div className="site-loading-kicker" />
                <div className="site-loading-title site-loading-line" />
                <div className="site-loading-line" />
                <div className="site-loading-line" />
                <div className="site-loading-grid">
                    <div className="site-loading-card" />
                    <div className="site-loading-card" />
                    <div className="site-loading-card" />
                </div>
            </div>
        </div>
    );
}
