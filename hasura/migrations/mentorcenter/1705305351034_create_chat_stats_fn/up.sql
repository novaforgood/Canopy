CREATE OR REPLACE FUNCTION get_chat_stats(sp_id UUID DEFAULT NULL, after TIMESTAMP DEFAULT NULL)
RETURNS SETOF chat_stats AS $$

BEGIN
    -- Return the query using the determined cutoff date
    RETURN QUERY
    SELECT 
        p.id AS profile_id,
        COUNT(DISTINCT cm.chat_room_id) AS rooms_messaged,
        COUNT(DISTINCT CASE WHEN pc.latest_read_chat_message_id IS NOT NULL THEN pc.chat_room_id END) AS rooms_read,
        COUNT(DISTINCT pc.chat_room_id) AS total_rooms
    FROM 
        profile p
    LEFT JOIN 
        profile_to_chat_room pc ON p.id = pc.profile_id
    LEFT JOIN 
        chat_message cm ON p.id = cm.sender_profile_id AND pc.chat_room_id = cm.chat_room_id
    JOIN 
        chat_room ON pc.chat_room_id = chat_room.id
    JOIN 
        "user" ON "user".id = p.user_id
    JOIN 
        chat_intro ci ON chat_room.chat_intro_id = ci.id
    WHERE 
        (ci.space_id = sp_id OR sp_id IS NULL)
        AND (ci.created_at >= after OR after IS NULL)
        AND "user"."type" = 'User'
    GROUP BY 
        p.id;
END;
$$ LANGUAGE plpgsql STABLE;
