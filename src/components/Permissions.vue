<script setup lang="ts">
const redditOrigin = 'https://*.reddit.com/*'

const permissionsGranted = ref(true)

async function checkPermissions() {
  const permissions = await browser.permissions.getAll()
  if (permissions.origins?.includes(redditOrigin)) {
    permissionsGranted.value = true
    return
  }
  permissionsGranted.value = false
}

checkPermissions()

async function askPermissions() {
  const response = await browser.permissions.request({ origins: [redditOrigin] })
  if (!response) {
    console.log('Permission was refused')
    return
  }
  permissionsGranted.value = true
}
</script>

<template>
  <div v-if="!permissionsGranted" class="flex gap-2 w-full justify-end items-center ml-auto">
    <Message severity="warn">
      <div class="flex items-center gap-4 pr-2">
        The extension doesn't have permission to access Reddit.
        <Button label="Grant permissions" severity="warning" size="small" @click="askPermissions" />
      </div>
    </Message>
  </div>
</template>
