import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const resetPassword = useAuthStore(state => state.resetPassword);
  const error = useAuthStore(state => state.error);
  const isLoading = useAuthStore(state => state.isLoading);
  const clearError = useAuthStore(state => state.clearError);
  
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await resetPassword(email);
      setIsSent(true);
    } catch (err) {
      // Error is handled by store
    }
  };
  
  if (isSent) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'var(--color-bg-primary)'
      }}>
        <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <div style={{ marginBottom: '2rem' }}>
            <Mail style={{
              width: 64,
              height: 64,
              color: 'var(--color-accent-primary)',
              margin: '0 auto 1rem'
            }} />
            <h1 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Check Your Email
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              We've sent password reset instructions to:<br />
              <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong>
            </p>
          </div>
          
          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem' }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'var(--color-bg-primary)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/login')}
          className="btn btn-ghost"
          style={{ marginBottom: '1rem', padding: '0.5rem' }}
        >
          <ArrowLeft size={18} />
          Back to Login
        </button>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Forgot Password?
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            No worries, we'll send you reset instructions
          </p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div style={{
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--color-error)',
            color: 'var(--color-error)',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}
        
        {/* Reset Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)'
            }}>
              Enter your email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 18,
                height: 18,
                color: 'var(--color-text-muted)'
              }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="typing-dot"></div>
                Sending...
              </span>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
