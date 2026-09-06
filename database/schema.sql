-- BluePin Messenger Database Schema
-- Supabase PostgreSQL with Row Level Security

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bluepin_id TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    personal_status TEXT DEFAULT 'Hey there! I am using BluePin Messenger',
    bio TEXT,
    show_last_seen BOOLEAN DEFAULT true,
    show_read_receipt BOOLEAN DEFAULT true,
    allow_messages_from_non_contacts BOOLEAN DEFAULT false,
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(owner_id, contact_id)
);

-- 3. Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('direct', 'group')),
    name TEXT,
    avatar_url TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Conversation Members table
CREATE TABLE IF NOT EXISTS conversation_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'member')) DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    muted BOOLEAN DEFAULT false,
    archived BOOLEAN DEFAULT false,
    last_read_message_id UUID,
    UNIQUE(conversation_id, user_id)
);

-- 5. Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id),
    type TEXT NOT NULL CHECK (type IN ('text', 'image', 'system')) DEFAULT 'text',
    content TEXT NOT NULL,
    attachment_url TEXT,
    reply_to_message_id UUID REFERENCES messages(id),
    edited_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Message Receipts table
CREATE TABLE IF NOT EXISTS message_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('delivered', 'read')) DEFAULT 'delivered',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- 7. Typing Indicators table (for realtime)
CREATE TABLE IF NOT EXISTS typing_indicators (
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    is_typing BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

-- 8. Presence table
CREATE TABLE IF NOT EXISTS presence (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    is_online BOOLEAN DEFAULT false,
    last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    payload JSONB NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_bluepin_id ON profiles(bluepin_id);
CREATE INDEX IF NOT EXISTS idx_contacts_owner_id ON contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_contacts_contact_id ON contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversation_members_conversation_id ON conversation_members(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_members_user_id ON conversation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_receipts_message_id ON message_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_message_receipts_user_id ON message_receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to generate unique BluePin ID
CREATE OR REPLACE FUNCTION generate_bluepin_id()
RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    exists_count INTEGER;
BEGIN
    LOOP
        -- Generate format: BP-XXXXXX (6 random digits)
        new_id := 'BP-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        
        -- Check if it exists
        SELECT COUNT(*) INTO exists_count FROM profiles WHERE bluepin_id = new_id;
        
        IF exists_count = 0 THEN
            RETURN new_id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create profile after user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_bluepin_id TEXT;
BEGIN
    -- Generate unique BluePin ID
    new_bluepin_id := generate_bluepin_id();
    
    -- Insert profile
    INSERT INTO profiles (id, bluepin_id, username, display_name)
    VALUES (
        NEW.id,
        new_bluepin_id,
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', 'BluePin User')
    );
    
    -- Initialize presence
    INSERT INTO presence (user_id, is_online, last_seen_at)
    VALUES (NEW.id, false, NOW());
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at for profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at for contacts
CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at for conversations
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Contacts policies
CREATE POLICY "Users can view own contacts"
    ON contacts FOR SELECT
    USING (auth.uid() = owner_id OR auth.uid() = contact_id);

CREATE POLICY "Users can insert own contacts"
    ON contacts FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own contacts"
    ON contacts FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own contacts"
    ON contacts FOR DELETE
    USING (auth.uid() = owner_id);

-- Conversations policies
CREATE POLICY "Users can view conversations they are members of"
    ON conversations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversation_members cm
            WHERE cm.conversation_id = id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create conversations"
    ON conversations FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update conversations they are members of"
    ON conversations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM conversation_members cm
            WHERE cm.conversation_id = id
            AND cm.user_id = auth.uid()
        )
    );

-- Conversation Members policies
CREATE POLICY "Users can view members of their conversations"
    ON conversation_members FOR SELECT
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM conversation_members cm
            WHERE cm.conversation_id = conversation_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can add themselves to conversations"
    ON conversation_members FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage members"
    ON conversation_members FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM conversation_members cm
            WHERE cm.conversation_id = conversation_id
            AND cm.user_id = auth.uid()
            AND cm.role = 'admin'
        )
    );

CREATE POLICY "Admins can remove members"
    ON conversation_members FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM conversation_members cm
            WHERE cm.conversation_id = conversation_id
            AND cm.user_id = auth.uid()
            AND cm.role = 'admin'
        )
    );

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversation_members cm
            WHERE cm.conversation_id = conversation_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages in their conversations"
    ON messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM conversation_members cm
            WHERE cm.conversation_id = conversation_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own messages"
    ON messages FOR UPDATE
    USING (sender_id = auth.uid());

CREATE POLICY "Users can delete own messages"
    ON messages FOR DELETE
    USING (sender_id = auth.uid());

-- Message Receipts policies
CREATE POLICY "Users can view receipts for their messages"
    ON message_receipts FOR SELECT
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM messages m
            WHERE m.id = message_id
            AND m.sender_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own receipts"
    ON message_receipts FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can create receipts"
    ON message_receipts FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Typing Indicators policies
CREATE POLICY "Users can view typing indicators in their conversations"
    ON typing_indicators FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversation_members cm
            WHERE cm.conversation_id = conversation_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own typing indicator"
    ON typing_indicators FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own typing indicator"
    ON typing_indicators FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own typing indicator"
    ON typing_indicators FOR DELETE
    USING (user_id = auth.uid());

-- Presence policies
CREATE POLICY "Public presence viewable by everyone"
    ON presence FOR SELECT
    USING (true);

CREATE POLICY "Users can update own presence"
    ON presence FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own presence"
    ON presence FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications for users"
    ON notifications FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- INITIAL DATA (Optional - for testing)
-- ============================================================================

-- This section is intentionally left empty
-- Do not add dummy data as per requirements
-- All data should be created through the application
