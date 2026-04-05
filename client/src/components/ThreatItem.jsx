function extractHighlights(title, summary) {
  const text = `${title} ${summary}`;
  const hits = [];

  // Ransom paid
  const paidRe = /\$([\d,.]+[MKmk]?)\s*(?:million|M)?\s*ransom\s+paid|\bpaid\s+\$([\d,.]+[MKmk]?)|\bransom\s+paid[^.]*\$([\d,.]+[MKmk]?)/i;
  const paidM = text.match(paidRe);
  if (paidM) {
    const amt = paidM[1] || paidM[2] || paidM[3] || '';
    hits.push({ label: `paid $${amt} ransom`, type: 'ransom-paid' });
  }

  // Ransom demanded (only if nothing paid)
  if (!paidM) {
    const demRe = /\$([\d,.]+[MKmk]?)\s*(?:million|M)?\s*(?:ransom\s+)?demand(?:ed|s)?|\bdemands?\s+\$([\d,.]+[MKmk]?)/i;
    const demM = text.match(demRe);
    if (demM) {
      const amt = demM[1] || demM[2] || '';
      hits.push({ label: `$${amt} ransom demanded`, type: 'ransom' });
    }
  }

  // Recovery / downtime duration
  const dtRe = /(\d+)\+?\s*[-–]?\s*(day|week|month)s?\s+(?:recovery|outage|offline|down|disruption|closure)|(?:recovery|outage|offline|down|disruption)\s+(?:took|lasted|for)?\s*(\d+)\+?\s*(day|week|month)s?/i;
  const dtM = text.match(dtRe);
  if (dtM) {
    const num = dtM[1] || dtM[3];
    const unit = (dtM[2] || dtM[4] || '').toLowerCase();
    const plural = parseInt(num) !== 1 ? 's' : '';
    hits.push({ label: `${num}-${unit}${plural} recovery`, type: 'downtime' });
  }

  // Backups deleted / destroyed
  if (/backup[s]?\s+(?:deleted|destroyed|encrypted|wiped|targeted)|deleted\s+backup|destroy(?:ed|ing)\s+backup/i.test(text)) {
    hits.push({ label: 'backups deleted', type: 'backup' });
  }

  return hits;
}

export default function ThreatItem({ item }) {
  const colonIdx = item.title.indexOf(':');
  const org = colonIdx > 0 ? item.title.slice(0, colonIdx).trim() : null;
  const description = colonIdx > 0 ? item.title.slice(colonIdx + 1).trim() : item.title;
  const highlights = extractHighlights(item.title, item.summary || '');

  return (
    <div className="item">
      <div className="item-meta">
        <span className={`badge badge-${item.severity}`}>{item.severity}</span>
        <span className="item-date">{item.date}</span>
        {item.source_name && item.source_url && (
          <span className="item-source">
            via <a href={item.source_url} target="_blank" rel="noreferrer">{item.source_name}</a>
          </span>
        )}
      </div>

      <div className="item-headline">
        {org && <span className="item-org">{org}</span>}
        {org && <span className="item-dash"> — </span>}
        <span className="item-desc">{description}</span>
        {highlights.map((h, i) => (
          <span key={i} className={`highlight-tag highlight-${h.type}`}> · {h.label}</span>
        ))}
      </div>

      <div className="item-summary">{item.summary}</div>
    </div>
  );
}
