import api from './client'
import type { CreateJobPayload, JobResponse } from '../types/job'

export const createAnalysisJob = async (
  payload: CreateJobPayload,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal
) => {
  const formData = new FormData()
  formData.append('file', payload.file)
  formData.append('name', payload.name)
  formData.append('eventDate', payload.eventDate)
  formData.append('language', payload.language)
  if (payload.notes) {
    formData.append('notes', payload.notes)
  }

  const response = await api.post<JobResponse>('/jobs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    signal,
    onUploadProgress: (event) => {
      if (!event.total) return
      const percent = Math.round((event.loaded / event.total) * 100)
      onProgress?.(percent)
    }
  })

  return response.data
}
