export default function ChatList() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg-primary)'
    }}>
      <div className="card" style={{ textAlign: 'center' }}>
        <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          BluePin Messenger
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
          Chat List - Coming Soon
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <a href="/contacts" className="btn btn-secondary">
            View Contacts
          </a>
          <a href="/profile" className="btn btn-ghost">
            My Profile
          </a>
        </div>
      </div>
    </div>
  );
}
