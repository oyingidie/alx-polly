import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getPolls } from "@/lib/services/polls"
import { PollWithOptions } from "@/types/database"
import Link from "next/link"

export default async function PollsPage() {
  let polls: PollWithOptions[] = []
  let error: string | null = null

  try {
    polls = await getPolls(20, 0)
  } catch (err: any) {
    error = err.message || "Failed to load polls"
    console.error("Error loading polls:", err)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">All Polls</h1>
          <p className="text-muted-foreground mt-2">
            Discover and vote on polls created by the community
          </p>
        </div>
        <Link href="/polls/create">
          <Button>Create New Poll</Button>
        </Link>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {polls.length === 0 && !error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No polls found.</p>
              <Link href="/polls/create">
                <Button>Create the first poll</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {polls.map((poll) => (
            <Card key={poll.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">{poll.title}</CardTitle>
                {poll.description && (
                  <CardDescription className="line-clamp-2">
                    {poll.description}
                  </CardDescription>
                )}
                <div className="text-xs text-muted-foreground">
                  Created by {poll.user?.name || 'Anonymous'}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="text-sm text-muted-foreground">
                    {poll.options.length} options
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {poll.total_votes} total votes
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(poll.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link href={`/polls/${poll.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Poll
                    </Button>
                  </Link>
                  <Link href={`/polls/${poll.id}`} className="flex-1">
                    <Button className="w-full">
                      Vote Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}