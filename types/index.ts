export type UserRole = "owner" | "staff" | null

export interface Link {
  id: string
  title: string
  url: string
  description?: string
  createdBy: string
  createdAt: any // Firestore timestamp
  updatedAt?: any // Firestore timestamp
  linkType: "owner" | "staff"
}

