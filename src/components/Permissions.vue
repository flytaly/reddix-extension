<script setup lang="ts">
import { Alert } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'

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
    <Alert class="ring ring-destructive">
      <AlertTitle>The extension doesn't have permission to access Reddit</AlertTitle>
      <AlertDescription>
        <Button size="sm" severity="warning" @click="askPermissions">
          Grant permissions
        </Button>
      </AlertDescription>
    </Alert>
  </div>
</template>
