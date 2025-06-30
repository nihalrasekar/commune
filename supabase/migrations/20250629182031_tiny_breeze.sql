/*
  # Simple Chat Data Migration
  
  This migration creates basic chat data with simple INSERT statements
  without using complex PL/pgSQL variable assignments that cause syntax errors.
*/

-- Clean up any existing chat data first
DELETE FROM message_reactions;
DELETE FROM message_read_receipts;
DELETE FROM chat_messages;
DELETE FROM chat_members;
DELETE FROM chat_rooms WHERE apartment_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
DELETE FROM user_presence;

-- Create one community chat room using the first available user as creator
INSERT INTO chat_rooms (id, apartment_id, name, description, type, created_by, is_private, member_count, is_active)
SELECT 
  uuid_generate_v4(),
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Skyline Apartments - Community',
  'General community discussions for all residents',
  'general',
  id,
  false,
  0,
  true
FROM user_profiles 
WHERE apartment_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' 
LIMIT 1;

-- Get the community room ID for later use
DO $$
DECLARE
  community_room_id UUID;
  user_id_1 UUID;
  user_id_2 UUID;
  user_id_3 UUID;
  user_id_4 UUID;
  user_id_5 UUID;
  private_room_id UUID;
BEGIN
  -- Get the community room ID
  SELECT id INTO community_room_id 
  FROM chat_rooms 
  WHERE apartment_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' 
  AND type = 'general' 
  LIMIT 1;
  
  -- Get user IDs
  SELECT id INTO user_id_1 FROM user_profiles WHERE apartment_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' ORDER BY created_at LIMIT 1 OFFSET 0;
  SELECT id INTO user_id_2 FROM user_profiles WHERE apartment_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' ORDER BY created_at LIMIT 1 OFFSET 1;
  SELECT id INTO user_id_3 FROM user_profiles WHERE apartment_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' ORDER BY created_at LIMIT 1 OFFSET 2;
  SELECT id INTO user_id_4 FROM user_profiles WHERE apartment_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' ORDER BY created_at LIMIT 1 OFFSET 3;
  SELECT id INTO user_id_5 FROM user_profiles WHERE apartment_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' ORDER BY created_at LIMIT 1 OFFSET 4;
  
  -- Only proceed if we have users and community room
  IF community_room_id IS NOT NULL AND user_id_1 IS NOT NULL THEN
    
    -- Add users as members of the community chat
    INSERT INTO chat_members (chat_room_id, user_id, role, last_read_at) VALUES
    (community_room_id, user_id_1, 'admin', NOW() - INTERVAL '1 hour');
    
    IF user_id_2 IS NOT NULL THEN
      INSERT INTO chat_members (chat_room_id, user_id, role, last_read_at) VALUES
      (community_room_id, user_id_2, 'member', NOW() - INTERVAL '1 hour');
    END IF;
    
    IF user_id_3 IS NOT NULL THEN
      INSERT INTO chat_members (chat_room_id, user_id, role, last_read_at) VALUES
      (community_room_id, user_id_3, 'member', NOW() - INTERVAL '1 hour');
    END IF;
    
    IF user_id_4 IS NOT NULL THEN
      INSERT INTO chat_members (chat_room_id, user_id, role, last_read_at) VALUES
      (community_room_id, user_id_4, 'member', NOW() - INTERVAL '1 hour');
    END IF;
    
    IF user_id_5 IS NOT NULL THEN
      INSERT INTO chat_members (chat_room_id, user_id, role, last_read_at) VALUES
      (community_room_id, user_id_5, 'member', NOW() - INTERVAL '1 hour');
    END IF;

    -- Add community chat messages
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at) VALUES
    (community_room_id, user_id_1, 'Welcome to Skyline Apartments community chat! 🏠', 'text', NOW() - INTERVAL '2 days');
    
    IF user_id_2 IS NOT NULL THEN
      INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at) VALUES
      (community_room_id, user_id_2, 'Hi everyone! Excited to be part of this community! 👋', 'text', NOW() - INTERVAL '1 day 20 hours');
    END IF;
    
    IF user_id_3 IS NOT NULL THEN
      INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at) VALUES
      (community_room_id, user_id_3, 'Hello! Looking forward to getting to know everyone!', 'text', NOW() - INTERVAL '1 day 18 hours');
    END IF;
    
    IF user_id_4 IS NOT NULL THEN
      INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at) VALUES
      (community_room_id, user_id_4, 'Has anyone noticed the new security measures at the main gate?', 'text', NOW() - INTERVAL '1 day 12 hours');
    END IF;
    
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at) VALUES
    (community_room_id, user_id_1, 'Yes! The management upgraded the system last week.', 'text', NOW() - INTERVAL '1 day 10 hours');
    
    IF user_id_5 IS NOT NULL THEN
      INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at) VALUES
      (community_room_id, user_id_5, 'Quick reminder: Gym maintenance tomorrow 10 AM - 2 PM 🏊‍♂️', 'text', NOW() - INTERVAL '8 hours');
    END IF;
    
    IF user_id_2 IS NOT NULL THEN
      INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at) VALUES
      (community_room_id, user_id_2, 'Anyone interested in organizing a weekend BBQ? 🔥', 'text', NOW() - INTERVAL '2 hours');
    END IF;
    
    IF user_id_3 IS NOT NULL THEN
      INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at) VALUES
      (community_room_id, user_id_3, 'Count me in! That sounds great!', 'text', NOW() - INTERVAL '1 hour 45 minutes');
    END IF;
    
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at) VALUES
    (community_room_id, user_id_1, 'Great initiative! I can help with getting approval from management.', 'text', NOW() - INTERVAL '15 minutes');

    -- Create a private chat room if we have at least 2 users
    IF user_id_2 IS NOT NULL THEN
      private_room_id := uuid_generate_v4();
      INSERT INTO chat_rooms (id, apartment_id, name, description, type, created_by, is_private, member_count, is_active) VALUES
      (
        private_room_id,
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'Private Chat',
        'Private conversation',
        'private',
        user_id_1,
        true,
        0,
        true
      );

      INSERT INTO chat_members (chat_room_id, user_id, role, last_read_at) VALUES
      (private_room_id, user_id_1, 'admin', NOW() - INTERVAL '10 minutes'),
      (private_room_id, user_id_2, 'member', NOW() - INTERVAL '5 minutes');

      INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at) VALUES
      (private_room_id, user_id_1, 'Hey! Thanks for helping with the BBQ idea.', 'text', NOW() - INTERVAL '1 hour'),
      (private_room_id, user_id_2, 'Happy to help! I have experience organizing events.', 'text', NOW() - INTERVAL '45 minutes'),
      (private_room_id, user_id_1, 'Perfect! Let us sync up tomorrow to plan the details.', 'text', NOW() - INTERVAL '30 minutes'),
      (private_room_id, user_id_2, 'How about 7 PM at the club house?', 'text', NOW() - INTERVAL '10 minutes');
    END IF;

    -- Add some message reactions
    IF user_id_2 IS NOT NULL THEN
      INSERT INTO message_reactions (message_id, user_id, reaction) 
      SELECT id, user_id_2, 'like' 
      FROM chat_messages 
      WHERE chat_room_id = community_room_id 
      AND message LIKE '%BBQ%'
      LIMIT 1;
    END IF;

    -- Add user presence data
    INSERT INTO user_presence (user_id, is_online, last_seen_at, current_activity) VALUES
    (user_id_1, true, NOW(), 'In community chat');
    
    IF user_id_2 IS NOT NULL THEN
      INSERT INTO user_presence (user_id, is_online, last_seen_at, current_activity) VALUES
      (user_id_2, true, NOW() - INTERVAL '5 minutes', 'Active');
    END IF;
    
    IF user_id_3 IS NOT NULL THEN
      INSERT INTO user_presence (user_id, is_online, last_seen_at, current_activity) VALUES
      (user_id_3, false, NOW() - INTERVAL '1 hour', 'Away');
    END IF;

  END IF;
END $$;

-- Update member counts for all rooms
UPDATE chat_rooms SET member_count = (
  SELECT COUNT(*) FROM chat_members WHERE chat_members.chat_room_id = chat_rooms.id
);

-- Update last message info for all rooms
UPDATE chat_rooms SET 
  last_message_id = (
    SELECT id FROM chat_messages 
    WHERE chat_room_id = chat_rooms.id 
    AND is_deleted = false 
    ORDER BY created_at DESC 
    LIMIT 1
  ),
  last_message_at = (
    SELECT created_at FROM chat_messages 
    WHERE chat_room_id = chat_rooms.id 
    AND is_deleted = false 
    ORDER BY created_at DESC 
    LIMIT 1
  );