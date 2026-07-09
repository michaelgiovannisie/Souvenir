import { api } from '@/lib/axios'

export interface Photo {
  id: string
  tripId: string
  memoryId: string | null
  destinationId: string | null
  cloudinaryUrl: string
  caption: string | null
  takenAt: string | null
  createdAt: string
}

export interface UploadPhotoPayload {
  tripId: string
  file: File
  caption?: string
  onProgress?: (percent: number) => void
}

export const photosApi = {
  getTripPhotos: async (tripId: string): Promise<Photo[]> => {
    const { data } = await api.get(`/trips/${tripId}/photos`)
    return data.data
  },

  uploadPhoto: async ({ tripId, file, caption, onProgress }: UploadPhotoPayload): Promise<Photo> => {
    const form = new FormData()
    form.append('file', file)
    if (caption?.trim()) form.append('caption', caption.trim())

    const { data } = await api.post(`/trips/${tripId}/photos`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (event.total && onProgress) {
          onProgress(Math.round((event.loaded * 100) / event.total))
        }
      },
    })
    return data.data
  },

  deletePhoto: async (photoId: string): Promise<void> => {
    await api.delete(`/photos/${photoId}`)
  },
}
