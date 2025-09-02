-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
-- ARCHITECT'S NOTE: Wrapped type creation in a DO block to make it idempotent.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'poll_status') THEN
        CREATE TYPE public.poll_status AS ENUM ('active', 'closed', 'draft');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vote_status') THEN
        CREATE TYPE public.vote_status AS ENUM ('active', 'deleted');
    END IF;
END$$;


-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Polls table
CREATE TABLE IF NOT EXISTS public.polls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status poll_status DEFAULT 'draft' NOT NULL,
    -- ARCHITECT'S NOTE: Changed the foreign key to reference auth.users(id) directly.
    -- This is the primary source of truth for user identity and solves the foreign key violation error.
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    allow_multiple_votes BOOLEAN DEFAULT FALSE NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE NOT NULL,
    total_votes INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poll options table
CREATE TABLE IF NOT EXISTS public.poll_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    vote_count INTEGER DEFAULT 0 NOT NULL,
    order_index SMALLINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
    option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Use SET NULL if user is deleted, keeping the vote record
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table (for future use)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poll category assignments (Junction Table)
CREATE TABLE IF NOT EXISTS public.poll_categories (
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (poll_id, category_id)
);

-- === INDEXES FOR PERFORMANCE ===
CREATE INDEX IF NOT EXISTS idx_polls_creator_id ON public.polls(creator_id);
CREATE INDEX IF NOT EXISTS idx_polls_status ON public.polls(status);

CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON public.poll_options(poll_id);

CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON public.votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes(user_id);

-- ARCHITECT'S NOTE: This partial unique index enforces one vote per user, but only for logged-in users.
DROP INDEX IF EXISTS idx_unique_vote_per_user_per_poll;
CREATE UNIQUE INDEX idx_unique_vote_per_user_per_poll ON public.votes(poll_id, user_id) WHERE user_id IS NOT NULL;


-- === ROW LEVEL SECURITY (RLS) POLICIES ===
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_categories ENABLE ROW LEVEL SECURITY;

-- ARCHITECT'S NOTE: Added DROP POLICY IF EXISTS before each policy creation to ensure the script is re-runnable.

-- Profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Polls policies
DROP POLICY IF EXISTS "Active polls are viewable by everyone." ON public.polls;
CREATE POLICY "Active polls are viewable by everyone." ON public.polls FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "Users can view their own polls." ON public.polls;
CREATE POLICY "Users can view their own polls." ON public.polls FOR SELECT USING (auth.uid() = creator_id);
DROP POLICY IF EXISTS "Users can create polls." ON public.polls;
CREATE POLICY "Users can create polls." ON public.polls FOR INSERT WITH CHECK (auth.uid() = creator_id);
DROP POLICY IF EXISTS "Users can update their own polls." ON public.polls;
CREATE POLICY "Users can update their own polls." ON public.polls FOR UPDATE USING (auth.uid() = creator_id);
DROP POLICY IF EXISTS "Users can delete their own polls." ON public.polls;
CREATE POLICY "Users can delete their own polls." ON public.polls FOR DELETE USING (auth.uid() = creator_id);

-- Poll options policies
DROP POLICY IF EXISTS "Poll options are viewable by everyone for visible polls." ON public.poll_options;
CREATE POLICY "Poll options are viewable by everyone for visible polls." ON public.poll_options
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.polls p
            WHERE p.id = poll_options.poll_id
        )
    );
DROP POLICY IF EXISTS "Users can add options to their own polls." ON public.poll_options;
CREATE POLICY "Users can add options to their own polls." ON public.poll_options
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.polls p
            WHERE p.id = poll_options.poll_id AND p.creator_id = auth.uid()
        )
    );
DROP POLICY IF EXISTS "Users can update options on their own polls." ON public.poll_options;
CREATE POLICY "Users can update options on their own polls." ON public.poll_options
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.polls p
            WHERE p.id = poll_options.poll_id AND p.creator_id = auth.uid()
        )
    );
DROP POLICY IF EXISTS "Users can delete options from their own polls." ON public.poll_options;
CREATE POLICY "Users can delete options from their own polls." ON public.poll_options
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.polls p
            WHERE p.id = poll_options.poll_id AND p.creator_id = auth.uid()
        )
    );

-- Votes policies
DROP POLICY IF EXISTS "Votes are publically viewable." ON public.votes;
CREATE POLICY "Votes are publically viewable." ON public.votes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can cast votes." ON public.votes;
CREATE POLICY "Users can cast votes." ON public.votes FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.polls p
        WHERE p.id = votes.poll_id
        AND p.status = 'active'
        AND (p.expires_at IS NULL OR p.expires_at > NOW())
    )
);
DROP POLICY IF EXISTS "Users can delete their own votes." ON public.votes;
CREATE POLICY "Users can delete their own votes." ON public.votes FOR DELETE USING (auth.uid() = user_id);

-- Categories policies
DROP POLICY IF EXISTS "Categories are viewable by everyone." ON public.categories;
CREATE POLICY "Categories are viewable by everyone." ON public.categories FOR SELECT USING (true);

-- Poll categories policies
DROP POLICY IF EXISTS "Poll categories are viewable by everyone." ON public.poll_categories;
CREATE POLICY "Poll categories are viewable by everyone." ON public.poll_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage categories for their own polls." ON public.poll_categories;
CREATE POLICY "Users can manage categories for their own polls." ON public.poll_categories
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.polls p WHERE p.id = poll_categories.poll_id AND p.creator_id = auth.uid())
    );
DROP POLICY IF EXISTS "Users can manage categories for their own polls." ON public.poll_categories;
CREATE POLICY "Users can manage categories for their own polls." ON public.poll_categories
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.polls p WHERE p.id = poll_categories.poll_id AND p.creator_id = auth.uid())
    );


-- === TRIGGERS & FUNCTIONS ===

-- Function to maintain created_by on profiles from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING; -- ARCHITECT'S NOTE: Added ON CONFLICT to prevent errors on re-runs.
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create a profile when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Generic function to update the 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attaching the updated_at trigger to tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_polls_updated_at ON public.polls;
CREATE TRIGGER update_polls_updated_at BEFORE UPDATE ON public.polls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_poll_options_updated_at ON public.poll_options;
CREATE TRIGGER update_poll_options_updated_at BEFORE UPDATE ON public.poll_options FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- Function for denormalized vote counts
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Increment counts
        UPDATE public.poll_options SET vote_count = vote_count + 1 WHERE id = NEW.option_id;
        UPDATE public.polls SET total_votes = total_votes + 1 WHERE id = NEW.poll_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        -- Decrement counts
        UPDATE public.poll_options SET vote_count = vote_count - 1 WHERE id = OLD.option_id;
        UPDATE public.polls SET total_votes = total_votes - 1 WHERE id = OLD.poll_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for vote counts
DROP TRIGGER IF EXISTS on_vote_change ON public.votes;
CREATE TRIGGER on_vote_change
    AFTER INSERT OR DELETE ON public.votes
    FOR EACH ROW EXECUTE FUNCTION update_vote_counts();


-- Function to close expired polls (for pg_cron)
CREATE OR REPLACE FUNCTION close_expired_polls()
RETURNS void AS $$
BEGIN
    UPDATE public.polls
    SET status = 'closed'
    WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at <= NOW();
END;
$$ LANGUAGE plpgsql;

/*
-- ARCHITECT'S NOTE: To schedule the above function to run every hour, execute this once in the Supabase SQL editor:
-- Make sure to enable the pg_cron extension in your Supabase dashboard first.
SELECT cron.schedule('close-expired-polls-hourly', '0 * * * *', 'SELECT close_expired_polls()');
*/

-- Function to create a poll and its options transactionally
CREATE OR REPLACE FUNCTION create_poll_with_options(
    p_title TEXT,
    p_description TEXT DEFAULT NULL,
    p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_allow_multiple_votes BOOLEAN DEFAULT FALSE,
    p_is_anonymous BOOLEAN DEFAULT FALSE,
    p_options TEXT[] DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    new_poll_id UUID;
    option_text TEXT;
    option_index SMALLINT := 0;
BEGIN
    INSERT INTO public.polls (
        title,
        description,
        expires_at,
        allow_multiple_votes,
        is_anonymous,
        creator_id
    ) VALUES (
        p_title,
        p_description,
        p_expires_at,
        p_allow_multiple_votes,
        p_is_anonymous,
        auth.uid()
    ) RETURNING id INTO new_poll_id;

    FOREACH option_text IN ARRAY p_options
    LOOP
        INSERT INTO public.poll_options (poll_id, text, order_index)
        VALUES (new_poll_id, option_text, option_index);
        option_index := option_index + 1;
    END LOOP;

    RETURN new_poll_id;
END;
$$ LANGUAGE plpgsql;

-- === PERMISSIONS ===
-- ARCHITECT'S NOTE: These permissions are generally safe to re-run.

-- 1. Reset default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM public, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM public, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM public, anon, authenticated;

-- 2. Grant basic USAGE on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 3. Grant minimal table permissions
-- anon role (unauthenticated users) can only read data
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- authenticated role can read all data and insert into specific tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT ON public.polls, public.poll_options, public.votes, public.categories, public.poll_categories TO authenticated;
-- The ability to UPDATE and DELETE is now controlled *only* by RLS policies.

