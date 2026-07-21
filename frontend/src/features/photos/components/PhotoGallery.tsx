import { useState, useEffect, useCallback } from 'react'
import { Trash2, X, ChevronLeft, ChevronRight, ZoomIn, ImagePlus, Crown } from 'lucide-react'
import { clsx } from 'clsx'
import { Photo } from '../api/photosApi'
import { useDeletePhoto } from '../hooks/usePhotos'

interface PhotoGalleryProps {
  tripId: string
  photos: Photo[]
  currentCoverUrl?: string | null
  onSetCover?: (photoId: string) => void
  isSettingCover?: boolean
}

export function PhotoGallery({ tripId, photos, currentCoverUrl, onSetCover, isSettingCover }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const { mutate: deletePhoto, isPending: isDeleting } = useDeletePhoto(tripId)

  // Keyboard navigation in lightbox
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (e.key === 'ArrowRight') setLightboxIndex((i) => Math.min(i! + 1, photos.length - 1))
      if (e.key === 'ArrowLeft') setLightboxIndex((i) => Math.max(i! - 1, 0))
      if (e.key === 'Escape') setLightboxIndex(null)
    },
    [lightboxIndex, photos.length]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (photos.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <div className="text-5xl mb-3">📷</div>
        <p className="text-sm font-medium text-gray-500">No photos yet</p>
        <p className="text-xs mt-1">Upload some memories above</p>
      </div>
    )
  }

  const confirmDelete = (photoId: string) => {
    deletePhoto(photoId, {
      onSuccess: () => {
        setDeleteConfirmId(null)
        if (lightboxIndex !== null) setLightboxIndex(null)
      },
    })
  }

  return (
    <>
      {/* Masonry grid */}
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
        {photos.map((photo, index) => {
          const isCover = !!currentCoverUrl && photo.cloudinaryUrl === currentCoverUrl
          return (
            <div key={photo.id} className="break-inside-avoid group relative rounded-xl overflow-hidden bg-gray-100">
              <img
                src={photo.cloudinaryUrl}
                alt={photo.caption ?? ''}
                className="w-full object-cover cursor-pointer transition-transform duration-200 group-hover:scale-105"
                onClick={() => setLightboxIndex(index)}
                loading="lazy"
              />

              {/* Cover badge */}
              {isCover && (
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-amber-400/90 rounded-lg shadow-sm">
                  <Crown className="w-3 h-3 text-white" />
                  <span className="text-white text-xs font-semibold">Cover</span>
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 pointer-events-none" />

              {/* Actions on hover */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(index) }}
                  className="p-1.5 bg-white/90 rounded-lg text-gray-700 hover:bg-white transition-colors shadow-sm"
                  title="Zoom"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                {onSetCover && !isCover && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onSetCover(photo.id) }}
                    disabled={isSettingCover}
                    className="p-1.5 bg-white/90 rounded-lg text-amber-500 hover:bg-white hover:text-amber-600 transition-colors shadow-sm disabled:opacity-50"
                    title="Set as cover photo"
                  >
                    <ImagePlus className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(photo.id) }}
                  className="p-1.5 bg-white/90 rounded-lg text-red-500 hover:bg-white transition-colors shadow-sm"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Caption */}
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs truncate">{photo.caption}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Delete confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-2">Delete photo?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently remove the photo from Cloudinary. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deleteConfirmId)}
                disabled={isDeleting}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
            onClick={() => setLightboxIndex(null)}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
            {lightboxIndex + 1} / {photos.length}
          </div>

          {/* Set as cover from lightbox */}
          {onSetCover && photos[lightboxIndex].cloudinaryUrl !== currentCoverUrl && (
            <button
              className="absolute top-4 right-28 flex items-center gap-1.5 px-3 py-2 text-white/70 hover:text-amber-400 transition-colors text-sm"
              onClick={(e) => { e.stopPropagation(); onSetCover(photos[lightboxIndex].id) }}
              title="Set as cover photo"
            >
              <ImagePlus className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Set cover</span>
            </button>
          )}

          {/* Delete from lightbox */}
          <button
            className="absolute top-4 right-14 p-2 text-white/70 hover:text-red-400 transition-colors"
            onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(photos[lightboxIndex].id) }}
          >
            <Trash2 className="w-5 h-5" />
          </button>

          {/* Prev */}
          <button
            className={clsx(
              'absolute left-4 p-3 text-white/70 hover:text-white transition-colors',
              lightboxIndex === 0 && 'opacity-30 pointer-events-none'
            )}
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => i! - 1) }}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          {/* Image */}
          <div
            className="max-w-5xl max-h-[85vh] px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[lightboxIndex].cloudinaryUrl}
              alt={photos[lightboxIndex].caption ?? ''}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
            {photos[lightboxIndex].caption && (
              <p className="text-white/70 text-sm text-center mt-3">
                {photos[lightboxIndex].caption}
              </p>
            )}
          </div>

          {/* Next */}
          <button
            className={clsx(
              'absolute right-4 p-3 text-white/70 hover:text-white transition-colors',
              lightboxIndex === photos.length - 1 && 'opacity-30 pointer-events-none'
            )}
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => i! + 1) }}
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}
    </>
  )
}
