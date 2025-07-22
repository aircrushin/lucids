import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen, Code, Globe, Lightbulb, Sparkles, TrendingUp } from 'lucide-react'

const exampleMessages = [
  {
    heading: 'Latest AI developments',
    message: 'What are the latest developments in artificial intelligence?',
    icon: Sparkles,
    color: 'bg-purple-500'
  },
  {
    heading: 'Market trends analysis',
    message: 'Analyze current market trends in technology stocks',
    icon: TrendingUp,
    color: 'bg-green-500'
  },
  {
    heading: 'Global news summary',
    message: 'Give me a summary of today\'s most important global news',
    icon: Globe,
    color: 'bg-blue-500'
  },
  {
    heading: 'Code explanation',
    message: 'Explain how React hooks work with examples',
    icon: Code,
    color: 'bg-orange-500'
  },
  {
    heading: 'Learning resources',
    message: 'Best resources to learn machine learning in 2024',
    icon: BookOpen,
    color: 'bg-indigo-500'
  },
  {
    heading: 'Creative ideas',
    message: 'Give me creative startup ideas for sustainable technology',
    icon: Lightbulb,
    color: 'bg-yellow-500'
  }
]

export function EmptyScreen({
  submitMessage,
  className
}: {
  submitMessage: (message: string) => void
  className?: string
}) {
  return (
    <div className={`mx-auto w-full transition-all duration-500 ${className}`}>
      <div className="mt-6 p-4">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">Try asking about...</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto px-2">
          {exampleMessages.map((message, index) => {
            const IconComponent = message.icon
            return (
              <Button
                key={index}
                variant="ghost"
                className="h-auto p-3 md:p-4 text-left justify-start floating-card hover:scale-102 md:hover:scale-105 transition-all duration-300 group"
                onClick={async () => {
                  submitMessage(message.message)
                }}
              >
                <div className="flex items-start gap-2 md:gap-3 w-full">
                  <div className={`p-1.5 md:p-2 rounded-lg ${message.color} text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <IconComponent size={14} className="md:size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs md:text-sm text-foreground group-hover:text-primary transition-colors duration-300">
                      {message.heading}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 md:mt-1 line-clamp-2">
                      {message.message}
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 md:size-4" />
                </div>
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
