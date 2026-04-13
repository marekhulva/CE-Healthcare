import { useState } from 'react';

/* ── highlight extraction (unchanged logic) ── */
function extractHighlights(title, summary) {
  const text = `${title} ${summary}`;
  const hits = [];

  const paidRe = /\$([\d,.]+[MKmk]?)\s*(?:million|M)?\s*ransom\s+paid|\bpaid\s+\$([\d,.]+[MKmk]?)|\bransom\s+paid[^.]*\$([\d,.]+[MKmk]?)/i;
  const paidM = text.match(paidRe);
  if (paidM) {
    const amt = paidM[1] || paidM[2] || paidM[3] || '';
    hits.push({ label: `paid $${amt} ransom`, type: 'ransom-paid' });
  }

  if (!paidM) {
    const demRe = /\$([\d,.]+[MKmk]?)\s*(?:million|M)?\s*(?:ransom\s+)?demand(?:ed|s)?|\bdemands?\s+\$([\d,.]+[MKmk]?)/i;
    const demM = text.match(demRe);
    if (demM) {
      const amt = demM[1] || demM[2] || '';
      hits.push({ label: `$${amt} ransom demanded`, type: 'ransom' });
    }
  }

  const dtRe = /(\d+)\+?\s*[-–]?\s*(day|week|month)s?\s+(?:recovery|outage|offline|down|disruption|closure)|(?:recovery|outage|offline|down|disruption)\s+(?:took|lasted|for)?\s*(\d+)\+?\s*(day|week|month)s?/i;
  const dtM = text.match(dtRe);
  if (dtM) {
    const num = dtM[1] || dtM[3];
    const unit = (dtM[2] || dtM[4] || '').toLowerCase();
    const plural = parseInt(num) !== 1 ? 's' : '';
    hits.push({ label: `${num}-${unit}${plural} recovery`, type: 'downtime' });
  }

  if (/backup[s]?\s+(?:deleted|destroyed|encrypted|wiped|targeted)|deleted\s+backup|destroy(?:ed|ing)\s+backup/i.test(text)) {
    hits.push({ label: 'backups deleted', type: 'backup' });
  }

  return hits;
}

/* ── infra tag label → CSS class slug ── */
const TAG_CLASS_MAP = {
  'Active Directory': 'ad',
  'AD':               'ad',
  'M365':             'm365',
  'Microsoft 365':    'm365',
  'Google Workspace': 'cloud',
  'Salesforce':       'sfdc',
  'AWS':              'cloud',
  'Azure':            'cloud',
  'GCP':              'cloud',
  'Cloud':            'cloud',
  'Backups':          'bk',
  'EHR':              'ehr',
  'EHR/EMR':          'ehr',
  'EMR':              'ehr',
  'PACS':             'pacs',
  'Firewall':         'nw',
  'Network':          'nw',
  'Servers':          'srv',
  'Databases':        'db',
  'Email':            'email',
  'Payment Systems':  'db',
};

function tagClass(label) {
  return `inc-tag inc-tag-${TAG_CLASS_MAP[label] || 'other'}`;
}

export default function ThreatItem({ item }) {
  const [expanded, setExpanded] = useState(false);

  /* ── parse "Org: description" title ── */
  const colonIdx = item.title.indexOf(':');
  const org         = colonIdx > 0 ? item.title.slice(0, colonIdx).trim() : null;
  const description = colonIdx > 0 ? item.title.slice(colonIdx + 1).trim() : item.title;

  const highlights = extractHighlights(item.title, item.summary || '');

  const allTags = [...(item.cloud_platforms || []), ...(item.infra_impacted || [])];
  const hasEnrichedContent =
    (item.impact_bullets && item.impact_bullets.length > 0) || allTags.length > 0;

  const handleItemClick = (e) => {
    if (!hasEnrichedContent) return;
    if (window.getSelection().toString()) return;
    if (e.target.closest('a')) return;
    if (e.target.closest('button')) return;
    setExpanded(v => !v);
  };

  return (
    <div
      className="incident"
      data-sev={item.severity}
      onClick={handleItemClick}
      style={hasEnrichedContent ? { cursor: 'pointer' } : undefined}
    >
      {/* Meta row */}
      <div className="inc-meta">
        <span className={`sev-badge ${item.severity}`}>{item.severity}</span>
        <span className="inc-date">{item.date}</span>
        {(item.source_name || item.source_url) && (
          <>
            <span className="inc-dot">·</span>
            <span className="inc-source">
              via{' '}
              {item.source_url
                ? <a href={item.source_url} target="_blank" rel="noreferrer">{item.source_name || item.source_url}</a>
                : item.source_name}
            </span>
          </>
        )}
        {item.cloud_involved && (
          <span className="cloud-badge">☁ Cloud</span>
        )}
      </div>

      {/* Title */}
      <div className="inc-title">
        {org && <><span className="inc-org">{org}</span><span className="inc-dash">—</span></>}
        <span className="inc-desc">{description}</span>
        {highlights.map((h, i) => (
          <span key={i} className={`inc-hl ${h.type}`}> · {h.label}</span>
        ))}
      </div>

      {/* Summary */}
      <div className="inc-summary">{item.enriched_summary || item.summary}</div>

      {/* Infra tags */}
      {allTags.length > 0 && (
        <div className="inc-tags">
          {allTags.map((t, i) => (
            <span key={i} className={tagClass(t)}>{t}</span>
          ))}
        </div>
      )}

      {/* Expand button */}
      {hasEnrichedContent && (
        <button
          className="expand-btn"
          onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
        >
          {expanded ? '▴ Less' : '▾ Full Analysis'}
        </button>
      )}

      {/* Expanded detail */}
      {expanded && hasEnrichedContent && (
        <div className="inc-expand">
          <span className="inc-expand-label">Impact &amp; Facts</span>
          <ul className="inc-bullets">
            {allTags.length > 0 && (
              <li className="affected">Affected: {allTags.join(', ')}</li>
            )}
            {(item.impact_bullets || []).map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
