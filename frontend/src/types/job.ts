export type JobLanguage = 'English' | 'Sinhala'

export interface Job {
  id: string
  name: string
  eventDate: string
  language: JobLanguage
  notes?: string
  status: 'uploading' | 'processing' | 'ready' | 'failed'
}

export interface CreateJobPayload {
  name: string
  eventDate: string
  language: JobLanguage
  notes?: string
  file: File
}

export interface JobResponse {
  id?: string
  jobId?: string
  status?: Job['status']
}
