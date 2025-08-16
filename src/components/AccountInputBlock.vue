<script setup lang="ts">
import FetchButton from '~/components/FetchButton.vue'
import { Input } from '~/components/ui/input'
import { userName } from '~/logic/browser-storage'
import { state } from '~/logic/stores'
import { sendMessage } from '~/messages'
import { getUserInfo } from '~/reddit/me'

const props = defineProps<{ startFetching?: boolean }>()

const status = ref('')
const isEdit = ref(false)

const fetchingUsername = ref(false)

watch(
  userName,
  (newValue) => {
    status.value = !newValue ? 'username is required' : ''
  },
  { immediate: false },
)

async function fetchPosts(category: ItemCategory = 'saved', fetchAll = false) {
  if (state.isFetching)
    return
  if (!userName.value) {
    status.value = 'username is required'
    return
  }
  await sendMessage('fetch-items', { username: userName.value, category, options: { fetchAll } })
}

watch(userName, () => {
  if (state.fetchError) {
    state.fetchError = ''
    sendMessage('clear-fetch-error')
  }
})

async function fetchUsername() {
  fetchingUsername.value = true
  const [info, error] = await getUserInfo()
  userName.value = info?.data?.name || ''
  status.value = error || ''
  fetchingUsername.value = false
  if (!error)
    isEdit.value = false
}

watch(
  () => props.startFetching,
  async (value) => {
    if (!value)
      return
    if (!userName.value)
      await fetchUsername()

    if (userName.value)
      await fetchPosts('saved', false)
  },
  { immediate: true },
)

function showEdit() {
  return isEdit.value || !userName.value || status.value || state.fetchError
}
</script>

<template>
  <article class="min-w-48 max-w-60 mx-auto">
    <div v-if="!showEdit()" class="flex w-full items-center gap-2 text-surface-400">
      <PhRedditLogoDuotone class="h-4 w-4 text-surface-400 dark:text-surface-400" />
      <span>{{ userName }}</span>
      <button title="edit username" class="btn ml-auto" @click="isEdit = true">
        <PhPencilSimpleDuotone class="h-4 w-4" />
      </button>
    </div>

    <div v-if="showEdit()">
      <div class="flex max-w-full flex-col gap-2">
        <span class="relative">
          <PhRedditLogoFill
            class="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400 dark:text-surface-400"
          />
          <Input
            v-model="userName"
            type="text"
            placeholder="username"
            class="w-full pl-8 pr-8"
            :disabled="state.isFetching || fetchingUsername"
            :class="{ 'text-error-dark dark:text-error-light': status || state.fetchError }"
            @input="isEdit = true"
          />
          <button
            class="btn absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2"
            title="fetch current login username from reddit"
            :disabled="state.isFetching || fetchingUsername"
            @click="fetchUsername"
          >
            <PhSignInDuotone v-if="!fetchingUsername" class="" />
            <PhSpinnerGap v-if="fetchingUsername" class="animate-spin" />
          </button>
        </span>

        <small class="text-xs text-error-dark dark:text-error-light">{{ status || state.fetchError }}</small>
      </div>
    </div>

    <div class="mt-2">
      <FetchButton :is-fetching="state.isFetching" @fetch-items="fetchPosts" />
      <div v-if="state.isFetching && state.loaded > 0" class="text-right text-accent">
        Loaded {{ state.loaded }} items ({{ state.savedNew }} new)
      </div>
    </div>
  </article>
</template>
