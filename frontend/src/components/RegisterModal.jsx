import { useState } from 'react';
import './LoginModal.css';
import { useAuth } from '../context/AuthContext.jsx';
import { useAuthModals } from '../context/AuthModalContext.jsx';

function RegisterModal({ onClose }) {
  const { register } = useAuth();
  const { openLogin } = useAuthModals();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('student'); // 'student' | 'alumni'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateUsername = (value) => {
    if (value.length < 3) return 'Username must be at least 3 characters';
    if (value.length > 20) return 'Username cannot exceed 20 characters';
    if (!/^[a-z0-9_]+$/.test(value)) return 'Only lowercase letters, numbers, and underscores allowed';
    return null;
  };

  const validateEmail = (value) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@marwadiuniversity\.(ac|edu)\.in$/;
    if (!emailRegex.test(value.toLowerCase())) {
      return 'Email must be from @marwadiuniversity.ac.in or @marwadiuniversity.edu.in domain';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Validate username
    const usernameError = validateUsername(username.toLowerCase());
    if (usernameError) {
      setError(usernameError);
      return;
    }

    // Validate email domain
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        name,
        username: username.toLowerCase(),
        email,
        password,
        // backend derives role from isAlumni when role not provided
        isAlumni: accountType === 'alumni',
      });
      onClose?.();
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modal-backdrop" onClick={onClose}>
      <div
        className="login-modal-shell"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="login-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg
            className="login-modal-close-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <div className="login-modal-left">
          <div className="login-modal-logo">
            <span className="login-modal-star">*</span>
            <span>Placement Portal</span>
          </div>
          <h2 className="login-modal-title">Create account</h2>
          <p className="login-modal-subtitle">
            Join the community and start sharing your placement experiences.
          </p>

          <form onSubmit={handleSubmit} className="login-modal-form">
            <label className="login-modal-label">
              Full name
              <input
                type="text"
                className="login-modal-input"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>

            <label className="login-modal-label">
              Username
              <input
                type="text"
                className="login-modal-input"
                placeholder="Choose a username (e.g., john_doe)"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                required
                minLength={3}
                maxLength={20}
              />
              <span className="login-modal-hint">3-20 characters, lowercase letters, numbers, and underscores only</span>
            </label>

            <div className="login-modal-label">
              Account type
              <div className="login-modal-radio-group">
                <label className="login-modal-radio">
                  <input
                    type="radio"
                    name="accountType"
                    value="student"
                    checked={accountType === 'student'}
                    onChange={() => setAccountType('student')}
                  />
                  <span>Student</span>
                </label>
                <label className="login-modal-radio">
                  <input
                    type="radio"
                    name="accountType"
                    value="alumni"
                    checked={accountType === 'alumni'}
                    onChange={() => setAccountType('alumni')}
                  />
                  <span>Alumni</span>
                </label>
              </div>
            </div>

            <label className="login-modal-label">
              Email
              <input
                type="email"
                className="login-modal-input"
                placeholder="yourname@marwadiuniversity.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span className="login-modal-hint">Must be from @marwadiuniversity.ac.in or @marwadiuniversity.edu.in</span>
            </label>

            <label className="login-modal-label">
              Password
              <input
                type="password"
                className="login-modal-input"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            {error && <div className="login-modal-error">{error}</div>}

            <button
              type="submit"
              className="login-modal-button"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="login-modal-footer-text">
            Already have an account?{' '}
            <span className="login-modal-link" onClick={openLogin} style={{ cursor: 'pointer' }}>Login</span>
          </p>
        </div>

        <div className="login-modal-right">
          <div className="login-modal-shape login-modal-shape-main" />
          <div className="login-modal-shape login-modal-shape-small" />
          <div className="login-modal-illustration">
            <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Two people connecting/sharing */}
              <circle cx="150" cy="130" r="40" fill="rgba(129, 140, 248, 0.2)" />
              <circle cx="150" cy="120" r="22" fill="rgba(99, 102, 241, 0.3)" />
              <rect x="138" y="142" width="24" height="45" rx="12" fill="rgba(99, 102, 241, 0.25)" />
              
              <circle cx="250" cy="130" r="40" fill="rgba(244, 114, 182, 0.2)" />
              <circle cx="250" cy="120" r="22" fill="rgba(219, 39, 119, 0.3)" />
              <rect x="238" y="142" width="24" height="45" rx="12" fill="rgba(219, 39, 119, 0.25)" />
              
              {/* Connection line between people */}
              <path d="M190 155 Q200 140 210 155" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="2" fill="none" />
              <circle cx="200" cy="140" r="3" fill="rgba(148, 163, 184, 0.4)" />
              
              {/* Document/experience sharing */}
              <rect x="160" y="200" width="80" height="100" rx="6" fill="rgba(129, 140, 248, 0.15)" />
              <line x1="175" y1="220" x2="225" y2="220" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="2" />
              <line x1="175" y1="240" x2="225" y2="240" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="2" />
              <line x1="175" y1="260" x2="210" y2="260" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="2" />
              <circle cx="220" cy="200" r="8" fill="rgba(244, 114, 182, 0.3)" />
              
              {/* Success checkmarks */}
              <path d="M120 250 L130 260 L150 240" stroke="rgba(34, 197, 94, 0.5)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M280 250 L290 260 L310 240" stroke="rgba(34, 197, 94, 0.5)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              
              {/* Floating elements */}
              <circle cx="100" cy="180" r="6" fill="rgba(251, 191, 36, 0.4)" />
              <circle cx="300" cy="200" r="5" fill="rgba(251, 191, 36, 0.35)" />
              <circle cx="320" cy="280" r="7" fill="rgba(129, 140, 248, 0.25)" />
            </svg>
          </div>
          <p className="login-modal-quote">
            “Every shared experience makes placements a little less scary for someone else.”
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterModal;


