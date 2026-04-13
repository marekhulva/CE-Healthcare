import { useState, useMemo } from 'react';
import ThreatItem from './ThreatItem';
import SectorSidebar from './SectorSidebar';
import { THREATS_SLED } from '../data/threats_sled';

/* ── unchanged constants ── */
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
  'City', 'County', 'State Agency', 'Court System', 'Sheriff / Law Enforcement',
  'School District', 'University', 'Community College', 'Library', 'Municipal Utility',
  'Transit Authority', 'Union / Association', 'Vendor / Contractor',
  'Hospital / Health System', 'Physician Group / Clinic', 'Health Insurance / Payer',
  'Pharmacy / PBM', 'Home Health / Hospice', 'Mental Health / Behavioral Health',
  'Long-Term Care / Nursing Homes', 'Pharmacy / Telehealth',
];

const INDUSTRIES = ['All Industries', 'SLED', 'Healthcare'];

const HC_SEGMENT_MAP = {
  'Hospital / Health System':          'Hospitals & Health Systems',
  'Physician Group / Clinic':          'Clinics & Physician Groups',
  'Mental Health / Behavioral Health': 'Clinics & Physician Groups',
  'Health Insurance / Payer':          'Health Insurance & Payer',
  'Pharmacy / PBM':                    'Pharmacy',
  'Pharmacy / Telehealth':             'Pharmacy',
  'Home Health / Hospice':             'Post-Acute Care',
  'Long-Term Care / Nursing Homes':    'Post-Acute Care',
};

const HC_SEGMENT_ORDER = [
  'Hospitals & Health Systems',
  'Clinics & Physician Groups',
  'Health Insurance & Payer',
  'Pharmacy',
  'Post-Acute Care',
];

const PRIORITY_TAGS = ['Cloud', 'Google Workspace', 'Email / M365', 'Salesforce', 'Active Directory', 'Databases'];

export default function ThreatsSection() {
  const [selectedIndustry, setSelectedIndustry] = useState('Healthcare');
  const [selectedState,    setSelectedState]    = useState('All');
  const [selectedOrgType,  setSelectedOrgType]  = useState('All');
  const [selectedTag,      setSelectedTag]      = useState('All');

  /* ── unchanged filter cascade ── */
  const industryFiltered = useMemo(() =>
    THREATS_SLED.filter(item =>
      selectedIndustry === 'All Industries' || item.industry === selectedIndustry
    ),
  [selectedIndustry]);

  const states = useMemo(() => {
    const set = new Set(industryFiltered.map(i => i.state).filter(s => s !== 'Nationwide'));
    return ['All', 'Nationwide', ...Array.from(set).sort()];
  }, [industryFiltered]);

  const orgTypes = useMemo(() => {
    if (selectedIndustry === 'Healthcare') {
      const present = new Set(industryFiltered.map(i => HC_SEGMENT_MAP[i.org_type]).filter(Boolean));
      return ['All', ...HC_SEGMENT_ORDER.filter(s => present.has(s))];
    }
    const present = new Set(industryFiltered.map(i => i.org_type).filter(Boolean));
    const ordered = ORG_TYPE_ORDER.filter(t => present.has(t));
    const remaining = [...present].filter(t => !ORG_TYPE_ORDER.includes(t)).sort();
    return ['All', ...ordered, ...remaining];
  }, [industryFiltered, selectedIndustry]);

  const remainingTags = useMemo(() => {
    const counts = {};
    industryFiltered.forEach(item => {
      [...(item.cloud_platforms || []), ...(item.infra_impacted || [])].forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.keys(counts)
      .filter(t => !PRIORITY_TAGS.includes(t))
      .sort((a, b) => a.localeCompare(b));
  }, [industryFiltered]);

  const filtered = useMemo(() =>
    industryFiltered.filter(item => {
      const stateMatch = selectedState === 'All' || item.state === selectedState;
      const orgMatch   = selectedOrgType === 'All'
        || (selectedIndustry === 'Healthcare'
            ? HC_SEGMENT_MAP[item.org_type] === selectedOrgType
            : item.org_type === selectedOrgType);
      const allTags = [...(item.cloud_platforms || []), ...(item.infra_impacted || [])];
      const tagMatch   = selectedTag === 'All'
        ? true
        : selectedTag === 'Cloud'
          ? item.cloud_involved === true || allTags.includes('Cloud')
          : selectedTag === 'Email / M365'
            ? allTags.includes('Email') || allTags.includes('M365') || allTags.includes('Microsoft 365')
            : allTags.includes(selectedTag);
      return stateMatch && orgMatch && tagMatch;
    }),
  [industryFiltered, selectedState, selectedOrgType, selectedTag, selectedIndustry]);

  const count = filtered.length;
  const total = THREATS_SLED.length;
  const isFiltered = selectedIndustry !== 'All Industries' || selectedState !== 'All' || selectedOrgType !== 'All' || selectedTag !== 'All';

  function resetAll() {
    setSelectedState('All');
    setSelectedOrgType('All');
    setSelectedTag('All');
  }

  return (
    <div>
      {/* ── Filter Toolbar ── */}
      <div className="toolbar">
        <span className="toolbar-label">Filter</span>

        <select
          className={`f-select${selectedIndustry !== 'All Industries' ? ' filled' : ''}`}
          value={selectedIndustry}
          onChange={e => { setSelectedIndustry(e.target.value); resetAll(); }}
        >
          {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
        </select>

        <select
          className="f-select"
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
          className="f-select"
          value={selectedOrgType}
          onChange={e => setSelectedOrgType(e.target.value)}
        >
          {orgTypes.map(t => (
            <option key={t} value={t}>{t === 'All' ? 'All Segments' : t}</option>
          ))}
        </select>

        <select
          className="f-select"
          value={selectedTag}
          onChange={e => setSelectedTag(e.target.value)}
        >
          <option value="All">All Infrastructure</option>
          <optgroup label="Key Infrastructure">
            {PRIORITY_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
          </optgroup>
          {remainingTags.length > 0 && (
            <optgroup label="────────────────────">
              {remainingTags.map(t => <option key={t} value={t}>{t}</option>)}
            </optgroup>
          )}
        </select>

        <div className="toolbar-sep" />

        {isFiltered && (
          <div className="count-pill">
            Showing <b>{count}</b> of {total}
          </div>
        )}
      </div>

      {/* ── 2-column grid ── */}
      <div className="threats-grid">

        {/* Incident list */}
        <div className="incident-card-wrap">
          <div className="incident-list-head">
            <h3>
              All Incidents
              <span className="count">{count} results</span>
            </h3>
            <button className="incident-sort-pill">
              Sort: Most recent ▾
            </button>
          </div>

          <div className="incident-scroll">
            {filtered.length === 0 ? (
              <p style={{ padding: '24px 8px', fontSize: 13, color: 'var(--t3)', fontStyle: 'italic', textAlign: 'center' }}>
                No incidents match the current filters.
              </p>
            ) : (
              filtered.map((item, i) => <ThreatItem key={i} item={item} />)
            )}
          </div>

          <div className="scroll-fade" />
        </div>

        {/* Right sidebar */}
        <SectorSidebar filtered={filtered} />
      </div>
    </div>
  );
}
