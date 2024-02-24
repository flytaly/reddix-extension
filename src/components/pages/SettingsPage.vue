<script setup lang="ts">
import { Theme } from '~/logic/extension-options'
import { optionsStorage } from '~/logic/browser-storage'
import { SelectButtonPassThroughOptions } from 'primevue/selectbutton'

const themeOptions = ref<{ name: string; value: Theme }[]>([
  { name: 'Light', value: 'light' },
  { name: 'Dark', value: 'dark' },
  { name: 'System', value: 'auto' },
])

const hour = 1000 * 60 * 60
const updateIntervalValues = ref<{ name: string; value: number }[]>([
  { name: '1h', value: hour },
  { name: '4h', value: 4 * hour },
  { name: '8h', value: 8 * hour },
  { name: '12h', value: 12 * hour },
  { name: '24h', value: 24 * hour },
])

const pt: SelectButtonPassThroughOptions = {
  root: 'max-w-max',
  button: ({ context }) => ({
    class: { '!bg-primary-500 dark:!bg-primary-400 text-white dark:text-black': context.active },
  }),
}
</script>

<template>
  <MainLayout>
    <div class="mx-auto flex w-full max-w-screen-md flex-col">
      <Card class="mt-2 w-full">
        <template #title>Settings</template>
        <template #content>
          <article>
            <h3>Appearance</h3>
            <div>
              <SelectButton
                v-model="optionsStorage.theme"
                :options="themeOptions"
                option-label="name"
                option-value="value"
                :pt="pt"
                :pt-options="{ mergeProps: true }"
                @change="optionsStorage.theme = $event.value"
              />
            </div>
          </article>
          <article class="space-y-4">
            <h3>Update</h3>
            <Fieldset legend="Automatically update:">
              <div class="grid grid-cols-[auto,1fr] gap-4">
                <label for="auto-update-saved">Saved posts/comments</label>
                <InputSwitch v-model="optionsStorage.autoUpdateSaved" input-id="auto-update-saved" />
                <label for="auto-update-saved">Upvoted posts</label>
                <InputSwitch v-model="optionsStorage.autoUpdateUpvoted" input-id="auto-update-upvoted" />
                Update interval
                <SelectButton
                  v-model="optionsStorage.updateInterval"
                  :options="updateIntervalValues"
                  option-label="name"
                  option-value="value"
                  :pt="pt"
                  :pt-options="{ mergeProps: true }"
                  @change="optionsStorage.updateInterval = $event.value"
                />
              </div>
            </Fieldset>
          </article>
        </template>
      </Card>
    </div>
  </MainLayout>
</template>

<style lang="postcss" scoped>
article {
  @apply mb-2 gap-4 p-2 text-sm;
}
h3 {
  @apply mb-4 mt-2 text-base font-medium;
}
</style>
