export default function ContactList() {
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
          Contacts
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
          Contact List - Coming Soon
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <a href="/add-contact" className="btn btn-primary">
            Add Contact
          </a>
          <a href="/" className="btn btn-ghost">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
