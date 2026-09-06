export default function Conversation() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg-primary)'
    }}>
      <div className="card" style={{ textAlign: 'center' }}>
        <h2 style={{ color: 'var(--color-text-primary)', marginBottom: '1rem' }}>
          Conversation View
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Coming Soon - Real-time chat interface
        </p>
        <a href="/" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          Back to Home
        </a>
      </div>
    </div>
  );
}
