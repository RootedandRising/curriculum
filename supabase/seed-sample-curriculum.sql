-- =====================================================
-- SAMPLE CURRICULUM: 1st Grade Bible - Week 1
-- Unit: Creation - God Made Everything
-- =====================================================

-- First, create the course
INSERT INTO courses (id, grade_id, subject_id, name, description, total_weeks, lessons_per_week)
SELECT 
    'a1b2c3d4-1111-1111-1111-111111111111'::uuid,
    g.id,
    s.id,
    '1st Grade Bible',
    'A year-long journey through God''s Word, learning His stories and character.',
    36,
    4
FROM grades g, subjects s
WHERE g.slug = '1st' AND s.slug = 'bible';

-- Create Unit 1: Creation
INSERT INTO units (id, course_id, name, description, order_index, week_start, week_end, memory_verse, memory_verse_reference, character_trait)
VALUES (
    'b2c3d4e5-2222-2222-2222-222222222222'::uuid,
    'a1b2c3d4-1111-1111-1111-111111111111'::uuid,
    'Creation: God Made Everything',
    'Learn about how God created the world and everything in it in just six days, and rested on the seventh.',
    1,
    1,
    2,
    'In the beginning God created the heavens and the earth.',
    'Genesis 1:1',
    'Wonder'
);

-- =====================================================
-- LESSON 1: Day 1 - God Creates Light
-- =====================================================

INSERT INTO lessons (
    id, unit_id, course_id, name, slug, description, order_index, 
    day_number, week_number, objectives, estimated_minutes,
    teacher_intro, teacher_script, discussion_questions, teacher_closing,
    materials_needed, bible_connection, prayer_prompt
) VALUES (
    'c3d4e5f6-3333-3333-3333-333333333333'::uuid,
    'b2c3d4e5-2222-2222-2222-222222222222'::uuid,
    'a1b2c3d4-1111-1111-1111-111111111111'::uuid,
    'Day 1: God Creates Light',
    'day-1-god-creates-light',
    'Discover how God spoke light into existence on the very first day of creation.',
    1,
    1,
    1,
    ARRAY[
        'Understand that God created everything',
        'Learn that God made light on Day 1',
        'Recognize that God''s Word is powerful'
    ],
    25,
    
    -- Teacher Intro
    'Today we begin an exciting adventure! We''re going to learn about how God made EVERYTHING. Before God created anything, there was nothing but darkness. Can you imagine that? Let''s find out what happened next!',
    
    -- Teacher Script
    'Open your Bible to Genesis 1:1-5 and read aloud:

"In the beginning God created the heavens and the earth. Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters. And God said, ''Let there be light,'' and there was light. God saw that the light was good, and he separated the light from the darkness. God called the light ''day,'' and the darkness he called ''night.'' And there was evening, and there was morning—the first day."

**Key Points to Emphasize:**
1. God was there "in the beginning" - He has always existed!
2. God created by SPEAKING - His words are that powerful
3. God called the light "good" - everything God makes is good
4. This was just Day 1 - there''s so much more to come!',
    
    -- Discussion Questions
    ARRAY[
        'What did God create on the very first day?',
        'How did God create the light? Did He use His hands or His words?',
        'What did God say about the light - was it good or bad?',
        'Why do you think God made light first, before anything else?'
    ],
    
    -- Teacher Closing
    'Isn''t it amazing that God can create things just by speaking? His words are so powerful! Tomorrow we''ll learn about what God made on Day 2. Let''s thank God for creating light so we can see all the beautiful things He made.',
    
    -- Materials
    ARRAY['Bible', 'Optional: flashlight for demonstration'],
    
    -- Bible Connection
    'Genesis 1:1-5 shows us that God is all-powerful (omnipotent). He didn''t need tools or helpers - He simply spoke and creation happened!',
    
    -- Prayer Prompt
    'Dear God, thank You for being so powerful that You can create things just by speaking. Thank You for making light so we can see Your beautiful world. Help us remember how amazing You are. Amen.'
);

-- Lesson 1 Content Blocks
INSERT INTO lesson_content (lesson_id, content_type, order_index, title, content, is_read_aloud, for_student, for_teacher) VALUES
(
    'c3d4e5f6-3333-3333-3333-333333333333'::uuid,
    'scripture',
    1,
    'Today''s Bible Verse',
    'In the beginning God created the heavens and the earth. — Genesis 1:1',
    true,
    true,
    true
),
(
    'c3d4e5f6-3333-3333-3333-333333333333'::uuid,
    'story',
    2,
    'The Story',
    'Before God made anything, there was nothing but darkness everywhere. It was completely dark and empty!

Then God spoke. He said, "Let there be light!" And guess what happened? LIGHT appeared! Just like that!

God looked at the light and smiled. "This is good," He said.

God named the light "day" and the darkness "night." 

And that was the very first day of creation!',
    true,
    true,
    true
),
(
    'c3d4e5f6-3333-3333-3333-333333333333'::uuid,
    'vocabulary',
    3,
    'New Word',
    '**Create** means to make something new. God created the whole world!',
    true,
    true,
    true
),
(
    'c3d4e5f6-3333-3333-3333-333333333333'::uuid,
    'note',
    4,
    'Remember This!',
    'God is SO powerful that He can make things just by speaking. When God talks, things happen!',
    true,
    true,
    true
);

-- Lesson 1 Activities
INSERT INTO activities (lesson_id, activity_type, order_index, title, instructions, question_text, activity_data, points, explanation) VALUES
(
    'c3d4e5f6-3333-3333-3333-333333333333'::uuid,
    'multiple_choice',
    1,
    'Comprehension Check',
    'Choose the correct answer.',
    'What did God create on Day 1?',
    '{"options": ["Water", "Light", "Animals", "Trees"], "correct": 1}',
    10,
    'God created LIGHT on Day 1! He said "Let there be light" and there was light.'
),
(
    'c3d4e5f6-3333-3333-3333-333333333333'::uuid,
    'multiple_choice',
    2,
    'Comprehension Check',
    'Choose the correct answer.',
    'How did God create light?',
    '{"options": ["He used a flashlight", "He spoke and it happened", "He clapped His hands", "He waited a long time"], "correct": 1}',
    10,
    'God SPOKE and light was created! His words are very powerful.'
),
(
    'c3d4e5f6-3333-3333-3333-333333333333'::uuid,
    'true_false',
    3,
    'True or False',
    'Is this statement true or false?',
    'God said the light was good.',
    '{"correct": true}',
    10,
    'TRUE! God looked at the light and said it was good. Everything God makes is good!'
),
(
    'c3d4e5f6-3333-3333-3333-333333333333'::uuid,
    'fill_blank',
    4,
    'Fill in the Blank',
    'Complete the sentence with the correct word.',
    'God called the light "___" and the darkness "night."',
    '{"answers": ["day", "Day"], "display": "God called the light \"___\" and the darkness \"night.\""}',
    10,
    'God called the light DAY and the darkness night.'
),
(
    'c3d4e5f6-3333-3333-3333-333333333333'::uuid,
    'memory_verse',
    5,
    'Memory Verse Practice',
    'Practice saying this week''s memory verse! Tap the words in the correct order.',
    'Put the verse in order:',
    '{"verse": "In the beginning God created the heavens and the earth.", "reference": "Genesis 1:1", "words": ["In", "the", "beginning", "God", "created", "the", "heavens", "and", "the", "earth."]}',
    20,
    'Great job! This verse reminds us that God made everything!'
);

-- =====================================================
-- LESSON 2: Day 2 - God Creates the Sky
-- =====================================================

INSERT INTO lessons (
    id, unit_id, course_id, name, slug, description, order_index, 
    day_number, week_number, objectives, estimated_minutes,
    teacher_intro, teacher_script, discussion_questions, teacher_closing,
    materials_needed, bible_connection, prayer_prompt
) VALUES (
    'd4e5f6g7-4444-4444-4444-444444444444'::uuid,
    'b2c3d4e5-2222-2222-2222-222222222222'::uuid,
    'a1b2c3d4-1111-1111-1111-111111111111'::uuid,
    'Day 2: God Creates the Sky',
    'day-2-god-creates-sky',
    'Learn how God separated the waters and created the beautiful sky above us.',
    2,
    2,
    1,
    ARRAY[
        'Learn that God made the sky on Day 2',
        'Understand that God separated the waters',
        'Appreciate the beauty of God''s creation'
    ],
    25,
    
    'Yesterday we learned that God made light on Day 1. Today we''re going to see what God made on Day 2! Have you ever looked up at the sky and wondered who put it there? Let''s find out!',
    
    'Open your Bible to Genesis 1:6-8 and read aloud:

"And God said, ''Let there be a vault between the waters to separate water from water.'' So God made the vault and separated the water under the vault from the water above it. And it was so. God called the vault ''sky.'' And there was evening, and there was morning—the second day."

**Key Points to Emphasize:**
1. God spoke again - He said "Let there be..."
2. God made the sky to separate the waters
3. There was water below (oceans) and water above (clouds)
4. God named it "sky" - He gives names to what He creates',
    
    ARRAY[
        'What did God create on Day 2?',
        'What did the sky separate?',
        'When you look up, what do you see in the sky?',
        'What are some things you love about the sky?'
    ],
    
    'God made the beautiful sky that we see every day! The blue sky, the fluffy clouds, the place where birds fly - God made it all on Day 2. Tomorrow we''ll learn what God made on Day 3!',
    
    ARRAY['Bible', 'Optional: blue paper or cotton balls for cloud craft'],
    
    'Genesis 1:6-8 shows us that God brings order to creation. He separated and organized the waters, showing us that God is a God of order, not chaos.',
    
    'Dear God, thank You for the beautiful sky! Thank You for the blue color during the day and the pretty colors at sunset. Thank You for the clouds that bring rain. You are an amazing Creator! Amen.'
);

-- Lesson 2 Content Blocks
INSERT INTO lesson_content (lesson_id, content_type, order_index, title, content, is_read_aloud, for_student, for_teacher) VALUES
(
    'd4e5f6g7-4444-4444-4444-444444444444'::uuid,
    'scripture',
    1,
    'Today''s Bible Reading',
    'God called the vault "sky." — Genesis 1:8',
    true,
    true,
    true
),
(
    'd4e5f6g7-4444-4444-4444-444444444444'::uuid,
    'story',
    2,
    'The Story',
    'On Day 2, God looked at all the water everywhere and had a plan.

God spoke again! He said, "Let there be sky to separate the waters!"

And just like that, the sky appeared! 

The sky pushed some water down below (that became the oceans and seas) and some water stayed up high (that became the clouds).

God looked at the big, beautiful sky stretching everywhere and called it good.

And that was Day 2!',
    true,
    true,
    true
),
(
    'd4e5f6g7-4444-4444-4444-444444444444'::uuid,
    'vocabulary',
    3,
    'New Word',
    '**Sky** (also called the heavens) is the space above us where we see clouds, birds, and airplanes fly!',
    true,
    true,
    true
);

-- Lesson 2 Activities
INSERT INTO activities (lesson_id, activity_type, order_index, title, instructions, question_text, activity_data, points, explanation) VALUES
(
    'd4e5f6g7-4444-4444-4444-444444444444'::uuid,
    'multiple_choice',
    1,
    'Day 2 Question',
    'Choose the correct answer.',
    'What did God create on Day 2?',
    '{"options": ["Light", "Sky", "Fish", "Sun"], "correct": 1}',
    10,
    'God created the SKY on Day 2!'
),
(
    'd4e5f6g7-4444-4444-4444-444444444444'::uuid,
    'matching',
    2,
    'Match the Days',
    'Match each day with what God created.',
    'Draw a line to match:',
    '{"pairs": [{"left": "Day 1", "right": "Light"}, {"left": "Day 2", "right": "Sky"}]}',
    15,
    'Day 1 = Light, Day 2 = Sky. Great job remembering!'
),
(
    'd4e5f6g7-4444-4444-4444-444444444444'::uuid,
    'true_false',
    3,
    'True or False',
    'Is this statement true or false?',
    'The sky separated water from water.',
    '{"correct": true}',
    10,
    'TRUE! The sky separated the water below (oceans) from the water above (clouds).'
),
(
    'd4e5f6g7-4444-4444-4444-444444444444'::uuid,
    'memory_verse',
    4,
    'Memory Verse Review',
    'Let''s practice our memory verse again!',
    'Can you say the verse?',
    '{"verse": "In the beginning God created the heavens and the earth.", "reference": "Genesis 1:1", "words": ["In", "the", "beginning", "God", "created", "the", "heavens", "and", "the", "earth."]}',
    20,
    'You''re learning Genesis 1:1!'
);

-- =====================================================
-- LESSON 3: Day 3 - God Creates Land, Seas, and Plants
-- =====================================================

INSERT INTO lessons (
    id, unit_id, course_id, name, slug, description, order_index, 
    day_number, week_number, objectives, estimated_minutes,
    teacher_intro, teacher_script, discussion_questions, teacher_closing,
    materials_needed, bible_connection, prayer_prompt
) VALUES (
    'e5f6g7h8-5555-5555-5555-555555555555'::uuid,
    'b2c3d4e5-2222-2222-2222-222222222222'::uuid,
    'a1b2c3d4-1111-1111-1111-111111111111'::uuid,
    'Day 3: God Creates Land, Seas, and Plants',
    'day-3-god-creates-land-plants',
    'Discover how God gathered the waters, made dry land appear, and filled it with plants and trees.',
    3,
    3,
    1,
    ARRAY[
        'Learn that God made land and seas on Day 3',
        'Learn that God made plants and trees on Day 3',
        'Notice that Day 3 had TWO creative acts'
    ],
    30,
    
    'We''ve learned about Day 1 (light) and Day 2 (sky). Today is exciting because God did TWO amazing things on Day 3! Are you ready to find out what they are?',
    
    'Open your Bible to Genesis 1:9-13 and read aloud:

"And God said, ''Let the water under the sky be gathered to one place, and let dry ground appear.'' And it was so. God called the dry ground ''land,'' and the gathered waters he called ''seas.'' And God saw that it was good.

Then God said, ''Let the land produce vegetation: seed-bearing plants and trees on the land that bear fruit with seed in it, according to their various kinds.'' And it was so. The land produced vegetation: plants bearing seed according to their kinds and trees bearing fruit with seed in it according to their kinds. And God saw that it was good. And there was evening, and there was morning—the third day."

**Key Points to Emphasize:**
1. First, God gathered the waters and made dry land appear
2. Then, God made plants and trees grow from the land
3. TWO big things happened on Day 3!
4. God said "it was good" TWICE on this day',
    
    ARRAY[
        'What two things did God make on Day 3?',
        'What did God call the dry ground?',
        'What did God call the gathered waters?',
        'What''s your favorite plant or tree?'
    ],
    
    'Day 3 was a busy day! God made the land, the seas, AND all the plants and trees. Think about all the different flowers, fruits, and trees you''ve seen - God made them all! Tomorrow we''ll learn about Day 4.',
    
    ARRAY['Bible', 'Optional: a plant or leaf to show', 'Optional: fruit for snack'],
    
    'Genesis 1:9-13 shows us God''s creativity and abundance. He didn''t just make one type of plant - He made countless varieties, each beautiful in its own way.',
    
    'Dear God, thank You for the land we walk on and the seas full of water. Thank You for all the beautiful plants, flowers, and trees. Thank You for fruits and vegetables that we can eat. You think of everything! Amen.'
);

-- =====================================================
-- LESSON 4: Day 4 - God Creates Sun, Moon, and Stars
-- =====================================================

INSERT INTO lessons (
    id, unit_id, course_id, name, slug, description, order_index, 
    day_number, week_number, objectives, estimated_minutes,
    teacher_intro, teacher_script, discussion_questions, teacher_closing,
    materials_needed, bible_connection, prayer_prompt
) VALUES (
    'f6g7h8i9-6666-6666-6666-666666666666'::uuid,
    'b2c3d4e5-2222-2222-2222-222222222222'::uuid,
    'a1b2c3d4-1111-1111-1111-111111111111'::uuid,
    'Day 4: God Creates Sun, Moon, and Stars',
    'day-4-god-creates-sun-moon-stars',
    'Learn how God placed the sun, moon, and stars in the sky to give us light and mark our days and seasons.',
    4,
    4,
    1,
    ARRAY[
        'Learn that God made the sun, moon, and stars on Day 4',
        'Understand that God made them to give light',
        'Learn that they help us know day from night and seasons'
    ],
    25,
    
    'Today we''re going to learn about some of the most amazing things God created - things you can see in the sky! What do you see in the sky during the day? What about at night?',
    
    'Open your Bible to Genesis 1:14-19 and read aloud:

"And God said, ''Let there be lights in the vault of the sky to separate the day from the night, and let them serve as signs to mark sacred times, and days and years, and let them be lights in the vault of the sky to give light on the earth.'' And it was so. 

God made two great lights—the greater light to govern the day and the lesser light to govern the night. He also made the stars. God set them in the vault of the sky to give light on the earth, to govern the day and the night, and to separate light from darkness. And God saw that it was good. And there was evening, and there was morning—the fourth day."

**Key Points to Emphasize:**
1. The "greater light" is the sun - for daytime
2. The "lesser light" is the moon - for nighttime  
3. God made ALL the stars too - billions of them!
4. They help us know when it''s day, night, and what season it is',
    
    ARRAY[
        'What did God create on Day 4?',
        'Which light is for the day? Which is for night?',
        'Have you ever tried to count the stars at night?',
        'Why do you think God gave us the sun and moon?'
    ],
    
    'Tonight, if it''s clear outside, look up at the sky and try to see the moon and stars. Remember - God made every single one of those stars! And tomorrow we finish Week 1 with a review of everything we''ve learned.',
    
    ARRAY['Bible', 'Optional: yellow circle (sun), white circle (moon), star stickers'],
    
    'Psalm 19:1 says "The heavens declare the glory of God." Every time we see the sun, moon, and stars, they remind us of how great and powerful our God is!',
    
    'Dear God, thank You for the warm sun that gives us light during the day. Thank You for the moon and stars that shine at night. The sky is so beautiful because You made it! Amen.'
);

-- Add activities for lessons 3 and 4...
-- (Following same pattern as lessons 1 and 2)
