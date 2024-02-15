<script setup lang="ts">
import SearchInput from '~/components/SearchInput.vue'
import ItemsContainer from '~/components/item/ItemsContainer.vue'
</script>

<template>
  <Toast />
  <main class="h-[600px] w-[var(--popup-width)] bg-surface-50 text-dark dark:bg-surface-950 dark:text-light">
    <div class="px-2 pt-1">
      <SearchInput />
    </div>
    <ItemsContainer />
  </main>
</template>
