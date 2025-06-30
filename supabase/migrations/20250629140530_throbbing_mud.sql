/*
  # Seed Initial Challenges

  1. Communication Challenges
  2. Trust Building Challenges  
  3. Intimacy Challenges
  4. Fun & Playful Challenges
  5. Conflict Resolution Challenges
*/

-- Communication Challenges
INSERT INTO challenges (title, description, category, difficulty_level, points_reward, time_limit_minutes, is_premium) VALUES
('Daily Check-In', 'Spend 10 minutes each day sharing your highs and lows without interruption. Take turns and practice active listening.', 'communication', 1, 50, 15, false),
('Love Language Discovery', 'Take the love languages quiz together and discuss your results. Plan one activity for each other''s primary love language.', 'communication', 2, 100, 60, false),
('Phone-Free Dinner', 'Have a complete meal together without any devices. Focus entirely on conversation and connection.', 'communication', 1, 75, 45, false),
('Appreciation Circle', 'Take turns sharing 3 specific things you appreciate about your partner. Be detailed and heartfelt.', 'communication', 1, 60, 20, false),
('Dream Sharing', 'Share your biggest dreams and goals with each other. Discuss how you can support each other in achieving them.', 'communication', 3, 150, 45, true);

-- Trust Building Challenges
INSERT INTO challenges (title, description, category, difficulty_level, points_reward, time_limit_minutes, is_premium) VALUES
('Vulnerability Practice', 'Share something you''ve never told anyone else. Create a safe space for complete honesty.', 'trust', 4, 200, 30, true),
('Trust Fall Exercise', 'Practice physical trust exercises together. Start small and build up to bigger challenges.', 'trust', 2, 100, 25, false),
('Secret Sharing', 'Share a secret fear or insecurity with your partner. Practice non-judgmental listening.', 'trust', 3, 150, 30, false),
('Promise Keeping', 'Make 3 small promises to each other and follow through within the week. Track your progress together.', 'trust', 2, 125, null, false),
('Financial Transparency', 'Share your complete financial picture with each other. Discuss money goals and concerns openly.', 'trust', 5, 300, 90, true);

-- Intimacy Challenges
INSERT INTO challenges (title, description, category, difficulty_level, points_reward, time_limit_minutes, is_premium) VALUES
('Eye Contact Challenge', 'Maintain eye contact for 2 minutes without speaking. Notice what comes up for you.', 'intimacy', 2, 80, 5, false),
('Massage Exchange', 'Give each other 10-minute massages focusing on relaxation and connection, not arousal.', 'intimacy', 2, 120, 25, false),
('Compliment Marathon', 'Give each other 10 genuine compliments about non-physical attributes. Focus on character and actions.', 'intimacy', 1, 70, 15, false),
('Slow Dance', 'Dance together to 3 slow songs in your living room. No phones, just connection.', 'intimacy', 1, 90, 15, false),
('Intimacy Interview', 'Ask each other deep questions about desires, boundaries, and what makes you feel most loved.', 'intimacy', 4, 250, 60, true);

-- Fun & Playful Challenges
INSERT INTO challenges (title, description, category, difficulty_level, points_reward, time_limit_minutes, is_premium) VALUES
('Childhood Games', 'Play 3 games you both loved as children. Rediscover your playful sides together.', 'fun', 1, 85, 45, false),
('Cooking Adventure', 'Cook a meal from a cuisine neither of you has tried before. Work as a team and have fun with mistakes.', 'fun', 2, 110, 90, false),
('Photo Scavenger Hunt', 'Create a list of 10 things to find and photograph together around your neighborhood.', 'fun', 2, 95, 60, false),
('Karaoke Night', 'Sing 5 songs together - include duets, solos, and songs from when you first met.', 'fun', 1, 100, 30, false),
('Adventure Planning', 'Plan your dream vacation together, even if you can''t take it right now. Research and get excited together.', 'fun', 2, 120, 45, false);

-- Conflict Resolution Challenges
INSERT INTO challenges (title, description, category, difficulty_level, points_reward, time_limit_minutes, is_premium) VALUES
('I-Statement Practice', 'Practice expressing frustrations using only "I" statements. No "you" accusations allowed.', 'conflict-resolution', 3, 140, 20, false),
('Cooling Off Protocol', 'Establish a system for taking breaks during heated discussions. Practice using it during a mock disagreement.', 'conflict-resolution', 2, 110, 30, false),
('Perspective Swap', 'Argue each other''s side of a recent disagreement. Try to genuinely understand their viewpoint.', 'conflict-resolution', 4, 180, 40, true),
('Apology Practice', 'Practice giving meaningful apologies that include acknowledgment, responsibility, and change commitment.', 'conflict-resolution', 3, 160, 25, false),
('Compromise Challenge', 'Find a current disagreement and work together to find a solution where you both feel heard and valued.', 'conflict-resolution', 4, 200, 45, true);