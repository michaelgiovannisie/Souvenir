import { useState, useRef, KeyboardEvent } from 'react'
import { X, Tag } from 'lucide-react'
import { clsx } from 'clsx'

const SUGGESTIONS = [
  'beach', 'mountains', 'city', 'rural', 'solo', 'family', 'couple',
  'backpacking', 'luxury', 'budget', 'road-trip', 'cruise', 'camping',
  'food', 'history', 'adventure', 'relaxation', 'work', 'festival',
  'winter', 'summer', 'spring', 'autumn',
]

interface Props {
  tags: string[]
  onChange: (tags: string[]) => void
  className?: string
}

export function TagsEditor({ tags, onChange, className }: Props) {
  const [input, setInput] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredSuggestions = input.length > 0
    ? SUGGESTIONS.filter(s => s.startsWith(input.toLowerCase()) && !tags.includes(s))
    : SUGGESTIONS.filter(s => !tags.includes(s)).slice(0, 8)

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, '-')
    if (!tag || tags.includes(tag) || tags.length >= 10) return
    onChange([...tags, tag])
    setInput('')
  }

  function removeTag(tag: string) {
    onChange(tags.filter(t => t !== tag))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',' || e.key === ' ') && input.trim()) {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  const showSuggestions = focused && filteredSuggestions.length > 0

  return (
    <div className={clsx('relative', className)}>
      {/* Tag chips + input */}
      <div
        className={clsx(
          'flex flex-wrap gap-1.5 items-center min-h-[38px] px-2.5 py-1.5',
          'border rounded-xl text-sm transition-colors cursor-text',
          focused
            ? 'border-brand-500 ring-2 ring-brand-500/20 bg-white dark:bg-gray-800'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.length === 0 && !focused && (
          <span className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 select-none">
            <Tag className="w-3.5 h-3.5" />
            Add tags…
          </span>
        )}
        {tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300"
          >
            #{tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag) }}
              className="hover:text-brand-900 dark:hover:text-brand-100 transition-colors ml-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value.replace(',', ''))}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={tags.length > 0 ? '' : focused ? 'Type a tag and press Enter…' : ''}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
        />
      </div>

      {/* Suggestion dropdown */}
      {showSuggestions && (
        <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-2 flex flex-wrap gap-1.5">
          {filteredSuggestions.map(s => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); addTag(s) }}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-brand-100 dark:hover:bg-brand-900/40 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
            >
              #{s}
            </button>
          ))}
        </div>
      )}

      {tags.length > 0 && (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          {tags.length}/10 tags · Press Enter or comma to add · Backspace to remove last
        </p>
      )}
    </div>
  )
}
