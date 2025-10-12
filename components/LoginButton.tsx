"use client"

import { signIn, signOut, useSession } from "next-auth/react"

interface ButtonProps {
  onClick?: () => void
  variant?: "default" | "outline"
  size?: "sm" | "md"
  disabled?: boolean
  children: React.ReactNode
  className?: string
}

function Button({ onClick = () => {}, variant = "default", size = "md", disabled = false, children, className = "" }: ButtonProps) {
  const baseClasses = "font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
  const variantClasses = {
    default: "bg-brand-DEFAULT hover:bg-brand-dark text-white focus:ring-brand-light",
    outline: "border border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-brand-light dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300"
  }
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base"
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  )
}

export function LoginButton() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <Button disabled className="animate-pulse">
        Loading...
      </Button>
    )
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {session.user?.image && (
            <img 
              src={session.user.image} 
              alt={session.user.name || "User"} 
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm font-medium">
            {session.user?.name}
          </span>
        </div>
        <Button 
          onClick={() => signOut()} 
          variant="outline"
          size="sm"
        >
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <Button 
        onClick={() => signIn("google")} 
        variant="default"
        size="sm"
      >
        Sign in with Google
      </Button>
      <Button 
        onClick={() => signIn("github")} 
        variant="outline"
        size="sm"
      >
        Sign in with GitHub
      </Button>
    </div>
  )
}