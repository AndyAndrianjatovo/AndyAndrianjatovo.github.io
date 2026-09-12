import { apiClient } from './client'
import type { FamilyPerson, FamilyTreeResponse } from './types'

export const familyTreeApi = {
  get: () => apiClient.get<FamilyTreeResponse>('/api/family-tree'),
  people: () => apiClient.get<Pick<FamilyPerson, 'id' | 'first_name' | 'last_name'>[]>('/api/family-tree/people')
}
