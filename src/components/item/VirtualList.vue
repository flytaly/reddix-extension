<script setup lang="ts">
import { WrappedItem } from '~/logic/wrapped-item'

defineProps<{
  items: WrappedItem[]
}>()

const emit = defineEmits<{
  (e: 'scroll-end'): void
}>()

const height = ref(300)
const elem = ref<HTMLElement>()
const scroller = ref()
const hasScroll = ref(false)

const onResize = () => {
  if (!elem.value) return
  height.value = window.innerHeight - elem.value.offsetTop - 10
  const el = scroller.value.$el
  if (!el) return
  hasScroll.value = el.scrollHeight > el.clientHeight
}

defineExpose({
  onResize,
})

const listener = (ev: KeyboardEvent) => {
  if (!ev.shiftKey) return
  switch (ev.key) {
    case 'ArrowUp':
      ;(scroller.value.$el as HTMLElement).scrollBy(0, -height.value * 0.1)
      break
    case 'ArrowDown':
      ;(scroller.value.$el as HTMLElement).scrollBy(0, height.value * 0.1)
      break
    case 'PageUp':
      ;(scroller.value.$el as HTMLElement).scrollBy(0, -height.value * 0.9)
      break
    case 'PageDown':
      ;(scroller.value.$el as HTMLElement).scrollBy(0, height.value * 0.9)
      break
  }
}

onMounted(() => {
  document.body.style.overflowY = 'hidden'
  document.body.addEventListener('keydown', listener)
})

onUnmounted(() => {
  document.body.style.overflowY = ''
  document.body.removeEventListener('keydown', listener)
})
</script>

<template>
  <div ref="elem" class="flex w-full flex-col overflow-hidden" :style="{ height: height + 'px' }">
    <DynamicScroller
      ref="scroller"
      :items="items"
      :min-item-size="54"
      key-field="dbId"
      @resize="onResize"
      @scroll-end="emit('scroll-end')"
    >
      <template #default="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :data-index="index" :data-active="active">
          <div :key="item.dbId" class="w-full p-[1px] px-[2px]">
            <slot name="item" :item="item as WrappedItem"></slot>
          </div>
        </DynamicScrollerItem>
      </template>

      <template #after>
        <div v-if="hasScroll" class="mt-4 max-w-full">
          <button class="btn group mx-auto flex gap-1" @click="scroller.scrollToItem(0)">
            Scroll to the top<ph-arrow-up class="transition-transform group-hover:-translate-y-[2px]" />
          </button>
        </div>
      </template>
    </DynamicScroller>
  </div>
</template>

<style lang="postcss">
.vue-recycle-scroller {
  scrollbar-color: theme('colors.surface-400') theme('colors.surface-200');
  &:hover {
    scrollbar-color: theme('colors.primary-500') theme('colors.surface-200');
  }
}

.dark .vue-recycle-scroller {
  scrollbar-color: theme('colors.surface-600') theme('colors.surface-800');

  &:hover {
    scrollbar-color: theme('colors.primary-500') theme('colors.surface-800');
  }
}
</style>
