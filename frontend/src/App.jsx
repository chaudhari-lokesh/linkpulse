import React, { useState, useEffect, Component } from 'react';

// API Base URL Configuration (sanitizes VITE_API_BASE in production on Vercel)
const getApiBase = () => {
  const envBase = (import.meta.env.VITE_API_BASE || '').trim();
  if (!envBase) return '/api';
  const cleanBase = envBase.replace(/\/+$/, '');
  return cleanBase.endsWith('/api') ? cleanBase : `${cleanBase}/api`;
};

const API_BASE = getApiBase();

const parseError = (errVal, defaultMsg = 'An error occurred') => {
  if (!errVal) return defaultMsg;
  if (typeof errVal === 'string') return errVal;
  if (typeof errVal === 'object') return errVal.message || JSON.stringify(errVal);
  return String(errVal);
};

// React Error Boundary to prevent blank pages
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("LinkPulse UI Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#fff' }}>
          <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', border: '1px solid var(--error)' }}>
            <h2 style={{ color: 'var(--error)', marginBottom: '1rem' }}>Something went wrong</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {parseError(this.state.error, 'An unexpected UI error occurred.')}
            </p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              <i className="fa-solid fa-rotate-right"></i> Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}

function MainApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  
  const [toast, setToast] = useState(null);
  const [analyticsShortId, setAnalyticsShortId] = useState(null);
  const [activeQrModal, setActiveQrModal] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/user/me`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) return setUser(null);
      const data = await res.json();
      if (data && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/user/logout`, { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setCurrentPage('login');
    showToast('Logged out successfully', 'info');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {toast && (
        <div id="toast-container">
          <div className="toast" style={{ borderLeftColor: toast.type === 'success' ? 'var(--success)' : 'var(--primary)' }}>
            {toast.message}
          </div>
        </div>
      )}

      <nav className="navbar">
        <div className="brand" onClick={() => setCurrentPage('home')}>
          <i className="fa-solid fa-bolt brand-icon"></i>
          LinkPulse
        </div>

        <div className="nav-links">
          <button className={`nav-link ${currentPage === 'home' ? 'active' : ''}`} onClick={() => setCurrentPage('home')}>
            Home
          </button>
          <button className={`nav-link ${currentPage === 'docs' ? 'active' : ''}`} onClick={() => setCurrentPage('docs')}>
            API Docs
          </button>

          {user ? (
            <>
              <button className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentPage('dashboard')}>
                Dashboard
              </button>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                <i className="fa-solid fa-right-from-bracket"></i> Logout
              </button>
            </>
          ) : (
            <>
              <button className={`nav-link ${currentPage === 'login' ? 'active' : ''}`} onClick={() => setCurrentPage('login')}>
                Login
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setCurrentPage('signup')}>
                <i className="fa-solid fa-user-plus"></i> Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      <div className="container">
        {currentPage === 'home' && <HomePage token={token} user={user} showToast={showToast} setCurrentPage={setCurrentPage} setAnalyticsShortId={setAnalyticsShortId} setActiveQrModal={setActiveQrModal} />}
        {currentPage === 'dashboard' && <DashboardPage token={token} user={user} showToast={showToast} setCurrentPage={setCurrentPage} setAnalyticsShortId={setAnalyticsShortId} setActiveQrModal={setActiveQrModal} copyToClipboard={copyToClipboard} />}
        {currentPage === 'login' && <LoginPage setToken={setToken} setUser={setUser} setCurrentPage={setCurrentPage} showToast={showToast} />}
        {currentPage === 'signup' && <SignupPage setToken={setToken} setUser={setUser} setCurrentPage={setCurrentPage} showToast={showToast} />}
        {currentPage === 'analytics' && <AnalyticsPage shortId={analyticsShortId} token={token} setCurrentPage={setCurrentPage} copyToClipboard={copyToClipboard} setActiveQrModal={setActiveQrModal} />}
        {currentPage === 'docs' && <DocsPage />}
      </div>

      {activeQrModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '90%', textAlign: 'center', position: 'relative' }}>
            <button style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setActiveQrModal(null)}>&times;</button>
            <h3 style={{ marginBottom: '0.5rem' }}>{activeQrModal.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', wordBreak: 'break-all' }}>{activeQrModal.shortUrl}</p>
            <div style={{ background: '#fff', padding: '1rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1.5rem' }}>
              <img src={activeQrModal.qrCode} alt="QR Code" style={{ width: '180px', height: '180px', display: 'block' }} />
            </div>
            <div>
              <a href={activeQrModal.qrCode} download="qr-code.png" className="btn btn-primary">
                <i className="fa-solid fa-download"></i> Download PNG
              </a>
            </div>
          </div>
        </div>
      )}

      <footer>
        <p>&copy; {new Date().getFullYear()} <strong>LinkPulse</strong>. Decoupled REST API + React Single Page Architecture.</p>
      </footer>
    </div>
  );
}

/* Home Page Component */
function HomePage({ token, user, showToast, setCurrentPage, setAnalyticsShortId, setActiveQrModal }) {
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [title, setTitle] = useState('');
  const [expiration, setExpiration] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ url, customAlias, title, expiration })
      });

      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { error: `Backend server error (${res.status}). Server might be spinning up.` };
      }

      if (!res.ok) {
        setError(parseError(data.error, 'Failed to shorten URL'));
      } else {
        setResult(data);
        showToast('Short link created successfully!', 'success');
      }
    } catch (err) {
      console.error("Shorten URL error:", err);
      setError('Network error. Is the backend server running on Render?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="hero">
        <div className="hero-badge">
          <i className="fa-solid fa-wand-magic-sparkles"></i> Powerful & Fast Link Management
        </div>
        <h1 className="hero-title">
          Shorten Links, Expand Your <span>Digital Reach</span>
        </h1>
        <p className="hero-subtitle">
          Transform long URLs into memorable, brandable short links with real-time analytics.
        </p>
      </div>

      {error && <div className="alert alert-danger"><i className="fa-solid fa-triangle-exclamation"></i> {parseError(error)}</div>}

      <div className="glass-card" style={{ marginBottom: '3rem' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Destination URL</label>
            <input type="text" className="form-control" placeholder="https://example.com/very-long-url-path" value={url} onChange={e => setUrl(e.target.value)} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Custom Alias (Optional)</label>
              <input type="text" className="form-control" placeholder="my-custom-name" value={customAlias} onChange={e => setCustomAlias(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Link Title (Optional)</label>
              <input type="text" className="form-control" placeholder="Campaign Landing Page" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Expiration (Optional)</label>
              <select className="form-control" value={expiration} onChange={e => setExpiration(e.target.value)}>
                <option value="">Never Expire</option>
                <option value="24h">24 Hours</option>
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.9rem' }} disabled={loading}>
            <i className="fa-solid fa-link"></i> {loading ? 'Shortening...' : 'Shorten URL Now'}
          </button>
        </form>

        {result && (
          <div className="result-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <img src={result.qrCode} alt="QR Code" style={{ width: '80px', height: '80px', background: '#fff', padding: '4px', borderRadius: '8px', cursor: 'pointer' }} onClick={() => setActiveQrModal({ qrCode: result.qrCode, title: result.title, shortUrl: result.shortUrl })} />
              <div>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700 }}>Short Link Ready!</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{result.shortUrl}</div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Original: {result.redirectUrl}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard.writeText(result.shortUrl); showToast('Link copied!', 'success'); }}>
                <i className="fa-solid fa-copy"></i> Copy
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => { setAnalyticsShortId(result.shortId); setCurrentPage('analytics'); }}>
                <i className="fa-solid fa-chart-line"></i> Analytics
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="features-grid">
        <div className="glass-card feature-card">
          <div style={{ fontSize: '2rem', color: '#6366f1', marginBottom: '0.75rem' }}><i className="fa-solid fa-shield-halved"></i></div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>Custom Branding</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Create branded custom aliases that boost user trust and click-through rates.</p>
        </div>
        <div className="glass-card feature-card">
          <div style={{ fontSize: '2rem', color: '#a855f7', marginBottom: '0.75rem' }}><i className="fa-solid fa-chart-pie"></i></div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>Real-Time Analytics</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Track click counts, referrer sites, and user-agent logs with traffic graphs.</p>
        </div>
        <div className="glass-card feature-card">
          <div style={{ fontSize: '2rem', color: '#06b6d4', marginBottom: '0.75rem' }}><i className="fa-solid fa-qrcode"></i></div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>Instant QR Codes</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Download high-resolution QR codes for print and digital marketing campaigns.</p>
        </div>
      </div>
    </div>
  );
}

/* Dashboard Page Component */
function DashboardPage({ token, user, showToast, setCurrentPage, setAnalyticsShortId, setActiveQrModal, copyToClipboard }) {
  const [data, setData] = useState({ urls: [], stats: { totalLinks: 0, totalClicks: 0, activeLinks: 0 } });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/url/my-links`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      showToast('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url, customAlias })
      });
      if (res.ok) {
        showToast('Link shortened!', 'success');
        setUrl('');
        setCustomAlias('');
        fetchDashboard();
      } else {
        const errData = await res.json();
        showToast(parseError(errData.error, 'Failed to shorten'), 'error');
      }
    } catch (err) {
      showToast('Server error', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this short link?')) return;
    try {
      const res = await fetch(`${API_BASE}/url/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Link deleted', 'success');
        fetchDashboard();
      }
    } catch (e) {
      showToast('Failed to delete', 'error');
    }
  };

  const filteredUrls = (data.urls || []).filter(u => 
    (u.title || '').toLowerCase().includes(search.toLowerCase()) || 
    (u.redirectUrl || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.shortId || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
          Welcome back, <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.name}</span>!
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your shortened links and monitor performance in real-time.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><i className="fa-solid fa-link"></i></div>
          <div>
            <div className="stat-value">{data.stats?.totalLinks || 0}</div>
            <div className="stat-label">Total Short Links</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--secondary)', background: 'rgba(168, 85, 247, 0.15)' }}><i className="fa-solid fa-mouse-pointer"></i></div>
          <div>
            <div className="stat-value">{data.stats?.totalClicks || 0}</div>
            <div className="stat-label">Total Clicks</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.15)' }}><i className="fa-solid fa-circle-check"></i></div>
          <div>
            <div className="stat-value">{data.stats?.activeLinks || 0}</div>
            <div className="stat-label">Active Links</div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <form onSubmit={handleQuickCreate} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input type="text" className="form-control" placeholder="Destination URL (https://...)" value={url} onChange={e => setUrl(e.target.value)} required style={{ flex: 2, minWidth: '220px' }} />
          <input type="text" className="form-control" placeholder="Custom Alias (optional)" value={customAlias} onChange={e => setCustomAlias(e.target.value)} style={{ flex: 1, minWidth: '150px' }} />
          <button type="submit" className="btn btn-primary"><i className="fa-solid fa-bolt"></i> Shorten</button>
        </form>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Your Links</h2>
        <input type="text" className="form-control" placeholder="Search links..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: '250px' }} />
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Title / URL</th>
              <th>Short Link</th>
              <th>Clicks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUrls.length > 0 ? filteredUrls.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{u.title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.redirectUrl}</div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <a href={u.fullShortUrl} target="_blank" rel="noreferrer" style={{ fontWeight: 600 }}>{u.fullShortUrl}</a>
                    <button className="btn btn-secondary btn-sm" onClick={() => copyToClipboard(u.fullShortUrl)}><i className="fa-solid fa-copy"></i></button>
                  </div>
                </td>
                <td><span className="badge badge-success">{u.visitHistory ? u.visitHistory.length : 0} Clicks</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setAnalyticsShortId(u.shortId); setCurrentPage('analytics'); }}><i className="fa-solid fa-chart-simple"></i></button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setActiveQrModal({ qrCode: u.qrCode, title: u.title, shortUrl: u.fullShortUrl })}><i className="fa-solid fa-qrcode"></i></button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}><i className="fa-solid fa-trash"></i></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>No short links found. Create your first link above!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* Login Page Component */
function LoginPage({ setToken, setUser, setCurrentPage, showToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(parseError(data.error, 'Login failed'));
      } else {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        setCurrentPage('dashboard');
        showToast('Logged in successfully!', 'success');
      }
    } catch (err) {
      setError('Network error connecting to backend API');
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '3rem auto' }}>
      <div className="glass-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}><i className="fa-solid fa-user-lock"></i></div>
          <h2>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Log in to access your LinkPulse dashboard</p>
        </div>

        {error && <div className="alert alert-danger"><i className="fa-solid fa-triangle-exclamation"></i> {parseError(error)}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}>Log In</button>
        </form>
      </div>
    </div>
  );
}

/* Signup Page Component */
function SignupPage({ setToken, setUser, setCurrentPage, showToast }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE}/user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(parseError(data.error, 'Signup failed'));
      } else {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        setCurrentPage('dashboard');
        showToast('Account created successfully!', 'success');
      }
    } catch (err) {
      setError('Network error connecting to backend API');
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '3rem auto' }}>
      <div className="glass-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}><i className="fa-solid fa-user-plus"></i></div>
          <h2>Create Free Account</h2>
        </div>

        {error && <div className="alert alert-danger"><i className="fa-solid fa-triangle-exclamation"></i> {parseError(error)}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-control" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" placeholder="Minimum 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}>Sign Up</button>
        </form>
      </div>
    </div>
  );
}

/* Analytics Page Component */
function AnalyticsPage({ shortId, token, setCurrentPage, copyToClipboard, setActiveQrModal }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (shortId) {
      fetch(`${API_BASE}/url/analytics/${shortId}`)
        .then(res => res.json())
        .then(resData => setData(resData.url))
        .catch(err => console.error(err));
    }
  }, [shortId]);

  if (!data) return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading analytics...</div>;

  return (
    <div>
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }} onClick={() => setCurrentPage('dashboard')}>
        <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1>{data.title} Analytics</h1>
          <p style={{ color: 'var(--text-muted)' }}>Destination: <a href={data.redirectUrl} target="_blank" rel="noreferrer">{data.redirectUrl}</a></p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => copyToClipboard(data.fullShortUrl)}><i className="fa-solid fa-copy"></i> Copy Short Link</button>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveQrModal({ qrCode: data.qrCode, title: data.title, shortUrl: data.fullShortUrl })}><i className="fa-solid fa-qrcode"></i> QR Code</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.15)' }}><i className="fa-solid fa-chart-line"></i></div>
          <div>
            <div className="stat-value">{data.clickCount}</div>
            <div className="stat-label">Total Clicks</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="fa-solid fa-calendar-days"></i></div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.2rem' }}>{new Date(data.createdAt).toLocaleDateString()}</div>
            <div className="stat-label">Creation Date</div>
          </div>
        </div>
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Click History Logs</h3>
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Timestamp</th>
              <th>IP Address</th>
              <th>Referrer</th>
              <th>User Agent</th>
            </tr>
          </thead>
          <tbody>
            {data.visitHistory && data.visitHistory.length > 0 ? data.visitHistory.map((v, i) => (
              <tr key={i}>
                <td><strong>{data.visitHistory.length - i}</strong></td>
                <td>{new Date(v.timestamp).toLocaleString()}</td>
                <td><span className="badge badge-secondary">{v.ip || 'Anonymous'}</span></td>
                <td>{v.referrer || 'Direct'}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.userAgent || 'Unknown'}</td>
              </tr>
            )) : (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No clicks recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* API Docs Component */
function DocsPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div className="hero-badge"><i className="fa-solid fa-code"></i> Developer API</div>
        <h1>LinkPulse REST API Documentation</h1>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3>POST /api/url</h3>
        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1rem' }}>Generates a new short URL for a given destination URL.</p>
        <pre style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', color: 'var(--success)' }}>
{`POST /api/url
Content-Type: application/json

{
  "url": "https://example.com/very-long-path",
  "customAlias": "my-brand",
  "title": "Campaign Link",
  "expiration": "7d"
}`}
        </pre>
      </div>
    </div>
  );
}
