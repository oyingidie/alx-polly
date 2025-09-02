"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createPoll } from "@/lib/services/polls"
import { getCategories } from "@/lib/services/categories"
import { Category } from "@/types/database"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface CreatePollFormProps {
  onSuccess?: (pollId: string) => void
}

export function CreatePollForm({ onSuccess }: CreatePollFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [options, setOptions] = useState(["", ""])
  const [expiresAt, setExpiresAt] = useState("")
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  // Check authentication and load categories
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (!user) {
        router.push('/login')
        return
      }

      // Load categories
      try {
        const categoriesData = await getCategories()
        setCategories(categoriesData)
      } catch (err) {
        console.error('Failed to load categories:', err)
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!user) {
      setError("You must be logged in to create a poll")
      return
    }

    const filteredOptions = options.filter(option => option.trim() !== "")
    
    if (title.trim() === "" || filteredOptions.length < 2) {
      setError("Please provide a title and at least 2 options")
      return
    }

    setIsLoading(true)

    try {
      const pollData = {
        title: title.trim(),
        description: description.trim() || undefined,
        options: filteredOptions,
        expires_at: expiresAt || undefined,
        allow_multiple_votes: allowMultipleVotes,
        is_anonymous: isAnonymous,
        categories: selectedCategories
      }

      const pollId = await createPoll(pollData)
      
      if (onSuccess) {
        onSuccess(pollId)
      } else {
        router.push(`/polls/${pollId}`)
      }
    } catch (err: any) {
      setError(err.message || "Failed to create poll")
    } finally {
      setIsLoading(false)
    }
  }

  const addOption = () => {
    setOptions([...options, ""])
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  if (!user) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create New Poll</CardTitle>
        <CardDescription>
          Create a new poll for others to vote on
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Poll Title *
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What would you like to ask?"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description (optional)
            </label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more context to your poll..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Poll Options *
            </label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    required
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addOption}
              className="mt-2"
            >
              Add Option
            </Button>
          </div>

          <div className="space-y-2">
            <label htmlFor="expires_at" className="text-sm font-medium">
              Expiration Date (optional)
            </label>
            <Input
              id="expires_at"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allow_multiple_votes"
                checked={allowMultipleVotes}
                onChange={(e) => setAllowMultipleVotes(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="allow_multiple_votes" className="text-sm font-medium">
                Allow multiple votes per user
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="is_anonymous" className="text-sm font-medium">
                Allow anonymous voting
              </label>
            </div>
          </div>

          {categories.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Categories (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      selectedCategories.includes(category.id)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:bg-muted'
                    }`}
                    style={{
                      borderColor: selectedCategories.includes(category.id) ? category.color : undefined
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating..." : "Create Poll"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
