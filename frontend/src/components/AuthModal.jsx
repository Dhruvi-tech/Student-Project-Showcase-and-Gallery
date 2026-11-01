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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      onAuthenticated(result.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Demo login failed. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    setError('');

    if (mode === 'register') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      const result = mode === 'login'
        ? await api.login(identifier, password)
        : await api.registerAccount({ name, username, email, password });
      onAuthenticated(result.user);
      onClose();
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
        {/* Header with Close */}
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

        {/* Quick Demo Login Pill */}
        {mode === 'login' && (
          <div className="demo-login-box">
            <div className="demo-login-info">
              <Zap size={14} className="text-amber" />
              <span>Quick Evaluation Mode:</span>
            </div>
            <button
              type="button"
              className="btn-demo-quick"
              onClick={handleDemoLogin}
              disabled={loading}
              title="1-click login as Demo Student"
            >
              ⚡ Instant Demo Login (demo@student.edu)
            </button>
          </div>
        )}

        <form onSubmit={submit} className="auth-form-content">
          <div className="modal-body auth-modal-body">
            {error && (
              <div className="auth-error-banner">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {mode === 'register' && (
              <label className="form-group">
                <span className="form-label">Full Name</span>
                <div className="input-with-icon">
                  <User size={15} className="input-icon" />
                  <input
                    className="form-input"
                    placeholder="e.g. Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </div>
              </label>
            )}

            <label className="form-group">
              <span className="form-label">{mode === 'login' ? 'Email or Username' : 'Username'}</span>
              <div className="input-with-icon">
                <AtSign size={15} className="input-icon" />
                <input
                  className="form-input"
                  placeholder={mode === 'login' ? 'demo@student.edu or username' : 'e.g. alex_dev'}
                  value={mode === 'login' ? identifier : username}
                  onChange={(e) => mode === 'login' ? setIdentifier(e.target.value) : setUsername(e.target.value)}
                  autoComplete="username"
                  required
                  minLength={3}
                  maxLength={150}
                />
              </div>
            </label>

            {mode === 'register' && (
              <label className="form-group">
                <span className="form-label">Email Address</span>
                <div className="input-with-icon">
                  <Mail size={15} className="input-icon" />
                  <input
                    className="form-input"
                    type="email"
                    placeholder="student@rvu.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </label>
            )}

            <label className="form-group">
              <span className="form-label">Password</span>
              <div className="input-with-icon">
                <Lock size={15} className="input-icon" />
                <input
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'login' ? 'Enter your password' : 'At least 6 characters'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  minLength={mode === 'register' ? 6 : 1}
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

            {mode === 'register' && (
              <label className="form-group">
                <span className="form-label">Confirm Password</span>
                <div className="input-with-icon">
                  <Lock size={15} className="input-icon" />
                  <input
                    className="form-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-type your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </label>
            )}
          </div>

          <div className="modal-footer auth-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
            >
              {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
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
