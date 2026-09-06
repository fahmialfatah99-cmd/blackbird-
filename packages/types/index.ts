export interface Profile {
  id: string;
  bluepin_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  personal_status?: string;
  bio?: string;
  show_last_seen: boolean;
  show_read_receipt: boolean;
  allow_messages_from_non_contacts: boolean;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  owner_id: string;
  contact_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
  contact_profile?: Profile;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  avatar_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  members?: ConversationMember[];
  last_message?: Message;
}

export interface ConversationMember {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  muted: boolean;
  archived: boolean;
  last_read_message_id?: string;
  profile?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  type: 'text' | 'image' | 'system';
  content: string;
  attachment_url?: string;
  reply_to_message_id?: string;
  edited_at?: string;
  deleted_at?: string;
  created_at: string;
  sender?: Profile;
  receipts?: MessageReceipt[];
}

export interface MessageReceipt {
  id: string;
  message_id: string;
  user_id: string;
  status: 'delivered' | 'read';
  updated_at: string;
}

export interface TypingIndicator {
  conversation_id: string;
  user_id: string;
  is_typing: boolean;
  updated_at: string;
}

export interface Presence {
  user_id: string;
  is_online: boolean;
  last_seen_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  payload: Record<string, any>;
  read: boolean;
  created_at: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends AuthCredentials {
  username: string;
  display_name: string;
}

export type MessageType = 'text' | 'image' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';
export type ContactStatus = 'pending' | 'accepted' | 'blocked';
export type ConversationType = 'direct' | 'group';
export type MemberRole = 'admin' | 'member';
