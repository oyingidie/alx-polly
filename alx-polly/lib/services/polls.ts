import { supabase } from '@/lib/supabase'
import { Poll, PollInsert, PollWithDetails, PollWithOptions, PollOptionInsert } from '@/types/database'

// Get all active polls with options
export const getPolls = async (limit = 20, offset = 0): Promise<PollWithOptions[]> => {
  const { data, error } = await supabase
    .from('polls')
    .select(`
      *,
      options:poll_options(*),
      user:users(*)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data || []
}

// Get a single poll by ID with all details
export const getPollById = async (id: string): Promise<PollWithDetails | null> => {
  const { data, error } = await supabase
    .from('polls')
    .select(`
      *,
      options:poll_options(*),
      user:users(*),
      categories:categories(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // No rows returned
    throw error
  }

  // Get user's vote if authenticated
  const { data: { user } } = await supabase.auth.getUser()
  let userVote = null
  
  if (user) {
    const { data: vote } = await supabase
      .from('votes')
      .select('*')
      .eq('poll_id', id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()
    
    userVote = vote
  }

  return {
    ...data,
    user_vote: userVote,
    total_votes: data.total_votes
  }
}

// Create a new poll with options
export const createPoll = async (pollData: {
  title: string
  description?: string
  expires_at?: string
  allow_multiple_votes?: boolean
  is_anonymous?: boolean
  options: string[]
  categories?: string[]
}): Promise<Poll> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be authenticated')

  // Use the database function to create poll with options
  const { data, error } = await supabase.rpc('create_poll_with_options', {
    p_title: pollData.title,
    p_description: pollData.description || null,
    p_expires_at: pollData.expires_at || null,
    p_allow_multiple_votes: pollData.allow_multiple_votes || false,
    p_is_anonymous: pollData.is_anonymous || false,
    p_options: pollData.options
  })

  if (error) throw error

  // Add categories if provided
  if (pollData.categories && pollData.categories.length > 0) {
    const categoryInserts = pollData.categories.map(categoryId => ({
      poll_id: data,
      category_id: categoryId
    }))

    const { error: categoryError } = await supabase
      .from('poll_categories')
      .insert(categoryInserts)

    if (categoryError) throw categoryError
  }

  // Fetch and return the created poll
  const { data: createdPoll, error: fetchError } = await supabase
    .from('polls')
    .select('*')
    .eq('id', data)
    .single()

  if (fetchError) throw fetchError
  return createdPoll
}

// Update a poll
export const updatePoll = async (id: string, updates: Partial<PollInsert>): Promise<Poll> => {
  const { data, error } = await supabase
    .from('polls')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete a poll
export const deletePoll = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('polls')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Get polls created by a specific user
export const getUserPolls = async (userId: string, limit = 20, offset = 0): Promise<PollWithOptions[]> => {
  const { data, error } = await supabase
    .from('polls')
    .select(`
      *,
      options:poll_options(*),
      user:users(*)
    `)
    .eq('created_by', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data || []
}

// Get polls by category
export const getPollsByCategory = async (categoryId: string, limit = 20, offset = 0): Promise<PollWithOptions[]> => {
  const { data, error } = await supabase
    .from('polls')
    .select(`
      *,
      options:poll_options(*),
      user:users(*)
    `)
    .eq('status', 'active')
    .eq('poll_categories.category_id', categoryId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data || []
}

// Search polls by title or description
export const searchPolls = async (query: string, limit = 20, offset = 0): Promise<PollWithOptions[]> => {
  const { data, error } = await supabase
    .from('polls')
    .select(`
      *,
      options:poll_options(*),
      user:users(*)
    `)
    .eq('status', 'active')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data || []
}

// Close expired polls (admin function)
export const closeExpiredPolls = async (): Promise<void> => {
  const { error } = await supabase.rpc('close_expired_polls')
  if (error) throw error
}
