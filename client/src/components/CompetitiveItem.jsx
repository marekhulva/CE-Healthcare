function getCompClass(competitor) {
  if (!competitor) return 'comp-other';
  const name = competitor.toLowerCase();
  if (name.includes('rubrik'))   return 'comp-rubrik';
  if (name.includes('veeam'))    return 'comp-veeam';
  if (name.includes('cohesity')) return 'comp-cohesity';
  if (name.includes('veritas'))  return 'comp-veritas';
  return 'comp-other';
}

export default function CompetitiveItem({ item }) {
  return (
    <div className="item">
      <div className="item-meta">
        <span className={`comp-tag ${getCompClass(item.competitor)}`}>{item.competitor}</span>
        {item.event_type && <span className="event-tag">{item.event_type}</span>}
        {item.sentiment && (
          <span
            className={`sentiment-dot sentiment-${item.sentiment}`}
            title={item.sentiment}
          />
        )}
        <span className="item-date">{item.date}</span>
        {item.source_name && item.source_url && (
          <span className="item-source">
            via <a href={item.source_url} target="_blank" rel="noreferrer">{item.source_name}</a>
          </span>
        )}
      </div>
      <div className="item-title">{item.title}</div>
      <div className="item-summary">{item.summary}</div>
    </div>
  );
}
