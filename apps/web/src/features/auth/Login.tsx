import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Mail, Lock, LogIn } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  const error = useAuthStore(state => state.error);
  const isLoading = useAuthStore(state => state.isLoading);
  const clearError = useAuthStore(state => state.clearError);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      // Error is handled by store
    }
  };
  
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
        {/* Logo/Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            BluePin Messenger
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Sign in to your account
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
        
        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)'
            }}>
              Email
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
          
          {/* Password Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 18,
                height: 18,
                color: 'var(--color-text-muted)'
              }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>
          
          {/* Submit Button */}
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
                Signing in...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <LogIn size={18} />
                Sign In
              </span>
            )}
          </button>
        </form>
        
        {/* Links */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link
            to="/forgot-password"
            style={{
              color: 'var(--color-accent-primary)',
              textDecoration: 'none',
              fontSize: '0.875rem'
            }}
          >
            Forgot password?
          </Link>
          
          <p style={{
            marginTop: '1rem',
            color: 'var(--color-text-secondary)',
            fontSize: '0.875rem'
          }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: 'var(--color-accent-primary)',
                textDecoration: 'none',
                fontWeight: 500
              }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
