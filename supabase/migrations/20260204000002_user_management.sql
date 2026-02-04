-- =====================================================
-- USER MANAGEMENT ENHANCEMENTS
-- =====================================================

-- Create user activity logs table
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Activity details
  action TEXT NOT NULL,
  entity_type TEXT, -- product, page, order, etc.
  entity_id UUID,
  entity_name TEXT, -- For display purposes
  
  -- Change details
  changes JSONB, -- Before/after values
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user sessions table for tracking
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Session info
  session_token TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON user_activity_logs(action);
CREATE INDEX idx_activity_logs_entity_type ON user_activity_logs(entity_type);
CREATE INDEX idx_activity_logs_created_at ON user_activity_logs(created_at DESC);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_last_activity ON user_sessions(last_activity DESC);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id UUID,
  p_action TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_entity_name TEXT DEFAULT NULL,
  p_changes JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_activity_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    entity_name,
    changes
  ) VALUES (
    p_user_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_entity_name,
    p_changes
  );
END;
$$ LANGUAGE plpgsql;

-- Function to clean old activity logs (retention: 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_activity_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM user_activity_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_statistics(p_user_id UUID)
RETURNS TABLE(
  total_actions BIGINT,
  last_login TIMESTAMP WITH TIME ZONE,
  products_created BIGINT,
  products_updated BIGINT,
  orders_managed BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_actions,
    MAX(created_at) as last_login,
    COUNT(*) FILTER (WHERE action = 'product.create') as products_created,
    COUNT(*) FILTER (WHERE action LIKE 'product.update%') as products_updated,
    COUNT(*) FILTER (WHERE action LIKE 'order.%') as orders_managed
  FROM user_activity_logs
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Only admins can view all activity logs
CREATE POLICY "Admins can view all activity logs"
  ON user_activity_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Users can view their own activity
CREATE POLICY "Users can view own activity"
  ON user_activity_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- System can insert activity logs
CREATE POLICY "Authenticated users can log activity"
  ON user_activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Session policies
CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own sessions"
  ON user_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions"
  ON user_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- =====================================================
-- ENHANCED PROFILES TABLE
-- =====================================================

-- Add additional user management fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create index on is_active
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-log profile changes
CREATE OR REPLACE FUNCTION track_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    PERFORM log_user_activity(
      NEW.id,
      'profile.update',
      'profile',
      NEW.id,
      NEW.full_name,
      jsonb_build_object(
        'old', jsonb_build_object('role', OLD.role, 'email', OLD.email),
        'new', jsonb_build_object('role', NEW.role, 'email', NEW.email)
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_profile_changes
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION track_profile_changes();

-- =====================================================
-- SEED DATA (Sample activity logs for testing)
-- =====================================================

-- Uncomment to add sample logs
/*
INSERT INTO user_activity_logs (user_id, action, entity_type, entity_name)
SELECT 
  id,
  'login',
  NULL,
  NULL
FROM profiles
LIMIT 5;
*/