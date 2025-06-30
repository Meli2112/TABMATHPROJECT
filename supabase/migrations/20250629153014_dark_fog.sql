/*
  # Extended Schema for Dr. Marcie AI System

  1. New Tables
    - `sos_sessions` - SOS Fight Solver sessions
    - `sos_inputs` - Partner inputs for SOS sessions
    - `sos_analyses` - AI analysis results
    - `therapy_games` - Available therapy games
    - `game_sessions` - Active game sessions
    - `game_responses` - User responses to game prompts
    - `consequence_rules` - Available consequence types
    - `active_consequences` - Currently active consequences
    - `consequence_preferences` - User consequence preferences
    - `dr_marcie_conversations` - Conversation history with Dr. Marcie

  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies for data access
*/

-- SOS Fight Solver Tables
CREATE TABLE IF NOT EXISTS sos_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
  initiated_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'active' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  resolved_at timestamptz
);

CREATE TABLE IF NOT EXISTS sos_inputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sos_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  perspective text NOT NULL,
  emotional_state text NOT NULL,
  severity_level integer NOT NULL CHECK (severity_level >= 1 AND severity_level <= 5),
  trigger_event text NOT NULL,
  desired_outcome text NOT NULL,
  submitted_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS sos_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sos_sessions(id) ON DELETE CASCADE NOT NULL,
  ai_provider text NOT NULL,
  analysis jsonb NOT NULL,
  dr_marcie_response jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Therapy Games Tables
CREATE TABLE IF NOT EXISTS therapy_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  game_type text NOT NULL,
  difficulty_level integer NOT NULL CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  estimated_duration integer NOT NULL, -- minutes
  points_reward integer NOT NULL DEFAULT 0,
  is_premium boolean DEFAULT false NOT NULL,
  dr_marcie_intro text NOT NULL,
  dr_marcie_outro text NOT NULL,
  rules text[] NOT NULL DEFAULT '{}',
  prompts jsonb NOT NULL DEFAULT '[]',
  scoring_criteria jsonb NOT NULL DEFAULT '{}',
  personalizations jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES therapy_games(id) ON DELETE CASCADE NOT NULL,
  couple_id uuid REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'starting' NOT NULL,
  current_prompt_index integer DEFAULT 0 NOT NULL,
  scores jsonb NOT NULL DEFAULT '{"partner1": 0, "partner2": 0, "combined": 0}',
  dr_marcie_commentary text[] NOT NULL DEFAULT '{}',
  started_at timestamptz DEFAULT now() NOT NULL,
  completed_at timestamptz,
  paused_at timestamptz
);

CREATE TABLE IF NOT EXISTS game_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE NOT NULL,
  prompt_id text NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  response jsonb NOT NULL,
  submitted_at timestamptz DEFAULT now() NOT NULL,
  ai_analysis text,
  dr_marcie_feedback text
);

-- Consequence System Tables
CREATE TABLE IF NOT EXISTS consequence_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by text NOT NULL,
  severity text NOT NULL,
  type text NOT NULL,
  description text NOT NULL,
  dr_marcie_message text NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  requires_consent boolean DEFAULT true NOT NULL,
  max_duration integer, -- minutes
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS active_consequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid REFERENCES consequence_rules(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  couple_id uuid REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending_consent' NOT NULL,
  triggered_by text NOT NULL,
  assigned_at timestamptz DEFAULT now() NOT NULL,
  started_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  user_consent boolean DEFAULT false NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  dr_marcie_commentary text[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS consequence_preferences (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  allow_screensaver_changes boolean DEFAULT true NOT NULL,
  allow_app_blocking boolean DEFAULT false NOT NULL,
  allow_notification_spam boolean DEFAULT true NOT NULL,
  max_notification_frequency integer DEFAULT 5 NOT NULL, -- minutes
  blocked_app_categories text[] NOT NULL DEFAULT '{}',
  exemption_hours jsonb NOT NULL DEFAULT '[]',
  emergency_bypass boolean DEFAULT true NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Dr. Marcie Conversation History
CREATE TABLE IF NOT EXISTS dr_marcie_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  couple_id uuid REFERENCES couples(id) ON DELETE CASCADE,
  session_type text NOT NULL,
  context jsonb NOT NULL DEFAULT '{}',
  user_message text NOT NULL,
  dr_marcie_response jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE sos_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapy_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE consequence_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_consequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE consequence_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE dr_marcie_conversations ENABLE ROW LEVEL SECURITY;

-- SOS Sessions Policies
CREATE POLICY "Partners can read SOS sessions"
  ON sos_sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = sos_sessions.couple_id
      AND (couples.partner_1_id = auth.uid() OR couples.partner_2_id = auth.uid())
    )
  );

CREATE POLICY "Partners can create SOS sessions"
  ON sos_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = sos_sessions.couple_id
      AND (couples.partner_1_id = auth.uid() OR couples.partner_2_id = auth.uid())
    )
    AND auth.uid() = initiated_by
  );

-- SOS Inputs Policies
CREATE POLICY "Partners can read SOS inputs"
  ON sos_inputs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sos_sessions
      JOIN couples ON couples.id = sos_sessions.couple_id
      WHERE sos_sessions.id = sos_inputs.session_id
      AND (couples.partner_1_id = auth.uid() OR couples.partner_2_id = auth.uid())
    )
  );

CREATE POLICY "Users can create own SOS inputs"
  ON sos_inputs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- SOS Analyses Policies
CREATE POLICY "Partners can read SOS analyses"
  ON sos_analyses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sos_sessions
      JOIN couples ON couples.id = sos_sessions.couple_id
      WHERE sos_sessions.id = sos_analyses.session_id
      AND (couples.partner_1_id = auth.uid() OR couples.partner_2_id = auth.uid())
    )
  );

-- Therapy Games Policies
CREATE POLICY "Anyone can read therapy games"
  ON therapy_games
  FOR SELECT
  TO authenticated
  USING (true);

-- Game Sessions Policies
CREATE POLICY "Partners can read game sessions"
  ON game_sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = game_sessions.couple_id
      AND (couples.partner_1_id = auth.uid() OR couples.partner_2_id = auth.uid())
    )
  );

CREATE POLICY "Partners can create game sessions"
  ON game_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = game_sessions.couple_id
      AND (couples.partner_1_id = auth.uid() OR couples.partner_2_id = auth.uid())
    )
  );

CREATE POLICY "Partners can update game sessions"
  ON game_sessions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = game_sessions.couple_id
      AND (couples.partner_1_id = auth.uid() OR couples.partner_2_id = auth.uid())
    )
  );

-- Game Responses Policies
CREATE POLICY "Partners can read game responses"
  ON game_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM game_sessions
      JOIN couples ON couples.id = game_sessions.couple_id
      WHERE game_sessions.id = game_responses.session_id
      AND (couples.partner_1_id = auth.uid() OR couples.partner_2_id = auth.uid())
    )
  );

CREATE POLICY "Users can create own game responses"
  ON game_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Consequence Rules Policies
CREATE POLICY "Anyone can read consequence rules"
  ON consequence_rules
  FOR SELECT
  TO authenticated
  USING (true);

-- Active Consequences Policies
CREATE POLICY "Users can read own consequences"
  ON active_consequences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own consequences"
  ON active_consequences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Consequence Preferences Policies
CREATE POLICY "Users can read own preferences"
  ON consequence_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON consequence_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON consequence_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Dr. Marcie Conversations Policies
CREATE POLICY "Users can read own conversations"
  ON dr_marcie_conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON dr_marcie_conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sos_sessions_couple ON sos_sessions(couple_id);
CREATE INDEX IF NOT EXISTS idx_sos_inputs_session ON sos_inputs(session_id);
CREATE INDEX IF NOT EXISTS idx_sos_analyses_session ON sos_analyses(session_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_couple ON game_sessions(couple_id);
CREATE INDEX IF NOT EXISTS idx_game_responses_session ON game_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_active_consequences_user ON active_consequences(user_id);
CREATE INDEX IF NOT EXISTS idx_dr_marcie_conversations_user ON dr_marcie_conversations(user_id);

-- Add updated_at triggers
CREATE TRIGGER update_therapy_games_updated_at BEFORE UPDATE ON therapy_games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consequence_preferences_updated_at BEFORE UPDATE ON consequence_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();