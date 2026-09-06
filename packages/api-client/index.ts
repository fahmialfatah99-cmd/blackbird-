import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { 
  Profile, 
  Message, 
  Conversation, 
  Contact, 
  Presence,
  RegisterCredentials,
  AuthCredentials 
} from '../types';

export class SupabaseApi {
  private client: SupabaseClient;

  constructor(supabaseUrl: string, supabaseAnonKey: string) {
    this.client = createClient(supabaseUrl, supabaseAnonKey);
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  // ==================== AUTH ====================

  async register(credentials: RegisterCredentials) {
    const { data, error } = await this.client.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          username: credentials.username,
          display_name: credentials.display_name,
        },
      },
    });

    if (error) throw error;
    return data;
  }

  async login(credentials: AuthCredentials) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw error;
    return data;
  }

  async logout() {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  async resetPassword(email: string) {
    const { data, error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return data;
  }

  async getSession() {
    const { data, error } = await this.client.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async getCurrentUser() {
    const { data, error } = await this.client.auth.getUser();
    if (error) throw error;
    return data.user;
  }

  // ==================== PROFILES ====================

  async getProfile(userId: string) {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as Profile;
  }

  async getCurrentProfile() {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    return this.getProfile(user.id);
  }

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await this.client
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  }

  async searchProfiles(query: string) {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,bluepin_id.ilike.%${query}%`)
      .limit(20);

    if (error) throw error;
    return data as Profile[];
  }

  // ==================== CONTACTS ====================

  async getContacts(userId: string) {
    const { data, error } = await this.client
      .from('contacts')
      .select(`
        *,
        contact_profile:profiles!contacts_contact_id_fkey (*)
      `)
      .eq('owner_id', userId)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as (Contact & { contact_profile: Profile })[];
  }

  async getPendingContactRequests(userId: string) {
    const { data, error } = await this.client
      .from('contacts')
      .select(`
        *,
        contact_profile:profiles!contacts_contact_id_fkey (*)
      `)
      .eq('contact_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as (Contact & { contact_profile: Profile })[];
  }

  async sendContactRequest(ownerId: string, contactId: string) {
    const { data, error } = await this.client
      .from('contacts')
      .insert({
        owner_id: ownerId,
        contact_id: contactId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data as Contact;
  }

  async acceptContactRequest(contactId: string) {
    const { data, error } = await this.client
      .from('contacts')
      .update({ status: 'accepted' })
      .eq('id', contactId)
      .select()
      .single();

    if (error) throw error;
    return data as Contact;
  }

  async rejectContactRequest(contactId: string) {
    const { error } = await this.client
      .from('contacts')
      .delete()
      .eq('id', contactId);

    if (error) throw error;
  }

  async blockContact(ownerId: string, contactId: string) {
    const { data, error } = await this.client
      .from('contacts')
      .upsert({
        owner_id: ownerId,
        contact_id: contactId,
        status: 'blocked',
      })
      .select()
      .single();

    if (error) throw error;
    return data as Contact;
  }

  async removeContact(contactId: string) {
    const { error } = await this.client
      .from('contacts')
      .delete()
      .eq('id', contactId);

    if (error) throw error;
  }

  // ==================== CONVERSATIONS ====================

  async createConversation(type: 'direct' | 'group', createdBy: string, name?: string) {
    const { data, error } = await this.client
      .from('conversations')
      .insert({
        type,
        name,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Conversation;
  }

  async addConversationMember(conversationId: string, userId: string, role: 'admin' | 'member' = 'member') {
    const { data, error } = await this.client
      .from('conversation_members')
      .insert({
        conversation_id: conversationId,
        user_id: userId,
        role,
      })
      .select(`
        *,
        profile:profiles!conversation_members_user_id_fkey (*)
      `)
      .single();

    if (error) throw error;
    return data as any;
  }

  async getConversations(userId: string) {
    const { data, error } = await this.client
      .from('conversation_members')
      .select(`
        conversation:conversations (
          *,
          members:conversation_members (*),
          messages (
            *,
            sender:profiles!messages_sender_id_fkey (*)
          )
        )
      `)
      .eq('user_id', userId)
      .eq('archived', false)
      .order('updated_at', { foreignTable: 'conversations', ascending: false });

    if (error) throw error;
    return data.map(item => item.conversation) as (Conversation & { members: any[], messages: Message[] })[];
  }

  async getConversation(conversationId: string) {
    const { data, error } = await this.client
      .from('conversations')
      .select(`
        *,
        members:conversation_members (
          *,
          profile:profiles!conversation_members_user_id_fkey (*)
        )
      `)
      .eq('id', conversationId)
      .single();

    if (error) throw error;
    return data as Conversation & { members: any[] };
  }

  async leaveConversation(conversationId: string, userId: string) {
    const { error } = await this.client
      .from('conversation_members')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  // ==================== MESSAGES ====================

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: 'text' | 'image' | 'system' = 'text',
    attachmentUrl?: string,
    replyToMessageId?: string
  ) {
    const { data, error } = await this.client
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        type,
        attachment_url: attachmentUrl,
        reply_to_message_id: replyToMessageId,
      })
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey (*)
      `)
      .single();

    if (error) throw error;

    // Update conversation updated_at
    await this.client
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    // Create message receipts for all members except sender
    const members = await this.client
      .from('conversation_members')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .neq('user_id', senderId);

    if (members.data && members.data.length > 0) {
      const receipts = members.data.map(member => ({
        message_id: data.id,
        user_id: member.user_id,
        status: 'delivered',
      }));

      await this.client.from('message_receipts').insert(receipts);
    }

    return data as Message & { sender: Profile };
  }

  async getMessages(conversationId: string, limit: number = 50, before?: string) {
    let query = this.client
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey (*),
        receipts:message_receipts (*)
      `)
      .eq('conversation_id', conversationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as (Message & { sender: Profile; receipts: any[] })[];
  }

  async editMessage(messageId: string, content: string) {
    const { data, error } = await this.client
      .from('messages')
      .update({
        content,
        edited_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;
    return data as Message;
  }

  async deleteMessage(messageId: string) {
    const { error } = await this.client
      .from('messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', messageId);

    if (error) throw error;
  }

  async markMessageAsRead(messageId: string, userId: string) {
    const { data, error } = await this.client
      .from('message_receipts')
      .upsert({
        message_id: messageId,
        user_id: userId,
        status: 'read',
      })
      .onConflict('message_id,user_id')
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async markConversationAsRead(conversationId: string, userId: string, messageId: string) {
    const { error } = await this.client
      .from('conversation_members')
      .update({ last_read_message_id: messageId })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    if (error) throw error;

    // Mark all messages as read
    const messages = await this.getMessages(conversationId, 100);
    for (const message of messages) {
      if (message.sender_id !== userId) {
        await this.markMessageAsRead(message.id, userId);
      }
    }
  }

  // ==================== PRESENCE ====================

  async updatePresence(userId: string, isOnline: boolean) {
    const { data, error } = await this.client
      .from('presence')
      .upsert({
        user_id: userId,
        is_online: isOnline,
        last_seen_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Also update profile last_seen_at
    await this.client
      .from('profiles')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', userId);

    return data as Presence;
  }

  async getPresence(userId: string) {
    const { data, error } = await this.client
      .from('presence')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data as Presence;
  }

  // ==================== TYPING INDICATORS ====================

  async updateTypingIndicator(conversationId: string, userId: string, isTyping: boolean) {
    const { data, error } = await this.client
      .from('typing_indicators')
      .upsert({
        conversation_id: conversationId,
        user_id: userId,
        is_typing: isTyping,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ==================== NOTIFICATIONS ====================

  async getNotifications(userId: string, unreadOnly: boolean = false) {
    let query = this.client
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as any[];
  }

  async markNotificationAsRead(notificationId: string) {
    const { error } = await this.client
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  }

  async markAllNotificationsAsRead(userId: string) {
    const { error } = await this.client
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  }

  // ==================== REALTIME SUBSCRIPTIONS ====================

  subscribeToMessages(conversationId: string, callback: (message: any) => void) {
    return this.client
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        callback
      )
      .subscribe();
  }

  subscribeToTyping(conversationId: string, callback: (typing: any) => void) {
    return this.client
      .channel(`typing:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${conversationId}`,
        },
        callback
      )
      .subscribe();
  }

  subscribeToPresence(callback: (presence: any) => void) {
    return this.client
      .channel('presence')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'presence',
        },
        callback
      )
      .subscribe();
  }

  unsubscribe(channel: any) {
    return this.client.removeChannel(channel);
  }

  // ==================== STORAGE ====================

  async uploadAvatar(file: File, userId: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;

    const { data, error } = await this.client.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    const { data: urlData } = this.client.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }

  async uploadImage(file: File, conversationId: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${conversationId}-${Date.now()}.${fileExt}`;

    const { data, error } = await this.client.storage
      .from('images')
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    const { data: urlData } = this.client.storage
      .from('images')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }
}

// Export singleton instance creator
export function createApi(supabaseUrl: string, supabaseAnonKey: string) {
  return new SupabaseApi(supabaseUrl, supabaseAnonKey);
}
