'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { getRedirectUrl } from '@/lib/environment'

interface LogoutButtonProps {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  showIcon?: boolean
  children?: React.ReactNode
}

export default function LogoutButton({ 
  variant = 'ghost', 
  size = 'default', 
  className = '',
  showIcon = true,
  children 
}: LogoutButtonProps) {
  
  const handleLogout = async () => {
    try {
      console.log('Logout initiated')

      // Get the correct redirect URL for the current environment
      const redirectUrl = getRedirectUrl('/')
      console.log('Logout redirect URL:', redirectUrl)

      // Sign out with explicit redirect to home page
      await signOut({
        callbackUrl: redirectUrl,
        redirect: true
      })

      console.log('Logout completed')
    } catch (error) {
      console.error('Logout error:', error)

      // Fallback: manually redirect to home page
      const fallbackUrl = getRedirectUrl('/')
      console.log('Fallback redirect to:', fallbackUrl)
      window.location.href = fallbackUrl
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={className}
      title="Sign Out"
    >
      {showIcon && <LogOut className="w-4 h-4 mr-2" />}
      {children || 'Sign Out'}
    </Button>
  )
}
