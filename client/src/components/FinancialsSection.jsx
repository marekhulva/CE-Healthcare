import { useState, useMemo } from 'react';
import { INCIDENT_FINANCIALS } from '../data/incident_financials';

const ORG_TYPES = [
  'All Segments',
  'School District',
  'University',
  'Community College',
  'City',
  'County',
  'State Agency',
  'Court System',
  'Sheriff / Law Enforcement',
  'Municipal Utility',
  'Transit Authority',
  'Vendor / Contractor',
];

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

function fmt(n) {
  if (n === null || n === undefined) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n.toLocaleString()}`;
}

function avg(arr) {
  const vals = arr.filter(v => v !== null && v !== undefined && v > 0);
  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function StatBox({ label, value, sub, color }) {
  return (
    <div className="stat-box">
      <span className="stat-box-label">{label}</span>
      <span className="stat-box-value" style={{ color: color || 'var(--t1)' }}>{value}</span>
      {sub && <span className="stat-box-sub">{sub}</span>}
    </div>
  );
}

export default function FinancialsSection() {
  const [orgType, setOrgType] = useState('All Segments');
  const [state, setState]     = useState('All');

  const states = useMemo(() => {
    const set = new Set(INCIDENT_FINANCIALS.map(r => r.state).filter(Boolean).filter(s => s !== 'Nationwide'));
    return ['All', 'Nationwide', ...Array.from(set).sort()];
  }, []);

  const filtered = useMemo(() => {
    return INCIDENT_FINANCIALS.filter(r => {
      const orgMatch   = orgType === 'All Segments' || r.org_type === orgType;
      const stateMatch = state === 'All' || r.state === state;
      return orgMatch && stateMatch;
    });
  }, [orgType, state]);

  const stats = useMemo(() => {
    const demanded  = filtered.map(r => r.ransom_demanded_usd);
    const paid      = filtered.map(r => r.ransom_paid_usd);
    const recovery  = filtered.map(r => r.recovery_cost_usd);
    const settle    = filtered.map(r => r.settlement_usd);
    const impact    = filtered.map(r => r.total_economic_impact_usd);
    const downtime  = filtered.map(r => r.downtime_days);
    const records   = filtered.map(r => r.records_exposed);

    const paidNonZero = paid.filter(v => v !== null && v > 0);
    const refusedCount = paid.filter(v => v === 0).length;
    const paidCount    = paidNonZero.length;

    return {
      total: filtered.length,
      avgDemanded:  avg(demanded),
      avgPaid:      avg(paidNonZero),
      avgRecovery:  avg(recovery),
      avgSettle:    avg(settle),
      avgImpact:    avg(impact),
      avgDowntime:  avg(downtime),
      avgRecords:   avg(records),
      paidCount,
      refusedCount,
      withDemand:   demanded.filter(v => v !== null).length,
      withPaid:     paid.filter(v => v !== null).length,
      withRecovery: recovery.filter(v => v !== null).length,
      withDowntime: downtime.filter(v => v !== null).length,
      withRecords:  records.filter(v => v !== null).length,
    };
  }, [filtered]);

  const isFiltered = orgType !== 'All Segments' || state !== 'All';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header + filters */}
      <div className="fin-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>Financial Impact Analytics</span>
          <span style={{ fontSize: 12, color: 'var(--t3)' }}>
            Based on {stats.total} incidents with publicly reported figures
            {isFiltered && ` · filtered`}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <select className="f-select" value={orgType} onChange={e => setOrgType(e.target.value)}>
            {ORG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="f-select" value={state} onChange={e => setState(e.target.value)}>
            {states.map(s => (
              <option key={s} value={s}>
                {s === 'All' ? 'All States' : s === 'Nationwide' ? 'Nationwide' : `${s} — ${STATE_LABELS[s] || s}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats grid */}
      <div className="fin-grid-4">
        <StatBox
          label="Avg Ransom Demanded"
          value={fmt(stats.avgDemanded)}
          sub={`${stats.withDemand} incidents reported`}
          color="var(--high)"
        />
        <StatBox
          label="Avg Ransom Paid"
          value={fmt(stats.avgPaid)}
          sub={`${stats.paidCount} paid · ${stats.refusedCount} refused`}
          color="var(--crit-l)"
        />
        <StatBox
          label="Avg Recovery Cost"
          value={fmt(stats.avgRecovery)}
          sub={`${stats.withRecovery} incidents reported`}
          color="var(--med)"
        />
        <StatBox
          label="Avg Downtime"
          value={stats.avgDowntime ? `${stats.avgDowntime}d` : '—'}
          sub={`${stats.withDowntime} incidents reported`}
          color="var(--accent-l)"
        />
      </div>

      {/* Secondary row */}
      <div className="fin-grid-3">
        <StatBox
          label="Avg Records Exposed"
          value={stats.avgRecords ? fmt(stats.avgRecords).replace('$','') : '—'}
          sub={`${stats.withRecords} incidents reported`}
          color="var(--indigo)"
        />
        <StatBox
          label="Avg Legal Settlement"
          value={fmt(stats.avgSettle)}
          sub="lawsuits · fines · class actions"
          color="var(--low)"
        />
        <StatBox
          label="Paid vs Refused"
          value={stats.withPaid ? `${Math.round((stats.paidCount / stats.withPaid) * 100)}% paid` : '—'}
          sub={`of incidents where outcome is known`}
          color="var(--crit-l)"
        />
      </div>

      {/* Disclaimer */}
      <p style={{ fontSize: 11, color: 'var(--t4)', margin: 0 }}>
        * Figures sourced from public reporting only. Coverage varies — not all incidents disclosed financials.
        Averages exclude nulls. Recovery cost ≠ ransom paid.
      </p>
    </div>
  );
}
