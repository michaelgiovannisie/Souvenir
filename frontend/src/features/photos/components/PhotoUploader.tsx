import { useCallback, useRef, useState } from 'react'
import { Upload, X, CheckCircle, AlertCircle, ImagePlus } from 'lucide-react'
import { clsx } from 'clsx'
import { useQueryClient } from '@tanstack/react-query'
import { photosApi } from '../api/photosApi'
import { photoKeys } from '../hooks/usePhotos'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

type FileStatus = 'pending' | 'uploading' | 'done' | 'error'

interface FileEntry {
  id: string
  file: File
  preview: string
  caption: string
  progress: number
  status: FileStatus
  error?: string
}

interface PhotoUploaderProps {
  tripId: string
}

export function PhotoUploader({ tripId }: PhotoUploaderProps) {
  const [files, setFiles] = useState<FileEntry[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()

  // --- File validation & addition ---
  const addFiles = useCallback((rawFiles: File[]) => {
    const entries: FileEntry[] = rawFiles
      .filter((f) => {
        if (!ACCEPTED_TYPES.includes(f.type)) return false
        if (f.size > MAX_SIZE_BYTES) return false
        return true
      })
      .map((f) => ({
        id: crypto.randomUUID(),
        file: f,
        preview: URL.createObjectURL(f),
        caption: '',
        progress: 0,
        status: 'pending' as FileStatus,
      }))

    // Warn about rejected files
    const rejected = rawFiles.length - entries.length
    if (rejected > 0) {
      console.warn(`${rejected} file(s) rejected — must be JPEG/PNG/WebP/HEIC under 10 MB`)
    }

    setFiles((prev) => [...prev, ...entries])
  }, [])

  // --- Drag handlers ---
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const onDragLeave = () => setIsDragging(false)
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(Array.from(e.dataTransfer.files))
  }

  // --- Input change ---
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files))
    e.target.value = '' // reset so same file can be re-added
  }

  // --- Caption update ---
  const updateCaption = (id: string, caption: string) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, caption } : f)))
  }

  // --- Remove before upload ---
  const remove = (id: string) => {
    setFiles((prev) => {
      const entry = prev.find((f) => f.id === id)
      if (entry) URL.revokeObjectURL(entry.preview)
      return prev.filter((f) => f.id !== id)
    })
  }

  // --- Upload a single file ---
  const uploadOne = async (entry: FileEntry) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === entry.id ? { ...f, status: 'uploading', progress: 0 } : f))
    )
    try {
      await photosApi.uploadPhoto({
        tripId,
        file: entry.file,
        caption: entry.caption,
        onProgress: (pct) =>
          setFiles((prev) =>
            prev.map((f) => (f.id === entry.id ? { ...f, progress: pct } : f))
          ),
      })
      setFiles((prev) =>
        prev.map((f) => (f.id === entry.id ? { ...f, status: 'done', progress: 100 } : f))
      )
    } catch {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === entry.id ? { ...f, status: 'error', error: 'Upload failed. Try again.' } : f
        )
      )
    }
  }

  // --- Upload all pending ---
  const uploadAll = async () => {
    const pending = files.filter((f) => f.status === 'pending' || f.status === 'error')
    await Promise.all(pending.map(uploadOne))
    await qc.invalidateQueries({ queryKey: photoKeys.byTrip(tripId) })
  }

  const pendingCount = files.filter((f) => f.status === 'pending' || f.status === 'error').length
  const hasFiles = files.length > 0

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !hasFiles && inputRef.current?.click()}
        className={clsx(
          'relative border-2 border-dashed rounded-2xl transition-colors',
          isDragging
            ? 'border-brand-400 bg-brand-50'
            : hasFiles
            ? 'border-gray-200 bg-white'
            : 'border-gray-300 bg-gray-50 hover:border-brand-400 hover:bg-brand-50 cursor-pointer',
          !hasFiles && 'flex flex-col items-center justify-center py-16'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          className="hidden"
          onChange={onInputChange}
        />

        {!hasFiles ? (
          /* Empty state */
          <div className="text-center pointer-events-none">
            <div className="mx-auto w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center mb-4">
              <ImagePlus className="w-7 h-7 text-brand-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              Drop photos here, or{' '}
              <span className="text-brand-600">browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP, HEIC · Max 10 MB each</p>
          </div>
        ) : (
          /* File list */
          <div className="p-4 space-y-3">
            {files.map((entry) => (
              <FileRow
                key={entry.id}
                entry={entry}
                onCaptionChange={(v) => updateCaption(entry.id, v)}
                onRemove={() => remove(entry.id)}
                onRetry={() => uploadOne(entry)}
              />
            ))}

            {/* Add more button inside the zone */}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-brand-400 hover:text-brand-600 transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Add more photos
            </button>
          </div>
        )}
      </div>

      {/* Upload button */}
      {pendingCount > 0 && (
        <button
          type="button"
          onClick={uploadAll}
          className="w-full py-3 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 active:bg-brand-800 transition-colors flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload {pendingCount} {pendingCount === 1 ? 'photo' : 'photos'}
        </button>
      )}
    </div>
  )
}

// --- Individual file row ---
interface FileRowProps {
  entry: FileEntry
  onCaptionChange: (v: string) => void
  onRemove: () => void
  onRetry: () => void
}

function FileRow({ entry, onCaptionChange, onRemove, onRetry }: FileRowProps) {
  const isDone = entry.status === 'done'
  const isError = entry.status === 'error'
  const isUploading = entry.status === 'uploading'

  return (
    <div
      className={clsx(
        'flex gap-3 p-3 rounded-xl border transition-colors',
        isDone ? 'border-green-200 bg-green-50' : isError ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'
      )}
    >
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
        <img src={entry.preview} alt="" className="w-full h-full object-cover" />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 space-y-2">
        <p className="text-sm font-medium text-gray-800 truncate">{entry.file.name}</p>
        <p className="text-xs text-gray-400">{(entry.file.size / 1024 / 1024).toFixed(1)} MB</p>

        {/* Caption input — only when not done */}
        {!isDone && (
          <input
            type="text"
            placeholder="Add a caption… (optional)"
            value={entry.caption}
            onChange={(e) => onCaptionChange(e.target.value)}
            disabled={isUploading}
            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-brand-400 disabled:opacity-50"
          />
        )}

        {/* Progress bar */}
        {isUploading && (
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-300"
              style={{ width: `${entry.progress}%` }}
            />
          </div>
        )}

        {/* Status / error */}
        {isDone && (
          <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            Uploaded
          </div>
        )}
        {isError && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="w-3.5 h-3.5" />
              {entry.error}
            </div>
            <button
              type="button"
              onClick={onRetry}
              className="text-xs text-brand-600 hover:underline"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Remove button */}
      {!isUploading && !isDone && (
        <button
          type="button"
          onClick={onRemove}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
