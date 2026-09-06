import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { api } from '../../lib/api'
import type { Profile } from '@bluepin/types'

export default function CreateGroup() {
  const [name, setName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const { user, profile } = useAuthStore()

  useEffect(() => {
    const searchProfiles = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([])
        return
      }

      try {
        const results = await api.searchProfiles(searchQuery)
        // Filter out already selected members and current user
        const filtered = results.filter(p => 
          p.id !== user?.id && 
          !selectedMembers.has(p.id)
        )
        setSearchResults(filtered)
      } catch (err: any) {
        console.error('Search error:', err)
      }
    }

    const debounceTimer = setTimeout(searchProfiles, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, selectedMembers, user?.id])

  const toggleMember = (userId: string) => {
    const newSelected = new Set(selectedMembers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedMembers(newSelected)
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Group name is required')
      return
    }

    if (selectedMembers.size < 1) {
      setError('Select at least one member')
      return
    }

    if (!user || !profile) {
      setError('Not authenticated')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Create group conversation
      const conversation = await api.createConversation('group', user.id, name.trim())
      
      // Add creator as admin
      await api.addConversationMember(conversation.id, user.id, 'admin')
      
      // Add selected members
      for (const memberId of selectedMembers) {
        await api.addConversationMember(conversation.id, memberId, 'member')
      }

      setSuccess(true)
      setTimeout(() => {
        window.location.href = `/conversation/${conversation.id}`
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to create group')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-primary)'
      }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
          <h2 style={{ color: 'var(--color-text-primary)', marginBottom: '1rem' }}>
            Group Created!
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Redirecting to group chat...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-primary)',
      padding: '2rem'
    }}>
      <div className="container">
        <h1 style={{ color: 'var(--color-text-primary)', marginBottom: '2rem' }}>
          Create New Group
        </h1>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {/* Group Name */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ 
            display: 'block', 
            color: 'var(--color-text-primary)',
            marginBottom: '0.5rem',
            fontWeight: '600'
          }}>
            Group Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter group name"
            className="input-field"
            style={{ width: '100%', maxWidth: '400px' }}
          />
        </div>

        {/* Search Members */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ 
            display: 'block', 
            color: 'var(--color-text-primary)',
            marginBottom: '0.5rem',
            fontWeight: '600'
          }}>
            Add Members
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username or BluePin ID"
            className="input-field"
            style={{ width: '100%', maxWidth: '400px' }}
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div style={{ 
            marginBottom: '2rem',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            {searchResults.map(result => (
              <div
                key={result.id}
                onClick={() => toggleMember(result.id)}
                style={{
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                  background: selectedMembers.has(result.id) 
                    ? 'var(--color-accent-blue)' 
                    : 'transparent',
                  borderBottom: '1px solid var(--color-border)'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--color-accent-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  {result.display_name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--color-text-primary)', fontWeight: '600' }}>
                    {result.display_name}
                  </div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                    @{result.username} • {result.bluepin_id}
                  </div>
                </div>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: `2px solid ${selectedMembers.has(result.id) ? 'var(--color-accent-blue)' : 'var(--color-border)'}`,
                  background: selectedMembers.has(result.id) ? 'var(--color-accent-blue)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.75rem'
                }}>
                  {selectedMembers.has(result.id) && '✓'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Members */}
        {selectedMembers.size > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block', 
              color: 'var(--color-text-primary)',
              marginBottom: '0.5rem',
              fontWeight: '600'
            }}>
              Selected Members ({selectedMembers.size})
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {Array.from(selectedMembers).map(memberId => (
                <span
                  key={memberId}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'var(--color-bg-secondary)',
                    borderRadius: '20px',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.875rem'
                  }}
                >
                  {memberId.slice(0, 8)}...
                  <button
                    onClick={() => toggleMember(memberId)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      padding: '0',
                      lineHeight: '1'
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleCreate}
            disabled={isLoading || !name.trim() || selectedMembers.size === 0}
            className="btn btn-primary"
            style={{ opacity: isLoading || !name.trim() || selectedMembers.size === 0 ? 0.5 : 1 }}
          >
            {isLoading ? 'Creating...' : 'Create Group'}
          </button>
          <a href="/" className="btn btn-ghost">
            Cancel
          </a>
        </div>
      </div>
    </div>
  )
}
