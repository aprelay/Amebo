-- Find user by email
SELECT 'Your User ID:' as label, id, email, username FROM users WHERE email = 'amebo@oztec.cam';

-- Show all contacts for this user
SELECT 
  'Your Contacts:' as label,
  uc.contact_user_id,
  u.username,
  u.email,
  uc.status,
  uc.created_at
FROM user_contacts uc
JOIN users u ON uc.contact_user_id = u.id
WHERE uc.user_id = (SELECT id FROM users WHERE email = 'amebo@oztec.cam');

-- Show all DM rooms for this user
SELECT
  'Your DM Rooms:' as label,
  dm.id,
  dm.room_id,
  u1.username as user1,
  u2.username as user2,
  dm.created_at
FROM direct_message_rooms dm
JOIN users u1 ON dm.user1_id = u1.id
JOIN users u2 ON dm.user2_id = u2.id  
WHERE dm.user1_id = (SELECT id FROM users WHERE email = 'amebo@oztec.cam')
   OR dm.user2_id = (SELECT id FROM users WHERE email = 'amebo@oztec.cam');

-- Show room_members for this user
SELECT
  'Your Room Memberships:' as label,
  rm.room_id,
  cr.room_name,
  cr.room_type,
  rm.joined_at
FROM room_members rm
JOIN chat_rooms cr ON rm.room_id = cr.id
WHERE rm.user_id = (SELECT id FROM users WHERE email = 'amebo@oztec.cam');
