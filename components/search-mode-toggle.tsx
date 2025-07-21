'use client'

import { getCookie, setCookie } from '@/lib/utils/cookies'
import { ChevronDown, Globe } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu'

export function SearchModeToggle() {
  const [searchMode, setSearchMode] = useState<'academic' | 'normal'>('normal')

  useEffect(() => {
    const savedMode = getCookie('search-mode')
    if (savedMode) {
      setSearchMode(savedMode as 'academic' | 'normal')
    }
  }, [])

  const handleSearchModeChange = (mode: 'academic' | 'normal') => {
    setSearchMode(mode)
    setCookie('search-mode', mode)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 px-3 glass-effect hover:bg-white/20 dark:hover:bg-gray-800/20 border-white/20 dark:border-gray-700/30 rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <div className="p-1 bg-blue-500 rounded-full">
            <Globe className="size-3 text-white" />
          </div>
          <span className="text-xs font-medium">
            {searchMode === 'academic' ? 'Academic' : 'Normal'}
          </span>
          <ChevronDown className="size-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-effect border-white/20 dark:border-gray-700/30 shadow-2xl">
        <DropdownMenuItem
          onClick={() => handleSearchModeChange('normal')}
          className="hover:bg-white/10 dark:hover:bg-gray-800/10 transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Normal</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSearchModeChange('academic')}
          className="hover:bg-white/10 dark:hover:bg-gray-800/10 transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Academic</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
