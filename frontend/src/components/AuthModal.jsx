import React, { useState } from 'react';
import { X, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export function AuthModal({ onClose, onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const result = mode === 'login'
        ? await api.login(identifier, password)
        : await api.registerAccount({ name, username, email, password });
      onAuthenticated(result.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Could not complete account request.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-container auth-modal ${mode === 'register' ? 'is-registering' : ''}`} role="dialog" aria-modal="true" aria-labelledby="auth-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div><h2 id="auth-title">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2><span>Join the ProjectSpace community</span></div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            {error && <div className="auth-error"><AlertCircle size={16} />{error}</div>}
            {mode === 'register' && <label className="form-group"><span className="form-label">Full name</span><input className="form-input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required minLength={2} maxLength={100} /></label>}
            <label className="form-group"><span className="form-label">{mode === 'login' ? 'Email or username' : 'Username'}</span><input className="form-input" value={mode === 'login' ? identifier : username} onChange={(e) => mode === 'login' ? setIdentifier(e.target.value) : setUsername(e.target.value)} autoComplete="username" required minLength={3} maxLength={150} /></label>
            {mode === 'register' && <label className="form-group"><span className="form-label">Email</span><input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></label>}
            <label className="form-group"><span className="form-label">Password</span><input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={mode === 'register' ? 12 : 1} maxLength={128} /></label>
            {mode === 'register' && <label className="form-group"><span className="form-label">Confirm password</span><input className="form-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required /></label>}
            {mode === 'register' && <p className="auth-password-hint">Use at least 12 characters with lowercase, uppercase, and a number.</p>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}> {mode === 'login' ? 'Create account' : 'I have an account'}</button>
            <button className="btn-primary" type="submit" disabled={loading}>{mode === 'login' ? <LogIn size={15} /> : <UserPlus size={15} />}{loading ? 'Working…' : mode === 'login' ? 'Log in' : 'Sign up'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
