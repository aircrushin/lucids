'use client'
import { cn } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import React, { useEffect, useState } from 'react'
import { LoginModal } from './auth/login-modal'
import { UserAccountNav } from './auth/user-account-nav'
import { Button } from './ui/button'
import { IconLogo } from './ui/icons'

export const Header: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <header className="fixed w-full p-2 flex justify-between items-center z-10 backdrop-blur-md bg-background/60 transition-all duration-200">
      <div>
        <a
          href="/"
          className="flex items-center gap-3 hover:opacity-90 transition-all duration-300 group"
        >
          <IconLogo
            className={cn(
              'w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300 drop-shadow-sm'
            )}
          />
          <span className="font-bold text-xl tracking-tight text-primary group-hover:scale-105 transition-transform duration-300">
            Lucid
          </span>
        </a>
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <UserAccountNav user={user} />
        ) : (
          <Button
            variant="outline"
            onClick={() => setShowLoginModal(true)}
            className="glass-effect hover:bg-white/20 dark:hover:bg-gray-800/20 border-white/20 dark:border-gray-700/30 transition-all duration-300 hover:scale-105"
          >
            Login
          </Button>
        )}
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </div>
      {/* <History /> */}
    </header>
  )
}

export default Header
