/*
  # Community Chat Seed Data

  This migration populates the chat system with initial data:
  1. Default chat rooms for the apartment
  2. Sample chat members
  3. Welcome messages
*/

-- Insert default chat rooms for Skyline Apartments
INSERT INTO chat_rooms (id, apartment_id, name, description, type, created_by, is_private) VALUES
(
  'cr-general-001',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'General Discussion',
  'General conversations and community discussions',
  'general',
  (SELECT id FROM user_profiles LIMIT 1),
  false
),
(
  'cr-announce-001',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Announcements',
  'Official announcements from management',
  'announcements',
  (SELECT id FROM user_profiles LIMIT 1),
  false
),
(
  'cr-maintenance-001',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Maintenance & Repairs',
  'Discuss maintenance issues and repairs',
  'maintenance',
  (SELECT id FROM user_profiles LIMIT 1),
  false
),
(
  'cr-events-001',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Events & Activities',
  'Community events and social activities',
  'events',
  (SELECT id FROM user_profiles LIMIT 1),
  false
),
(
  'cr-marketplace-001',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Marketplace',
  'Buy, sell, and exchange items',
  'marketplace',
  (SELECT id FROM user_profiles LIMIT 1),
  false
);

-- Function to create sample chat data (will be called after users are created)
CREATE OR REPLACE FUNCTION create_sample_chat_data()
RETURNS void AS $$
DECLARE
  user_ids UUID[];
  room_id UUID;
  message_id UUID;
BEGIN
  -- Get existing user IDs
  SELECT array_agg(id) INTO user_ids FROM user_profiles LIMIT 5;
  
  -- Only proceed if we have users
  IF array_length(user_ids, 1) > 0 THEN
    -- Add users to general chat room
    room_id := 'cr-general-001';
    
    -- Add all users as members of general chat
    INSERT INTO chat_members (chat_room_id, user_id, role)
    SELECT room_id, unnest(user_ids), 'member'
    ON CONFLICT (chat_room_id, user_id) DO NOTHING;
    
    -- Add first user as admin
    UPDATE chat_members 
    SET role = 'admin' 
    WHERE chat_room_id = room_id AND user_id = user_ids[1];
    
    -- Insert welcome message
    INSERT INTO chat_messages (id, chat_room_id, sender_id, message, message_type)
    VALUES (
      uuid_generate_v4(),
      room_id,
      user_ids[1],
      'Welcome to Skyline Apartments community chat! 🏠 Feel free to introduce yourself and connect with your neighbors.',
      'text'
    );
    
    -- Add users to other rooms
    INSERT INTO chat_members (chat_room_id, user_id, role)
    SELECT 'cr-announce-001', unnest(user_ids), 'member'
    ON CONFLICT (chat_room_id, user_id) DO NOTHING;
    
    INSERT INTO chat_members (chat_room_id, user_id, role)
    SELECT 'cr-maintenance-001', unnest(user_ids), 'member'
    ON CONFLICT (chat_room_id, user_id) DO NOTHING;
    
    INSERT INTO chat_members (chat_room_id, user_id, role)
    SELECT 'cr-events-001', unnest(user_ids), 'member'
    ON CONFLICT (chat_room_id, user_id) DO NOTHING;
    
    INSERT INTO chat_members (chat_room_id, user_id, role)
    SELECT 'cr-marketplace-001', unnest(user_ids), 'member'
    ON CONFLICT (chat_room_id, user_id) DO NOTHING;
    
    -- Insert sample messages in announcements
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type)
    VALUES (
      'cr-announce-001',
      user_ids[1],
      '📢 Welcome to our community chat system! You can now communicate with your neighbors in real-time.',
      'text'
    );
    
    -- Insert sample message in maintenance
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type)
    VALUES (
      'cr-maintenance-001',
      user_ids[1],
      '🔧 Please report any maintenance issues here. Our team will respond promptly.',
      'text'
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Call the function to create sample data
SELECT create_sample_chat_data();

-- Drop the function as it's no longer needed
DROP FUNCTION create_sample_chat_data();