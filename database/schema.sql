-- ==========================================
-- PantryPal Pro — Database Schema
-- /database/schema.sql
-- ==========================================

-- 1. Recipes Table
-- Stores the established recipe catalog
CREATE TABLE IF NOT EXISTS public.recipes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    ingredients JSONB NOT NULL, -- Array of strings
    steps JSONB NOT NULL,       -- Array of strings
    tags JSONB,                 -- ['veg', 'vegan', 'keto', etc]
    tier TEXT DEFAULT 'free',   -- 'free', 'plus', 'pro'
    meal TEXT,                  -- 'breakfast', 'lunch', etc
    cuisine TEXT,               -- 'indian', 'chinese', etc
    difficulty TEXT,            -- 'beginner', 'intermediate', etc
    image TEXT,                 -- URL or path
    calories INTEGER,
    time TEXT,                  -- e.g. '30 min'
    rating DECIMAL DEFAULT 4.5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. User Profiles
-- Extends Supabase Auth with custom fields
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    plan TEXT DEFAULT 'free',
    phone TEXT,
    country TEXT DEFAULT 'India',
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Row Level Security (RLS)
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read recipes
CREATE POLICY "Public recipes are viewable by everyone" ON public.recipes
    FOR SELECT USING (true);

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 4. Triggers for Profile Creation
-- Automatically creates a profile entry when a user signs up via Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
