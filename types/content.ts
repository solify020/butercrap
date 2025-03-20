import type { Timestamp } from "firebase/firestore"

export interface ContentItem {
  id?: string
  title: string
  description?: string
  platform: string
  scheduledDate: Timestamp | Date
  status?: "draft" | "scheduled" | "published"
  createdBy?: string
  createdAt?: Timestamp | Date
  updatedAt?: Timestamp | Date
}

