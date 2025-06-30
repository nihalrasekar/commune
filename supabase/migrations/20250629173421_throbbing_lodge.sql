/*
  # Community Chat Real-time Schema

  This migration creates the necessary tables for real-time community chat functionality:
  1. Chat rooms for group and one-to-one conversations
  2. Chat messages with real-time capabilities
  3. Chat members and their roles
  4. Message reactions and read receipts
  5. Typing indicators and presence tracking

  ## Tables Created:
  1. chat_rooms - Chat room definitions
  2. chat_members - Room membership and roles
  3. chat_messages - Individual messages
  4. message_reactions - Message reactions (likes, etc.)
  5. message_read_receipts - Read status tracking
  6. user_presence - Online status tracking
*/

-- 1. CHAT ROOMS TABLE
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  apartment_id UUID REFERENCES apartments(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('general', 'announcements', 'maintenance', 'events', 'marketplace', 'private')),
  is_private BOOLEAN DEFAULT false,
  created_by UUID REFERENCES user_profiles(id) NOT NULL,
  avatar_url TEXT,
  member_count INTEGER DEFAULT 0,
  last_message_id UUID,
  last_message_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CHAT MEMBERS TABLE
CREATE TABLE IF NOT EXISTS chat_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  is_muted BOOLEAN DEFAULT false,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chat_room_id, user_id)
);

-- 3. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES user_profiles(id) NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  reply_to_id UUID REFERENCES chat_messages(id),
  attachments JSONB DEFAULT '[]',
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  reactions_count JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. MESSAGE REACTIONS TABLE
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL CHECK (reaction IN ('like', 'love', 'laugh', 'angry', 'sad', 'thumbs_up', 'thumbs_down')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id, reaction)
);

-- 5. MESSAGE READ RECEIPTS TABLE
CREATE TABLE IF NOT EXISTS message_read_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- 6. USER PRESENCE TABLE
CREATE TABLE IF NOT EXISTS user_presence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,
  is_online BOOLEAN DEFAULT false,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_activity TEXT,
  device_info JSONB DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES for better performance
CREATE INDEX IF NOT EXISTS idx_chat_rooms_apartment_id ON chat_rooms(apartment_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_type ON chat_rooms(type);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_created_by ON chat_rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_chat_members_chat_room_id ON chat_members(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_user_id ON chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_room_id ON chat_messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_reply_to_id ON chat_messages(reply_to_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON message_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_message_id ON message_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_user_id ON message_read_receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_user_id ON user_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_is_online ON user_presence(is_online);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- ROW LEVEL SECURITY POLICIES

-- Chat Rooms: Users can read rooms they are members of
CREATE POLICY "Users can read chat rooms they are members of" ON chat_rooms
  FOR SELECT USING (
    id IN (
      SELECT chat_room_id FROM chat_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chat rooms in their apartment" ON chat_rooms
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    apartment_id IN (
      SELECT apartment_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Room creators and admins can update chat rooms" ON chat_rooms
  FOR UPDATE USING (
    created_by = auth.uid() OR
    id IN (
      SELECT chat_room_id FROM chat_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Chat Members: Users can read members of rooms they belong to
CREATE POLICY "Users can read chat members of their rooms" ON chat_members
  FOR SELECT USING (
    chat_room_id IN (
      SELECT chat_room_id FROM chat_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join chat rooms" ON chat_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own membership" ON chat_members
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can leave chat rooms" ON chat_members
  FOR DELETE USING (user_id = auth.uid());

-- Chat Messages: Users can read messages from rooms they are members of
CREATE POLICY "Users can read messages from their chat rooms" ON chat_messages
  FOR SELECT USING (
    chat_room_id IN (
      SELECT chat_room_id FROM chat_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their chat rooms" ON chat_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    chat_room_id IN (
      SELECT chat_room_id FROM chat_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages" ON chat_messages
  FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages" ON chat_messages
  FOR DELETE USING (sender_id = auth.uid());

-- Message Reactions: Users can manage reactions in their rooms
CREATE POLICY "Users can read reactions in their chat rooms" ON message_reactions
  FOR SELECT USING (
    message_id IN (
      SELECT id FROM chat_messages 
      WHERE chat_room_id IN (
        SELECT chat_room_id FROM chat_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can add reactions to messages" ON message_reactions
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    message_id IN (
      SELECT id FROM chat_messages 
      WHERE chat_room_id IN (
        SELECT chat_room_id FROM chat_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can remove their own reactions" ON message_reactions
  FOR DELETE USING (user_id = auth.uid());

-- Message Read Receipts: Users can manage their own read receipts
CREATE POLICY "Users can read receipts in their chat rooms" ON message_read_receipts
  FOR SELECT USING (
    message_id IN (
      SELECT id FROM chat_messages 
      WHERE chat_room_id IN (
        SELECT chat_room_id FROM chat_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can mark messages as read" ON message_read_receipts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their read receipts" ON message_read_receipts
  FOR UPDATE USING (user_id = auth.uid());

-- User Presence: Users can read presence of users in their apartment
CREATE POLICY "Users can read presence of apartment members" ON user_presence
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE apartment_id IN (
        SELECT apartment_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own presence" ON user_presence
  FOR ALL USING (user_id = auth.uid());

-- FUNCTIONS AND TRIGGERS

-- Function to update member count when members are added/removed
CREATE OR REPLACE FUNCTION update_chat_room_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE chat_rooms 
    SET member_count = member_count + 1,
        updated_at = NOW()
    WHERE id = NEW.chat_room_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE chat_rooms 
    SET member_count = member_count - 1,
        updated_at = NOW()
    WHERE id = OLD.chat_room_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for member count updates
CREATE TRIGGER trigger_update_chat_room_member_count
  AFTER INSERT OR DELETE ON chat_members
  FOR EACH ROW EXECUTE FUNCTION update_chat_room_member_count();

-- Function to update last message info in chat room
CREATE OR REPLACE FUNCTION update_chat_room_last_message()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NOT NEW.is_deleted THEN
    UPDATE chat_rooms 
    SET last_message_id = NEW.id,
        last_message_at = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.chat_room_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for last message updates
CREATE TRIGGER trigger_update_chat_room_last_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW EXECUTE FUNCTION update_chat_room_last_message();

-- Function to update reaction counts
CREATE OR REPLACE FUNCTION update_message_reaction_count()
RETURNS TRIGGER AS $$
DECLARE
  reaction_counts JSONB;
BEGIN
  -- Calculate new reaction counts
  SELECT COALESCE(
    jsonb_object_agg(reaction, count),
    '{}'::jsonb
  ) INTO reaction_counts
  FROM (
    SELECT reaction, COUNT(*)::int as count
    FROM message_reactions 
    WHERE message_id = COALESCE(NEW.message_id, OLD.message_id)
    GROUP BY reaction
  ) counts;
  
  -- Update the message with new counts
  UPDATE chat_messages 
  SET reactions_count = reaction_counts,
      updated_at = NOW()
  WHERE id = COALESCE(NEW.message_id, OLD.message_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for reaction count updates
CREATE TRIGGER trigger_update_message_reaction_count
  AFTER INSERT OR DELETE ON message_reactions
  FOR EACH ROW EXECUTE FUNCTION update_message_reaction_count();

-- Apply updated_at triggers to new tables
CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON chat_rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_presence_updated_at BEFORE UPDATE ON user_presence FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();