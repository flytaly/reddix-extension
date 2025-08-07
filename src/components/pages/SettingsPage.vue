<script setup lang="ts">
import type { ExtensionOptions, Theme } from '~/logic/extension-options'
import PhGearBold from '~icons/ph/gear-bold'
import { Card } from '~/components/ui/card'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Switch } from '~/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group'
import { optionsStorage } from '~/logic/browser-storage'

const themeOptions = ref<{ name: string, value: Theme }[]>([
  { name: 'Light', value: 'light' },
  { name: 'Dark', value: 'dark' },
  { name: 'System', value: 'auto' },
])

const hour = 1000 * 60 * 60
const updateIntervalValues = ref<{ name: string, value: number }[]>([
  { name: '1h', value: hour },
  { name: '4h', value: 4 * hour },
  { name: '8h', value: 8 * hour },
  { name: '12h', value: 12 * hour },
  { name: '24h', value: 24 * hour },
])

const badgeActions = ref<{ name: string, value: ExtensionOptions['onBadgeClick'] }[]>([
  { name: 'open in the popup', value: 'openPopup' },
  { name: 'open in a new tab', value: 'openNewTab' },
])

const badgeAction = ref<ExtensionOptions['onBadgeClick']>(
  badgeActions.value.find(v => v.value === optionsStorage.value.onBadgeClick)
    ? optionsStorage.value.onBadgeClick
    : 'openPopup',
)

watch(badgeAction, () => {
  optionsStorage.value.onBadgeClick = badgeAction.value
})
</script>

<template>
  <MainLayout>
    <div class="mx-auto flex w-full max-w-(--breakpoint-md) flex-col">
      <Card class="mx-auto mt-2 w-full max-w-[120ch]">
        <CardHeader>
          <CardTitle>
            <h2 class="flex items-center">
              <PhGearBold class="mr-2 h-5 w-5" />
              Settings
            </h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <!-- Corrected Structure -->
          <article>
            <h3>General</h3>
            <div class="grid grid-cols-[auto_1fr] gap-4">
              <Label> Badge click action </Label>
              <Select v-model="badgeAction">
                <SelectTrigger>
                  <SelectValue placeholder="Select badge action click" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="action in badgeActions" :key="action.value" :value="action.value!">
                    {{ action.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </article>

          <article>
            <h3>Appearance</h3>
            <div class="grid grid-cols-[auto_1fr] gap-4">
              <Label>Theme</Label>
              <ToggleGroup
                type="single"
                :model-value="optionsStorage.theme"
                variant="outline"
                size="sm"
                @update:model-value="(t) => {
                  if (!t) return
                  optionsStorage.theme = t as Theme || 'auto'
                }"
              >
                <ToggleGroupItem
                  v-for="theme in themeOptions"
                  :key="theme.value"
                  :value="theme.value"
                  class="px-3"
                >
                  {{ theme.name }}
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </article>

          <article class="space-y-4">
            <h3>Update</h3>
            <fieldset class="px-5 md:px-6 py-5 rounded-md bg-surface-0 dark:bg-surface-900 text-surface-700 dark:text-surface-0/80 ring-1 ring-inset ring-surface-300 dark:ring-surface-700 ring-offset-0">
              <legend class="px-3 py-1.5 font-medium leading-none text-surface-700 dark:text-surface-0/80 bg-surface-0 dark:bg-surface-900">
                Automatically update:
              </legend>

              <div class="grid grid-cols-[auto_1fr] gap-4">
                <Label for="auto-update-saved">Saved posts/comments</Label>
                <Switch id="auto-update-saved" v-model="optionsStorage.autoUpdateSaved" />
                <Label for="auto-update-upvoted">Upvoted posts</Label>
                <Switch id="auto-update-upvoted" v-model="optionsStorage.autoUpdateUpvoted" />
                <Label>Update interval</Label>
                <ToggleGroup
                  :model-value="optionsStorage.updateInterval"
                  type="single"
                  variant="outline"
                  size="sm"
                  @update:model-value="(v) => {
                    if (typeof v !== 'number') return
                    optionsStorage.updateInterval = v
                  }"
                >
                  <ToggleGroupItem
                    v-for="interval in updateIntervalValues"
                    :key="interval.value"
                    :value="interval.value"
                    class="px-2"
                  >
                    {{ interval.name }}
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </fieldset>
          </article>
        </CardContent>
      </Card>
    </div>
  </MainLayout>
</template>

<style lang="postcss" scoped>
@reference "../../styles/tailwind.css";

article {
  @apply mb-2 gap-4 p-2 text-sm;
}

h3 {
  @apply mb-4 mt-2 text-base font-medium;
}
</style>
