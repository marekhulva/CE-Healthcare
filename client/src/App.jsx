import { useState } from 'react';
import './App.css';
import Rail from './components/Rail';
import ThreatsSection from './components/ThreatsSection';
import FinancialsSection from './components/FinancialsSection';
import AccessGate from './components/AccessGate';

export default function App() {
  const [activeTab, setActiveTab] = useState('briefing');

  return (
    <AccessGate>
    <div className="app">
      <Rail />
      <div className="main">
        <div className="crumb">
          <a href="#">Sectors</a>
          <span className="sep">/</span>
          <a href="#">Healthcare</a>
          <span className="sep">/</span>
          <span className="here">Incidents</span>
        </div>
        <div className="page">
          <div className="page-head">
            <div className="page-title">
              <div className="avatar-circle">⚠</div>
              <h1>Healthcare Incidents</h1>
            </div>
          </div>

          <div className="main-tabs">
            <button
              className={`main-tab ${activeTab === 'briefing' ? 'active' : ''}`}
              onClick={() => setActiveTab('briefing')}
            >
              Daily Briefing
            </button>
            <button
              className={`main-tab ${activeTab === 'financials' ? 'active' : ''}`}
              onClick={() => setActiveTab('financials')}
            >
              Financial Impact
            </button>
          </div>

          {activeTab === 'briefing' ? <ThreatsSection /> : <FinancialsSection />}
        </div>
      </div>
    </div>
    </AccessGate>
  );
}
