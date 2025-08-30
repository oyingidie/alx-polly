'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MainLayout from "@/components/layout/main-layout";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/lib/auth/auth-context";

export default function DashboardPage() {
  const auth = useAuth();
  const user = auth?.user;
  const signOut = auth?.signOut;

  // Placeholder data - replace with actual data fetching
  const userStats = {
    totalPolls: 12,
    totalVotes: 156,
    activePolls: 3
  };

  const recentPolls = [
    {
      id: "1",
      title: "What's your favorite programming language?",
      votes: 45,
      status: "Active"
    },
    {
      id: "2",
      title: "Best framework for web development?",
      votes: 89,
      status: "Active"
    },
    {
      id: "3",
      title: "Preferred database system?",
      votes: 67,
      status: "Closed"
    }
  ];

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {user?.email}! Here's an overview of your polling activity.
              </p>
            </div>
            <Button onClick={signOut} variant="outline">Sign Out</Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Polls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.totalPolls}</div>
                <p className="text-xs text-muted-foreground">
                  Polls you've created
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.totalVotes}</div>
                <p className="text-xs text-muted-foreground">
                  Across all your polls
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.activePolls}</div>
                <p className="text-xs text-muted-foreground">
                  Currently accepting votes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Create a new poll or view your existing ones
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Link href="/polls/create">
                <Button>Create New Poll</Button>
              </Link>
              <Link href="/polls">
                <Button variant="outline">View All Polls</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Polls */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Polls</CardTitle>
              <CardDescription>
                Your most recent polling activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPolls.map((poll) => (
                  <div key={poll.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{poll.title}</h3>
                      <p className="text-sm text-gray-600">{poll.votes} votes</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        poll.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {poll.status}
                      </span>
                      <Link href={`/polls/${poll.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
