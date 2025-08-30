import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import MainLayout from "@/components/layout/main-layout"
import Link from "next/link"

interface PollPageProps {
  params: {
    id: string
  }
}

export default function PollPage({ params }: PollPageProps) {
  // Placeholder data - replace with actual data fetching based on params.id
  const poll = {
    id: params.id,
    title: "What's your favorite programming language?",
    description: "Vote for your preferred programming language for web development",
    options: [
      { id: "1", text: "JavaScript", votes: 45, percentage: 45 },
      { id: "2", text: "Python", votes: 30, percentage: 30 },
      { id: "3", text: "TypeScript", votes: 15, percentage: 15 },
      { id: "4", text: "Rust", votes: 10, percentage: 10 }
    ],
    totalVotes: 100,
    createdAt: "2024-01-15",
    isActive: true
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link href="/polls">
              <Button variant="outline" size="sm">
                ← Back to Polls
              </Button>
            </Link>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">{poll.title}</CardTitle>
              <CardDescription>{poll.description}</CardDescription>
              <div className="text-sm text-gray-600">
                Created on {poll.createdAt} • {poll.totalVotes} total votes
              </div>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            {poll.options.map((option) => (
              <Card key={option.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{option.text}</span>
                    <span className="text-sm text-gray-600">
                      {option.votes} votes ({option.percentage}%)
                    </span>
                  </div>
                  <Progress value={option.percentage} className="h-2" />
                  {poll.isActive && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => console.log(`Voted for ${option.text}`)}
                    >
                      Vote
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {!poll.isActive && (
            <Card className="mt-8">
              <CardContent className="p-6">
                <p className="text-center text-gray-600">
                  This poll is no longer active
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
