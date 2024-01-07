<script setup lang="ts">
import { ref, watch } from 'vue'
import { sendMessage } from 'webext-bridge/options'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

import { userName } from '~/logic/storage'
import { state } from '~/logic/store'
import { getUsername } from '~/reddit/username'

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

async function fetchPosts() {
  if (state.isFetching) return
  if (!userName.value) {
    status.value = 'username is required'
    return
  }
  const res = await sendMessage('fetch-saved', { username: userName.value }, 'background')
  state.isFetching = res.isFetching
}

watch(userName, () => {
  if (state.fetchError) state.fetchError = ''
})

async function fetchUsername() {
  fetchingUsername.value = true
  const [name, error] = await getUsername()
  userName.value = name || ''
  status.value = error || ''
  fetchingUsername.value = false
  if (!error) isEdit.value = false
}

function showEdit() {
  return isEdit.value || !userName.value || status.value || state.fetchError
}
</script>

<template>
  <article class="min-w-48 max-w-60">
    <div v-if="!showEdit()" class="flex w-full items-center gap-2 text-surface-400">
      <PhRedditLogoDuotone class="h-4 w-4 text-surface-400 dark:text-surface-400" />
      <span>{{ userName }}</span>
      <button title="edit username" class="icon-button ml-auto" @click="isEdit = true">
        <PhPencilSimpleDuotone class="h-4 w-4" />
      </button>
    </div>

    <div v-if="showEdit()">
      <div class="flex max-w-full flex-col gap-2">
        <span class="relative">
          <PhRedditLogoFill
            class="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400 dark:text-surface-400"
          />
          <InputText
            v-model="userName"
            type="text"
            size="small"
            placeholder="username"
            class="w-full pl-8 pr-8"
            :disabled="state.isFetching || fetchingUsername"
            :class="{ error: status || state.fetchError }"
            @input="isEdit = true"
          />
          <button
            class="icon-button absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2"
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
      <Button
        class="text-primary-700 dark:text-primary-400"
        size="small"
        text
        label="Sync saved items"
        :disabled="state.isFetching"
        @click="fetchPosts"
      >
        <div class="flex w-full items-center gap-1">
          <PhCloudArrowDownDuotone class="h-4 w-4" />
          <span>{{ state.isFetching ? 'fetching...' : 'Fetch saved items' }}</span>
        </div>
      </Button>
    </div>
  </article>
</template>

<style lang="postcss" scoped>
.error {
  @apply ring-red-600 dark:ring-red-300;
}
.icon-button {
  @apply text-surface-400 hover:text-primary-700 dark:text-surface-500 hover:dark:text-primary-400;
}
</style>
