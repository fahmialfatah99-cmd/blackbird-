import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { api } from '../../lib/api'
import type { Conversation, Message, Profile, Presence } from '@bluepin/types'

export default function ChatList() {
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const [conversations, setConversations] = useState<(Conversation & { lastMessage?: Message; otherProfile?: Profile })[]>([])
  const [presences, setPresences] = useState<Record<string, Presence>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadConversations()
    
    // Subscribe to presence updates
    const presenceChannel = api.subscribeToPresence((payload) => {
      const presence = payload.new as Presence
      setPresences(prev => ({ ...prev, [presence.user_id]: presence }))
    })

    return () => {
      api.unsubscribe(presenceChannel)
    }
  }, [])

  const loadConversations = async () => {
    if (!user) return
    
    try {
      const convs = await api.getConversations(user.id)
      
      // Get other profile for direct conversations
      const enriched = await Promise.all(convs.map(async conv => {
        if (conv.type === 'direct') {
          const otherMember = conv.members?.find(m => m.user_id !== user.id)
          const otherProfile = otherMember?.profile || 
            (otherMember?.user_id ? await api.getProfile(otherMember.user_id) : null)
          return { ...conv, otherProfile }
        }
        return conv
      }))
      
      setConversations(enriched)
    } catch (err: any) {
      setError(err.message || 'Failed to load conversations')
    } finally {
      setIsLoading(false)
    }
  }

  const getLastMessage = (conv: Conversation & { messages?: Message[] }) => {
    if (!conv.messages || conv.messages.length === 0) return null
    return conv.messages[conv.messages.length - 1]
  }

  const getUnreadCount = (conv: Conversation) => {
    // This would require more complex logic with last_read_message_id
    // For now, return 0
    return 0
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (hours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const getDisplayName = (conv: Conversation & { otherProfile?: Profile }) => {
    if (conv.name) return conv.name
    if (conv.otherProfile) return conv.otherProfile.display_name
    return 'Unknown'
  }

  const getAvatar = (conv: Conversation & { otherProfile?: Profile }) => {
    if (conv.avatar_url) return conv.avatar_url
    if (conv.otherProfile?.avatar_url) return conv.otherProfile.avatar_url
    return null
  }

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  const isOnline = (userId?: string) => {
    if (!userId) return false
    return presences[userId]?.is_online || false
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
      display: 'flex',
      height: '100vh',
      background: 'var(--color-bg-primary)'
    }}>
      {/* Sidebar */}
      <div style={{
        width: '360px',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg-secondary)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h1 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
            BluePin
          </h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => navigate('/create-group')}
              className="btn btn-ghost"
              style={{ padding: '0.5rem' }}
              title="Create Group"
            >
              +
            </button>
            <button
              onClick={() => navigate('/contacts')}
              className="btn btn-ghost"
              style={{ padding: '0.5rem' }}
              title="Contacts"
            >
              👥
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="btn btn-ghost"
              style={{ padding: '0.5rem' }}
              title="Profile"
            >
              👤
            </button>
          </div>
        </div>

        {/* Conversations List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {error && (
            <div className="alert alert-error" style={{ margin: '1rem' }}>
              {error}
            </div>
          )}
          
          {conversations.length === 0 && !error && (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--color-text-secondary)'
            }}>
              <p style={{ marginBottom: '1rem' }}>No conversations yet</p>
              <button onClick={() => navigate('/contacts')} className="btn btn-primary">
                Add Contacts
              </button>
            </div>
          )}

          {conversations.map(conv => {
            const lastMessage = getLastMessage(conv)
            const displayName = getDisplayName(conv)
            const avatar = getAvatar(conv)
            const unreadCount = getUnreadCount(conv)
            const onlineUser = conv.type === 'direct' && conv.otherProfile 
              ? isOnline(conv.otherProfile.id)
              : false

            return (
              <div
                key={conv.id}
                onClick={() => navigate(`/conversation/${conv.id}`)}
                style={{
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--color-border)',
                  transition: 'background 0.2s',
                  background: 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {/* Avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: avatar 
                      ? `url(${avatar})`
                      : 'var(--color-accent-blue)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.25rem'
                  }}>
                    {!avatar && getInitials(displayName)}
                  </div>
                  {conv.type === 'direct' && onlineUser && (
                    <div style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#10B981',
                      border: '2px solid var(--color-bg-secondary)'
                    }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.25rem'
                  }}>
                    <span style={{
                      color: 'var(--color-text-primary)',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {displayName}
                    </span>
                    {lastMessage && (
                      <span style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.75rem'
                      }}>
                        {formatTime(lastMessage.created_at)}
                      </span>
                    )}
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.875rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {lastMessage ? (
                        <>
                          {lastMessage.sender_id === user?.id && 'You: '}
                          {lastMessage.content}
                        </>
                      ) : (
                        <em>No messages yet</em>
                      )}
                    </span>
                    {unreadCount > 0 && (
                      <span style={{
                        background: 'var(--color-accent-blue)',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '10px',
                        minWidth: '20px',
                        textAlign: 'center'
                      }}>
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-primary)'
      }}>
        <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💬</div>
          <h2 style={{ color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
            Welcome to BluePin Messenger
          </h2>
          <p>Select a conversation to start chatting</p>
        </div>
      </div>
    </div>
  )
}
