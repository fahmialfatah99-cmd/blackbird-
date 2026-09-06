export default function AddContact() {
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
          Add Contact
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
          Search by username or BluePin ID - Coming Soon
        </p>
        <a href="/contacts" className="btn btn-primary">
          Back to Contacts
        </a>
      </div>
    </div>
  );
}
