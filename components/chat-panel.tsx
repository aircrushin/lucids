'use client'

import { Model } from '@/lib/types/models'
import { cn } from '@/lib/utils'
import { Message } from 'ai'
import { ArrowUp, MessageCirclePlus, Square } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Textarea from 'react-textarea-autosize'
import { TypeAnimation } from 'react-type-animation'
import { EmptyScreen } from './empty-screen'
import { ModelSelector } from './model-selector'
import { SearchModeToggle } from './search-mode-toggle'
import { Button } from './ui/button'
import { IconLogo } from './ui/icons'

interface ChatPanelProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  messages: Message[]
  setMessages: (messages: Message[]) => void
  query?: string
  stop: () => void
  append: (message: any) => void
  models?: Model[]
}

export function ChatPanel({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  messages,
  setMessages,
  query,
  stop,
  append,
  models
}: ChatPanelProps) {
  const [showEmptyScreen, setShowEmptyScreen] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isFirstRender = useRef(true)
  const [isComposing, setIsComposing] = useState(false) // Composition state
  const [enterDisabled, setEnterDisabled] = useState(false) // Disable Enter after composition ends

  const handleCompositionStart = () => setIsComposing(true)

  const handleCompositionEnd = () => {
    setIsComposing(false)
    setEnterDisabled(true)
    setTimeout(() => {
      setEnterDisabled(false)
    }, 300)
  }

  const handleNewChat = () => {
    setMessages([])
    router.push('/')
  }

  // if query is not empty, submit the query
  useEffect(() => {
    if (isFirstRender.current && query && query.trim().length > 0) {
      append({
        role: 'user',
        content: query
      })
      isFirstRender.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  return (
    <div
      className={cn(
        'mx-auto w-full',
        messages.length > 0
          ? 'fixed bottom-0 left-0 right-0 bg-background px-2 md:px-0'
          : 'fixed bottom-4 md:bottom-8 left-0 right-0 top-6 flex flex-col items-center justify-center'
      )}
    >
      {messages.length === 0 && (
        <div className="mb-8 md:mb-12 flex flex-col items-center gap-4 md:gap-6 px-4">
          <IconLogo className="md:size-16 size-10 text-primary drop-shadow-lg" />
          <div className="text-center space-y-2">
            <TypeAnimation
              sequence={[
                'Stay Lucid',
                2000,
                'Thinking While Retrieving...',
                2000,
                'Get Instant Answers',
                2000
              ]}
              wrapper="h1"
              cursor={true}
              repeat={Infinity}
              className="text-primary font-bold text-2xl md:text-4xl"
            />
            <p className="text-muted-foreground text-sm md:text-lg max-w-2xl px-2">
              Ask anything and get comprehensive answers with real-time information
            </p>
          </div>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className={cn(
          'max-w-3xl w-full mx-auto',
          messages.length > 0 ? 'px-2 py-4' : 'px-6'
        )}
      >
        <div className="relative flex flex-col w-full gap-2 search-input rounded-2xl md:rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 group">
          <Textarea
            ref={inputRef}
            name="input"
            rows={1}
            maxRows={4}
            tabIndex={0}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="Ask anything... ✨"
            spellCheck={false}
            value={input}
            className="resize-none w-full min-h-12 md:min-h-14 bg-transparent border-0 px-4 md:px-6 py-3 md:py-4 text-sm md:text-base placeholder:text-muted-foreground/70 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 font-medium"
            onChange={e => {
              handleInputChange(e)
              setShowEmptyScreen(e.target.value.length === 0)
            }}
            onKeyDown={e => {
              if (
                e.key === 'Enter' &&
                !e.shiftKey &&
                !isComposing &&
                !enterDisabled
              ) {
                if (input.trim().length === 0) {
                  e.preventDefault()
                  return
                }
                e.preventDefault()
                const textarea = e.target as HTMLTextAreaElement
                textarea.form?.requestSubmit()
              }
            }}
            onFocus={() => setShowEmptyScreen(true)}
            onBlur={() => setShowEmptyScreen(false)}
          />
          {/* Bottom menu area */}
          <div className="flex items-center justify-between px-3 md:px-4 pb-3 md:pb-4">
            <div className="flex items-center gap-2 md:gap-3">
              <ModelSelector models={models || []} />
              <SearchModeToggle />
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNewChat}
                  className="shrink-0 rounded-full group/btn glass-effect hover:bg-white/20 dark:hover:bg-gray-800/20 border-white/20 dark:border-gray-700/30 transition-all duration-300 hover:scale-105 md:hover:scale-110"
                  type="button"
                  disabled={isLoading}
                >
                  <MessageCirclePlus className="size-3.5 md:size-4 group-hover/btn:rotate-12 transition-all duration-300" />
                </Button>
              )}
              <Button
                type={isLoading ? 'button' : 'submit'}
                size={'icon'}
                className={cn(
                  isLoading && 'animate-pulse',
                  'rounded-full modern-button shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 md:hover:scale-110 active:scale-95',
                  input.length === 0 && !isLoading && 'opacity-50 cursor-not-allowed hover:scale-100'
                )}
                disabled={input.length === 0 && !isLoading}
                onClick={isLoading ? stop : undefined}
              >
                {isLoading ? <Square size={18} className="md:size-5" /> : <ArrowUp size={18} className="md:size-5" />}
              </Button>
            </div>
          </div>
        </div>

        {messages.length === 0 && (
          <EmptyScreen
            submitMessage={message => {
              handleInputChange({
                target: { value: message }
              } as React.ChangeEvent<HTMLTextAreaElement>)
            }}
            className={cn(showEmptyScreen ? 'visible' : 'invisible')}
          />
        )}
      </form>
    </div>
  )
}
