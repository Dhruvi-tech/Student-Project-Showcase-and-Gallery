import React, { useState } from 'react';
import { X, LogIn, UserPlus, AlertCircle, Eye, EyeOff, User, AtSign, Mail, Lock, Zap } from 'lucide-react';
import { api } from '../services/api';

export function AuthModal({ onClose, onAuthenticated }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1-Click Instant Demo Login
  async function handleDemoLogin() {
    setLoading(true);
    setError('');
    try {
      let result;
      try {
        result = await api.demoLogin();
      } catch (e) {
        result = await api.login('demo@student.edu', 'DemoPass123!');
      }
      const user = result?.user || result?.student || {
        id: 'stu_demo_eval',
        name: 'Demo Student',
        username: 'demo',
        email: 'demo@student.edu',
      };
      onAuthenticated(user);
      onClose();
    } catch (err) {
      setError(err.message || 'Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // 1-Click Instant Demo Registration
  async function handleInstantRegister() {
    setLoading(true);
    setError('');
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const demoPayload = {
      name: `Student Evaluator ${suffix}`,
      username: `eval_${suffix}`,
      email: `evaluator${suffix}@rvu.edu.in`,
      password: 'DemoPassword123!',
    };
    try {
      const result = await api.registerAccount(demoPayload);
      const user = result?.user || result?.student || {
        id: `stu_${Date.now()}`,
        name: demoPayload.name,
        username: demoPayload.username,
        email: demoPayload.email,
      };
      onAuthenticated(user);
      onClose();
    } catch (err) {
      setError(err.message || 'Could not create demo account.');
    } finally {
      setLoading(false);
    }
  }

  async function submit(event) {
    if (event) event.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!name.trim() || name.trim().length < 2) {
        setError('Please enter your full name (at least 2 characters).');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    } else {
      if (!identifier.trim()) {
        setError('Please enter your email or username.');
        return;
      }
      if (!password) {
        setError('Please enter your password.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const result = await api.login(identifier.trim(), password);
        const user = result?.user || result?.student || {
          id: identifier.toLowerCase().includes('demo') ? 'stu_demo_eval' : `stu_${Date.now()}`,
          name: identifier.split('@')[0] || 'Student Evaluator',
          username: identifier.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_') || 'student',
          email: identifier.trim(),
        };
        onAuthenticated(user);
        onClose();
      } else {
        // Build valid sanitized username
        let cleanUsername = (username || name || email.split('@')[0] || 'student')
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '_')
          .trim();
        while (cleanUsername.length < 3) {
          cleanUsername += `_${Math.floor(Math.random() * 90 + 10)}`;
        }
        cleanUsername = cleanUsername.slice(0, 30);
        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        const result = await api.registerAccount({
          name: cleanName,
          username: cleanUsername,
          email: cleanEmail,
          password,
        });

        const user = result?.user || result?.student || {
          id: `stu_${Date.now()}`,
          name: cleanName,
          username: cleanUsername,
          email: cleanEmail,
        };
        onAuthenticated(user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Could not complete request. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container auth-modal-premium"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Tabs with Close Button */}
        <div className="auth-header-strip">
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setError(''); }}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { setMode('register'); setError(''); }}
            >
              <UserPlus size={15} />
              <span>Create Account</span>
            </button>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Quick Instant Evaluation Actions */}
        <div className="demo-login-box">
          <div className="demo-login-info">
            <Zap size={14} className="text-amber" />
            <span>{mode === 'login' ? 'Quick Evaluation Login:' : 'Quick Evaluation Setup:'}</span>
          </div>
          {mode === 'login' ? (
            <button
              type="button"
              className="btn-demo-quick"
              onClick={handleDemoLogin}
              disabled={loading}
              title="1-click login as Demo Student"
            >
              ⚡ Instant Demo Login (demo@student.edu)
            </button>
          ) : (
            <button
              type="button"
              className="btn-demo-quick"
              onClick={handleInstantRegister}
              disabled={loading}
              title="1-click auto-create an Evaluator student account"
            >
              ⚡ 1-Click Instant Account (Join as Evaluator)
            </button>
          )}
        </div>

        {/* Auth Form with Bounded Flex Scrolling */}
        <form onSubmit={submit} className="auth-form-content" noValidate>
          <div className="modal-body auth-modal-body">
            {error && (
              <div className="auth-error-banner">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {mode === 'register' ? (
              <>
                {/* 2-Column Responsive Name & Username Row */}
                <div className="auth-row-2col">
                  <label className="form-group">
                    <span className="form-label">Full Name *</span>
                    <div className="input-with-icon">
                      <User size={15} className="input-icon" />
                      <input
                        className="form-input"
                        placeholder="e.g. Alex Rivera"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        maxLength={100}
                      />
                    </div>
                  </label>

                  <label className="form-group">
                    <span className="form-label">Username (optional)</span>
                    <div className="input-with-icon">
                      <AtSign size={15} className="input-icon" />
                      <input
                        className="form-input"
                        placeholder="e.g. alex_dev"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                        autoComplete="username"
                        maxLength={30}
                      />
                    </div>
                  </label>
                </div>

                <label className="form-group">
                  <span className="form-label">Email Address *</span>
                  <div className="input-with-icon">
                    <Mail size={15} className="input-icon" />
                    <input
                      className="form-input"
                      type="email"
                      placeholder="e.g. student@rvu.edu.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                </label>

                <label className="form-group">
                  <span className="form-label">Password *</span>
                  <div className="input-with-icon">
                    <Lock size={15} className="input-icon" />
                    <input
                      className="form-input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      maxLength={128}
                    />
                    <button
                      type="button"
                      className="btn-toggle-eye"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </label>
              </>
            ) : (
              <>
                <label className="form-group">
                  <span className="form-label">Email or Username</span>
                  <div className="input-with-icon">
                    <AtSign size={15} className="input-icon" />
                    <input
                      className="form-input"
                      placeholder="demo@student.edu or username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      autoComplete="username"
                      maxLength={150}
                    />
                  </div>
                </label>

                <label className="form-group">
                  <span className="form-label">Password</span>
                  <div className="input-with-icon">
                    <Lock size={15} className="input-icon" />
                    <input
                      className="form-input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      maxLength={128}
                    />
                    <button
                      type="button"
                      className="btn-toggle-eye"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </label>
              </>
            )}
          </div>

          {/* Permanently Pinned Modal Footer */}
          <div className="modal-footer auth-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
            >
              {mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
            </button>
            <button className="btn-primary auth-submit-btn" type="submit" disabled={loading}>
              {mode === 'login' ? <LogIn size={15} /> : <UserPlus size={15} />}
              <span>{loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default AuthModal;
