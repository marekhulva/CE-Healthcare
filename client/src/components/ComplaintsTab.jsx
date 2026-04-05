import { useState, useEffect } from 'react';

const VENDORS = ['Rubrik', 'Veeam', 'Cohesity'];

const CAT_CLASSES = {
  pricing:      'badge-high',
  support:      'badge-critical',
  ui:           'cat-rubrik',
  reporting:    'cat-veritas',
  features:     'badge-medium',
  ai:           'badge-low',
  relationship: 'badge-low',
  other:        'cat-other',
};

const CAT_LABELS = {
  pricing: 'Pricing', support: 'Support', ui: 'UI/UX',
  reporting: 'Reporting', features: 'Features', ai: 'AI', other: 'Other',
};

function PatternCard({ pattern }) {
  const [open, setOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <div className="card-header" onClick={() => setOpen(o => !o)}>
        <div className="card-title">
          <span className="card-label">{pattern.title}</span>
          <span className="card-count">{pattern.frequency}</span>
          <span className={`badge ${CAT_CLASSES[pattern.category] || 'badge-medium'}`}>
            {CAT_LABELS[pattern.category] || pattern.category}
          </span>
        </div>
        <div className="card-actions">
          <span className={`chevron ${open ? 'open' : 'closed'}`}>▼</span>
        </div>
      </div>

      {open && (
        <div className="card-body">
          <p className="item-summary" style={{ marginBottom: 16 }}>{pattern.description}</p>

          <button
            className="copy-btn"
            style={{ marginBottom: 12 }}
            onClick={() => setSourcesOpen(o => !o)}
          >
            {sourcesOpen ? '▼ Hide' : '▶ Show'} sources ({pattern.sources.length})
          </button>

          {sourcesOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pattern.sources.map((s, i) => (
                <div key={i} style={{ background: '#0d1117', border: '1px solid #1e2435', borderRadius: 8, padding: '12px 14px' }}>
                  <div className="item-meta">
                    <span className="badge badge-medium" style={{ textTransform: 'none', fontSize: 10 }}>{s.platform}</span>
                    <span className="item-date">{s.date}</span>
                  </div>
                  <p className="item-summary" style={{ fontStyle: 'italic', marginBottom: 8 }}>"{s.quote}"</p>
                  <a href={s.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#3b82f6', wordBreak: 'break-all' }}>{s.url}</a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VendorView({ vendor }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/complaints/${vendor.toLowerCase()}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [vendor]);

  if (loading) return (
    <div style={{ padding: 20 }}>
      {[1,2,3].map(i => <div key={i} className="card" style={{ marginBottom: 12 }}>
        <div className="card-header"><div className="skeleton" style={{ width: 240, height: 16 }} /></div>
      </div>)}
    </div>
  );

  if (!data?.patterns?.length) return (
    <div className="page-state" style={{ minHeight: 300 }}>
      <div className="page-state-icon">🔍</div>
      <div className="page-state-title">Research not yet run for {vendor}</div>
      <div className="page-state-sub">Run a manual complaint research session to populate this section.</div>
    </div>
  );

  return (
    <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.summary && (
        <div style={{ background: '#0d1117', border: '1px solid #1e2435', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 4 }}>
          <strong style={{ color: '#cbd5e1' }}>Summary: </strong>{data.summary}
          {data.last_updated && <span style={{ marginLeft: 8, color: '#475569', fontSize: 11 }}>Last updated: {data.last_updated}</span>}
        </div>
      )}
      {data.patterns.map(p => <PatternCard key={p.id} pattern={p} />)}
    </div>
  );
}

export default function ComplaintsTab() {
  const [activeVendor, setActiveVendor] = useState('Rubrik');

  return (
    <div>
      {/* Vendor sub-tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '16px 0 4px', borderBottom: '1px solid #1e2435', marginBottom: 4 }}>
        {VENDORS.map(v => (
          <button
            key={v}
            onClick={() => setActiveVendor(v)}
            style={{
              padding: '6px 18px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              background: activeVendor === v ? '#005bac' : 'transparent',
              color: activeVendor === v ? '#fff' : '#64748b',
              transition: 'all 0.15s',
            }}
          >
            {v}
          </button>
        ))}
      </div>
      <VendorView vendor={activeVendor} />
    </div>
  );
}
