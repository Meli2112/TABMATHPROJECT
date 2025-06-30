/*
  # Seed Consequence Rules

  1. Missed Challenge Consequences
  2. Low Score Consequences  
  3. Skipped Task Consequences
  4. Fight Unresolved Consequences
  5. Streak Broken Consequences
*/

-- Missed Challenge Consequences
INSERT INTO consequence_rules (
  triggered_by, severity, type, description, dr_marcie_message, requires_consent, max_duration
) VALUES
(
  'missed_challenge',
  'light',
  'screensaver',
  'Change phone screensaver to a motivational relationship message',
  'Oops! Looks like someone forgot about their relationship homework. Don''t worry, I''ve got a little reminder for you every time you check your phone!',
  true,
  1440 -- 24 hours
),
(
  'missed_challenge',
  'medium',
  'notification_spam',
  'Send motivational notifications every 10 minutes for 2 hours',
  'Since you missed your challenge, I''m going to be your personal relationship coach for the next couple hours. You''re welcome!',
  true,
  120 -- 2 hours
),
(
  'missed_challenge',
  'heavy',
  'challenge_assignment',
  'Assign an additional trust-building challenge',
  'Missing challenges is like skipping leg day for your relationship. Time for some makeup work! I''ve assigned you an extra challenge to get back on track.',
  false,
  null
);

-- Low Score Consequences
INSERT INTO consequence_rules (
  triggered_by, severity, type, description, dr_marcie_message, requires_consent, max_duration
) VALUES
(
  'low_score',
  'light',
  'screensaver',
  'Display encouraging message about effort and improvement',
  'Low scores happen, but giving up doesn''t! Your phone now has a daily dose of relationship motivation courtesy of yours truly.',
  true,
  720 -- 12 hours
),
(
  'low_score',
  'medium',
  'app_block',
  'Temporarily block social media apps for focused relationship time',
  'Time to put down the phone and pick up your relationship! I''ve blocked the distracting apps so you can focus on what really matters.',
  true,
  60 -- 1 hour
),
(
  'low_score',
  'heavy',
  'challenge_assignment',
  'Assign a communication-focused challenge to improve connection',
  'Low scores tell me you two need to work on your connection. I''ve got just the challenge to help you get back in sync!',
  false,
  null
);

-- Skipped Task Consequences
INSERT INTO consequence_rules (
  triggered_by, severity, type, description, dr_marcie_message, requires_consent, max_duration
) VALUES
(
  'skipped_task',
  'light',
  'notification_spam',
  'Send gentle reminders every 15 minutes for 1 hour',
  'Skipping tasks is like ignoring your relationship''s needs. Let me help you remember what''s important with some friendly reminders!',
  true,
  60 -- 1 hour
),
(
  'skipped_task',
  'medium',
  'screensaver',
  'Display task reminder with partner''s photo',
  'Your partner is counting on you! Every time you look at your phone, you''ll see a reminder of who you''re doing this for.',
  true,
  480 -- 8 hours
),
(
  'skipped_task',
  'heavy',
  'privilege_loss',
  'Lose access to fun challenges until makeup task is completed',
  'Actions have consequences, sweetie. No fun challenges until you complete your makeup task. Your relationship deserves your commitment!',
  false,
  null
);

-- Fight Unresolved Consequences
INSERT INTO consequence_rules (
  triggered_by, severity, type, description, dr_marcie_message, requires_consent, max_duration
) VALUES
(
  'fight_unresolved',
  'medium',
  'notification_spam',
  'Send conflict resolution reminders every 30 minutes',
  'Unresolved fights are like relationship poison. I''m going to keep reminding you both to work this out until you do!',
  true,
  360 -- 6 hours
),
(
  'fight_unresolved',
  'heavy',
  'app_block',
  'Block entertainment apps until conflict is addressed',
  'No fun and games until you two work this out! Your relationship comes first, entertainment comes second.',
  true,
  240 -- 4 hours
),
(
  'fight_unresolved',
  'heavy',
  'challenge_assignment',
  'Assign mandatory conflict resolution challenge',
  'Since you can''t resolve this on your own, I''m stepping in with a mandatory conflict resolution challenge. Time to do the work!',
  false,
  null
);

-- Streak Broken Consequences
INSERT INTO consequence_rules (
  triggered_by, severity, type, description, dr_marcie_message, requires_consent, max_duration
) VALUES
(
  'streak_broken',
  'light',
  'screensaver',
  'Display streak motivation and encouragement to restart',
  'Streaks are broken, but relationships don''t have to be! Your phone now has a daily reminder to get back on track.',
  true,
  1440 -- 24 hours
),
(
  'streak_broken',
  'medium',
  'notification_spam',
  'Send streak rebuilding tips every 20 minutes for 3 hours',
  'Broken streaks happen to the best of us. Let me help you rebuild with some expert tips delivered right to your notifications!',
  true,
  180 -- 3 hours
),
(
  'streak_broken',
  'heavy',
  'challenge_assignment',
  'Assign streak recovery challenge with bonus points',
  'Time for a comeback! I''ve assigned you a special streak recovery challenge with bonus points. Let''s get that momentum back!',
  false,
  null
);