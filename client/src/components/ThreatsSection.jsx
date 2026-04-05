import { useState, useMemo } from 'react';
import Section from './Section';
import ThreatItem from './ThreatItem';
import { THREATS_SLED } from '../data/threats_sled';

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

const ORG_TYPE_ORDER = [
  'City',
  'County',
  'State Agency',
  'Court System',
  'Sheriff / Law Enforcement',
  'School District',
  'University',
  'Community College',
  'Library',
  'Municipal Utility',
  'Transit Authority',
  'Union / Association',
  'Vendor / Contractor',
];

export default function ThreatsSection() {
  const [selectedState, setSelectedState]     = useState('All');
  const [selectedOrgType, setSelectedOrgType] = useState('All');

  const states = useMemo(() => {
    const set = new Set(THREATS_SLED.map(i => i.state).filter(s => s !== 'Nationwide'));
    return ['All', 'Nationwide', ...Array.from(set).sort()];
  }, []);

  const orgTypes = useMemo(() => {
    const present = new Set(THREATS_SLED.map(i => i.org_type).filter(Boolean));
    return ['All', ...ORG_TYPE_ORDER.filter(t => present.has(t))];
  }, []);

  const filtered = useMemo(() => {
    return THREATS_SLED.filter(item => {
      const stateMatch =
        selectedState === 'All' ||
        item.state === selectedState ||
        (selectedState !== 'Nationwide' && item.state === 'Nationwide');
      const orgMatch =
        selectedOrgType === 'All' || item.org_type === selectedOrgType;
      return stateMatch && orgMatch;
    });
  }, [selectedState, selectedOrgType]);

  const count = filtered.length;
  const total = THREATS_SLED.length;

  const headerExtra = (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
      <select
        className="state-filter-select"
        value={selectedState}
        onChange={e => setSelectedState(e.target.value)}
      >
        {states.map(s => (
          <option key={s} value={s}>
            {s === 'All' ? 'All States' : s === 'Nationwide' ? 'Nationwide' : `${s} — ${STATE_LABELS[s] || s}`}
          </option>
        ))}
      </select>
      <select
        className="state-filter-select"
        value={selectedOrgType}
        onChange={e => setSelectedOrgType(e.target.value)}
      >
        {orgTypes.map(t => (
          <option key={t} value={t}>{t === 'All' ? 'All Segments' : t}</option>
        ))}
      </select>
      {(selectedState !== 'All' || selectedOrgType !== 'All') && (
        <span style={{ fontSize: 11, color: '#475569' }}>{count}/{total}</span>
      )}
    </div>
  );

  return (
    <Section
      icon="🔴"
      title="Threat Landscape Pulse — SLED"
      items={filtered}
      error={false}
      loading={false}
      defaultOpen={true}
      scrollable={true}
      headerExtra={headerExtra}
      renderItem={(item, i) => <ThreatItem key={i} item={item} />}
    />
  );
}
