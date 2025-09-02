-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE poll_status AS ENUM ('active', 'closed', 'draft');
CREATE TYPE vote_status AS ENUM ('active', 'deleted');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Polls table
CREATE TABLE public.polls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status poll_status DEFAULT 'active',
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    allow_multiple_votes BOOLEAN DEFAULT FALSE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    total_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poll options table
CREATE TABLE public.poll_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    vote_count INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table
CREATE TABLE public.votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
    option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    status vote_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one vote per user per poll (if not anonymous)
    UNIQUE(poll_id, user_id) DEFERRABLE INITIALLY DEFERRED
);

-- Poll categories table (for future use)
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poll category assignments
CREATE TABLE public.poll_categories (
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (poll_id, category_id)
);

-- Indexes for better performance
CREATE INDEX idx_polls_created_by ON public.polls(created_by);
CREATE INDEX idx_polls_status ON public.polls(status);
CREATE INDEX idx_polls_created_at ON public.polls(created_at DESC);
CREATE INDEX idx_polls_expires_at ON public.polls(expires_at);

CREATE INDEX idx_poll_options_poll_id ON public.poll_options(poll_id);
CREATE INDEX idx_poll_options_order ON public.poll_options(poll_id, order_index);

CREATE INDEX idx_votes_poll_id ON public.votes(poll_id);
CREATE INDEX idx_votes_option_id ON public.votes(option_id);
CREATE INDEX idx_votes_user_id ON public.votes(user_id);
CREATE INDEX idx_votes_created_at ON public.votes(created_at DESC);

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_categories ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Polls policies
CREATE POLICY "Anyone can view active polls" ON public.polls
    FOR SELECT USING (status = 'active');

CREATE POLICY "Users can view their own polls" ON public.polls
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can create polls" ON public.polls
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own polls" ON public.polls
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own polls" ON public.polls
    FOR DELETE USING (auth.uid() = created_by);

-- Poll options policies
CREATE POLICY "Anyone can view poll options for active polls" ON public.poll_options
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.polls 
            WHERE polls.id = poll_options.poll_id 
            AND polls.status = 'active'
        )
    );

CREATE POLICY "Users can view options for their own polls" ON public.poll_options
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.polls 
            WHERE polls.id = poll_options.poll_id 
            AND polls.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can manage options for their own polls" ON public.poll_options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.polls 
            WHERE polls.id = poll_options.poll_id 
            AND polls.created_by = auth.uid()
        )
    );

-- Votes policies
CREATE POLICY "Users can view votes for active polls" ON public.votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.polls 
            WHERE polls.id = votes.poll_id 
            AND polls.status = 'active'
        )
    );

CREATE POLICY "Users can view their own votes" ON public.votes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can vote on active polls" ON public.votes
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.polls 
            WHERE polls.id = votes.poll_id 
            AND polls.status = 'active'
            AND (polls.expires_at IS NULL OR polls.expires_at > NOW())
        )
    );

CREATE POLICY "Users can delete their own votes" ON public.votes
    FOR DELETE USING (auth.uid() = user_id);

-- Categories policies
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create categories" ON public.categories
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Poll categories policies
CREATE POLICY "Anyone can view poll categories" ON public.poll_categories
    FOR SELECT USING (true);

CREATE POLICY "Users can manage categories for their own polls" ON public.poll_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.polls 
            WHERE polls.id = poll_categories.poll_id 
            AND polls.created_by = auth.uid()
        )
    );

-- Functions for updating vote counts
CREATE OR REPLACE FUNCTION update_poll_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update option vote count
    IF TG_OP = 'INSERT' THEN
        UPDATE public.poll_options 
        SET vote_count = vote_count + 1 
        WHERE id = NEW.option_id;
        
        UPDATE public.polls 
        SET total_votes = total_votes + 1 
        WHERE id = NEW.poll_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.poll_options 
        SET vote_count = vote_count - 1 
        WHERE id = OLD.option_id;
        
        UPDATE public.polls 
        SET total_votes = total_votes - 1 
        WHERE id = OLD.poll_id;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for vote count updates
CREATE TRIGGER trigger_update_vote_count
    AFTER INSERT OR DELETE ON public.votes
    FOR EACH ROW EXECUTE FUNCTION update_poll_vote_count();

-- Function to automatically close expired polls
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

-- Function to create a new poll with options
CREATE OR REPLACE FUNCTION create_poll_with_options(
    p_title TEXT,
    p_description TEXT DEFAULT NULL,
    p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_allow_multiple_votes BOOLEAN DEFAULT FALSE,
    p_is_anonymous BOOLEAN DEFAULT FALSE,
    p_options TEXT[] DEFAULT '{}'
)
RETURNS UUID AS $
DECLARE
    poll_id UUID;
    option_text TEXT;
    option_index INTEGER := 0;
BEGIN
    -- Create the poll
    INSERT INTO public.polls (
        title, 
        description, 
        expires_at, 
        allow_multiple_votes, 
        is_anonymous, 
        created_by
    ) VALUES (
        p_title, 
        p_description, 
        p_expires_at, 
        p_allow_multiple_votes, 
        p_is_anonymous, 
        auth.uid()
    ) RETURNING id INTO poll_id;
    
    -- Add poll options
    FOREACH option_text IN ARRAY p_options
    LOOP
        INSERT INTO public.poll_options (poll_id, text, order_index)
        VALUES (poll_id, option_text, option_index);
        option_index := option_index + 1;
    END LOOP;
    
    RETURN poll_id;
END;
$ LANGUAGE plpgsql SECURITY INVOKER;

-- Insert some default categories
INSERT INTO public.categories (name, description, color) VALUES
('Technology', 'Polls about technology, programming, and software', '#3B82F6'),
('General', 'General interest polls and discussions', '#10B981'),
('Entertainment', 'Movies, music, games, and entertainment', '#F59E0B'),
('Sports', 'Sports-related polls and discussions', '#EF4444'),
('Politics', 'Political discussions and opinions', '#8B5CF6'),
('Science', 'Scientific topics and discoveries', '#06B6D4');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_polls_updated_at BEFORE UPDATE ON public.polls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_poll_options_updated_at BEFORE UPDATE ON public.poll_options
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_votes_updated_at BEFORE UPDATE ON public.votes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- Grant usage on schema to Supabase roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant permissions to tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

GRANT SELECT ON public.users TO anon, authenticated;
GRANT SELECT ON public.polls TO anon, authenticated;
GRANT SELECT ON public.poll_options TO anon, authenticated;
GRANT SELECT ON public.votes TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.poll_categories TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.polls TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.poll_options TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.votes TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.poll_categories TO authenticated;