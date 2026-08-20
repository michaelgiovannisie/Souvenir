import { useState, useEffect, useRef, useCallback } from 'react'
import { Check, Eye, PenLine, Loader2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { clsx } from 'clsx'
import { tripsApi } from '../api/tripsApi'
import { tripKeys } from '../hooks/useTrips'

// ── Minimal markdown renderer ──────────────────────────────────────────────────
// Handles: # headings, **bold**, *italic*, - lists, 1. lists, > quotes, ---, links

function renderMarkdown(raw: string): string {
  const lines = raw.split('\n')
  const out: string[] = []
  let inList = false
  let listType: 'ul' | 'ol' | null = null

  function closeList() {
    if (inList) {
      out.push(listType === 'ul' ? '</ul>' : '</ol>')
      inList = false
      listType = null
    }
  }

  function inlineFormat(text: string): string {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-gray-100 text-brand-700 px-1 rounded text-sm font-mono">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-brand-600 underline" target="_blank">$1</a>')
  }

  for (const line of lines) {
    const trimmed = line.trim()

    // Horizontal rule
    if (/^---+$/.test(trimmed)) {
      closeList()
      out.push('<hr class="border-gray-200 my-4"/>')
      continue
    }

    // Headings
    const h3 = trimmed.match(/^### (.+)/)
    if (h3) { closeList(); out.push(`<h3 class="text-base font-bold text-gray-900 mt-4 mb-1">${inlineFormat(h3[1])}</h3>`); continue }
    const h2 = trimmed.match(/^## (.+)/)
    if (h2) { closeList(); out.push(`<h2 class="text-lg font-bold text-gray-900 mt-5 mb-1">${inlineFormat(h2[1])}</h2>`); continue }
    const h1 = trimmed.match(/^# (.+)/)
    if (h1) { closeList(); out.push(`<h1 class="text-xl font-bold text-gray-900 mt-5 mb-2">${inlineFormat(h1[1])}</h1>`); continue }

    // Blockquote
    const bq = trimmed.match(/^> (.+)/)
    if (bq) {
      closeList()
      out.push(`<blockquote class="border-l-4 border-brand-200 pl-4 py-0.5 text-gray-500 italic my-2">${inlineFormat(bq[1])}</blockquote>`)
      continue
    }

    // Unordered list
    const ul = trimmed.match(/^[-*] (.+)/)
    if (ul) {
      if (!inList || listType !== 'ul') {
        closeList()
        out.push('<ul class="list-disc list-inside space-y-0.5 my-2 text-gray-700">')
        inList = true; listType = 'ul'
      }
      out.push(`<li>${inlineFormat(ul[1])}</li>`)
      continue
    }

    // Ordered list
    const ol = trimmed.match(/^\d+\. (.+)/)
    if (ol) {
      if (!inList || listType !== 'ol') {
        closeList()
        out.push('<ol class="list-decimal list-inside space-y-0.5 my-2 text-gray-700">')
        inList = true; listType = 'ol'
      }
      out.push(`<li>${inlineFormat(ol[1])}</li>`)
      continue
    }

    // Empty line → paragraph break
    if (trimmed === '') {
      closeList()
      out.push('<div class="h-3"/>')
      continue
    }

    // Regular paragraph line
    closeList()
    out.push(`<p class="text-gray-700 leading-relaxed">${inlineFormat(trimmed)}</p>`)
  }

  closeList()
  return out.join('\n')
}

// ── Save status ────────────────────────────────────────────────────────────────

type SaveStatus = 'idle' | 'saving' | 'saved'

// ── Main component ─────────────────────────────────────────────────────────────

export function NotesTab({ tripId, initialNotes }: { tripId: string; initialNotes: string | null }) {
  const qc = useQueryClient()
  const [value, setValue] = useState(initialNotes ?? '')
  const [mode, setMode] = useState<'write' | 'preview'>('write')
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedRef = useRef(initialNotes ?? '')

  // Sync if parent re-fetches (e.g. after navigating back)
  useEffect(() => {
    setValue(initialNotes ?? '')
    savedRef.current = initialNotes ?? ''
  }, [initialNotes])

  const save = useCallback(async (text: string) => {
    if (text === savedRef.current) return
    setStatus('saving')
    try {
      const updated = await tripsApi.updateNotes(tripId, text)
      savedRef.current = text
      // Update cache so TripDetail reflects new notes
      qc.setQueryData(tripKeys.detail(tripId), updated)
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2500)
    } catch {
      setStatus('idle')
    }
  }, [tripId, qc])

  function handleChange(text: string) {
    setValue(text)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => save(text), 1000)
  }

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        save(value)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const charCount = value.length
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        {/* Mode toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setMode('write')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              mode === 'write' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <PenLine className="w-3.5 h-3.5" />
            Write
          </button>
          <button
            onClick={() => setMode('preview')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              mode === 'preview' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
        </div>

        {/* Save status + counts */}
        <div className="flex items-center gap-3">
          {status === 'saving' && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving…
            </span>
          )}
          {status === 'saved' && (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
          <span className="text-xs text-gray-300">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
        </div>
      </div>

      {/* Write mode */}
      {mode === 'write' && (
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={[
            '# Itinerary',
            '',
            '## Day 1',
            '- Check in to hotel',
            '- Dinner at local restaurant',
            '',
            '## Day 2',
            '- Morning hike',
            '',
            'Supports **bold**, *italic*, `code`, > quotes, and lists.',
          ].join('\n')}
          className="w-full min-h-[420px] px-4 py-3 text-sm text-gray-800 bg-white border border-gray-200 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-gray-300 font-mono leading-relaxed"
          spellCheck
        />
      )}

      {/* Preview mode */}
      {mode === 'preview' && (
        <div className="min-h-[420px] px-4 py-3 bg-white border border-gray-200 rounded-xl">
          {value.trim() ? (
            <div
              className="prose-like text-sm"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
            />
          ) : (
            <p className="text-gray-300 text-sm italic">Nothing written yet.</p>
          )}
        </div>
      )}

      {/* Markdown hint */}
      {mode === 'write' && (
        <p className="text-xs text-gray-400">
          Supports Markdown — <strong># Heading</strong>, <strong>**bold**</strong>, <strong>*italic*</strong>, <strong>- lists</strong>, <strong>{'> quotes'}</strong>. Auto-saves 1 s after you stop typing.
        </p>
      )}
    </div>
  )
}
