import { supabase } from '@/lib/supabase'
import { Vote, VoteInsert } from '@/types/database'

// Cast a vote on a poll
export const castVote = async (pollId: string, optionId: string): Promise<Vote> => {
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get user's IP and user agent for anonymous voting
  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : null
  
  const voteData: VoteInsert = {
    poll_id: pollId,
    option_id: optionId,
    user_id: user?.id || null,
    user_agent: userAgent,
    status: 'active'
  }

  // Check if user has already voted on this poll (if not anonymous)
  if (user) {
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (existingVote) {
      throw new Error('You have already voted on this poll')
    }
  }

  // Check if poll is still active and not expired
  const { data: poll } = await supabase
    .from('polls')
    .select('status, expires_at, allow_multiple_votes')
    .eq('id', pollId)
    .single()

  if (!poll) {
    throw new Error('Poll not found')
  }

  if (poll.status !== 'active') {
    throw new Error('This poll is no longer active')
  }

  if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
    throw new Error('This poll has expired')
  }

  // Insert the vote
  const { data, error } = await supabase
    .from('votes')
    .insert(voteData)
    .select()
    .single()

  if (error) throw error
  return data
}

// Get votes for a specific poll
export const getPollVotes = async (pollId: string): Promise<Vote[]> => {
  const { data, error } = await supabase
    .from('votes')
    .select(`
      *,
      option:poll_options(*),
      user:users(*)
    `)
    .eq('poll_id', pollId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Get user's votes
export const getUserVotes = async (userId: string): Promise<Vote[]> => {
  const { data, error } = await supabase
    .from('votes')
    .select(`
      *,
      option:poll_options(*),
      poll:polls(*)
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Get user's vote for a specific poll
export const getUserVoteForPoll = async (pollId: string, userId?: string): Promise<Vote | null> => {
  if (!userId) return null

  const { data, error } = await supabase
    .from('votes')
    .select(`
      *,
      option:poll_options(*)
    `)
    .eq('poll_id', pollId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // No rows returned
    throw error
  }

  return data
}

// Delete/retract a vote
export const deleteVote = async (voteId: string): Promise<void> => {
  const { error } = await supabase
    .from('votes')
    .update({ status: 'deleted' })
    .eq('id', voteId)

  if (error) throw error
}

// Get vote statistics for a poll
export const getPollVoteStats = async (pollId: string) => {
  const { data, error } = await supabase
    .from('votes')
    .select(`
      option_id,
      poll_options!inner(text, vote_count)
    `)
    .eq('poll_id', pollId)
    .eq('status', 'active')

  if (error) throw error

  // Group votes by option
  const stats = data?.reduce((acc, vote) => {
    const optionId = vote.option_id
    if (!acc[optionId]) {
      acc[optionId] = {
        option_id: optionId,
        text: vote.poll_options.text,
        vote_count: vote.poll_options.vote_count,
        percentage: 0
      }
    }
    return acc
  }, {} as Record<string, any>) || {}

  // Calculate percentages
  const totalVotes = Object.values(stats).reduce((sum: number, stat: any) => sum + stat.vote_count, 0)
  Object.values(stats).forEach((stat: any) => {
    stat.percentage = totalVotes > 0 ? Math.round((stat.vote_count / totalVotes) * 100) : 0
  })

  return {
    total_votes: totalVotes,
    options: Object.values(stats)
  }
}

// Check if user can vote on a poll
export const canUserVote = async (pollId: string, userId?: string): Promise<{
  canVote: boolean
  reason?: string
}> => {
  if (!userId) {
    return { canVote: true } // Anonymous voting allowed
  }

  // Check if user has already voted
  const { data: existingVote } = await supabase
    .from('votes')
    .select('id')
    .eq('poll_id', pollId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (existingVote) {
    return { canVote: false, reason: 'You have already voted on this poll' }
  }

  // Check poll status
  const { data: poll } = await supabase
    .from('polls')
    .select('status, expires_at, allow_multiple_votes')
    .eq('id', pollId)
    .single()

  if (!poll) {
    return { canVote: false, reason: 'Poll not found' }
  }

  if (poll.status !== 'active') {
    return { canVote: false, reason: 'This poll is no longer active' }
  }

  if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
    return { canVote: false, reason: 'This poll has expired' }
  }

  return { canVote: true }
}
