-- Clean up any existing chat data with invalid foreign keys
DELETE FROM message_reactions;
DELETE FROM message_read_receipts;
DELETE FROM chat_messages;
DELETE FROM chat_members;
DELETE FROM chat_rooms WHERE apartment_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
DELETE FROM user_presence;

-- Function to create chat data with valid user references
CREATE OR REPLACE FUNCTION create_valid_chat_data()
RETURNS void AS $$
DECLARE
  user_ids UUID[];
  user_names TEXT[];
  user_flats TEXT[];
  community_room_id UUID;
  private_room_id UUID;
  admin_user_id UUID;
  current_time TIMESTAMP WITH TIME ZONE;
  i INTEGER;
BEGIN
  -- Get actual user IDs from the database
  SELECT array_agg(id), array_agg(full_name), array_agg(flat_number) 
  INTO user_ids, user_names, user_flats
  FROM user_profiles 
  WHERE apartment_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  LIMIT 8;
  
  -- Only proceed if we have users
  IF array_length(user_ids, 1) > 0 THEN
    admin_user_id := user_ids[1];
    
    -- Create community chat room with valid user reference
    community_room_id := uuid_generate_v4();
    INSERT INTO chat_rooms (id, apartment_id, name, description, type, created_by, is_private, member_count, is_active) VALUES
    (
      community_room_id,
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      'Skyline Apartments - Community',
      'General community discussions for all residents',
      'general',
      admin_user_id,
      false,
      0,
      true
    );

    -- Add all users as members of the community chat
    FOR i IN 1..array_length(user_ids, 1) LOOP
      INSERT INTO chat_members (chat_room_id, user_id, role, last_read_at)
      VALUES (
        community_room_id, 
        user_ids[i], 
        CASE WHEN i = 1 THEN 'admin' ELSE 'member' END,
        NOW() - INTERVAL '1 hour'
      );
    END LOOP;

    -- Add community chat messages
    current_time := NOW() - INTERVAL '2 days';
    
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at) VALUES
    (community_room_id, user_ids[1], 'Welcome to Skyline Apartments community chat! 🏠 This is our space to connect, share updates, and help each other out.', 'text', current_time);
    
    current_time := current_time + INTERVAL '15 minutes';
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at) VALUES
    (community_room_id, user_ids[2], 'Hi everyone! I''m ' || user_names[2] || ' from ' || user_flats[2] || '. Excited to be part of this community! 👋', 'text', current_time);
    
    current_time := current_time + INTERVAL '8 minutes';
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at) VALUES
    (community_room_id, user_ids[3], 'Hello! ' || user_names[3] || ' here from ' || user_flats[3] || '. Looking forward to getting to know everyone!', 'text', current_time);
    
    current_time := current_time + INTERVAL '12 minutes';
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at) VALUES
    (community_room_id, user_ids[4], 'Has anyone noticed the new security measures at the main gate? They seem much more efficient now.', 'text', current_time);
    
    current_time := current_time + INTERVAL '5 minutes';
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at) VALUES
    (community_room_id, user_ids[1], 'Yes! The management upgraded the system last week. Much faster entry/exit process now.', 'text', current_time);
    
    current_time := current_time + INTERVAL '20 minutes';
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at) VALUES
    (community_room_id, user_ids[5], 'Quick reminder: Gym maintenance is scheduled for tomorrow 10 AM - 2 PM. Pool will remain open! 🏊‍♂️', 'text', current_time);
    
    -- Recent messages
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at) VALUES
    (community_room_id, user_ids[6], 'Anyone interested in organizing a weekend BBQ at the club house? I can coordinate if there''s interest! 🔥', 'text', NOW() - INTERVAL '2 hours');
    
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at) VALUES
    (community_room_id, user_ids[2], 'Count me in! That sounds like a great way to bring everyone together.', 'text', NOW() - INTERVAL '1 hour 45 minutes');
    
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at) VALUES
    (community_room_id, user_ids[7], 'I''m interested too! Should we create a group to plan this?', 'text', NOW() - INTERVAL '1 hour 30 minutes');
    
    INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at) VALUES
    (community_room_id, user_ids[1], 'Great initiative! Let''s discuss the details. I can help with getting approval from management.', 'text', NOW() - INTERVAL '15 minutes');

    -- Create private chat rooms if we have enough users
    IF array_length(user_ids, 1) >= 4 THEN
      -- Private Chat 1: User 1 and User 2
      private_room_id := uuid_generate_v4();
      INSERT INTO chat_rooms (id, apartment_id, name, description, type, created_by, is_private, member_count, is_active) VALUES
      (
        private_room_id,
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        user_names[1] || ' & ' || user_names[2],
        'Private conversation',
        'private',
        user_ids[1],
        true,
        0,
        true
      );

      INSERT INTO chat_members (chat_room_id, user_id, role, last_read_at) VALUES
      (private_room_id, user_ids[1], 'admin', NOW() - INTERVAL '10 minutes'),
      (private_room_id, user_ids[2], 'member', NOW() - INTERVAL '5 minutes');

      INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, created_at) VALUES
      (private_room_id, user_ids[1], 'Hey! Thanks for helping with the community BBQ idea. Do you have experience organizing events?', 'text', NOW() - INTERVAL '1 hour'),
      (private_room_id, user_ids[2], 'Yes, I organized a few events at my previous apartment complex. Happy to help here too!', 'text', NOW() - INTERVAL '45 minutes'),
      (private_room_id, user_ids[1], 'Perfect! Let''s sync up tomorrow to plan the details. What time works for you?', 'text', NOW() - INTERVAL '30 minutes'),
      (private_room_id, user_ids[2], 'How about 7 PM at the club house? We can check out the space too.', 'text', NOW() - INTERVAL '10 minutes');

      -- Private Chat 2: User 3 and User 4
      private_room_id := uuid_generate_v4();
      INSERT INTO chat_rooms (id, apartment_id, name, description, type, created_by, is_private, member_count, is_active) VALUES
      (
        private_room_id,
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        user_names[3] || ' & ' || user_names[4],
        'Private conversation',
        'private',
        user_ids[3],
        true,
        0,
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
    END IF;

    -- Add some message reactions
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

    -- Add user presence data
    INSERT INTO user_presence (user_id, is_online, last_seen_at, current_activity) VALUES
    (user_ids[1], true, NOW(), 'In community chat'),
    (user_ids[2], true, NOW() - INTERVAL '5 minutes', 'Active'),
    (user_ids[3], false, NOW() - INTERVAL '1 hour', 'Away'),
    (user_ids[4], true, NOW() - INTERVAL '2 minutes', 'Active')
    ON CONFLICT (user_id) DO UPDATE SET
      is_online = EXCLUDED.is_online,
      last_seen_at = EXCLUDED.last_seen_at,
      current_activity = EXCLUDED.current_activity;

    IF array_length(user_ids, 1) >= 5 THEN
      INSERT INTO user_presence (user_id, is_online, last_seen_at, current_activity) VALUES
      (user_ids[5], false, NOW() - INTERVAL '30 minutes', 'Away')
      ON CONFLICT (user_id) DO UPDATE SET
        is_online = EXCLUDED.is_online,
        last_seen_at = EXCLUDED.last_seen_at,
        current_activity = EXCLUDED.current_activity;
    END IF;

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

  END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to create valid chat data
SELECT create_valid_chat_data();

-- Clean up the function
DROP FUNCTION create_valid_chat_data();