export default function Rail() {
  return (
    <aside className="rail">
      <div className="rail-logo">✚</div>
      <button className="rail-btn active" title="Threats">⚠</button>
      <button className="rail-btn" title="Dashboard">◫</button>
      <button className="rail-btn" title="States">◉</button>
      <button className="rail-btn" title="Infrastructure">◈</button>
      <button className="rail-btn" title="Reports">≡</button>
      <button className="rail-btn" title="Alerts">🔔</button>
      <div className="rail-spacer" />
      <button className="rail-btn" title="Settings">⚙</button>
    </aside>
  );
}
