import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { createApi } from '../../../packages/api-client/index'
import type { Contact } from '../../../packages/types/index'
import { Users, UserPlus, Check, X, Shield } from 'lucide-react'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const api = createApi(supabaseUrl || '', supabaseAnonKey || '')

export default function ContactList() {
  const profile = useAuthStore(state => state.profile)
  const [contacts, setContacts] = useState<(Contact & { contact_profile: any })[]>([])
  const [pendingRequests, setPendingRequests] = useState<(Contact & { contact_profile: any })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'contacts' | 'requests'>('contacts')

  useEffect(() => {
    if (profile) {
      loadContacts()
    }
  }, [profile])

  const loadContacts = async () => {
    if (!profile) return
    
    try {
      const [contactsData, requestsData] = await Promise.all([
        api.getContacts(profile.id),
        api.getPendingContactRequests(profile.id)
      ])
      
      setContacts(contactsData)
      setPendingRequests(requestsData)
    } catch (error) {
      console.error('Failed to load contacts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await api.acceptContactRequest(requestId)
      await loadContacts()
    } catch (error) {
      console.error('Failed to accept request:', error)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      await api.rejectContactRequest(requestId)
      await loadContacts()
    } catch (error) {
      console.error('Failed to reject request:', error)
    }
  }

  const handleBlockContact = async (contactId: string) => {
    if (!profile) return
    try {
      await api.blockContact(profile.id, contactId)
      await loadContacts()
    } catch (error) {
      console.error('Failed to block contact:', error)
    }
  }

  const handleRemoveContact = async (contactId: string) => {
    try {
      await api.removeContact(contactId)
      await loadContacts()
    } catch (error) {
      console.error('Failed to remove contact:', error)
    }
  }

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-primary)'
      }}>
        <div className="typing-dot"></div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-primary)',
      padding: '2rem'
    }}>
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h1 className="text-gradient" style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>
            <Users size={28} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Contacts
          </h1>
          <a href="/add-contact" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
            <UserPlus size={18} style={{ marginRight: '0.5rem' }} />
            Add Contact
          </a>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--color-border)'
        }}>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`btn ${activeTab === 'contacts' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1 }}
          >
            My Contacts ({contacts.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1 }}
          >
            Requests ({pendingRequests.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'contacts' && (
          <div>
            {contacts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <Users size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
                <p style={{ color: 'var(--color-text-secondary)' }}>No contacts yet</p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Add your first contact to start chatting
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1rem',
                      gap: '1rem'
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'var(--gradient-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: 'white',
                      flexShrink: 0
                    }}>
                      {contact.contact_profile?.display_name?.charAt(0).toUpperCase() || '?'}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        color: 'var(--color-text-primary)',
                        fontWeight: 600,
                        marginBottom: '0.25rem'
                      }}>
                        {contact.contact_profile?.display_name}
                      </h3>
                      <p style={{
                        color: 'var(--color-accent-primary)',
                        fontSize: '0.875rem'
                      }}>
                        @{contact.contact_profile?.username}
                      </p>
                      {contact.contact_profile?.personal_status && (
                        <p style={{
                          color: 'var(--color-text-muted)',
                          fontSize: '0.75rem',
                          marginTop: '0.25rem',
                          fontStyle: 'italic'
                        }}>
                          {contact.contact_profile.personal_status}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => handleRemoveContact(contact.id)}
                      className="btn btn-ghost"
                      style={{ color: 'var(--color-error)' }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            {pendingRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <Shield size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
                <p style={{ color: 'var(--color-text-secondary)' }}>No pending requests</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1rem',
                      gap: '1rem'
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'var(--gradient-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: 'white',
                      flexShrink: 0
                    }}>
                      {request.contact_profile?.display_name?.charAt(0).toUpperCase() || '?'}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        color: 'var(--color-text-primary)',
                        fontWeight: 600,
                        marginBottom: '0.25rem'
                      }}>
                        {request.contact_profile?.display_name}
                      </h3>
                      <p style={{
                        color: 'var(--color-accent-primary)',
                        fontSize: '0.875rem'
                      }}>
                        @{request.contact_profile?.username}
                      </p>
                      <p style={{
                        color: 'var(--color-text-muted)',
                        fontSize: '0.75rem'
                      }}>
                        BluePin ID: {request.contact_profile?.bluepin_id}
                      </p>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="btn btn-primary"
                        style={{ padding: '0.5rem' }}
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="btn btn-ghost"
                        style={{ padding: '0.5rem', color: 'var(--color-error)' }}
                      >
                        <X size={18} />
                      </button>
                      <button
                        onClick={() => handleBlockContact(request.contact_id)}
                        className="btn btn-ghost"
                        style={{ padding: '0.5rem' }}
                        title="Block user"
                      >
                        <Shield size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Back Link */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a href="/" style={{
            color: 'var(--color-text-secondary)',
            textDecoration: 'none',
            fontSize: '0.875rem'
          }}>
            ← Back to Chats
          </a>
        </div>
      </div>
    </div>
  )
}
