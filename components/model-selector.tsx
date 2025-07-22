'use client'

import { Model } from '@/lib/types/models'
import { getCookie, setCookie } from '@/lib/utils/cookies'
import { isReasoningModel } from '@/lib/utils/registry'
import { Check, ChevronsUpDown, Lightbulb } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createModelId } from '../lib/utils'
import { Button } from './ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

function groupModelsByProvider(models: Model[]) {
  return models
    .filter(model => model.enabled)
    .reduce((groups, model) => {
      const provider = model.provider
      if (!groups[provider]) {
        groups[provider] = []
      }
      groups[provider].push(model)
      return groups
    }, {} as Record<string, Model[]>)
}

interface ModelSelectorProps {
  models: Model[]
}

export function ModelSelector({ models }: ModelSelectorProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

  useEffect(() => {
    const savedModel = getCookie('selectedModel')
    if (savedModel) {
      try {
        const model = JSON.parse(savedModel) as Model
        setValue(createModelId(model))
      } catch (e) {
        console.error('Failed to parse saved model:', e)
      }
    }
  }, [])

  const handleModelSelect = (id: string) => {
    const newValue = id === value ? '' : id
    setValue(newValue)

    const selectedModel = models.find(model => createModelId(model) === newValue)
    if (selectedModel) {
      setCookie('selectedModel', JSON.stringify(selectedModel))
    } else {
      setCookie('selectedModel', '')
    }

    setOpen(false)
  }

  const selectedModel = models.find(model => createModelId(model) === value)
  const groupedModels = groupModelsByProvider(models)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="text-xs md:text-sm rounded-full glass-effect hover:bg-white/20 dark:hover:bg-gray-800/20 border-white/20 dark:border-gray-700/30 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl py-1 md:py-2 px-2 md:px-3"
        >
          {selectedModel ? (
            <div className="flex items-center space-x-1.5 md:space-x-2">
              <div className="relative">
                <Image
                  src={`/providers/logos/${selectedModel.providerId}.svg`}
                  alt={selectedModel.provider}
                  width={16}
                  height={16}
                  className="bg-white rounded-full border shadow-sm md:w-5 md:h-5"
                />
                {isReasoningModel(selectedModel.id) && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-blue-500 rounded-full flex items-center justify-center">
                    <Lightbulb size={6} className="text-white md:size-2" />
                  </div>
                )}
              </div>
              <span className="text-xs font-medium hidden xs:inline">{selectedModel.name}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 md:space-x-2">
              <div className="w-4 h-4 md:w-5 md:h-5 bg-gray-400 rounded-full"></div>
              <span className="text-xs hidden xs:inline">Select model</span>
            </div>
          )}
          <ChevronsUpDown className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 glass-effect border-white/20 dark:border-gray-700/30 shadow-2xl" align="start">
        <Command className="bg-transparent">
          <CommandInput
            placeholder="Search models..."
            className="border-0 border-b border-gray-200/50 dark:border-gray-700/50 rounded-none focus:ring-0"
          />
          <CommandList className="max-h-80">
            <CommandEmpty className="py-6 text-center text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
                <span>No model found</span>
              </div>
            </CommandEmpty>
            {Object.entries(groupedModels).map(([provider, models]) => (
              <CommandGroup key={provider} heading={provider} className="px-2">
                {models.map(model => {
                  const modelId = createModelId(model)
                  return (
                    <CommandItem
                      key={modelId}
                      value={modelId}
                      onSelect={handleModelSelect}
                      className="flex justify-between items-center p-3 rounded-lg hover:bg-white/10 dark:hover:bg-gray-800/10 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Image
                            src={`/providers/logos/${model.providerId}.svg`}
                            alt={model.provider}
                            width={20}
                            height={20}
                            className="bg-white rounded-full border shadow-sm"
                          />
                          {isReasoningModel(model.id) && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                              <Lightbulb size={8} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium group-hover:text-primary transition-colors">
                            {model.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {model.provider}
                          </span>
                        </div>
                      </div>
                      <Check
                        className={`h-4 w-4 text-primary transition-all duration-200 ${value === modelId ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                          }`}
                      />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
