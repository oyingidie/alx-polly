import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import MainLayout from "@/components/layout/main-layout"
import Link from "next/link"

export default function PollsPage() {
  // Placeholder data - replace with actual data fetching
  const polls = [
    {
      id: "1",
      title: "What's your favorite programming language?",
      description: "Vote for your preferred programming language",
      totalVotes: 156,
      createdAt: "2024-01-15"
    },
    {
      id: "2",
      title: "Best framework for web development?",
      description: "Choose your favorite web framework",
      totalVotes: 89,
      createdAt: "2024-01-14"
    }
  ]

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">All Polls</h1>
          <Link href="/polls/create">
            <Button>Create New Poll</Button>
          </Link>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {polls.map((poll) => (
            <Card key={poll.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{poll.title}</CardTitle>
                <CardDescription>{poll.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>{poll.totalVotes} votes</span>
                  <span>{poll.createdAt}</span>
                </div>
                <Link href={`/polls/${poll.id}`}>
                  <Button variant="outline" className="w-full mt-4">
                    View Poll
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}
