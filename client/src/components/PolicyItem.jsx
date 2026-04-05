export default function PolicyItem({ item }) {
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
      <div className="item-title">{item.title}</div>
      <div className="item-summary">{item.summary}</div>
    </div>
  );
}
