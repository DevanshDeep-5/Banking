import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  TrendingUp,
  Settings,
  LogOut,
  Download,
} from 'lucide-react';

// DemoDashboard with simple client-side SignUp / SignIn (localStorage)
// NOTE: This is a demo-only auth. For production, use a secure backend, hashed passwords, and proper sessions/JWT.

const AUTH_KEY = 'demo_auth_users';
const SESSION_KEY = 'demo_auth_session';

const DemoDashboard = () => {
  // --- auth state ---
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [authError, setAuthError] = useState('');

  // --- dashboard state ---
  const [activeTab, setActiveTab] = useState('transactions');
  const [transactions, setTransactions] = useState([
    { id: 1, raw: 'STARBUCKS COFFEE #1234', category: 'coffee_dining', confidence: 0.95, status: 'pending' },
    { id: 2, raw: 'AMAZON MKTPLACE PMT', category: 'shopping', confidence: 0.88, status: 'pending' },
    { id: 3, raw: 'SHELL GAS STATION', category: 'fuel', confidence: 0.92, status: 'pending' },
    { id: 4, raw: 'BIG BAZAAR RETAIL', category: 'groceries', confidence: 0.89, status: 'pending' },
    { id: 5, raw: 'UBER TRIP #5678', category: 'transport', confidence: 0.94, status: 'pending' },
  ]);

  const [metrics] = useState({
    macroF1: 0.91,
    totalTransactions: 10000,
    categorized: 9850,
    needsReview: 150,
  });

  // Upload state + refs
  const fileInputRef = useRef(null);
  const nextIdRef = useRef(1000);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [lastUploadedFiles, setLastUploadedFiles] = useState([]);

  // --- auth helpers (very small demo storage) ---
  const loadUsers = () => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  };

  const saveUsers = (users) => localStorage.setItem(AUTH_KEY, JSON.stringify(users));

  const createAccount = ({ username, password }) => {
    const users = loadUsers();
    if (users[username]) return { ok: false, message: 'Username already exists' };
    // Demo: store base64 of password (NOT SECURE) — replace with secure hashing/server in real app
    users[username] = { password: btoa(password) };
    saveUsers(users);
    return { ok: true };
  };

  const signIn = ({ username, password }) => {
    const users = loadUsers();
    const entry = users[username];
    if (!entry) return { ok: false, message: 'No such user' };
    if (entry.password !== btoa(password)) return { ok: false, message: 'Incorrect password' };
    // create session
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username, createdAt: Date.now() }));
    setUser({ username });
    return { ok: true };
  };

  const signOut = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  useEffect(() => {
    // restore session if exists
    try {
      const s = localStorage.getItem(SESSION_KEY);
      if (s) {
        const session = JSON.parse(s);
        if (session?.username) setUser({ username: session.username });
      }
    } catch (e) {}
  }, []);

  // --- transaction handlers ---
  const handleAccept = (id) => setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'accepted' } : t)));
  const handleCorrect = (id) => {
    const newCategory = prompt('Enter correct category:');
    if (newCategory) {
      setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, category: newCategory.replace(/\s+/g, '_').toLowerCase(), status: 'corrected' } : t)));
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      coffee_dining: 'bg-amber-100 text-amber-800',
      shopping: 'bg-blue-100 text-blue-800',
      fuel: 'bg-red-100 text-red-800',
      groceries: 'bg-emerald-100 text-emerald-800',
      transport: 'bg-violet-100 text-violet-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const exportCSV = () => {
    const rows = [
      ['id', 'raw', 'category', 'confidence', 'status'],
      ...transactions.map((t) => [t.id, `"${t.raw}"`, t.category, t.confidence, t.status]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Upload helpers ---
  const parseCSVText = (text) => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];
    const first = lines[0].toLowerCase();
    const dataLines = (first.includes('raw') || first.includes('transaction') || first.includes('description')) ? lines.slice(1) : lines;
    return dataLines.map((line) => {
      const parts = line.split(',');
      const candidate = parts.length === 1 ? parts[0] : parts.reduce((a, b) => (a.length > b.length ? a : b));
      return candidate.replace(/^"|"$/g, '').trim();
    }).filter(Boolean);
  };

  const handleFiles = async (files) => {
    setUploadProgress({ status: 'reading', total: files.length, processed: 0 });
    const newTxns = [];
    const uploaded = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      uploaded.push({ name: file.name, size: file.size });

      if (file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv') {
        const text = await file.text();
        const rows = parseCSVText(text);
        rows.forEach((raw) => newTxns.push({ id: nextIdRef.current++, raw, category: 'unknown', confidence: 0.5, status: 'pending' }));
      } else if (file.type.startsWith('text/')) {
        const text = await file.text();
        const rows = parseCSVText(text);
        rows.forEach((raw) => newTxns.push({ id: nextIdRef.current++, raw, category: 'unknown', confidence: 0.5, status: 'pending' }));
      } else {
        newTxns.push({ id: nextIdRef.current++, raw: `[${file.name}] PDF/unsupported: parsing not implemented`, category: 'unknown', confidence: 0.0, status: 'pending' });
      }

      setUploadProgress((p) => ({ ...p, processed: (p?.processed || 0) + 1 }));
    }

    setTransactions((prev) => [...newTxns, ...prev]);
    setLastUploadedFiles(uploaded);
    setUploadProgress(null);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) handleFiles(files);
  };
  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const openFilePicker = () => fileInputRef.current?.click();
  const onFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) handleFiles(files);
    e.target.value = '';
  };

  // --- Simple auth UI handlers ---
  const handleSignupSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const username = (form.get('username') || '').toString().trim();
    const password = (form.get('password') || '').toString();
    if (!username || !password) return setAuthError('Provide username and password');
    const res = createAccount({ username, password });
    if (!res.ok) return setAuthError(res.message);
    // auto sign-in after signup
    signIn({ username, password });
    setAuthError('');
  };

  const handleSigninSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const username = (form.get('username') || '').toString().trim();
    const password = (form.get('password') || '').toString();
    if (!username || !password) return setAuthError('Provide username and password');
    const res = signIn({ username, password });
    if (!res.ok) return setAuthError(res.message);
    setAuthError('');
  };

  // --- render auth screen if not signed in ---
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow">
          <h2 className="text-2xl font-semibold mb-4">{authMode === 'signin' ? 'Sign in' : 'Create account'}</h2>
          {authError && <div className="text-sm text-red-600 mb-3">{authError}</div>}

          {authMode === 'signup' ? (
            <form onSubmit={handleSignupSubmit}>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input name="username" className="mt-1 mb-3 block w-full rounded-md border-1 border-black p-2" />
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input name="password" type="password" className="mt-1 mb-4 block w-full rounded-md border-1 border-black p-2" />
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-md">Create account</button>
              <div className="mt-3 text-sm text-gray-600">Already have an account? <button type="button" onClick={() => { setAuthMode('signin'); setAuthError(''); }} className="text-blue-600">Sign in</button></div>
            </form>
          ) : (
            <form onSubmit={handleSigninSubmit}>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input name="username" className="mt-1 mb-3 block w-full rounded-md border-1 border-black p-2" />
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input name="password" type="password" className="mt-1 mb-4 block w-full rounded-md border-1 border-black p-2" />
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-md">Sign in</button>
              <div className="mt-3 text-sm text-gray-600">New here? <button type="button" onClick={() => { setAuthMode('signup'); setAuthError(''); }} className="text-blue-600">Create account</button></div>
            </form>
          )}

          <div className="mt-4 text-center text-sm text-gray-500">This demo stores accounts in <code className="bg-gray-100 px-1 rounded">localStorage</code>.</div>
        </div>
      </div>
    );
  }

  // --- Render the dashboard when signed in ---
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900">Transaction Categorizer</h1>
              <div className="text-sm text-gray-500">signed in as <strong>{user.username}</strong></div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setActiveTab('model')} className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                <Settings className="w-5 h-5" />
                <span className="hidden sm:inline">Settings</span>
              </button>

              <button onClick={() => { signOut(); }} className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalTransactions.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <FileText className="w-7 h-7 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Categorized</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.categorized.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50">
              <CheckCircle className="w-7 h-7 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Needs Review</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.needsReview.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <XCircle className="w-7 h-7 text-orange-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Macro F1 Score</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.macroF1.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-lg bg-violet-50">
              <TrendingUp className="w-7 h-7 text-violet-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow mb-6 overflow-hidden">
          <div className="border-b border-gray-100">
            <nav className="flex gap-1 p-2 px-4">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'transactions' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'upload' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Upload
              </button>
              <button
                onClick={() => setActiveTab('model')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'model' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Model Performance
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'transactions' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                  <div className="flex items-center gap-3">
                    <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {transactions.map((txn) => (
                    <div key={txn.id} className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-4">
                          <p className="font-mono text-sm text-gray-800 mb-2">{txn.raw}</p>
                          <div className="flex items-center gap-4 flex-wrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(txn.category)}`}>
                              {txn.category.replace(/_/g, ' ')}
                            </span>

                            <span className={`text-sm font-medium ${getConfidenceColor(txn.confidence)}`}>
                              {(txn.confidence * 100).toFixed(1)}% confidence
                            </span>

                            {txn.status === 'accepted' && <span className="text-sm text-emerald-600">✓ Accepted</span>}
                            {txn.status === 'corrected' && <span className="text-sm text-blue-600">✓ Corrected</span>}
                          </div>
                        </div>

                        {txn.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleAccept(txn.id)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">
                              Accept
                            </button>
                            <button onClick={() => handleCorrect(txn.id)} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm">
                              Correct
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'upload' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Transactions</h2>

                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onFileChange} accept=".csv,text/csv,text/plain,.txt,.pdf" />

                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}`}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Drop CSV files here, or click to browse</p>
                  <p className="text-sm text-gray-500">We parse one transaction per line (or CSV with a header). PDF uploads will be added as placeholders — implement PDF parsing separately.</p>

                  <div className="mt-4 flex justify-center gap-3">
                    <button onClick={openFilePicker} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Select File</button>
                  </div>

                    {uploadProgress && (
                      <p className="mt-4 text-sm text-gray-600">Uploading {uploadProgress.processed}/{uploadProgress.total} files...</p>
                    )}

                    {lastUploadedFiles.length > 0 && (
                      <div className="mt-4 text-left max-w-xl mx-auto">
                        <p className="text-sm font-medium">Last uploaded files:</p>
                        <ul className="list-disc ml-6 text-sm text-gray-600">
                          {lastUploadedFiles.map((f) => (
                            <li key={f.name}>{f.name} — {(f.size / 1024).toFixed(0)} KB</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            )}

            {activeTab === 'model' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Model Performance</h2>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="font-medium text-gray-900 mb-4">Overall Metrics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Macro F1</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.macroF1.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Accuracy</p>
                      <p className="text-2xl font-bold text-gray-900">0.93</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Training Samples</p>
                      <p className="text-2xl font-bold text-gray-900">10,000</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-4">Per-Category Performance</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Coffee/Dining', f1: 0.94, precision: 0.95, recall: 0.93 },
                      { name: 'Shopping', f1: 0.9, precision: 0.88, recall: 0.92 },
                      { name: 'Fuel', f1: 0.92, precision: 0.93, recall: 0.91 },
                      { name: 'Groceries', f1: 0.89, precision: 0.87, recall: 0.91 },
                      { name: 'Transport', f1: 0.91, precision: 0.9, recall: 0.92 },
                    ].map((cat) => (
                      <div key={cat.name} className="bg-white border border-gray-100 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">{cat.name}</span>
                          <div className="flex gap-6 text-sm">
                            <span>
                              F1: <strong>{cat.f1.toFixed(2)}</strong>
                            </span>
                            <span>
                              Precision: <strong>{cat.precision.toFixed(2)}</strong>
                            </span>
                            <span>
                              Recall: <strong>{cat.recall.toFixed(2)}</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="w-full py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-medium">Retrain Model</button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DemoDashboard;
