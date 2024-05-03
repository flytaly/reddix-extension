import { getTagsArray, stats } from '~/logic/stores'

export type TagList = Array<[string, number]>

export function useTagsAutocomplete(forbidNew = false) {
  const allTags = ref<TagList>([])
  const completeItems = ref<TagList>([])
  const parts = ref<Record<string, TagList>>({})

  watch(
    () => stats.tags,
    () => {
      parts.value = {}
      allTags.value = getTagsArray().filter(t => t[0] !== '')
      // split tag words
      allTags.value.forEach(([tag, count]) => {
        for (let i = 0; i < tag.length; i++) {
          const substr = tag.slice(0, i + 1)
          if (!parts.value[substr])
            parts.value[substr] = []

          if (parts.value[substr].length >= 10)
            continue

          parts.value[substr] = [...parts.value[substr], [tag, count]]
        }
      })
    },
    { immediate: true },
  )

  const search = (event: { query: string }) => {
    const tags = parts.value[event.query]
    if (forbidNew) {
      completeItems.value = !event.query ? allTags.value.slice(0, 30) : tags
      return
    }
    if (!tags) {
      completeItems.value = !event.query ? allTags.value.slice(0, 30) : [[event.query, stats.tags[event.query]]]
      return
    }
    if (!event.query || tags[0][0] === event.query) {
      completeItems.value = tags
      return
    }
    completeItems.value = [[event.query, stats.tags[event.query]], ...tags]
  }

  return { search, allTags, completeItems }
}
