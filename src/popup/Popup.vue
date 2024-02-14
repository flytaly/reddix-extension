<script setup lang="ts">
import SearchInput from '~/components/SearchInput.vue'
import ItemsContainer from '~/components/item/ItemsContainer.vue'
</script>

<template>
  <Toast />
  <main class="h-[600px] w-[700px] text-gray-700">
    <div class="px-2 pt-1">
      <SearchInput />
    </div>
    <ItemsContainer />
  </main>
</template>
