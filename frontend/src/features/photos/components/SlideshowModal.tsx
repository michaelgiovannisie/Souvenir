import { useState, useEffect, useCallback, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, Pause, Play, MapPin } from 'lucide-react'
import dayjs from 'dayjs'
import type { Photo } from '../api/photosApi'

const SLIDE_DURATION = 5000 // ms per slide

interface Props {
  photos: Photo[]
  startIndex?: number
  tripTitle: string
  onClose: () => void
}

export function SlideshowModal({ photos, startIndex = 0, tripTitle, onClose }: Props) {
  const [index, setIndex] = useState(startIndex)
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(true)
  const [progressKey, setProgressKey] = useState(0) // forces progress bar restart
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const current = photos[index]

  // Fade transition helper — fade out, change slide, fade in
  const goTo = useCallback((next: number) => {
    setVisible(false)
    setTimeout(() => {
      setIndex(next)
      setProgressKey((k) => k + 1)
      setVisible(true)
    }, 280)
  }, [])

  const prev = useCallback(() => {
    goTo((index - 1 + photos.length) % photos.length)
  }, [index, photos.length, goTo])

  const next = useCallback(() => {
    goTo((index + 1) % photos.length)
  }, [index, photos.length, goTo])

  // Auto-advance
  useEffect(() => {
    if (paused || photos.length <= 1) return
    timeoutRef.current = setTimeout(() => {
      goTo((index + 1) % photos.length)
    }, SLIDE_DURATION)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [index, paused, photos.length, goTo])

  // Keyboard controls
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === ' ') { e.preventDefault(); setPaused((p) => !p) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next, onClose])

  if (!current) return null

  return (
    <div className="fixed inset-0 z-[2000] bg-black flex flex-col">
      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-5 py-4 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center gap-3">
          <span className="text-white font-semibold text-sm truncate max-w-[200px]">{tripTitle}</span>
          <span className="text-white/40 text-xs">·</span>
          <span className="text-white/60 text-xs tabular-nums">{index + 1} / {photos.length}</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress bars */}
      <div className="absolute top-0 inset-x-0 z-20 flex gap-1 px-4 pt-2">
        {photos.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-0.5 rounded-full bg-white/25 overflow-hidden cursor-pointer"
            onClick={() => goTo(i)}
          >
            {i === index ? (
              <div
                key={progressKey}
                className="h-full bg-white rounded-full"
                style={{
                  animation: paused
                    ? `none`
                    : `slideProgress ${SLIDE_DURATION}ms linear forwards`,
                  width: paused ? undefined : '0%',
                }}
              />
            ) : i < index ? (
              <div className="h-full bg-white rounded-full w-full" />
            ) : null}
          </div>
        ))}
      </div>

      {/* Photo */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <img
          key={current.id}
          src={current.cloudinaryUrl}
          alt={current.caption ?? ''}
          className="max-h-full max-w-full object-contain select-none"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.28s ease',
          }}
          draggable={false}
        />
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 inset-x-0 z-10 flex items-end justify-between px-5 py-5 bg-gradient-to-t from-black/70 to-transparent">
        {/* Caption / meta */}
        <div className="flex-1 min-w-0 pr-4">
          {current.caption && (
            <p className="text-white text-sm font-medium leading-snug mb-1 line-clamp-2">
              {current.caption}
            </p>
          )}
          <div className="flex items-center gap-3 text-white/50 text-xs">
            {current.takenAt && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {dayjs(current.takenAt).format('MMM D, YYYY')}
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={prev}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            disabled={photos.length <= 1}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setPaused((p) => !p)}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            {paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
          <button
            onClick={next}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            disabled={photos.length <= 1}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideProgress {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  )
}
