# Supabase Database Setup Guide

This guide will help you set up the Supabase database for your polling application.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization and enter project details:
   - **Name**: `alx-polly` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to your users
4. Click "Create new project"

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

## 3. Set Up Environment Variables

Create a `.env.local` file in your project root with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Supabase Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 4. Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase/schema.sql`
3. Paste it into the SQL editor
4. Click **Run** to execute the schema

This will create:
- All necessary tables (users, polls, poll_options, votes, categories)
- Row Level Security (RLS) policies
- Database functions and triggers
- Default categories

## 5. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

## 6. Configure Authentication (Optional)

If you want to use Supabase Auth:

1. Go to **Authentication** → **Settings**
2. Configure your site URL: `http://localhost:3000` (for development)
3. Add any additional providers you want (Google, GitHub, etc.)

## 7. Test the Setup

1. Start your development server: `npm run dev`
2. Visit `http://localhost:3000`
3. Try creating a poll or voting (you may need to implement the UI first)

## Database Schema Overview

### Tables Created:

- **`users`** - User profiles (extends Supabase auth.users)
- **`polls`** - Poll information and metadata
- **`poll_options`** - Individual poll options
- **`votes`** - User votes on poll options
- **`categories`** - Poll categories for organization
- **`poll_categories`** - Many-to-many relationship between polls and categories

### Key Features:

- **Row Level Security (RLS)** - Ensures users can only access appropriate data
- **Automatic vote counting** - Triggers update vote counts when votes are added/removed
- **Poll expiration** - Automatic closing of expired polls
- **Anonymous voting** - Support for both authenticated and anonymous votes
- **Categories** - Organize polls by topic

### Security Policies:

- Users can view all active polls
- Users can only edit/delete their own polls
- Users can vote on active polls (one vote per poll unless multiple votes allowed)
- Anonymous users can vote (tracked by IP address)

## Troubleshooting

### Common Issues:

1. **"Invalid API key"** - Check your environment variables are correct
2. **"Row Level Security" errors** - Make sure RLS policies are properly set up
3. **"Function not found"** - Ensure you ran the complete schema.sql file

### Useful Queries:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- View all polls
SELECT * FROM polls ORDER BY created_at DESC;

-- Check vote counts
SELECT p.title, po.text, po.vote_count 
FROM polls p 
JOIN poll_options po ON p.id = po.poll_id 
ORDER BY p.created_at DESC;
```

## Next Steps

1. Implement the authentication flow in your app
2. Connect your forms to the database services
3. Add real-time subscriptions for live vote updates
4. Implement poll management features
5. Add analytics and reporting features

For more information, check the [Supabase Documentation](https://supabase.com/docs).
