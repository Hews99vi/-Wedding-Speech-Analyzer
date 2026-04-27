export interface Job {
  id: string
  user_id: string
  name: string
  event_date: string | null
  language: 'en' | 'si' | 'English' | 'Sinhala'
  notes: string | null
  status: 'queued' | 'processing' | 'ready' | 'failed' | 'uploading'
  step_index: number
  step_label: string | null
  error_message: string | null
  duration_seconds: number | null
  created_at: string
  updated_at: string

  // Compatibility fields for existing UI pages.
  eventDate?: string
  createdAt?: string
  updatedAt?: string
  duration?: number
}

export type JobOut = Job

export interface TranscriptSegment {
  id: string
  job_id: string
  speaker: string | null
  start_time: number
  end_time: number
  text: string
  highlight_label: 'Emotional Peak' | 'Humor' | 'Toast' | 'Vows' | 'Advice' | null
  highlight_score: number | null
  segment_index: number
}

export type TranscriptSegmentOut = TranscriptSegment

export interface Highlight {
  id: string
  job_id: string
  segment_id: string
  score: number
  label: 'Emotional Peak' | 'Humor' | 'Toast' | 'Vows' | 'Advice'
  start_time: number
  end_time: number
  text: string
}

export type HighlightOut = Highlight

export type JobLanguage = 'English' | 'Sinhala' | 'en' | 'si'

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
