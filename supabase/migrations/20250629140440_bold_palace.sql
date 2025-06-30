/*
  # Initial Schema for Couples Therapy App

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `full_name` (text, nullable)
      - `avatar_url` (text, nullable)
      - `age` (integer, nullable)
      - `gender` (text, nullable)
      - `relationship_status` (text, nullable)
      - `subscription_tier` (text, default 'free')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `couples`
      - `id` (uuid, primary key)
      - `partner_1_id` (uuid, references profiles)
      - `partner_2_id` (uuid, references profiles)
      - `relationship_start_date` (date, nullable)
      - `status` (text, default 'active')
      - `total_score` (integer, default 0)
      - `current_streak` (integer, default 0)
      - `longest_streak` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `challenges`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `difficulty_level` (integer, 1-5)
      - `points_reward` (integer)
      - `time_limit_minutes` (integer, nullable)
      - `is_premium` (boolean, default false)
      - `created_by` (uuid, nullable, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `challenge_attempts`
      - `id` (uuid, primary key)
      - `couple_id` (uuid, references couples)
      - `challenge_id` (uuid, references challenges)
      - `status` (text, default 'pending')
      - `score` (integer, nullable)
      - `completed_at` (timestamp, nullable)
      - `feedback` (text, nullable)
      - `ai_analysis` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `consequences`
      - `id` (uuid, primary key)
      - `couple_id` (uuid, references couples)
      - `type` (text) -- 'reward', 'penalty', 'task'
      - `title` (text)
      - `description` (text)
      - `assigned_to` (uuid, nullable, references profiles)
      - `status` (text, default 'pending')
      - `due_date` (timestamp, nullable)
      - `completed_at` (timestamp, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `fight_logs`
      - `id` (uuid, primary key)
      - `couple_id` (uuid, references couples)
      - `reported_by` (uuid, references profiles)
      - `severity_level` (integer, 1-5)
      - `description` (text)
      - `ai_analysis` (text, nullable)
      - `resolution_status` (text, default 'unresolved')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `type` (text)
      - `title` (text)
      - `message` (text)
      - `is_read` (boolean, default false)
      - `action_url` (text, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for couples to access shared data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  age integer,
  gender text,
  relationship_status text,
  subscription_tier text DEFAULT 'free' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create couples table
CREATE TABLE IF NOT EXISTS couples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_1_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  partner_2_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  relationship_start_date date,
  status text DEFAULT 'active' NOT NULL,
  total_score integer DEFAULT 0 NOT NULL,
  current_streak integer DEFAULT 0 NOT NULL,
  longest_streak integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(partner_1_id, partner_2_id),
  CHECK (partner_1_id != partner_2_id)
);

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  difficulty_level integer NOT NULL CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  points_reward integer NOT NULL DEFAULT 0,
  time_limit_minutes integer,
  is_premium boolean DEFAULT false NOT NULL,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create challenge_attempts table
CREATE TABLE IF NOT EXISTS challenge_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  score integer,
  completed_at timestamptz,
  feedback text,
  ai_analysis text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create consequences table
CREATE TABLE IF NOT EXISTS consequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  assigned_to uuid REFERENCES profiles(id),
  status text DEFAULT 'pending' NOT NULL,
  due_date timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create fight_logs table
CREATE TABLE IF NOT EXISTS fight_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
  reported_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  severity_level integer NOT NULL CHECK (severity_level >= 1 AND severity_level <= 5),
  description text NOT NULL,
  ai_analysis text,
  resolution_status text DEFAULT 'unresolved' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false NOT NULL,
  action_url text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE consequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE fight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Couples policies
CREATE POLICY "Partners can read couple data"
  ON couples
  FOR SELECT
  TO authenticated
  USING (auth.uid() = partner_1_id OR auth.uid() = partner_2_id);

CREATE POLICY "Partners can update couple data"
  ON couples
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = partner_1_id OR auth.uid() = partner_2_id);

CREATE POLICY "Users can create couples"
  ON couples
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = partner_1_id OR auth.uid() = partner_2_id);

-- Challenges policies
CREATE POLICY "Anyone can read challenges"
  ON challenges
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create challenges"
  ON challenges
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by OR created_by IS NULL);

-- Challenge attempts policies
CREATE POLICY "Partners can read challenge attempts"
  ON challenge_attempts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = challenge_attempts.couple_id
      AND (couples.partner_1_id = auth.uid() OR couples.partner_2_id = auth.uid())
    )
  );

CREATE POLICY "Partners can create challenge attempts"
  ON challenge_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = challenge_attempts.couple_id
      AND (couples.partner_1_id = auth.uid() OR couples.partner_2_id = auth.uid())
    )
  );

CREATE POLICY "Partners can update challenge attempts"
  ON challenge_attempts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = challenge_attempts.couple_id
      AND (couples.partner_1_id = auth.uid() OR couples.partner_2_id = auth.uid())
    )
  );

-- Consequences policies
CREATE POLICY "Partners can read consequences"
  ON consequences
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = consequences.couple_id
      AND (couples.partner_1_id = auth.uid() OR couples.partner_2_id = auth.uid())
    )
  );

CREATE POLICY "Partners can create consequences"
  ON consequences
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = consequences.couple_id
      AND (couples.partner_1_id = auth.uid() OR couples.partner_2_id = auth.uid())
    )
  );

CREATE POLICY "Partners can update consequences"
  ON consequences
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = consequences.couple_id
      AND (couples.partner_1_id = auth.uid() OR couples.partner_2_id = auth.uid())
    )
  );

-- Fight logs policies
CREATE POLICY "Partners can read fight logs"
  ON fight_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = fight_logs.couple_id
      AND (couples.partner_1_id = auth.uid() OR couples.partner_2_id = auth.uid())
    )
  );

CREATE POLICY "Partners can create fight logs"
  ON fight_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = fight_logs.couple_id
      AND (couples.partner_1_id = auth.uid() OR couples.partner_2_id = auth.uid())
    )
    AND auth.uid() = reported_by
  );

-- Notifications policies
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_couples_partner_1 ON couples(partner_1_id);
CREATE INDEX IF NOT EXISTS idx_couples_partner_2 ON couples(partner_2_id);
CREATE INDEX IF NOT EXISTS idx_couples_status ON couples(status);
CREATE INDEX IF NOT EXISTS idx_challenge_attempts_couple ON challenge_attempts(couple_id);
CREATE INDEX IF NOT EXISTS idx_challenge_attempts_challenge ON challenge_attempts(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_attempts_status ON challenge_attempts(status);
CREATE INDEX IF NOT EXISTS idx_consequences_couple ON consequences(couple_id);
CREATE INDEX IF NOT EXISTS idx_consequences_assigned_to ON consequences(assigned_to);
CREATE INDEX IF NOT EXISTS idx_fight_logs_couple ON fight_logs(couple_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_couples_updated_at BEFORE UPDATE ON couples FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_challenge_attempts_updated_at BEFORE UPDATE ON challenge_attempts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consequences_updated_at BEFORE UPDATE ON consequences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fight_logs_updated_at BEFORE UPDATE ON fight_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();