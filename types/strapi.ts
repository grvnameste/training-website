// types/strapi.ts
export type StrapiQuestionItem = {
  id: number
  attributes: {
    slug?: string
    text?: string
    type?: 'likert' | 'open'
    placeholder?: string | null
    group?: string
    order?: number | null
    isActive?: boolean | null
    weights?: any | null
    createdAt?: string
    updatedAt?: string
  }
}
