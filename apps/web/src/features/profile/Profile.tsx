import { useAuthStore } from '../../store/authStore';

export default function Profile() {
  const profile = useAuthStore(state => state.profile);
  const logout = useAuthStore(state => state.logout);
  
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'var(--color-bg-primary)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            My Profile
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Manage your account settings
          </p>
        </div>
        
        {/* Profile Info */}
        {profile && (
          <div style={{ marginBottom: '2rem' }}>
            {/* Avatar Placeholder */}
            <div style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              margin: '0 auto 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: 'white'
            }}>
              {profile.display_name.charAt(0).toUpperCase()}
            </div>
            
            {/* Profile Details */}
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ 
                color: 'var(--color-text-primary)', 
                fontSize: '1.25rem', 
                fontWeight: 'bold',
                marginBottom: '0.25rem'
              }}>
                {profile.display_name}
              </h2>
              <p style={{ color: 'var(--color-accent-primary)', marginBottom: '0.5rem' }}>
                @{profile.username}
              </p>
              <p style={{ 
                color: 'var(--color-text-muted)', 
                fontSize: '0.875rem',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)'
              }}>
                BluePin ID: {profile.bluepin_id}
              </p>
              
              {profile.personal_status && (
                <p style={{ 
                  color: 'var(--color-text-secondary)', 
                  fontSize: '0.875rem',
                  marginTop: '1rem',
                  fontStyle: 'italic'
                }}>
                  "{profile.personal_status}"
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button className="btn btn-secondary" style={{ width: '100%' }}>
            Edit Profile
          </button>
          <button className="btn btn-ghost" style={{ width: '100%' }}>
            Privacy Settings
          </button>
          <button 
            onClick={() => logout()}
            className="btn" 
            style={{ 
              width: '100%', 
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--color-error)',
              border: '1px solid var(--color-error)'
            }}
          >
            Sign Out
          </button>
        </div>
        
        {/* Back Link */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a href="/" style={{ 
            color: 'var(--color-text-secondary)',
            textDecoration: 'none',
            fontSize: '0.875rem'
          }}>
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
