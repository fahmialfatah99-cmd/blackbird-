import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { api } from '../../lib/api'
import type { Message, Profile } from '@bluepin/types'

export default function Conversation() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const [conversation, setConversation] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Profile[]>([])

  useEffect(() => {
    if (!id) return

    loadConversation()
    loadMessages()

    // Subscribe to new messages
    const channel = api.subscribeToMessages(id, (payload) => {
      if (payload.eventType === 'INSERT') {
        const newMsg = payload.new as Message & { sender: Profile }
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === newMsg.id)) return prev
          return [...prev, newMsg]
        })
      } else if (payload.eventType === 'UPDATE') {
        const updatedMsg = payload.new as Message
        setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m))
      } else if (payload.eventType === 'DELETE') {
        const deletedId = payload.old.id
        setMessages(prev => prev.filter(m => m.id !== deletedId))
      }
    })

    // Subscribe to typing indicators
    const typingChannel = api.subscribeToTyping(id, (payload) => {
      const typing = payload.new
      if (typing.is_typing && typing.user_id !== user?.id) {
        api.getProfile(typing.user_id).then(p => {
          setTypingUsers(prev => {
            if (prev.some(u => u.id === p.id)) return prev
            return [...prev, p]
          })
        })
      } else {
        setTypingUsers(prev => prev.filter(u => u.id !== typing.user_id))
      }
    })

    return () => {
      api.unsubscribe(channel)
      api.unsubscribe(typingChannel)
    }
  }, [id])

  const loadConversation = async () => {
    if (!id) return
    try {
      const conv = await api.getConversation(id)
      setConversation(conv)
    } catch (err: any) {
      setError(err.message || 'Failed to load conversation')
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async () => {
    if (!id) return
    try {
      const msgs = await api.getMessages(id, 100)
      setMessages(msgs.reverse())
    } catch (err: any) {
      console.error('Failed to load messages:', err)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id || !user) return

    setIsSending(true)
    try {
      await api.sendMessage(id, user.id, newMessage.trim(), 'text')
      setNewMessage('')
      
      // Clear typing indicator
      await api.updateTypingIndicator(id, user.id, false)
      setIsTyping(false)
    } catch (err: any) {
      setError(err.message || 'Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const handleTyping = async () => {
    if (!id || !user) return
    
    setNewMessage(prev => {
      const newValue = prev
      if (!isTyping && newValue.length > 0) {
        api.updateTypingIndicator(id, user.id, true)
        setIsTyping(true)
        
        // Stop typing after 2 seconds of inactivity
        setTimeout(() => {
          api.updateTypingIndicator(id, user.id, false)
          setIsTyping(false)
        }, 2000)
      }
      return newValue
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return date.toLocaleDateString([], { weekday: 'long' })
    return date.toLocaleDateString()
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

  if (error && !conversation) {
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
            Error
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
            {error}
          </p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const otherUser = conversation?.type === 'direct' 
    ? conversation.members?.find((m: any) => m.user_id !== user?.id)?.profile 
    : null

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'var(--color-bg-primary)'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        background: 'var(--color-bg-secondary)'
      }}>
        <button onClick={() => navigate('/')} className="btn btn-ghost" style={{ padding: '0.5rem' }}>
          ←
        </button>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: conversation?.avatar_url 
            ? `url(${conversation.avatar_url})` 
            : 'var(--color-accent-blue)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          {!conversation?.avatar_url && (conversation?.name || otherUser?.display_name || '?').charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: 'var(--color-text-primary)', fontWeight: '600' }}>
            {conversation?.name || otherUser?.display_name || 'Unknown'}
          </div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            {conversation?.type === 'group' 
              ? `${conversation.members?.length || 0} members`
              : otherUser?.bluepin_id
            }
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginTop: '3rem' }}>
            <p>No messages yet</p>
            <p style={{ fontSize: '0.875rem' }}>Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.sender_id === user?.id
            const showDate = index === 0 || 
              formatDate(messages[index - 1].created_at) !== formatDate(message.created_at)
            
            return (
              <div key={message.id}>
                {showDate && (
                  <div style={{
                    textAlign: 'center',
                    margin: '1rem 0',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.75rem'
                  }}>
                    {formatDate(message.created_at)}
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: isOwn ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                  gap: '0.5rem'
                }}>
                  {!isOwn && conversation?.type === 'group' && (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--color-accent-blue)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {message.sender?.display_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <div style={{
                    maxWidth: '70%',
                    padding: '0.75rem 1rem',
                    borderRadius: '16px',
                    background: isOwn ? 'var(--color-accent-blue)' : 'var(--color-bg-secondary)',
                    color: isOwn ? 'white' : 'var(--color-text-primary)',
                    borderBottomRightRadius: isOwn ? 4 : 16,
                    borderBottomLeftRadius: isOwn ? 16 : 4
                  }}>
                    {conversation?.type === 'group' && !isOwn && (
                      <div style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        marginBottom: '0.25rem',
                        opacity: 0.8
                      }}>
                        {message.sender?.display_name}
                      </div>
                    )}
                    <div style={{ wordBreak: 'break-word' }}>
                      {message.content}
                    </div>
                    <div style={{
                      fontSize: '0.625rem',
                      marginTop: '0.25rem',
                      opacity: 0.7,
                      textAlign: 'right'
                    }}>
                      {formatTime(message.created_at)}
                      {isOwn && message.receipts && message.receipts.length > 0 && (
                        <span style={{ marginLeft: '0.25rem' }}>
                          {message.receipts.some(r => r.status === 'read') ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
        
        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--color-text-secondary)',
            fontSize: '0.875rem',
            marginTop: '0.5rem'
          }}>
            <div className="typing-dot"></div>
            <span>
              {typingUsers.map(u => u.display_name).join(', ')} 
              {typingUsers.length === 1 ? ' is' : ' are'} typing...
            </span>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        padding: '1rem 1.5rem',
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-bg-secondary)'
      }}>
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-end'
        }}>
          <textarea
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value)
              handleTyping()
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '20px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-primary)',
              color: 'var(--color-text-primary)',
              resize: 'none',
              maxHeight: '120px',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={isSending || !newMessage.trim()}
            className="btn btn-primary"
            style={{
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              padding: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isSending || !newMessage.trim() ? 0.5 : 1
            }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  )
}
