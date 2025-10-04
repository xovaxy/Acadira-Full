-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'student');

-- Create enum for subscription status
CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled');

-- Create institutions table
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  subscription_status subscription_status DEFAULT 'active',
  subscription_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table for additional user information
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL,
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create curriculum table
CREATE TABLE curriculum (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  subject TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_sessions table
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics table for tracking usage
CREATE TABLE usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  question_count INTEGER DEFAULT 1,
  topic TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for institutions
CREATE POLICY "Admins can view their own institution"
  ON institutions FOR SELECT
  USING (
    id IN (
      SELECT institution_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update their own institution"
  ON institutions FOR UPDATE
  USING (
    id IN (
      SELECT institution_id FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for curriculum
CREATE POLICY "Admins can view their institution's curriculum"
  ON curriculum FOR SELECT
  USING (
    institution_id IN (
      SELECT institution_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert curriculum for their institution"
  ON curriculum FOR INSERT
  WITH CHECK (
    institution_id IN (
      SELECT institution_id FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete their institution's curriculum"
  ON curriculum FOR DELETE
  USING (
    institution_id IN (
      SELECT institution_id FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for chat_sessions
CREATE POLICY "Students can view their own sessions"
  ON chat_sessions FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can create their own sessions"
  ON chat_sessions FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own sessions"
  ON chat_sessions FOR UPDATE
  USING (student_id = auth.uid());

CREATE POLICY "Students can delete their own sessions"
  ON chat_sessions FOR DELETE
  USING (student_id = auth.uid());

-- RLS Policies for chat_messages
CREATE POLICY "Students can view messages from their sessions"
  ON chat_messages FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM chat_sessions WHERE student_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert messages to their sessions"
  ON chat_messages FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM chat_sessions WHERE student_id = auth.uid()
    )
  );

-- RLS Policies for analytics
CREATE POLICY "Admins can view their institution's analytics"
  ON usage_analytics FOR SELECT
  USING (
    institution_id IN (
      SELECT institution_id FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert analytics"
  ON usage_analytics FOR INSERT
  WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_institutions_updated_at
  BEFORE UPDATE ON institutions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for curriculum files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('curriculum', 'curriculum', false);

-- Storage policies for curriculum bucket
CREATE POLICY "Admins can upload curriculum"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'curriculum' AND
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can view curriculum"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'curriculum' AND auth.uid() IS NOT NULL);