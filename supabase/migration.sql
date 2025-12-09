-- ============================================================================
-- GB CODER - SUPABASE DATABASE MIGRATION SCRIPT
-- ============================================================================
-- This script safely drops existing tables and recreates them
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP EXISTING TABLES (if they exist)
-- ============================================================================

-- Drop triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_settings ON auth.users;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_ai_conversations_updated_at ON ai_conversations;
DROP TRIGGER IF EXISTS update_snippets_updated_at ON snippets;
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.create_default_user_settings();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS ai_messages CASCADE;
DROP TABLE IF EXISTS ai_conversations CASCADE;
DROP TABLE IF EXISTS project_snapshots CASCADE;
DROP TABLE IF EXISTS project_history CASCADE;
DROP TABLE IF EXISTS snippets CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================================================
-- STEP 2: CREATE HELPER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 3: CREATE PROFILES TABLE
-- ============================================================================

CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT username_length CHECK (CHAR_LENGTH(username) >= 3)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE INDEX profiles_username_idx ON profiles(username);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 4: CREATE PROJECTS TABLE
-- ============================================================================

CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  html TEXT DEFAULT '',
  css TEXT DEFAULT '',
  javascript TEXT DEFAULT '',
  external_libraries JSONB DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{"autoSaveEnabled": true, "theme": "dark", "editorFontSize": 14}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects" ON projects FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX projects_user_id_idx ON projects(user_id);
CREATE INDEX projects_updated_at_idx ON projects(updated_at DESC);

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 5: CREATE PROJECT SNAPSHOTS TABLE
-- ============================================================================

CREATE TABLE project_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  html TEXT,
  css TEXT,
  javascript TEXT,
  label TEXT,
  description TEXT,
  snapshot_type TEXT DEFAULT 'auto',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE project_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view snapshots of their projects" ON project_snapshots FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_snapshots.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can create snapshots for their projects" ON project_snapshots FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_snapshots.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can delete snapshots of their projects" ON project_snapshots FOR DELETE
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_snapshots.project_id AND projects.user_id = auth.uid()));

CREATE INDEX snapshots_project_id_idx ON project_snapshots(project_id);

-- ============================================================================
-- STEP 6: CREATE AI CONVERSATIONS TABLE
-- ============================================================================

CREATE TABLE ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT DEFAULT 'New Chat',
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations" ON ai_conversations FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create conversations" ON ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own conversations" ON ai_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own conversations" ON ai_conversations FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX ai_conversations_user_id_idx ON ai_conversations(user_id);

CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 7: CREATE AI MESSAGES TABLE
-- ============================================================================

CREATE TABLE ai_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  code_blocks JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  model TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from their conversations" ON ai_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM ai_conversations WHERE ai_conversations.id = ai_messages.conversation_id AND ai_conversations.user_id = auth.uid()));
CREATE POLICY "Users can create messages in their conversations" ON ai_messages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM ai_conversations WHERE ai_conversations.id = ai_messages.conversation_id AND ai_conversations.user_id = auth.uid()));

CREATE INDEX ai_messages_conversation_id_idx ON ai_messages(conversation_id);

-- ============================================================================
-- STEP 8: CREATE SNIPPETS TABLE
-- ============================================================================

CREATE TABLE snippets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  html TEXT DEFAULT '',
  css TEXT DEFAULT '',
  javascript TEXT DEFAULT '',
  category TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  snippet_type TEXT DEFAULT 'full' CHECK (snippet_type IN ('full', 'html', 'css', 'javascript')),
  scope TEXT DEFAULT 'private' CHECK (scope IN ('private', 'public')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE snippets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view snippets" ON snippets FOR SELECT
  USING ((auth.uid() = user_id AND deleted_at IS NULL) OR (scope = 'public' AND deleted_at IS NULL));
CREATE POLICY "Users can create snippets" ON snippets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own snippets" ON snippets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own snippets" ON snippets FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX snippets_user_id_idx ON snippets(user_id);
CREATE INDEX snippets_tags_idx ON snippets USING GIN(tags);

CREATE TRIGGER update_snippets_updated_at BEFORE UPDATE ON snippets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 9: CREATE USER SETTINGS TABLE
-- ============================================================================

CREATE TABLE user_settings (
  user_id UUID REFERENCES auth.users PRIMARY KEY,
  editor_font_family TEXT DEFAULT 'JetBrains Mono',
  editor_font_size INTEGER DEFAULT 14 CHECK (editor_font_size >= 10 AND editor_font_size <= 30),
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'dark-blue', 'dark-purple', 'light')),
  auto_run_js BOOLEAN DEFAULT true,
  preview_delay INTEGER DEFAULT 300 CHECK (preview_delay >= 0 AND preview_delay <= 5000),
  ai_model TEXT DEFAULT 'gemini-2.0-flash-exp',
  ai_auto_suggest BOOLEAN DEFAULT true,
  custom_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION public.create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_user_settings();

-- ============================================================================
-- ✅ MIGRATION COMPLETE!
-- ============================================================================
