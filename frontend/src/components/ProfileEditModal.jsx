import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export function ProfileEditModal({ user, onClose, onSaved }) {
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [interestText, setInterestText] = useState((user?.interests || []).join(', '));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const interests = [...new Set(interestText.split(',').map((value) => value.trim()).filter(Boolean))].slice(0, 30);
      const payload = {
        name: name.trim() || user?.name || 'Student Developer',
        bio: bio.trim(),
        interests,
      };
      const result = await api.updateCurrentUser(payload, user);
      const updatedUser = {
        ...user,
        ...payload,
        ...(result?.user || (result?.id ? result : {})),
      };
      onSaved(updatedUser);
      onClose();
    } catch (err) {
      setError(err.message || 'Could not update your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <section
        className="modal-container profile-edit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <span className="eyebrow">Your account</span>
            <h2 id="edit-profile-title">Edit profile</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close profile editor">
            <X size={18} />
          </button>
        </header>
        <form onSubmit={submit} className="modal-body profile-edit-form">
          {error && (
            <div className="auth-error-banner">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}
          <label className="form-group">
            <span className="form-label">Display name</span>
            <input
              className="form-input"
              minLength={2}
              maxLength={100}
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your full name"
            />
          </label>
          <label className="form-group">
            <span className="form-label">Bio</span>
            <textarea
              className="form-textarea"
              rows={3}
              maxLength={500}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="What do you like building?"
            />
          </label>
          <label className="form-group">
            <span className="form-label">Discovery interests</span>
            <input
              className="form-input"
              value={interestText}
              onChange={(event) => setInterestText(event.target.value)}
              placeholder="Python, computer vision, education"
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              Separate interests with commas to personalize your recommendations.
            </small>
          </label>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              <Save size={14} />
              <span>{saving ? 'Saving…' : 'Save profile'}</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default ProfileEditModal;
