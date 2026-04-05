export default function Header({ generatedAt, onRegenerate, isGenerating }) {
  function formatTime(iso) {
    if (!iso) return null;
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
      hour12: true, timeZoneName: 'short',
    });
  }

  return (
    <div className="header">
      <div className="logo">
        <div className="logo-icon">🛡️</div>
        <div>
          <div className="logo-text">Field Intelligence Hub</div>
          <div className="logo-sub">Commvault · Daily Briefing</div>
        </div>
      </div>
      <div className="header-right">
        {generatedAt && (
          <>
            <div className="live-badge">
              <div className="live-dot" />
              Live
            </div>
            <div className="timestamp">
              Generated <span>{formatTime(generatedAt)}</span>
            </div>
          </>
        )}
        <button
          className="btn btn-primary"
          onClick={onRegenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="spinner" /> Generating...
            </span>
          ) : '↻ Regenerate'}
        </button>
      </div>
    </div>
  );
}
