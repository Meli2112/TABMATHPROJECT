/*
  # Seed Therapy Games

  1. Communication Games
  2. Trust Building Games
  3. Intimacy Games
  4. Fun & Creative Games
  5. Conflict Resolution Games
  6. Emotional Intelligence Games
*/

-- Communication Games
INSERT INTO therapy_games (
  title, description, category, game_type, difficulty_level, estimated_duration, 
  points_reward, is_premium, dr_marcie_intro, dr_marcie_outro, rules, prompts, scoring_criteria
) VALUES
(
  'Truth or Dare: Relationship Edition',
  'A playful twist on the classic game, designed to deepen your connection through fun questions and gentle challenges.',
  'communication',
  'quiz',
  2,
  30,
  150,
  false,
  'Alright lovebirds, time for some Truth or Dare - but make it therapeutic! This isn''t your teenage sleepover version. We''re going deep, but keeping it fun. Ready to learn something new about each other?',
  'Look at you two being all vulnerable and adorable! You''ve earned some serious relationship points today. Keep this energy going - your connection is stronger when you''re brave enough to be real with each other.',
  ARRAY['Take turns choosing truth or dare', 'Be honest and respectful', 'No judgment zone', 'Have fun with it!'],
  '[
    {
      "id": "1",
      "order": 1,
      "type": "question",
      "content": "Truth: What''s one thing about me that surprised you when we first started dating?",
      "drMarcieVoiceText": "Ooh, this is a good one! Time to get a little nostalgic and sweet. What caught you off guard about your partner in the beginning?",
      "timeLimit": 120,
      "requiredResponse": "text"
    },
    {
      "id": "2",
      "order": 2,
      "type": "instruction",
      "content": "Dare: Give your partner a 2-minute shoulder massage while telling them three things you appreciate about them.",
      "drMarcieVoiceText": "Time for some physical affection with a side of appreciation! This is what I call multitasking your love language.",
      "timeLimit": 180,
      "requiredResponse": "both-partners"
    }
  ]'::jsonb,
  '{
    "maxPoints": 150,
    "categories": {
      "participation": 40,
      "honesty": 50,
      "effort": 30,
      "insight": 20,
      "connection": 10
    },
    "bonusPoints": {
      "vulnerability": 25,
      "humor": 15,
      "creativity": 10
    }
  }'::jsonb
),
(
  'Love Language Detective',
  'Discover and explore each other''s love languages through interactive scenarios and questions.',
  'communication',
  'quiz',
  1,
  25,
  100,
  false,
  'Time to become love language detectives! You think you know how your partner feels most loved? Let''s put that to the test. This game will help you speak each other''s emotional language fluently.',
  'Detective work complete! Now you have the secret codes to each other''s hearts. Use this intel wisely - and often!',
  ARRAY['Answer honestly about preferences', 'Pay attention to your partner''s responses', 'No right or wrong answers', 'Focus on understanding, not judging'],
  '[
    {
      "id": "1",
      "order": 1,
      "type": "scenario",
      "content": "It''s been a stressful week. Which would make you feel most loved: A) Your partner doing the dishes without being asked B) A long hug and words of encouragement C) Uninterrupted time together watching your favorite show D) A small surprise gift E) A back rub",
      "drMarcieVoiceText": "Scenario time! Picture this stressful week and really think about what would fill your love tank the most.",
      "requiredResponse": "choice",
      "choices": ["Acts of Service", "Words of Affirmation", "Quality Time", "Receiving Gifts", "Physical Touch"]
    }
  ]'::jsonb,
  '{
    "maxPoints": 100,
    "categories": {
      "participation": 30,
      "honesty": 40,
      "effort": 20,
      "insight": 10,
      "connection": 0
    },
    "bonusPoints": {
      "vulnerability": 15,
      "humor": 10,
      "creativity": 5
    }
  }'::jsonb
);

-- Trust Building Games
INSERT INTO therapy_games (
  title, description, category, game_type, difficulty_level, estimated_duration, 
  points_reward, is_premium, dr_marcie_intro, dr_marcie_outro, rules, prompts, scoring_criteria
) VALUES
(
  'Secrets & Strengths',
  'Share personal stories and celebrate each other''s strengths in a safe, supportive environment.',
  'trust',
  'sharing',
  3,
  40,
  200,
  true,
  'Okay, brave souls, it''s time for some real talk. This game is about building trust through vulnerability. We''re going to share some secrets and celebrate some strengths. Remember, what''s shared here stays here.',
  'Wow, look at you two being all courageous and connected! Trust is built one vulnerable moment at a time, and you just added some serious foundation to your relationship.',
  ARRAY['Create a judgment-free zone', 'Listen without trying to fix', 'Share at your comfort level', 'Celebrate vulnerabilities as strengths'],
  '[
    {
      "id": "1",
      "order": 1,
      "type": "question",
      "content": "Share a fear you have that you''ve never told your partner about.",
      "drMarcieVoiceText": "Time to get vulnerable. Share a fear that you''ve been carrying alone. Your partner is here to support you, not judge you.",
      "timeLimit": 300,
      "requiredResponse": "text"
    },
    {
      "id": "2",
      "order": 2,
      "type": "reflection",
      "content": "Tell your partner about a time they showed incredible strength, and how it made you feel.",
      "drMarcieVoiceText": "Now let''s flip the script. Time to celebrate your partner''s strength. Think of a specific moment when they impressed you with their resilience.",
      "timeLimit": 240,
      "requiredResponse": "text"
    }
  ]'::jsonb,
  '{
    "maxPoints": 200,
    "categories": {
      "participation": 30,
      "honesty": 60,
      "effort": 40,
      "insight": 40,
      "connection": 30
    },
    "bonusPoints": {
      "vulnerability": 40,
      "humor": 10,
      "creativity": 15
    }
  }'::jsonb
);

-- Intimacy Games
INSERT INTO therapy_games (
  title, description, category, game_type, difficulty_level, estimated_duration, 
  points_reward, is_premium, dr_marcie_intro, dr_marcie_outro, rules, prompts, scoring_criteria
) VALUES
(
  'Eye Contact Challenge',
  'Build intimacy through sustained eye contact and mindful connection exercises.',
  'intimacy',
  'timed-challenge',
  2,
  15,
  120,
  false,
  'Alright, time to get comfortable with being uncomfortable. We''re doing the eye contact challenge. No giggling, no looking away, just pure connection. Think you can handle it?',
  'That was beautiful! Eye contact is like a direct line to the soul. You just practiced one of the most intimate acts possible - truly seeing each other.',
  ARRAY['Maintain eye contact for specified duration', 'No talking during eye contact phases', 'Breathe naturally', 'Notice what comes up without judgment'],
  '[
    {
      "id": "1",
      "order": 1,
      "type": "instruction",
      "content": "Sit facing each other and maintain eye contact for 2 minutes. Notice any urges to look away or laugh, but stay present.",
      "drMarcieVoiceText": "Two minutes of pure eye contact. No words, no distractions, just seeing each other. Ready? Go!",
      "timeLimit": 120,
      "requiredResponse": "both-partners"
    },
    {
      "id": "2",
      "order": 2,
      "type": "reflection",
      "content": "Share what you noticed during the eye contact - emotions, thoughts, or physical sensations.",
      "drMarcieVoiceText": "Now talk about what that was like. What did you notice? What came up for you during those two minutes?",
      "timeLimit": 180,
      "requiredResponse": "text"
    }
  ]'::jsonb,
  '{
    "maxPoints": 120,
    "categories": {
      "participation": 40,
      "honesty": 30,
      "effort": 30,
      "insight": 15,
      "connection": 5
    },
    "bonusPoints": {
      "vulnerability": 20,
      "humor": 5,
      "creativity": 5
    }
  }'::jsonb
);

-- Fun & Creative Games
INSERT INTO therapy_games (
  title, description, category, game_type, difficulty_level, estimated_duration, 
  points_reward, is_premium, dr_marcie_intro, dr_marcie_outro, rules, prompts, scoring_criteria
) VALUES
(
  'Relationship Time Machine',
  'Travel through your relationship timeline and create new memories together.',
  'fun',
  'creative',
  1,
  35,
  130,
  false,
  'All aboard the relationship time machine! We''re taking a trip through your love story - past, present, and future. Pack your sense of humor and your rose-colored glasses!',
  'What a journey! You''ve just celebrated your past, appreciated your present, and dreamed about your future together. That''s what I call relationship goals!',
  ARRAY['Be creative and playful', 'Share positive memories', 'Dream big about the future', 'Have fun with it!'],
  '[
    {
      "id": "1",
      "order": 1,
      "type": "question",
      "content": "If you could relive one day from your relationship, which would it be and why?",
      "drMarcieVoiceText": "Time machine activated! Take me back to one perfect day in your relationship. Paint me a picture of why this day was so special.",
      "timeLimit": 180,
      "requiredResponse": "text"
    },
    {
      "id": "2",
      "order": 2,
      "type": "creative",
      "content": "Design your dream date 10 years from now. Where are you? What are you doing? How have you grown together?",
      "drMarcieVoiceText": "Now let''s fast forward to the future! Dream big about your relationship 10 years from now. What does your love story look like?",
      "timeLimit": 240,
      "requiredResponse": "text"
    }
  ]'::jsonb,
  '{
    "maxPoints": 130,
    "categories": {
      "participation": 35,
      "honesty": 25,
      "effort": 30,
      "insight": 20,
      "connection": 20
    },
    "bonusPoints": {
      "vulnerability": 15,
      "humor": 20,
      "creativity": 25
    }
  }'::jsonb
);

-- Conflict Resolution Games
INSERT INTO therapy_games (
  title, description, category, game_type, difficulty_level, estimated_duration, 
  points_reward, is_premium, dr_marcie_intro, dr_marcie_outro, rules, prompts, scoring_criteria
) VALUES
(
  'The Great Perspective Swap',
  'Practice seeing conflicts from your partner''s point of view through role-playing exercises.',
  'conflict-resolution',
  'role-play',
  4,
  45,
  250,
  true,
  'Time for some relationship theater! We''re going to practice the ancient art of perspective-taking. You''ll literally argue each other''s side. It''s going to be weird, enlightening, and probably a little funny.',
  'Bravo! You just mastered one of the most important relationship skills - seeing through your partner''s eyes. This is how real understanding happens.',
  ARRAY['Argue your partner''s perspective, not your own', 'Try to genuinely understand their viewpoint', 'No mocking or sarcasm', 'Focus on understanding, not winning'],
  '[
    {
      "id": "1",
      "order": 1,
      "type": "scenario",
      "content": "Think of a recent disagreement you had. Partner A, argue Partner B''s side of the issue. Partner B, argue Partner A''s side.",
      "drMarcieVoiceText": "Role reversal time! You''re going to argue your partner''s side of a recent disagreement. Really try to understand and represent their perspective fairly.",
      "timeLimit": 600,
      "requiredResponse": "both-partners"
    },
    {
      "id": "2",
      "order": 2,
      "type": "reflection",
      "content": "What did you learn about your partner''s perspective? What surprised you?",
      "drMarcieVoiceText": "Now let''s debrief. What did you discover when you stepped into your partner''s shoes? Any lightbulb moments?",
      "timeLimit": 300,
      "requiredResponse": "text"
    }
  ]'::jsonb,
  '{
    "maxPoints": 250,
    "categories": {
      "participation": 40,
      "honesty": 50,
      "effort": 60,
      "insight": 60,
      "connection": 40
    },
    "bonusPoints": {
      "vulnerability": 30,
      "humor": 15,
      "creativity": 20
    }
  }'::jsonb
);

-- Emotional Intelligence Games
INSERT INTO therapy_games (
  title, description, category, game_type, difficulty_level, estimated_duration, 
  points_reward, is_premium, dr_marcie_intro, dr_marcie_outro, rules, prompts, scoring_criteria
) VALUES
(
  'Emotion Detective',
  'Learn to identify and understand each other''s emotional patterns and triggers.',
  'emotional-intelligence',
  'puzzle',
  3,
  30,
  180,
  false,
  'Welcome to Emotion Detective Academy! Today we''re learning to read the subtle signs of each other''s emotional world. By the end of this, you''ll be emotional mind readers!',
  'Congratulations, detectives! You''ve just leveled up your emotional intelligence. Use these new skills to support each other better every day.',
  ARRAY['Pay attention to subtle emotional cues', 'Ask clarifying questions', 'Validate emotions without trying to fix', 'Practice emotional vocabulary'],
  '[
    {
      "id": "1",
      "order": 1,
      "type": "question",
      "content": "Describe a time this week when you felt an emotion but didn''t express it clearly. What were the physical signs your partner might have noticed?",
      "drMarcieVoiceText": "Think about those hidden emotions from this week. What were the clues your body was giving that your partner might have picked up on?",
      "timeLimit": 240,
      "requiredResponse": "text"
    },
    {
      "id": "2",
      "order": 2,
      "type": "instruction",
      "content": "Partner, guess what emotion they were feeling and what physical signs you might have noticed. Then discuss how accurate you were.",
      "drMarcieVoiceText": "Detective time! Based on what your partner shared, what emotion do you think they were feeling? What clues would you have looked for?",
      "timeLimit": 300,
      "requiredResponse": "both-partners"
    }
  ]'::jsonb,
  '{
    "maxPoints": 180,
    "categories": {
      "participation": 35,
      "honesty": 45,
      "effort": 40,
      "insight": 35,
      "connection": 25
    },
    "bonusPoints": {
      "vulnerability": 25,
      "humor": 10,
      "creativity": 15
    }
  }'::jsonb
);