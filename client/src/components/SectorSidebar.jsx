import { useMemo } from 'react';

const STATE_LABELS = {
  AL:'Alabama', AK:'Alaska', AZ:'Arizona', AR:'Arkansas', CA:'California',
  CO:'Colorado', CT:'Connecticut', DE:'Delaware', FL:'Florida', GA:'Georgia',
  HI:'Hawaii', ID:'Idaho', IL:'Illinois', IN:'Indiana', IA:'Iowa',
  KS:'Kansas', KY:'Kentucky', LA:'Louisiana', ME:'Maine', MD:'Maryland',
  MA:'Massachusetts', MI:'Michigan', MN:'Minnesota', MS:'Mississippi', MO:'Missouri',
  MT:'Montana', NE:'Nebraska', NV:'Nevada', NH:'New Hampshire', NJ:'New Jersey',
  NM:'New Mexico', NY:'New York', NC:'North Carolina', ND:'North Dakota', OH:'Ohio',
  OK:'Oklahoma', OR:'Oregon', PA:'Pennsylvania', RI:'Rhode Island', SC:'South Carolina',
  SD:'South Dakota', TN:'Tennessee', TX:'Texas', UT:'Utah', VT:'Vermont',
  VA:'Virginia', WA:'Washington', WV:'West Virginia', WI:'Wisconsin', WY:'Wyoming',
};

export default function SectorSidebar({ filtered }) {
  const counts = useMemo(() => ({
    critical: filtered.filter(i => i.severity === 'critical').length,
    high:     filtered.filter(i => i.severity === 'high').length,
    medium:   filtered.filter(i => i.severity === 'medium').length,
  }), [filtered]);

  const topStates = useMemo(() => {
    const map = {};
    filtered.forEach(i => {
      if (i.state && i.state !== 'Nationwide') map[i.state] = (map[i.state] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [filtered]);

  const topInfra = useMemo(() => {
    const map = {};
    filtered.forEach(i => {
      [...(i.cloud_platforms || []), ...(i.infra_impacted || [])].forEach(t => {
        map[t] = (map[t] || 0) + 1;
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [filtered]);

  const spotlight = useMemo(() =>
    filtered.find(i => i.featured && i.severity === 'critical') ||
    filtered.find(i => i.severity === 'critical'),
  [filtered]);

  const maxState = topStates[0]?.[1] || 1;
  const maxInfra = topInfra[0]?.[1] || 1;

  /* severity tier for bar color */
  function stateClass(idx) {
    if (idx === 0) return 'facet-row crit';
    if (idx <= 2) return 'facet-row high';
    return 'facet-row';
  }

  /* parse spotlight title */
  function spotlightOrg(item) {
    const ci = item.title.indexOf(':');
    return ci > 0 ? item.title.slice(0, ci).trim() : item.title;
  }

  return (
    <aside className="side">
      {/* Severity summary */}
      <div className="side-card">
        <div className="side-card-title">Severity Breakdown *</div>
        <div className="sev-summary">
          <div className="ss-block c">
            <span className="ss-n">{counts.critical}</span>
            <span className="ss-l">Critical</span>
          </div>
          <div className="ss-block h">
            <span className="ss-n">{counts.high}</span>
            <span className="ss-l">High</span>
          </div>
          <div className="ss-block m">
            <span className="ss-n">{counts.medium}</span>
            <span className="ss-l">Medium</span>
          </div>
        </div>
        <p className="sev-footnote">* <b>Critical:</b> backups destroyed, emergency systems down, weeks+ outage, ransom paid, or 100K+ affected. <b>High:</b> multi-day disruption, significant data theft, ransom demanded. <b>Medium:</b> contained breach, limited operational impact.</p>
      </div>

      {/* Spotlight — commented out
      {spotlight && (
        <div className="spotlight">
          ...
        </div>
      )}
      */}

      {/* Top states */}
      {topStates.length > 0 && (
        <div className="side-card">
          <div className="side-card-title">Top Affected States</div>
          {topStates.map(([state, count], idx) => (
            <div key={state} className={stateClass(idx)}>
              <span className="facet-name">{STATE_LABELS[state] || state}</span>
              <div className="facet-bar">
                <div className="facet-fill" style={{ width: `${Math.round((count / maxState) * 100)}%` }} />
              </div>
              <span className="facet-n">{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Top infra */}
      {topInfra.length > 0 && (
        <div className="side-card">
          <div className="side-card-title">Top Infrastructure Impacted</div>
          {topInfra.map(([tag, count], idx) => (
            <div key={tag} className={stateClass(idx)}>
              <span className="facet-name">{tag}</span>
              <div className="facet-bar">
                <div className="facet-fill" style={{ width: `${Math.round((count / maxInfra) * 100)}%` }} />
              </div>
              <span className="facet-n">{count}</span>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
