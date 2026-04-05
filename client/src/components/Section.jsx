import { useState } from 'react';

function buildCopyText(title, items) {
  if (!items?.length) return `${title}\n\nNo items.`;
  return [
    title,
    '',
    ...items.map(item =>
      `• ${item.title} — ${item.summary}${item.source_url ? ' ' + item.source_url : ''}`
    ),
  ].join('\n');
}

export default function Section({ icon, title, items, error, loading, renderItem, defaultOpen = true, scrollable = false, headerExtra = null }) {
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  function handleCopy(e) {
    e.stopPropagation();
    const text = buildCopyText(title, items);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="card">
      <div className="card-header" onClick={() => setOpen(o => !o)}>
        <div className="card-title">
          <span className="card-icon">{icon}</span>
          <span className="card-label">{title}</span>
          {!loading && items && (
            <span className="card-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>
          )}
          {error && <span className="card-count" style={{color:'#f87171'}}>error</span>}
        </div>
        <div className="card-actions">
          {headerExtra}
          {!loading && items?.length > 0 && (
            <button
              className={`copy-btn${copied ? ' copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? '✓ Copied' : 'Copy Section'}
            </button>
          )}
          <span className={`chevron ${open ? 'open' : 'closed'}`}>▼</span>
        </div>
      </div>

      {open && (
        <div style={scrollable ? { position: 'relative' } : undefined}>
          <div className="card-body" style={scrollable ? { maxHeight: 640, overflowY: 'auto' } : undefined}>
            {loading && (
              <>
                {[1, 2, 3].map(i => (
                  <div key={i} className="item">
                    <div className="skeleton skeleton-meta" />
                    <div className="skeleton skeleton-title" />
                    <div className="skeleton skeleton-line w80" />
                    <div className="skeleton skeleton-line w60" />
                  </div>
                ))}
              </>
            )}
            {!loading && error && (
              <p className="section-error">Could not load this section. Try regenerating.</p>
            )}
            {!loading && !error && items?.length === 0 && (
              <p className="section-error">No relevant items found for today.</p>
            )}
            {!loading && !error && items?.map((item, i) => renderItem(item, i))}
          </div>
          {scrollable && <div className="scroll-fade" />}
        </div>
      )}
    </div>
  );
}
