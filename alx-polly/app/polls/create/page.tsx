"use client"

import { CreatePollForm } from "@/components/forms/create-poll-form"

export default function CreatePollPage() {
  const handleSuccess = (pollId: string) => {
    // The form will handle navigation, but we can add additional logic here if needed
    console.log("Poll created successfully:", pollId)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Create a New Poll</h1>
          <p className="text-muted-foreground mt-2">
            Ask a question and let others vote on the options
          </p>
        </div>
        
        <CreatePollForm onSuccess={handleSuccess} />
      </div>
    </div>
  )
}