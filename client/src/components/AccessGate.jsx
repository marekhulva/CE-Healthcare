import { useState } from 'react';

export default function AccessGate({ children }) {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem('ce_access') === '1'
  );
  const [input, setInput]   = useState('');
  const [error, setError]   = useState(false);

  if (unlocked) return children;

  function handleSubmit(e) {
    e.preventDefault();
    if (input.trim().toLowerCase() === 'immutable') {
      sessionStorage.setItem('ce_access', '1');
      setUnlocked(true);
    } else {
      setError(true);
      setInput('');
      setTimeout(() => setError(false), 1800);
    }
  }

  return (
    <div className="gate-wrap">
      <div className="gate-card">
        <div className="gate-logo">✚</div>
        <h2 className="gate-title">CE Healthcare Intelligence</h2>
        <p className="gate-sub">Enter access code to continue</p>
        <form className="gate-form" onSubmit={handleSubmit}>
          <input
            className={`gate-input${error ? ' gate-input-err' : ''}`}
            type="password"
            placeholder="Access code"
            value={input}
            onChange={e => setInput(e.target.value)}
            autoFocus
            autoComplete="off"
          />
          {error && <p className="gate-err">Incorrect code. Try again.</p>}
          <button className="gate-btn" type="submit">Continue →</button>
        </form>
      </div>
    </div>
  );
}
