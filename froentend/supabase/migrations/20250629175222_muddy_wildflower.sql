/*
  # Fix Chat Room UUID Error
  
  This migration fixes the invalid UUID format in chat rooms and ensures
  proper UUID generation for all chat-related tables.
*/

-- First, clean up any existing invalid data
DELETE FROM message_reactions WHERE message_id IN (
  SELECT id FROM chat_messages WHERE chat_room_id = 'cr-general-skyline'
);
DELETE FROM message_read_receipts WHERE message_id IN (
  SELECT id FROM chat_messages WHERE chat_room_id = 'cr-general-skyline'
);
DELETE FROM chat_messages WHERE chat_room_id = 'cr-general-skyline';
DELETE FROM chat_members WHERE chat_room_id = 'cr-general-skyline';
DELETE FROM chat_rooms WHERE id = 'cr-general-skyline';

-- Create the community chat room with proper UUID
INSERT INTO chat_rooms (id, apartment_id, name, description, type, created_by, is_private) VALUES
(
  uuid_generate_v4(),
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Skyline Apartments - Community',
  'General community discussions for all residents',
  'general',
  (SELECT id FROM user_profiles WHERE apartment_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' LIMIT 1),
  false
);

-- Function to create realistic chat data with proper UUIDs
CREATE OR REPLACE FUNCTION create_fixed_chat_data()
RETURNS void AS $$
DECLARE
  user_records RECORD;
  user_ids UUID[];
  user_names TEXT[];
  user_flats TEXT[];
  community_room_id UUID;
  private_room_id UUID;
  message_id UUID;
  i INTEGER;
  j INTEGER;
  current_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get the community room ID
  SELECT id INTO community_room_id 
  FROM chat_rooms 
  WHERE apartment_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' 
  AND type = 'general' 
  AND name = 'Skyline Apartments - Community'
  LIMIT 1;
  
  -- Get existing users from Skyline Apartments
  SELECT array_agg(id), array_agg(full_name), array_agg(flat_number) 
  INTO user_ids, user_names, user_flats
  FROM user_profiles 
  WHERE apartment_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  LIMIT 8;
  
  -- Only proceed if we have users and community room
  IF array_length(user_ids, 1) > 0 AND community_room_id IS NOT NULL THEN
    
    -- === COMMUNITY CHAT SETUP ===
    
    -- Add all users as members of the community chat
    FOR i IN 1..array_length(user_ids, 1) LOOP
      INSERT INTO chat_members (chat_room_id, user_id, role, last_read_at)
      VALUES (
        community_room_id, 
        user_ids[i], 
        CASE WHEN i = 1 THEN 'admin' ELSE 'member' END,
        NOW() - INTERVAL '1 hour'
      )
      ON CONFLICT (chat_room_id, user_id) DO NOTHING;
    END LOOP;
    
    -- Add community chat messages with realistic conversation
    current_time := NOW() - INTERVAL '2 days';
    
    -- Welcome message from admin
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at)
    VALUES (
      community_room_id,
      user_ids[1],
      'Welcome to Skyline Apartments community chat! 🏠 This is our space to connect, share updates, and help each other out. Feel free to introduce yourselves!',
      'text',
      current_time
    );
    current_time := current_time + INTERVAL '15 minutes';
    
    -- User introductions
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at)
    VALUES (
      community_room_id,
      user_ids[2],
      'Hi everyone! I''m ' || user_names[2] || ' from ' || user_flats[2] || '. Excited to be part of this community! 👋',
      'text',
      current_time
    );
    current_time := current_time + INTERVAL '8 minutes';
    
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at)
    VALUES (
      community_room_id,
      user_ids[3],
      'Hello! ' || user_names[3] || ' here from ' || user_flats[3] || '. Looking forward to getting to know everyone!',
      'text',
      current_time
    );
    current_time := current_time + INTERVAL '12 minutes';
    
    -- Community discussion
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at)
    VALUES (
      community_room_id,
      user_ids[4],
      'Has anyone noticed the new security measures at the main gate? They seem much more efficient now.',
      'text',
      current_time
    );
    current_time := current_time + INTERVAL '5 minutes';
    
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at)
    VALUES (
      community_room_id,
      user_ids[1],
      'Yes! The management upgraded the system last week. Much faster entry/exit process now.',
      'text',
      current_time
    );
    current_time := current_time + INTERVAL '3 minutes';
    
    -- Helpful community message
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at)
    VALUES (
      community_room_id,
      user_ids[5],
      'Quick reminder: Gym maintenance is scheduled for tomorrow 10 AM - 2 PM. Pool will remain open! 🏊‍♂️',
      'text',
      current_time
    );
    current_time := current_time + INTERVAL '20 minutes';
    
    -- Recent activity
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at)
    VALUES (
      community_room_id,
      user_ids[6],
      'Anyone interested in organizing a weekend BBQ at the club house? I can coordinate if there''s interest! 🔥',
      'text',
      NOW() - INTERVAL '2 hours'
    );
    
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at)
    VALUES (
      community_room_id,
      user_ids[2],
      'Count me in! That sounds like a great way to bring everyone together.',
      'text',
      NOW() - INTERVAL '1 hour 45 minutes'
    );
    
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at)
    VALUES (
      community_room_id,
      user_ids[7],
      'I''m interested too! Should we create a group to plan this?',
      'text',
      NOW() - INTERVAL '1 hour 30 minutes'
    );
    
    -- Most recent message
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at)
    VALUES (
      community_room_id,
      user_ids[1],
      'Great initiative! Let''s discuss the details. I can help with getting approval from management.',
      'text',
      NOW() - INTERVAL '15 minutes'
    );
    
    -- === PRIVATE CHATS SETUP ===
    
    -- Create private chat rooms between different users
    -- Chat 1: User 1 and User 2
    private_room_id := uuid_generate_v4();
    INSERT INTO chat_rooms (id, apartment_id, name, description, type, created_by, is_private)
    VALUES (
      private_room_id,
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      user_names[1] || ' & ' || user_names[2],
      'Private conversation',
      'private',
      user_ids[1],
      true
    );
    
    -- Add members
    INSERT INTO chat_members (chat_room_id, user_id, role, last_read_at) VALUES
    (private_room_id, user_ids[1], 'admin', NOW() - INTERVAL '10 minutes'),
    (private_room_id, user_ids[2], 'member', NOW() - INTERVAL '5 minutes');
    
    -- Add private messages
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at) VALUES
    (private_room_id, user_ids[1], 'Hey! Thanks for helping with the community BBQ idea. Do you have experience organizing events?', 'text', NOW() - INTERVAL '1 hour'),
    (private_room_id, user_ids[2], 'Yes, I organized a few events at my previous apartment complex. Happy to help here too!', 'text', NOW() - INTERVAL '45 minutes'),
    (private_room_id, user_ids[1], 'Perfect! Let''s sync up tomorrow to plan the details. What time works for you?', 'text', NOW() - INTERVAL '30 minutes'),
    (private_room_id, user_ids[2], 'How about 7 PM at the club house? We can check out the space too.', 'text', NOW() - INTERVAL '10 minutes');
    
    -- Chat 2: User 3 and User 4
    private_room_id := uuid_generate_v4();
    INSERT INTO chat_rooms (id, apartment_id, name, description, type, created_by, is_private)
    VALUES (
      private_room_id,
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      user_names[3] || ' & ' || user_names[4],
      'Private conversation',
      'private',
      user_ids[3],
      true
    );
    
    INSERT INTO chat_members (chat_room_id, user_id, role, last_read_at) VALUES
    (private_room_id, user_ids[3], 'admin', NOW() - INTERVAL '2 hours'),
    (private_room_id, user_ids[4], 'member', NOW() - INTERVAL '1 hour');
    
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at) VALUES
    (private_room_id, user_ids[3], 'Hi! I noticed you mentioned the security upgrades. Do you know if they''re planning any other improvements?', 'text', NOW() - INTERVAL '3 hours'),
    (private_room_id, user_ids[4], 'I heard they''re also upgrading the parking system next month. Smart card access instead of manual gates.', 'text', NOW() - INTERVAL '2 hours 30 minutes'),
    (private_room_id, user_ids[3], 'That''s great! The current system can be slow during peak hours.', 'text', NOW() - INTERVAL '2 hours'),
    (private_room_id, user_ids[4], 'Exactly! Should make things much smoother for everyone.', 'text', NOW() - INTERVAL '1 hour 45 minutes');
    
    -- Chat 3: User 5 and User 6
    private_room_id := uuid_generate_v4();
    INSERT INTO chat_rooms (id, apartment_id, name, description, type, created_by, is_private)
    VALUES (
      private_room_id,
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      user_names[5] || ' & ' || user_names[6],
      'Private conversation',
      'private',
      user_ids[5],
      true
    );
    
    INSERT INTO chat_members (chat_room_id, user_id, role, last_read_at) VALUES
    (private_room_id, user_ids[5], 'admin', NOW() - INTERVAL '30 minutes'),
    (private_room_id, user_ids[6], 'member', NOW() - INTERVAL '15 minutes');
    
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at) VALUES
    (private_room_id, user_ids[6], 'Love the BBQ idea! I can help with the setup and decorations if needed.', 'text', NOW() - INTERVAL '1 hour'),
    (private_room_id, user_ids[5], 'That would be amazing! I was thinking we could use the garden area near the club house.', 'text', NOW() - INTERVAL '45 minutes'),
    (private_room_id, user_ids[6], 'Perfect spot! Good shade and plenty of space. Should we create a planning group?', 'text', NOW() - INTERVAL '30 minutes'),
    (private_room_id, user_ids[5], 'Great idea! Let''s discuss with the others tomorrow.', 'text', NOW() - INTERVAL '15 minutes');
    
    -- Chat 4: User 7 and User 8 (if available)
    IF array_length(user_ids, 1) >= 8 THEN
      private_room_id := uuid_generate_v4();
      INSERT INTO chat_rooms (id, apartment_id, name, description, type, created_by, is_private)
      VALUES (
        private_room_id,
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        user_names[7] || ' & ' || user_names[8],
        'Private conversation',
        'private',
        user_ids[7],
        true
      );
      
      INSERT INTO chat_members (chat_room_id, user_id, role, last_read_at) VALUES
      (private_room_id, user_ids[7], 'admin', NOW() - INTERVAL '4 hours'),
      (private_room_id, user_ids[8], 'member', NOW() - INTERVAL '3 hours');
      
      INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at) VALUES
      (private_room_id, user_ids[7], 'Hey neighbor! Are you planning to join the BBQ event?', 'text', NOW() - INTERVAL '5 hours'),
      (private_room_id, user_ids[8], 'Definitely! It''s a great way to meet everyone. Are you helping with the planning?', 'text', NOW() - INTERVAL '4 hours 30 minutes'),
      (private_room_id, user_ids[7], 'Yes, I offered to help with coordination. Should be fun!', 'text', NOW() - INTERVAL '4 hours'),
      (private_room_id, user_ids[8], 'Count me in for any help needed. Looking forward to it!', 'text', NOW() - INTERVAL '3 hours 30 minutes');
    END IF;
    
    -- Chat 5: User 2 and User 5 (cross-connection)
    private_room_id := uuid_generate_v4();
    INSERT INTO chat_rooms (id, apartment_id, name, description, type, created_by, is_private)
    VALUES (
      private_room_id,
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      user_names[2] || ' & ' || user_names[5],
      'Private conversation',
      'private',
      user_ids[2],
      true
    );
    
    INSERT INTO chat_members (chat_room_id, user_id, role, last_read_at) VALUES
    (private_room_id, user_ids[2], 'admin', NOW() - INTERVAL '6 hours'),
    (private_room_id, user_ids[5], 'member', NOW() - INTERVAL '5 hours');
    
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at) VALUES
    (private_room_id, user_ids[2], 'Hi! I saw your gym maintenance reminder. Do you work with the management team?', 'text', NOW() - INTERVAL '6 hours'),
    (private_room_id, user_ids[5], 'I''m part of the residents committee. We coordinate with management for community updates.', 'text', NOW() - INTERVAL '5 hours 30 minutes'),
    (private_room_id, user_ids[2], 'That''s great! Would love to get involved in community activities.', 'text', NOW() - INTERVAL '5 hours'),
    (private_room_id, user_ids[5], 'We always welcome new members! I''ll let you know about our next meeting.', 'text', NOW() - INTERVAL '4 hours 30 minutes');
    
    -- Add some message reactions to make it more realistic
    INSERT INTO message_reactions (message_id, user_id, reaction) 
    SELECT id, user_ids[2], 'like' 
    FROM chat_messages 
    WHERE chat_room_id = community_room_id 
    AND sender_id = user_ids[6] 
    AND message LIKE '%BBQ%'
    LIMIT 1;
    
    INSERT INTO message_reactions (message_id, user_id, reaction) 
    SELECT id, user_ids[3], 'thumbs_up' 
    FROM chat_messages 
    WHERE chat_room_id = community_room_id 
    AND sender_id = user_ids[6] 
    AND message LIKE '%BBQ%'
    LIMIT 1;
    
    -- Update user presence for some users
    INSERT INTO user_presence (user_id, is_online, last_seen_at, current_activity) VALUES
    (user_ids[1], true, NOW(), 'In community chat'),
    (user_ids[2], true, NOW() - INTERVAL '5 minutes', 'Active'),
    (user_ids[3], false, NOW() - INTERVAL '1 hour', 'Away'),
    (user_ids[4], true, NOW() - INTERVAL '2 minutes', 'Active'),
    (user_ids[5], false, NOW() - INTERVAL '30 minutes', 'Away')
    ON CONFLICT (user_id) DO UPDATE SET
      is_online = EXCLUDED.is_online,
      last_seen_at = EXCLUDED.last_seen_at,
      current_activity = EXCLUDED.current_activity;
    
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to create realistic chat data
SELECT create_fixed_chat_data();

-- Clean up the function
DROP FUNCTION create_fixed_chat_data();

-- Update member counts for all rooms
UPDATE chat_rooms SET member_count = (
  SELECT COUNT(*) FROM chat_members WHERE chat_members.chat_room_id = chat_rooms.id
);

-- Update last message info for all rooms
UPDATE chat_rooms SET 
  last_message_id = latest.message_id,
  last_message_at = latest.created_at
FROM (
  SELECT DISTINCT ON (chat_room_id) 
    chat_room_id, 
    id as message_id, 
    created_at
  FROM chat_messages 
  WHERE is_deleted = false
  ORDER BY chat_room_id, created_at DESC
) latest
WHERE chat_rooms.id = latest.chat_room_id;