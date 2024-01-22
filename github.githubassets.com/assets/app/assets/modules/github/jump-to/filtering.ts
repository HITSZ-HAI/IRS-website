import {compare, fuzzyScore} from '../fuzzy-filter'
import type {Suggestion} from './model'
import {filterSort} from '../filter-sort'

export function filterSuggestions(suggestions: Suggestion[], str: string, ignorePath: string): Suggestion[] {
  const query = str.replace(/\s/g, '').toLowerCase()
  const list = suggestions.filter(s => s.path !== ignorePath)
  if (!query) return list
  const key = (item: Suggestion) => {
    const text = item.name
    const score = fuzzyScore(text, query)
    return score > 0 ? {score, text} : null
  }
  return filterSort(list, key, compare)
}
