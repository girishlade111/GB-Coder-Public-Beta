-- ============================================================================
-- GB CODER - MIGRATION SCRIPT FOR SUPABASE DATA SYNC
-- ============================================================================
-- Run this in Supabase SQL Editor to ensure all tables exist
-- This is safe to run multiple times (uses IF NOT EXISTS)
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. Ensure projects table exists with all columns
-- ============================================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  html TEXT DEFAULT '',
  css TEXT DEFAULT '',
  javascript TEXT DEFAULT '',
  external_libraries JSONB DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Add missing columns if they don't exist
DO $$ BEGIN
  ALTER TABLE projects ADD COLUMN IF NOT EXISTS external_libraries JSONB DEFAULT '[]'::jsonb;
  ALTER TABLE projects ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;
  ALTER TABLE projects ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ============================================================================
-- 2. Ensure snippets table exists
-- ============================================================================
CREATE TABLE IF NOT EXISTS snippets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  html TEXT DEFAULT '',
  css TEXT DEFAULT '',
  javascript TEXT DEFAULT '',
  category TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  snippet_type TEXT DEFAULT 'full',
  scope TEXT DEFAULT 'private',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- 3. Ensure user_settings table exists
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID REFERENCES auth.users PRIMARY KEY,
  editor_font_family TEXT DEFAULT 'JetBrains Mono',
  editor_font_size INTEGER DEFAULT 14,
  theme TEXT DEFAULT 'dark',
  auto_run_js BOOLEAN DEFAULT true,
  preview_delay INTEGER DEFAULT 300,
  ai_model TEXT DEFAULT 'gemini-2.0-flash-exp',
  ai_auto_suggest BOOLEAN DEFAULT true,
  custom_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 4. Ensure ai_conversations table exists
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT DEFAULT 'New Chat',
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- 5. Ensure ai_messages table exists
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  code_blocks JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  model TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 6. Ensure project_snapshots table exists
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_snapshots (
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

-- ============================================================================
-- 7. Ensure profiles table exists
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 8. Enable Row Level Security on all tables
-- ============================================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 9. Create RLS Policies (DROP existing first to avoid conflicts)
-- ============================================================================

-- Projects policies
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

CREATE POLICY "Users can view their own projects" ON projects FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create projects" ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON projects FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Snippets policies
DROP POLICY IF EXISTS "Users can view their own snippets" ON snippets;
DROP POLICY IF EXISTS "Users can create snippets" ON snippets;
DROP POLICY IF EXISTS "Users can update their own snippets" ON snippets;
DROP POLICY IF EXISTS "Users can delete their own snippets" ON snippets;

CREATE POLICY "Users can view their own snippets" ON snippets FOR SELECT
  USING ((auth.uid() = user_id OR scope = 'public') AND deleted_at IS NULL);
CREATE POLICY "Users can create snippets" ON snippets FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own snippets" ON snippets FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own snippets" ON snippets FOR DELETE
  USING (auth.uid() = user_id);

-- User settings policies
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;

CREATE POLICY "Users can view their own settings" ON user_settings FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- AI conversations policies
DROP POLICY IF EXISTS "Users can view their own conversations" ON ai_conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON ai_conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON ai_conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON ai_conversations;

CREATE POLICY "Users can view their own conversations" ON ai_conversations FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create conversations" ON ai_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own conversations" ON ai_conversations FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own conversations" ON ai_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- AI messages policies
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON ai_messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON ai_messages;

CREATE POLICY "Users can view messages from their conversations" ON ai_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM ai_conversations WHERE ai_conversations.id = ai_messages.conversation_id AND ai_conversations.user_id = auth.uid()));
CREATE POLICY "Users can create messages in their conversations" ON ai_messages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM ai_conversations WHERE ai_conversations.id = ai_messages.conversation_id AND ai_conversations.user_id = auth.uid()));

-- Project snapshots policies
DROP POLICY IF EXISTS "Users can view snapshots of their projects" ON project_snapshots;
DROP POLICY IF EXISTS "Users can create snapshots for their projects" ON project_snapshots;

CREATE POLICY "Users can view snapshots of their projects" ON project_snapshots FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_snapshots.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can create snapshots for their projects" ON project_snapshots FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_snapshots.project_id AND projects.user_id = auth.uid()));

-- Profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT
  USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================================
-- 10. Create indexes for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
CREATE INDEX IF NOT EXISTS projects_updated_at_idx ON projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS snippets_user_id_idx ON snippets(user_id);
CREATE INDEX IF NOT EXISTS snippets_updated_at_idx ON snippets(updated_at DESC);
CREATE INDEX IF NOT EXISTS ai_conversations_user_id_idx ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS ai_messages_conversation_id_idx ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS project_snapshots_project_id_idx ON project_snapshots(project_id);

-- ============================================================================
-- 11. Create trigger function for updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_snippets_updated_at ON snippets;
CREATE TRIGGER update_snippets_updated_at BEFORE UPDATE ON snippets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_conversations_updated_at ON ai_conversations;
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 12. Create trigger to auto-create profile and settings for new users
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  ) ON CONFLICT (id) DO NOTHING;
  
  -- Create default settings
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================
-- All tables, policies, indexes, and triggers have been created/updated.
-- Run this script in Supabase SQL Editor to ensure your database is ready.
-- ============================================================================
