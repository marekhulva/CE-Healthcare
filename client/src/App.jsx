import { useState, useEffect, useCallback } from 'react';
import './App.css';
import Header from './components/Header';
import Section from './components/Section';
import ThreatItem from './components/ThreatItem';
import PolicyItem from './components/PolicyItem';
import CompetitiveItem from './components/CompetitiveItem';
import ComplaintsTab from './components/ComplaintsTab';
import ThreatsSection from './components/ThreatsSection';

export default function App() {
  const [activeTab, setActiveTab]       = useState('briefing');
  const [briefing, setBriefing]         = useState(null);
  const [loading, setLoading]           = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fetchError, setFetchError]     = useState(false);
  const [notGenerated, setNotGenerated] = useState(false);

  const loadBriefing = useCallback(async () => {
    try {
      const res = await fetch('/api/briefing/today');
      if (res.status === 404) {
        setNotGenerated(true);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      setBriefing(data);
      setNotGenerated(false);
      setLoading(false);
    } catch {
      setFetchError(true);
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => { loadBriefing(); }, [loadBriefing]);

  async function handleRegenerate() {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate', { method: 'POST' });
      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      setBriefing(data);
      setNotGenerated(false);
    } catch {
      // generation failed — keep showing existing briefing if any
    } finally {
      setIsGenerating(false);
    }
  }

  const s = briefing?.sections;

  function renderBriefingContent() {
    if (loading) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card">
              <div className="card-header">
                <div className="card-title">
                  <div className="skeleton" style={{ width: 200, height: 16 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (fetchError) {
      return (
        <div className="page-state">
          <div className="page-state-icon">⚠️</div>
          <div className="page-state-title">Could not connect to server</div>
          <div className="page-state-sub">Make sure the backend is running on port 3001.</div>
        </div>
      );
    }

    if (notGenerated && !isGenerating) {
      return (
        <div className="page-state">
          <div className="page-state-icon">📋</div>
          <div className="page-state-title">No briefing yet today</div>
          <div className="page-state-sub">
            The daily briefing generates automatically at 6 AM ET. Click below to generate now.
          </div>
          <button className="btn btn-primary" onClick={handleRegenerate}>
            Generate Today's Briefing
          </button>
        </div>
      );
    }

    return (
      <>
        {isGenerating && (
          <div className="generating-banner">
            <div className="spinner" />
            Generating fresh briefing — this takes 30–60 seconds. Page will update automatically.
          </div>
        )}

        <ThreatsSection />

        <Section
          icon="📋"
          title="Policy & Regulatory Watch"
          items={s?.policy?.items}
          error={s?.policy?.error}
          loading={false}
          renderItem={(item, i) => <PolicyItem key={i} item={item} />}
        />

        <Section
          icon="🎯"
          title="Competitive Intelligence"
          items={s?.competitive?.items}
          error={s?.competitive?.error}
          loading={false}
          renderItem={(item, i) => <CompetitiveItem key={i} item={item} />}
        />

        <Section
          icon="⚡"
          title="Deal Ammunition"
          items={[]}
          error={false}
          loading={false}
          renderItem={() => null}
        />
      </>
    );
  }

  return (
    <>
      <Header
        generatedAt={briefing?.generated_at}
        onRegenerate={handleRegenerate}
        isGenerating={isGenerating}
      />
      <div className="container">
        {/* Main tab navigation */}
        <div className="main-tabs">
          <button
            className={`main-tab ${activeTab === 'briefing' ? 'active' : ''}`}
            onClick={() => setActiveTab('briefing')}
          >
            Daily Briefing
          </button>
          <button
            className={`main-tab ${activeTab === 'complaints' ? 'active' : ''}`}
            onClick={() => setActiveTab('complaints')}
          >
            Customer Complaints
          </button>
        </div>

        {activeTab === 'complaints' ? <ComplaintsTab /> : renderBriefingContent()}
      </div>
    </>
  );
}
