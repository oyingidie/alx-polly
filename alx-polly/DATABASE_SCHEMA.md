# Database Schema Documentation

This document describes the complete database schema for the ALX Polling Application.

## Overview

The database is designed to support a full-featured polling application with user authentication, poll creation, voting, and categorization.

## Tables

### 1. Users Table
```sql
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Extends Supabase's built-in auth.users table with additional profile information.

**Key Features**:
- Links to Supabase authentication
- Stores user profile data
- Automatic timestamps

### 2. Polls Table
```sql
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
```

**Purpose**: Stores poll information and metadata.

**Key Features**:
- Support for poll expiration
- Anonymous voting capability
- Multiple vote options
- Automatic vote counting
- Status tracking (active, closed, draft)

### 3. Poll Options Table
```sql
CREATE TABLE public.poll_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    vote_count INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Stores individual options for each poll.

**Key Features**:
- Ordered options
- Vote count tracking
- Cascade deletion with polls

### 4. Votes Table
```sql
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
    
    UNIQUE(poll_id, user_id) DEFERRABLE INITIALLY DEFERRED
);
```

**Purpose**: Tracks individual votes on poll options.

**Key Features**:
- Support for both authenticated and anonymous voting
- IP address tracking for anonymous votes
- User agent tracking
- One vote per user per poll (unless multiple votes allowed)
- Soft deletion with status field

### 5. Categories Table
```sql
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Organizes polls by topic/category.

**Key Features**:
- Color coding for UI
- Unique category names
- Descriptive text

### 6. Poll Categories Table
```sql
CREATE TABLE public.poll_categories (
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (poll_id, category_id)
);
```

**Purpose**: Many-to-many relationship between polls and categories.

## Enums

### Poll Status
```sql
CREATE TYPE poll_status AS ENUM ('active', 'closed', 'draft');
```

### Vote Status
```sql
CREATE TYPE vote_status AS ENUM ('active', 'deleted');
```

## Functions

### 1. create_poll_with_options()
Creates a new poll with multiple options in a single transaction.

**Parameters**:
- `p_title`: Poll title
- `p_description`: Poll description (optional)
- `p_expires_at`: Expiration date (optional)
- `p_allow_multiple_votes`: Allow multiple votes (boolean)
- `p_is_anonymous`: Anonymous voting (boolean)
- `p_options`: Array of option texts

**Returns**: UUID of the created poll

### 2. close_expired_polls()
Automatically closes polls that have passed their expiration date.

### 3. update_poll_vote_count()
Trigger function that automatically updates vote counts when votes are added or removed.

## Triggers

### Vote Count Updates
Automatically updates vote counts in both `poll_options` and `polls` tables when votes are added or removed.

### Updated At Timestamps
Automatically updates the `updated_at` field when records are modified.

## Row Level Security (RLS)

### Users
- Anyone can view user profiles
- Users can only update their own profile
- Users can only insert their own profile

### Polls
- Anyone can view active polls
- Users can view their own polls (including drafts)
- Authenticated users can create polls
- Users can only update/delete their own polls

### Poll Options
- Anyone can view options for active polls
- Users can view options for their own polls
- Users can manage options for their own polls

### Votes
- Users can view votes for active polls
- Users can view their own votes
- Authenticated users can vote on active polls
- Users can delete their own votes

### Categories
- Anyone can view categories
- Authenticated users can create categories
- Users can manage categories for their own polls

## Indexes

The schema includes optimized indexes for:
- Poll lookups by creator
- Poll status filtering
- Date-based sorting
- Vote tracking
- Category relationships

## Default Data

The schema includes default categories:
- Technology
- General
- Entertainment
- Sports
- Politics
- Science

## Security Considerations

1. **Authentication**: All user data is tied to Supabase auth
2. **Authorization**: RLS policies ensure users can only access appropriate data
3. **Anonymous Voting**: IP addresses are tracked for anonymous votes
4. **Data Integrity**: Foreign key constraints and triggers maintain consistency
5. **Soft Deletion**: Votes use status fields instead of hard deletion

## Performance Optimizations

1. **Indexes**: Strategic indexes on frequently queried columns
2. **Triggers**: Automatic vote counting reduces need for complex queries
3. **Cascade Deletes**: Efficient cleanup when polls are deleted
4. **Deferred Constraints**: Allows for complex vote operations

## Usage Examples

### Creating a Poll
```sql
SELECT create_poll_with_options(
    'What is your favorite programming language?',
    'Choose the language you enjoy working with most',
    NULL, -- no expiration
    FALSE, -- single vote only
    FALSE, -- not anonymous
    ARRAY['JavaScript', 'Python', 'Java', 'C++']
);
```

### Getting Poll Results
```sql
SELECT 
    p.title,
    po.text as option_text,
    po.vote_count,
    ROUND((po.vote_count::float / p.total_votes * 100), 2) as percentage
FROM polls p
JOIN poll_options po ON p.id = po.poll_id
WHERE p.id = 'poll-uuid-here'
ORDER BY po.vote_count DESC;
```

This schema provides a solid foundation for a scalable, secure polling application with room for future enhancements.
