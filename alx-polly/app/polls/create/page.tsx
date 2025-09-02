"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CreatePollForm } from "@/components/forms/create-poll-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"

export default function CreatePollPage() {
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()

  const handleSuccess = (pollId: string) => {
    console.log("Poll created successfully:", pollId)
    setShowSuccess(true)
    setTimeout(() => {
      router.push("/polls")
    }, 2000) // Wait 2 seconds before redirecting
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

        {showSuccess ? (
          <Alert variant="default" className="mb-4 bg-green-100 border-green-400 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Your poll has been created. Redirecting you to the polls page...
            </AlertDescription>
          </Alert>
        ) : (
          <CreatePollForm onSuccess={handleSuccess} />
        )}
      </div>
    </div>
  )
}