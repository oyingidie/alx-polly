import { supabase } from '@/lib/supabase'
import { Category, CategoryInsert } from '@/types/database'

// Get all categories
export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data || []
}

// Get a category by ID
export const getCategoryById = async (id: string): Promise<Category | null> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // No rows returned
    throw error
  }

  return data
}

// Create a new category
export const createCategory = async (categoryData: Omit<CategoryInsert, 'id'>): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .insert(categoryData)
    .select()
    .single()

  if (error) throw error
  return data
}

// Update a category
export const updateCategory = async (id: string, updates: Partial<CategoryInsert>): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete a category
export const deleteCategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Get categories with poll counts
export const getCategoriesWithCounts = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select(`
      *,
      poll_categories(count)
    `)
    .order('name', { ascending: true })

  if (error) throw error

  return data?.map(category => ({
    ...category,
    poll_count: category.poll_categories?.[0]?.count || 0
  })) || []
}

// Add category to poll
export const addCategoryToPoll = async (pollId: string, categoryId: string): Promise<void> => {
  const { error } = await supabase
    .from('poll_categories')
    .insert({
      poll_id: pollId,
      category_id: categoryId
    })

  if (error) throw error
}

// Remove category from poll
export const removeCategoryFromPoll = async (pollId: string, categoryId: string): Promise<void> => {
  const { error } = await supabase
    .from('poll_categories')
    .delete()
    .eq('poll_id', pollId)
    .eq('category_id', categoryId)

  if (error) throw error
}

// Get poll categories
export const getPollCategories = async (pollId: string): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('poll_categories')
    .select(`
      categories(*)
    `)
    .eq('poll_id', pollId)

  if (error) throw error

  return data?.map(item => item.categories).filter(Boolean) || []
}
