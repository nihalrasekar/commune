/*
  # Simple Chat Data Migration
  
  This migration creates basic chat data with simple INSERT statements:
  1. One community chat room
  2. A few private chat rooms
  3. Basic messages between users
  4. Simple user presence data
*/

-- Clean up any existing chat data first
DELETE FROM message_reactions;
DELETE FROM message_read_receipts;
DELETE FROM chat_messages;
DELETE FROM chat_members;
DELETE FROM chat_rooms WHERE apartment_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
DELETE FROM user_presence;

-- Create one community chat room
INSERT INTO chat_rooms (id, apartment_id, name, description, type, created_by, is_private, member_count, is_active) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Skyline Apartments - Community',
  'General community discussions for all residents',
  'general',
  '550e8400-e29b-41d4-a716-446655440000',
  false,
  0,
  true
);

-- Create a few private chat rooms
INSERT INTO chat_rooms (id, apartment_id, name, description, type, created_by, is_private, member_count, is_active) VALUES
(
  '550e8400-e29b-41d4-a716-446655440002',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Private Chat 1',
  'Private conversation',
  'private',
  '550e8400-e29b-41d4-a716-446655440000',
  true,
  0,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Private Chat 2',
  'Private conversation',
  'private',
  '550e8400-e29b-41d4-a716-446655440000',
  true,
  0,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Private Chat 3',
  'Private conversation',
  'private',
  '550e8400-e29b-41d4-a716-446655440000',
  true,
  0,
  true
);

-- Add sample users to community chat (using placeholder UUIDs)
INSERT INTO chat_members (chat_room_id, user_id, role, last_read_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'admin', NOW() - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010', 'member', NOW() - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440020', 'member', NOW() - INTERVAL '3 hours'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440030', 'member', NOW() - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440040', 'member', NOW() - INTERVAL '30 minutes');

-- Add members to private chats
INSERT INTO chat_members (chat_room_id, user_id, role, last_read_at) VALUES
-- Private Chat 1
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'admin', NOW() - INTERVAL '10 minutes'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440010', 'member', NOW() - INTERVAL '5 minutes'),
-- Private Chat 2
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440020', 'admin', NOW() - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440030', 'member', NOW() - INTERVAL '1 hour'),
-- Private Chat 3
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440010', 'admin', NOW() - INTERVAL '30 minutes'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440040', 'member', NOW() - INTERVAL '15 minutes');

-- Add sample messages to community chat
INSERT INTO chat_messages (id, chat_room_id, sender_id, message, message_type, created_at) VALUES
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Welcome to Skyline Apartments community chat! 🏠', 'text', NOW() - INTERVAL '2 days'),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010', 'Hi everyone! Excited to be part of this community! 👋', 'text', NOW() - INTERVAL '1 day 20 hours'),
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440020', 'Hello! Looking forward to getting to know everyone!', 'text', NOW() - INTERVAL '1 day 18 hours'),
('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440030', 'Has anyone noticed the new security measures at the main gate?', 'text', NOW() - INTERVAL '1 day 12 hours'),
('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Yes! The management upgraded the system last week.', 'text', NOW() - INTERVAL '1 day 10 hours'),
('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440040', 'Quick reminder: Gym maintenance tomorrow 10 AM - 2 PM 🏊‍♂️', 'text', NOW() - INTERVAL '8 hours'),
('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010', 'Anyone interested in organizing a weekend BBQ? 🔥', 'text', NOW() - INTERVAL '2 hours'),
('650e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440020', 'Count me in! That sounds great!', 'text', NOW() - INTERVAL '1 hour 45 minutes'),
('650e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440030', 'I am interested too! Should we create a planning group?', 'text', NOW() - INTERVAL '1 hour 30 minutes'),
('650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Great initiative! I can help with getting approval from management.', 'text', NOW() - INTERVAL '15 minutes');

-- Add messages to private chats
INSERT INTO chat_messages (id, chat_room_id, sender_id, message, message_type, created_at) VALUES
-- Private Chat 1 messages
('650e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Hey! Thanks for helping with the BBQ idea.', 'text', NOW() - INTERVAL '1 hour'),
('650e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440010', 'Happy to help! I have experience organizing events.', 'text', NOW() - INTERVAL '45 minutes'),
('650e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Perfect! Let us sync up tomorrow to plan the details.', 'text', NOW() - INTERVAL '30 minutes'),
('650e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440010', 'How about 7 PM at the club house?', 'text', NOW() - INTERVAL '10 minutes'),

-- Private Chat 2 messages
('650e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440020', 'Hi! Do you know about other planned improvements?', 'text', NOW() - INTERVAL '3 hours'),
('650e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440030', 'I heard they are upgrading the parking system next month.', 'text', NOW() - INTERVAL '2 hours 30 minutes'),
('650e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440020', 'That is great! The current system can be slow.', 'text', NOW() - INTERVAL '2 hours'),
('650e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440030', 'Exactly! Should make things much smoother.', 'text', NOW() - INTERVAL '1 hour 45 minutes'),

-- Private Chat 3 messages
('650e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440010', 'Love the BBQ idea! I can help with decorations.', 'text', NOW() - INTERVAL '1 hour'),
('650e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440040', 'That would be amazing! Garden area near club house?', 'text', NOW() - INTERVAL '45 minutes'),
('650e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440010', 'Perfect spot! Good shade and plenty of space.', 'text', NOW() - INTERVAL '30 minutes'),
('650e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440040', 'Great idea! Let us discuss with others tomorrow.', 'text', NOW() - INTERVAL '15 minutes');

-- Add some message reactions
INSERT INTO message_reactions (message_id, user_id, reaction) VALUES
('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440020', 'like'),
('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440030', 'thumbs_up'),
('650e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', 'like'),
('650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440010', 'thumbs_up'),
('650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440040', 'like');

-- Add user presence data
INSERT INTO user_presence (user_id, is_online, last_seen_at, current_activity) VALUES
('550e8400-e29b-41d4-a716-446655440000', true, NOW(), 'In community chat'),
('550e8400-e29b-41d4-a716-446655440010', true, NOW() - INTERVAL '5 minutes', 'Active'),
('550e8400-e29b-41d4-a716-446655440020', false, NOW() - INTERVAL '1 hour', 'Away'),
('550e8400-e29b-41d4-a716-446655440030', true, NOW() - INTERVAL '2 minutes', 'Active'),
('550e8400-e29b-41d4-a716-446655440040', false, NOW() - INTERVAL '30 minutes', 'Away');

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