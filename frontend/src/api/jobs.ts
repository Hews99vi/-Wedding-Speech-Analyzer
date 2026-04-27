import api from './client'
import type {
  HighlightOut,
  JobOut,
  JobResponse,
  TranscriptSegmentOut,
  CreateJobPayload
} from '../types/job'

export async function createJob(formData: FormData): Promise<JobOut> {
  const response = await api.post<JobOut>('/jobs', formData)
  return response.data
}

export async function listJobs(params?: {
  page?: number
  page_size?: number
  status?: string
}): Promise<{ items: JobOut[]; total: number; page: number; page_size: number }> {
  const response = await api.get<{ items: JobOut[]; total: number; page: number; page_size: number }>(
    '/jobs',
    { params }
  )
  return response.data
}

export async function getJob(jobId: string): Promise<JobOut> {
  const response = await api.get<JobOut>(`/jobs/${jobId}`)
  return response.data
}

export async function retryJob(jobId: string): Promise<JobOut> {
  const response = await api.post<JobOut>(`/jobs/${jobId}/retry`)
  return response.data
}

export async function getTranscript(jobId: string): Promise<TranscriptSegmentOut[]> {
  const response = await api.get<TranscriptSegmentOut[]>(`/jobs/${jobId}/transcript`)
  return response.data
}

export async function getHighlights(jobId: string): Promise<HighlightOut[]> {
  const response = await api.get<HighlightOut[]>(`/jobs/${jobId}/highlights`)
  return response.data
}

export async function downloadJobAudio(jobId: string): Promise<Blob> {
  const response = await api.get<Blob>(`/jobs/${jobId}/audio`, {
    responseType: 'blob'
  })
  return response.data
}

export function getExportCsvUrl(jobId: string): string {
  return `http://localhost:8000/jobs/${jobId}/export/csv`
}

export function getExportJsonUrl(jobId: string): string {
  return `http://localhost:8000/jobs/${jobId}/export/json`
}

export async function downloadExportCsv(jobId: string): Promise<Blob> {
  const response = await api.get<Blob>(`/jobs/${jobId}/export/csv`, {
    responseType: 'blob'
  })
  return response.data
}

export async function downloadExportJson(jobId: string): Promise<Blob> {
  const response = await api.get<Blob>(`/jobs/${jobId}/export/json`, {
    responseType: 'blob'
  })
  return response.data
}

// Compatibility shim used by existing upload page.
export async function createAnalysisJob(
  payload: CreateJobPayload,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal
): Promise<JobResponse> {
  const formData = new FormData()
  formData.append('audio_file', payload.file)
  formData.append('name', payload.name)
  formData.append('event_date', payload.eventDate)
  formData.append('language', payload.language === 'Sinhala' ? 'si' : payload.language === 'English' ? 'en' : payload.language)
  if (payload.notes) {
    formData.append('notes', payload.notes)
  }

  const response = await api.post<JobOut>('/jobs', formData, {
    signal,
    onUploadProgress: (event) => {
      if (!event.total) return
      const percent = Math.round((event.loaded / event.total) * 100)
      onProgress?.(percent)
    }
  })

  return {
    id: response.data.id,
    jobId: response.data.id,
    status: response.data.status
  }
}
