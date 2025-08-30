import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Navigation() {
  // Placeholder authentication state - replace with actual auth logic
  const isAuthenticated = false

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              ALX-Polly
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/polls">
              <Button variant="ghost">Polls</Button>
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Link href="/polls/create">
                  <Button variant="ghost">Create Poll</Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <Button variant="outline">Logout</Button>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
