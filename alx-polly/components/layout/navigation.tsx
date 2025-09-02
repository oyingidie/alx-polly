'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from '@/components/auth/auth-provider'

export default function Navigation() {
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

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
            {user && (
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
            {user ? (
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
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
